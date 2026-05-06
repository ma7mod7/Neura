import { useState, useRef } from 'react';
import { User, Lock, Save, Loader2, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import NavBar from '../../../shared/components/NavBar';
import Footer from '../../../shared/components/footerauth';
import SideBar from '../components/SideBar';
import { useUpdateName, useUpdatePassword, useUpdateImage } from '../hooks/useProfileUpdate';
import { updateNameSchema, updatePasswordSchema, type UpdateNameInputs, type UpdatePasswordInputs } from '../schema/profile.schema';

const ProfileEditPage = () => {
    // Mutations
    const { mutate: mutateName, isPending: isPendingName } = useUpdateName();
    const { mutate: mutatePassword, isPending: isPendingPassword } = useUpdatePassword();
    const { mutate: mutateImage, isPending: isPendingImage } = useUpdateImage();

    // Image Upload State & Ref
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Form for Personal Info (Name)
    const {
        register: registerName,
        handleSubmit: handleSubmitName,
        formState: { errors: errorsName }
    } = useForm<UpdateNameInputs>({
        resolver: zodResolver(updateNameSchema),
        defaultValues: { firstName: '', lastName: '' }
    });

    // 2. Form for Password
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: errorsPassword },
        reset: resetPasswordForm
    } = useForm<UpdatePasswordInputs>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
    });

    // Submit Handlers
    const onSubmitName = (data: UpdateNameInputs) => {
        mutateName({
            firstName: data.firstName || null,
            lastName: data.lastName || null,
        });
    };

    const onSubmitPassword = (data: UpdatePasswordInputs) => {
        mutatePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        }, {
            onSuccess: () => {
                
                resetPasswordForm();
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 1. عرض الصورة للمستخدم كـ Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string); 
            };
            reader.readAsDataURL(file);

            // 2. إرسال الملف الفعلي (File Object) للسيرفر
            mutateImage(file as any); // استخدم as any إذا كان الـ Hook لا يزال مقيداً بـ string مؤقتاً
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0e0e10] font-inter">
            <NavBar />

            <main className="mx-auto p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT SIDEBAR --- */}
                    <SideBar />

                    {/* --- RIGHT CONTENT --- */}
                    <div className="lg:col-span-9 space-y-6">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Profile</h1>

                        {/* --- FORM 1: Personal Info --- */}
                        <div className="bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-sm border border-slate-100 dark:border-[#2a2a2e] p-6 md:p-8">
                            
                            {/* --- User Image Upload Section --- */}
                            <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-100 dark:border-[#2a2a2e]">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-[#1c1c1f] shadow-lg bg-slate-100 dark:bg-[#2a2a2e] flex items-center justify-center relative">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-slate-400" />
                                        )}
                                        {/* Hover Overlay */}
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <Camera size={28} className="text-white" />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isPendingImage}
                                        className="absolute bottom-1 right-1 p-2.5 bg-[#0061EF] text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                                    >
                                        {isPendingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">Profile Picture</p>
                            </div>

                            <form onSubmit={handleSubmitName(onSubmitName)} className="space-y-6">
                                <div className="flex items-center gap-2 mb-4 text-[#0061EF]">
                                    <User size={20} />
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Personal Information</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">First Name</label>
                                        <input
                                            {...registerName('firstName')}
                                            type="text"
                                            placeholder="Enter your first name"
                                            className={`w-full bg-slate-50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-[#0061EF] text-sm ${errorsName.firstName ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-[#2a2a2e]'}`}
                                        />
                                        {errorsName.firstName && <p className="text-xs text-red-500">{errorsName.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Name</label>
                                        <input
                                            {...registerName('lastName')}
                                            type="text"
                                            placeholder="Enter your last name"
                                            className={`w-full bg-slate-50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-[#0061EF] text-sm ${errorsName.lastName ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-[#2a2a2e]'}`}
                                        />
                                        {errorsName.lastName && <p className="text-xs text-red-500">{errorsName.lastName.message}</p>}
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isPendingName}
                                        className="bg-[#0061EF] hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isPendingName ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {isPendingName ? 'Saving...' : 'Save Info'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* --- FORM 2: Password --- */}
                        <div className="bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-sm border border-slate-100 dark:border-[#2a2a2e] p-6 md:p-8">
                            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                                <div className="flex items-center gap-2 mb-4 text-[#0061EF]">
                                    <Lock size={20} />
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Change Password</h2>
                                </div>

                                <div className="space-y-2 w-full md:w-1/2">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Password</label>
                                    <input
                                        {...registerPassword('currentPassword')}
                                        type="password"
                                        placeholder="Enter current password"
                                        className={`w-full bg-slate-50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-[#0061EF] text-sm ${errorsPassword.currentPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-[#2a2a2e]'}`}
                                    />
                                    {errorsPassword.currentPassword && <p className="text-xs text-red-500">{errorsPassword.currentPassword.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">New Password</label>
                                        <input
                                            {...registerPassword('newPassword')}
                                            type="password"
                                            placeholder="Enter new password"
                                            className={`w-full bg-slate-50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-[#0061EF] text-sm ${errorsPassword.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-[#2a2a2e]'}`}
                                        />
                                        {errorsPassword.newPassword && <p className="text-xs text-red-500">{errorsPassword.newPassword.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Confirm New Password</label>
                                        <input
                                            {...registerPassword('confirmPassword')}
                                            type="password"
                                            placeholder="Confirm new password"
                                            className={`w-full bg-slate-50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-[#0061EF] text-sm ${errorsPassword.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-[#2a2a2e]'}`}
                                        />
                                        {errorsPassword.confirmPassword && <p className="text-xs text-red-500">{errorsPassword.confirmPassword.message}</p>}
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isPendingPassword}
                                        className="bg-[#0061EF] hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isPendingPassword ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {isPendingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfileEditPage;