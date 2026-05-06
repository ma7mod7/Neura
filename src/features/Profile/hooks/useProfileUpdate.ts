import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateProfileImage, updateProfileName, updateProfilePassword, type UpdateNamePayload, type UpdatePasswordPayload } from '../api/profile.api';
import { useAuth } from '../../auth/hooks/useAuth';

export const useUpdateName = () => {
    return useMutation({
        mutationFn: (data: UpdateNamePayload) => updateProfileName(data),
        onSuccess: () => {
            toast.success('Name Updated');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error happend during change name');
        },
    });
};

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: (data: UpdatePasswordPayload) => updateProfilePassword(data),
        onSuccess: () => {
            toast.success('Password changed');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error happend during change Password');
        },
    });
};


export const useUpdateImage = () => {
    const { updateUser } = useAuth(); 

    return useMutation({
        mutationFn: (imageFile: File) => updateProfileImage(imageFile),
        onSuccess: (data) => {
            console.log("Response from server:", data);
            
            // استخراج الرابط الجديد (بناءً على شكل استجابة السيرفر بتاعك)
            let newImageUrl = null;
            if (typeof data === 'string' && data.startsWith('http')) {
                newImageUrl = data;
            } else if (data?.imageUrl || data?.image || data?.url) {
                newImageUrl = data.imageUrl || data.image || data.url;
            }

            if (newImageUrl) {
                updateUser({ imageUrl: newImageUrl });
                toast.success('Updated User Photo ');
            } 
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error happened during change Photo');
        },
    });
};