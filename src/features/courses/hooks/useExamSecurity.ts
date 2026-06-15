import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { reportViolation } from '../api/examApi';

interface UseExamSecurityProps {
    isActive: boolean;
    attemptId: string | null;
    lessonId: string | null;
}

export const useExamSecurity = ({
    isActive,
    attemptId,
    lessonId
}: UseExamSecurityProps) => {
    const [violationCount, setViolationCount] = useState(0);
    const [isBlurred, setIsBlurred] = useState(false);
    const examContainerRef = useRef<HTMLDivElement>(null);

    // Use refs for mutable values to avoid stale closure issues
    const attemptIdRef = useRef(attemptId);
    const violationCountRef = useRef(0);
    const lastHardViolationTime = useRef(0);
    const lastSoftViolationTime = useRef(0);

    // Keep attemptId ref in sync
    useEffect(() => {
        attemptIdRef.current = attemptId;
    }, [attemptId]);

    // Reset state when exam deactivates
    useEffect(() => {
        if (!isActive) {
            violationCountRef.current = 0;
            setViolationCount(0);
            setIsBlurred(false);
        }
    }, [isActive]);

    // ── 1. Prevent Copy / Paste / Right-click ──────────────────────────
    useEffect(() => {
        if (!isActive) return;

        const container = examContainerRef.current;
        if (!container) return;

        const handleCopyPaste = (e: Event) => {
            e.preventDefault();

            const currentAttemptId = attemptIdRef.current;
            if (!currentAttemptId) return;

            // Debounce soft violations: 3 seconds
            const now = Date.now();
            if (now - lastSoftViolationTime.current < 3000) return;
            lastSoftViolationTime.current = now;

            reportViolation(currentAttemptId, 'CopyPasteAttempt', `Event: ${e.type}`);
            toast.error('🚫 Copy/paste is not allowed during the exam.', { duration: 3000 });
        };

        const handleSelectStart = (e: Event) => {
            e.preventDefault();
        };

        const handleKeydown = (e: KeyboardEvent) => {
            if (e.ctrlKey && ['c', 'v', 'x', 'a', 'p'].includes(e.key.toLowerCase())) {
                e.preventDefault();

                const currentAttemptId = attemptIdRef.current;
                if (!currentAttemptId) return;

                const now = Date.now();
                if (now - lastSoftViolationTime.current < 3000) return;
                lastSoftViolationTime.current = now;

                reportViolation(currentAttemptId, 'CopyPasteAttempt', `Keyboard: Ctrl+${e.key.toUpperCase()}`);
                toast.error('🚫 Copy/paste is not allowed during the exam.', { duration: 3000 });
            }
            if (
                e.key === 'PrintScreen' || 
                (e.metaKey && e.shiftKey && ['s', '3', '4', '5'].includes(e.key.toLowerCase()))
            ) {
                e.preventDefault();
                const currentAttemptId = attemptIdRef.current;
                if (currentAttemptId) {
                    reportViolation(currentAttemptId, 'ScreenshotAttempt', 'Screenshot shortcut detected');
                    toast.error('🚫 Screenshots are not allowed during the exam.', { duration: 3000 });
                }
            }
        };

        const events = ['copy', 'cut', 'paste', 'contextmenu'] as const;
        events.forEach(event => container.addEventListener(event, handleCopyPaste));
        container.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('keydown', handleKeydown);

        return () => {
            events.forEach(event => container.removeEventListener(event, handleCopyPaste));
            container.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [isActive]);

    // ── 2. Tab Switch / Visibility + Focus Detection ───────────────────
    useEffect(() => {
        if (!isActive) return;

        const recordTabViolation = (detail: string) => {
            const currentAttemptId = attemptIdRef.current;
            if (!currentAttemptId) return;

            // Debounce: ignore if another tab violation happened within 10 seconds
            const now = Date.now();
            if (now - lastHardViolationTime.current < 10000) return;
            lastHardViolationTime.current = now;

            const newCount = violationCountRef.current + 1;
            violationCountRef.current = newCount;
            setViolationCount(newCount);

            reportViolation(currentAttemptId, 'TabSwitch', detail);
            toast.error(`⚠️ Violation #${newCount}: Tab switching detected! Please stay on the exam page.`, { duration: 6000 });
        };

        // Primary: visibilitychange — fires when tab becomes hidden
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
                recordTabViolation('Tab became hidden (visibilitychange)');
            } else {
                setIsBlurred(false);
            }
        };

        // Backup: window blur — fires when browser window loses focus (alt-tab, new tab, etc.)
        const handleWindowBlur = () => {
            setIsBlurred(true);
            if (!document.hidden) {
                recordTabViolation('Window lost focus (blur)');
            }
        };

        const handleWindowFocus = () => {
            setIsBlurred(false);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        console.log('🛡️ Exam security: Tab switch detection ACTIVE (attemptId:', attemptIdRef.current, ')');

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
            console.log('🛡️ Exam security: Tab switch detection DEACTIVATED');
        };
    }, [isActive]);

    // NOTE: Multi-screen detection is disabled for now (development mode).
    // ── 3. AI Proctoring WebSocket ─────────────────────────────────────
    useEffect(() => {
        if (!isActive || !attemptId || !lessonId) return;

        const jwtToken = localStorage.getItem('token');
        if (!jwtToken) return;

        const WS_HOST = 'wss://neura-lms-proctor-vision-api.hf.space';
        const wsUrl = `${WS_HOST}/ws/proctor/${encodeURIComponent(lessonId)}?token=${encodeURIComponent(jwtToken)}`;

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        let ws: WebSocket | null = null;
        let frameInterval: ReturnType<typeof setInterval> | null = null;
        let videoElement: HTMLVideoElement | null = null;
        let stream: MediaStream | null = null;
        let reconnectAttempt = 0;
        const MAX_RECONNECT = 3;
        const PERMANENT_ERRORS = new Set([4001, 4002, 4003, 4004, 1005]);

        const sendFrame = () => {
            if (!ws || ws.readyState !== WebSocket.OPEN || !videoElement || !ctx) return;
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob && ws?.readyState === WebSocket.OPEN) {
                    ws.send(blob);
                }
            }, 'image/jpeg', 0.5);
        };

        const connect = () => {
            ws = new WebSocket(wsUrl);
            ws.binaryType = 'blob';

            ws.onopen = () => {
                console.log('🎥 AI Proctoring connected');
                reconnectAttempt = 0;
                frameInterval = setInterval(sendFrame, 500); 
            };

            ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    if (response.active_alerts?.length > 0) {
                        console.warn('🤖 AI Alert:', response.active_alerts);
                        const currentAttemptId = attemptIdRef.current;
                        if (currentAttemptId) {
                            reportViolation(currentAttemptId, 'AIViolation', response.active_alerts.join(', '));
                        }
                    }
                } catch {
                    // ignore non-JSON messages
                }
            };

            ws.onclose = (event) => {
                if (frameInterval) clearInterval(frameInterval);
                console.log(`🔴 AI Proctoring disconnected. Code: ${event.code}`);

                if (!PERMANENT_ERRORS.has(event.code) && reconnectAttempt < MAX_RECONNECT) {
                    reconnectAttempt++;
                    const delay = reconnectAttempt * 2000;
                    console.log(`🔄 Reconnecting WebSocket (attempt ${reconnectAttempt}/${MAX_RECONNECT}) in ${delay}ms...`);
                    setTimeout(connect, delay);
                }
            };

            ws.onerror = (err) => {
                console.warn('⚠️ AI Proctoring WebSocket error:', err);
            };
        };

        navigator.mediaDevices.getUserMedia({ video: true })
            .then((mediaStream) => {
                stream = mediaStream;
                const vid = document.createElement('video');
                vid.srcObject = mediaStream;
                vid.muted = true;
                vid.playsInline = true;
                videoElement = vid;
                vid.onplay = () => connect();
                vid.play().catch(console.warn);
            })
            .catch((err) => console.warn('📷 Webcam access denied:', err));

        return () => {
            if (frameInterval) clearInterval(frameInterval);
            if (ws) ws.close();
            if (stream) stream.getTracks().forEach(t => t.stop());
            console.log('🛡️ AI Proctoring DEACTIVATED');
        };
    }, [isActive, attemptId, lessonId]);
    
    return {
        violationCount,
        isBlurred,
        examContainerRef,
    };
};
