import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { reportViolation } from '../../courses/api/examApi';

interface UseProctoringProps {
    isActive: boolean;  
    attemptId: string | null; 
    wsUrl: string;            
    intervalMs?: number;     
}

export const useProctoring = ({ isActive, attemptId, wsUrl, intervalMs = 3000 }: UseProctoringProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const retryCountRef = useRef(0);
    const maxRetries = 3;

    useEffect(() => {
        // لو الامتحان مش شغال أو مفيش ID، متعملش حاجة
        if (!isActive || !attemptId) return;

        // Flag to handle async cleanup — if cleanup runs while startProctoring is still async,
        // this flag tells startProctoring to immediately release resources.
        let cancelled = false;

        const cleanup = () => {
            // وقف المؤقت
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            
            // اقفل الكاميرا
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            // اقفل الفيديو
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current = null;
            }
            
            // اقفل اتصال الـ WebSocket
            if (wsRef.current) {
                if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
                    wsRef.current.close();
                }
                wsRef.current = null;
            }

            canvasRef.current = null;
        };

        const connectWebSocket = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
            void video
            if (cancelled) return;

            const ws = new WebSocket(`${wsUrl}?attemptId=${attemptId}`);
            wsRef.current = ws;

            ws.onopen = () => {
                if (cancelled) { ws.close(); return; }
                console.log('🔗 WebSocket connected to AI Proctoring');
                retryCountRef.current = 0;
                
                intervalRef.current = setInterval(() => {
                    if (videoRef.current && canvasRef.current && ws.readyState === WebSocket.OPEN) {
                        const ctx = canvasRef.current.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                            const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.5);
                            ws.send(JSON.stringify({
                                type: 'frame',
                                attemptId: attemptId,
                                image: base64Image
                            }));
                        }
                    }
                }, intervalMs);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'violation_detected') {
                        toast.error(`⚠️ Warning: ${data.message}`, { duration: 5000 });
                        reportViolation(attemptId, 'AIViolation', data.message || data.violationType);
                    }
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err);
                }
            };

            ws.onerror = (err) => console.error('WebSocket Error:', err);

            ws.onclose = (event) => {
                console.log('🔴 WebSocket closed:', event.code, event.reason);
                if (intervalRef.current) clearInterval(intervalRef.current);

                // Reconnect only if not cancelled and under retry limit
                if (!cancelled && !event.wasClean && retryCountRef.current < maxRetries) {
                    retryCountRef.current++;
                    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
                    console.log(`🔄 Reconnecting WebSocket (attempt ${retryCountRef.current}/${maxRetries}) in ${delay}ms...`);
                    setTimeout(() => {
                        if (!cancelled && videoRef.current && canvasRef.current) {
                            connectWebSocket(videoRef.current, canvasRef.current);
                        }
                    }, delay);
                }
            };
        };

        const startProctoring = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                
                // If cleanup was called while we were waiting for camera permission, stop immediately
                if (cancelled) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = stream;

                const video = document.createElement('video');
                video.srcObject = stream;
                await video.play();
                
                if (cancelled) {
                    stream.getTracks().forEach(track => track.stop());
                    video.srcObject = null;
                    return;
                }

                videoRef.current = video;

                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                canvasRef.current = canvas;

                connectWebSocket(video, canvas);

            } catch (error) {
                console.error("Camera access denied or error:", error);
                toast.error("Camera access is required for this exam.");
            }
        };

        startProctoring();

        // Cleanup: runs when isActive becomes false, component unmounts, or deps change
        return () => {
            cancelled = true;
            cleanup();
            console.log('🔴 Proctoring fully cleaned up (camera off, WS closed)');
        };
    }, [isActive, attemptId, wsUrl, intervalMs]);
};