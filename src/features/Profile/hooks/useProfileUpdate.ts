import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateProfileName, updateProfilePassword, type UpdateNamePayload, type UpdatePasswordPayload } from '../api/profile.api';

export const useUpdateName = () => {
    return useMutation({
        mutationFn: (data: UpdateNamePayload) => updateProfileName(data),
        onSuccess: () => {
            toast.success('تم تحديث البيانات الشخصية بنجاح!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات');
        },
    });
};

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: (data: UpdatePasswordPayload) => updateProfilePassword(data),
        onSuccess: () => {
            toast.success('تم تغيير كلمة المرور بنجاح!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
        },
    });
};