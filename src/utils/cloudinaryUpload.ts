import type { SignedVideoUploadResponse } from "../features/uploadVideo/types/video";

export interface CloudinaryUploadResponse {
    public_id: string;
    secure_url: string;
    duration: number;
    bytes: number;
    format: string;
}

export interface CloudinaryUploadResult {
    success: boolean;
    data?: CloudinaryUploadResponse;
    error?: string;
}

// دالة الرفع المباشر لـ Cloudinary
export async function uploadToCloudinary(
    file: File,
    credentials: SignedVideoUploadResponse,
    onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        const uploadUrl = `https://api.cloudinary.com/v1_1/${credentials.cloudName}/video/upload`;

        formData.append('file', file);
        formData.append('api_key', credentials.apiKey);
        formData.append('timestamp', credentials.timestamp.toString());
        formData.append('signature', credentials.signature);
        formData.append('folder', credentials.folder);
        formData.append('public_id', credentials.publicId);

        if (credentials.eager) {
            formData.append('eager', credentials.eager);
            formData.append('eager_async', 'true');
        }

        if (credentials.notificationUrl) {
            formData.append('notification_url', credentials.notificationUrl);
        }

        // تتبع حالة الرفع (Progress)
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress(progress);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
                    resolve({ success: true, data: response });
                } catch (e) {
                    void e
                    resolve({ success: false, error: 'Failed to parse Cloudinary response' });
                }
            } else {
                let errorMessage = 'Upload failed';
                try {
                    errorMessage = JSON.parse(xhr.responseText).error?.message || errorMessage;
                } catch (e) { void e}
                resolve({ success: false, error: errorMessage });
            }
        });

        xhr.addEventListener('error', () => resolve({ success: false, error: 'Network error during upload' }));
        xhr.addEventListener('abort', () => resolve({ success: false, error: 'Upload cancelled' }));

        xhr.open('POST', uploadUrl);
        xhr.send(formData);
    });
}