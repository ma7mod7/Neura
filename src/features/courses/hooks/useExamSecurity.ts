import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { reportViolation } from '../api/examApi';

interface UseExamSecurityProps {
    isActive: boolean;
    attemptId: string | null;
}

export const useExamSecurity = ({
    isActive,
    attemptId,
}: UseExamSecurityProps) => {
    const [violationCount, setViolationCount] = useState(0);
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
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                const currentAttemptId = attemptIdRef.current;
                if (currentAttemptId) {
                    reportViolation(currentAttemptId, 'CopyPasteAttempt', 'PrintScreen key');
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
                recordTabViolation('Tab became hidden (visibilitychange)');
            }
        };

        // Backup: window blur — fires when browser window loses focus (alt-tab, new tab, etc.)
        const handleWindowBlur = () => {
            // Only trigger if the document isn't already hidden (to avoid double-counting with visibilitychange)
            if (!document.hidden) {
                recordTabViolation('Window lost focus (blur)');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        console.log('🛡️ Exam security: Tab switch detection ACTIVE (attemptId:', attemptIdRef.current, ')');

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            console.log('🛡️ Exam security: Tab switch detection DEACTIVATED');
        };
    }, [isActive]);

    // NOTE: Multi-screen detection is disabled for now (development mode).

    return {
        violationCount,
        examContainerRef,
    };
};
