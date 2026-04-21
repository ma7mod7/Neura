import { z } from 'zod';

export const updateNameSchema = z.object({
    firstName: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل").optional().or(z.literal('')),
    lastName: z.string().min(2, "الاسم الأخير يجب أن يكون حرفين على الأقل").optional().or(z.literal('')),
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, "برجاء إدخال كلمة المرور الحالية"),
    newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "برجاء تأكيد كلمة المرور"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
});

export type UpdateNameInputs = z.infer<typeof updateNameSchema>;
export type UpdatePasswordInputs = z.infer<typeof updatePasswordSchema>;