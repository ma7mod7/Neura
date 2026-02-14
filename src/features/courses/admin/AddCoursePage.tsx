import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { 
    Upload, X, Save, Layout, Clock, DollarSign, FileText, Image as ImageIcon 
} from 'lucide-react';

import { courseSchema, type CourseFormValues } from '../schema/courseSchema';
import { useCreateCourse } from '../api/useCreateCourse';

const AddCoursePage = () => {
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    // 1. Setup Hook Form
    const { 
        register, 
        handleSubmit, 
        formState: { errors },
        setValue, // هنحتاجها لو عايزين نغير قيم يدوياً
    } = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            price: 0,
            category: ""
        }
    });

    // 2. Setup React Query Mutation
    const { mutate, isPending } = useCreateCourse();

    // 3. Handle Submit
    const onSubmit = (data: CourseFormValues) => {
        mutate(data, {
            onSuccess: () => {
                // Navigate back or reset form
                navigate('/courses'); 
            }
        });
    };

    // Helper for Image Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // دمج الـ ref بتاع react-hook-form مع الـ onChange بتاعنا
    const { ref: fileRef, onChange: fileOnChange, ...fileRest } = register("thumbnail");

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-inter p-6 md:p-10">
            <div className="max-w-[1200px] mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Add New Course</h1>
                        <p className="text-slate-500 text-sm mt-1">Create a new course and add it to the catalog.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        
                        {/* Submit Button linked to form */}
                        <button 
                            onClick={handleSubmit(onSubmit)}
                            disabled={isPending}
                            className="px-5 py-2.5 rounded-xl bg-[#0061EF] text-white hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {isPending ? 'Publishing...' : 'Publish Course'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- Left Column --- */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* General Info */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Layout size={20} className="text-[#0061EF]" />
                                General Information
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Title</label>
                                    <input 
                                        {...register("title")}
                                        type="text" 
                                        placeholder="e.g. Complete Machine Learning Bootcamp"
                                        className={`w-full bg-slate-50 rounded-xl py-3 px-4 outline-none border transition-all ${errors.title ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#0061EF]/50 focus:border-[#0061EF]'}`}
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                    <textarea 
                                        {...register("description")}
                                        rows={5}
                                        placeholder="Write a compelling description..."
                                        className={`w-full bg-slate-50 rounded-xl py-3 px-4 outline-none border transition-all resize-none ${errors.description ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#0061EF]/50'}`}
                                    />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Course Details */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-[#0061EF]" />
                                Course Details
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Instructor Name</label>
                                    <input 
                                        {...register("instructor")}
                                        type="text" 
                                        placeholder="e.g. Angela Yu"
                                        className={`w-full bg-slate-50 rounded-xl py-3 px-4 outline-none border transition-all ${errors.instructor ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#0061EF]/50'}`}
                                    />
                                    {errors.instructor && <p className="text-red-500 text-xs mt-1">{errors.instructor.message as string}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            {...register("duration")}
                                            type="text" 
                                            placeholder="e.g. 45h"
                                            className={`w-full bg-slate-50 rounded-xl py-3 pl-12 pr-4 outline-none border transition-all ${errors.duration ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#0061EF]/50'}`}
                                        />
                                    </div>
                                    {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message as string}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column --- */}
                    <div className="space-y-6">
                        
                        {/* Thumbnail Upload */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ImageIcon size={20} className="text-[#0061EF]" />
                                Thumbnail
                            </h2>
                            
                            <div className={`relative w-full aspect-video bg-slate-50 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center overflow-hidden cursor-pointer group ${errors.thumbnail ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-[#0061EF]'}`}>
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation(); // منع فتح الـ dialog
                                                setImagePreview(null);
                                                setValue("thumbnail", null); // تصفير القيمة في الفورم
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center p-4 text-center">
                                        <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="text-[#0061EF]" size={24} />
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">Click to upload image</p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                                <input 
                                    {...fileRest}
                                    type="file" 
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    ref={fileRef}
                                    onChange={(e) => {
                                        fileOnChange(e); // قول لـ Hook Form إن فيه تغيير
                                        handleImageChange(e); // حدث الـ Preview بتاعنا
                                    }}
                                />
                            </div>
                            {errors.thumbnail && <p className="text-red-500 text-xs mt-2 text-center">{errors.thumbnail.message as string}</p>}
                        </div>

                        {/* Settings */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <DollarSign size={20} className="text-[#0061EF]" />
                                Settings
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (E.L)</label>
                                    <input 
                                        {...register("price")}
                                        type="number" 
                                        placeholder="0.00"
                                        className={`w-full bg-slate-50 rounded-xl py-3 px-4 outline-none border transition-all ${errors.price ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#0061EF]/50'}`}
                                    />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message as string}</p>}
                                    <p className="text-xs text-slate-400 mt-1">Leave 0 for free courses.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                                    <select 
                                        {...register("category")}
                                        className={`w-full bg-slate-50 rounded-xl py-3 px-4 outline-none border transition-all text-slate-700 ${errors.category ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#0061EF]/50'}`}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                                        <option value="Web Development">Web Development</option>
                                        <option value="Data Science">Data Science</option>
                                    </select>
                                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>}
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCoursePage;