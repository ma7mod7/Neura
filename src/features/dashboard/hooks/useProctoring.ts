import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

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

    useEffect(() => {
        // لو الامتحان مش شغال أو مفيش ID، متعملش حاجة
        if (!isActive || !attemptId) return;

        
       

        const startProctoring = async () => {
            try {
                // 1. تشغيل الكاميرا (في الخلفية بدون ما تظهر للطالب لو مش عايز)
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;

                // بنربط الكاميرا بعنصر فيديو مخفي عشان نقدر ناخد منه صور
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                videoRef.current = video;

                // بنجهز Canvas مخفي عشان نرسم عليه الصورة ونحولها
                const canvas = document.createElement('canvas');
                canvas.width = 640; // جودة متوسطة عشان سرعة النت
                canvas.height = 480;
                canvasRef.current = canvas;

                // 2. فتح اتصال الـ WebSocket
                const ws = new WebSocket(`${wsUrl}?attemptId=${attemptId}`);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log('🔗 WebSocket connected to AI Proctoring');
                    
                    // 3. بدأ إرسال الصور كل عدد معين من الثواني
                    intervalRef.current = setInterval(() => {
                        if (videoRef.current && canvasRef.current && ws.readyState === WebSocket.OPEN) {
                            const ctx = canvasRef.current.getContext('2d');
                            if (ctx) {
                                // رسم الصورة من الفيديو للـ Canvas
                                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                                // تحويل الصورة لصيغة Base64
                                const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.5); // 0.5 يعني ضغط الجودة لـ 50%
                                
                                // إرسال الصورة للـ AI
                                ws.send(JSON.stringify({
                                    type: 'frame',
                                    attemptId: attemptId,
                                    image: base64Image
                                }));
                            }
                        }
                    }, intervalMs);
                };

                // 4. استقبال أي تحذير من الـ AI
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'violation_detected') {
                        // عرض تحذير للطالب
                        toast.error(`⚠️ Warning: ${data.message}`, { duration: 5000 });
                        
                        // هنا ممكن كمان تنادي API يبلغ الباك إند بتاع الـ LMS إن الطالب ده غش
                        // reportViolation(attemptId, data.violationType);
                    }
                };

                ws.onerror = (err) => console.error('WebSocket Error:', err);

            } catch (error) {
                console.error("Camera access denied or error:", error);
                toast.error("Camera access is required for this exam.");
            }
        };

        startProctoring();

        // 5. Cleanup Function: دي بتشتغل أول ما الطالب يقفل الامتحان أو يطلع من الصفحة
        return () => {
            
            
            // وقف المؤقت
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            // اقفل الكاميرا
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            
            // اقفل اتصال الـ WebSocket
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
                console.log('🔴 WebSocket connection closed');
            }
        };
    }, [isActive, attemptId, wsUrl, intervalMs]);
};