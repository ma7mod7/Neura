import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, Trash2, Plus, Pencil, Loader2, ChevronDown, X, Check } from 'lucide-react';
import { courseSchema, type CourseSchemaTypes } from '../schema/CourseFormSchema';
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseTags } from "../api/courseApi";

interface PropsTypes {
    currentStep: number;
    onSubmitData: (data: CourseSchemaTypes) => Promise<void>;
    isSaving: boolean;
    initialData?: Partial<CourseSchemaTypes> | null;
    initialImageUrl?: string | null;
}

export default function FormStep1({ currentStep, onSubmitData, isSaving, initialData, initialImageUrl }: PropsTypes) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl || null);

    const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<CourseSchemaTypes>({
        resolver: zodResolver(courseSchema),
    });

    const selectedTags = watch('Tags') || [];

    // ================= TanStack Query: Fetch Tags =================
    const { data: availableTags, isLoading: isLoadingTags, isError: isTagsError } = useQuery({
        queryKey: ['courseTags'],
        queryFn: fetchCourseTags,
        staleTime: 1000 * 60 * 5,
    });
    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
        if (initialImageUrl) {
            setImagePreview(initialImageUrl);
        }
    }, [initialData, initialImageUrl, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setValue('Image', file, { shouldValidate: true });
        }
    };

    const handleToggleTag = (tagId: number) => {
        if (selectedTags.includes(tagId)) {
            setValue('Tags', selectedTags.filter(id => id !== tagId), { shouldValidate: true });
        } else {
            setValue('Tags', [...selectedTags, tagId], { shouldValidate: true });
        }
    };

    const handleRemoveTag = (tagId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setValue('Tags', selectedTags.filter(id => id !== tagId), { shouldValidate: true });
    };

    const { fields: outcomeFields, append: appendOutcome, remove: removeOutcome } = useFieldArray({
        control,
        name: "LearningOutcomes"
    });
    const { fields: prereqFields, append: appendPrereq, remove: removePrereq } = useFieldArray({
        control,
        name: "Prerequisites"
    });

    const onSubmitStep1 = async (data: CourseSchemaTypes) => {
        await onSubmitData(data);
    };

    // دالة هتطبع الأخطاء في الكونسول علشان لو الفورم معملش Submit تعرف السبب فوراً
    const onFormError = (errors: any) => {
        console.log("Validation Errors prevented submission:", errors);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitStep1, onFormError)} className={currentStep === 1 ? 'block' : 'hidden'}>
            <div className="bg-white dark:bg-[#1c1c1f] rounded-xl p-8 shadow-sm flex flex-col gap-6 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-[#0e0e10] p-6 rounded-lg space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Course Title</label>
                                <input {...register("Title")} className="w-full border border-blue-300 dark:border-[#0061EF]/40 dark:bg-[#1c1c1f] dark:text-white rounded p-2 focus:outline-blue-500" disabled={isSaving} />
                                {errors.Title && <span className="text-red-500 text-xs mt-1">{errors.Title.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Description</label>
                                <input {...register("description")} className="w-full border border-blue-300 dark:border-[#0061EF]/40 dark:bg-[#1c1c1f] dark:text-white rounded p-2 focus:outline-blue-500" disabled={isSaving} />
                                {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description.message}</span>}
                            </div>

                            {/* ======== تم إضافة حقل مدة الكورس الناقص ======== */}
                            <div>
                                <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Price</label>
                                <input {...register("price")} className="w-full border border-blue-300 dark:border-[#0061EF]/40 dark:bg-[#1c1c1f] dark:text-white rounded p-2 focus:outline-blue-500" disabled={isSaving} />
                                {errors.price && <span className="text-red-500 text-xs mt-1">{errors.price.message}</span>}
                            </div>

                            {/* ================= Tags Multi-Select Dropdown ================= */}
                            <div className="relative">
                                <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Course Tags</label>

                                <div
                                    className={`w-full min-h-[42px] border rounded p-2 flex flex-wrap items-center gap-2 cursor-pointer transition-colors ${errors.Tags ? 'border-red-500' : 'border-blue-300 dark:border-[#0061EF]/40 hover:border-blue-400'
                                        } ${isSaving ? 'opacity-60 cursor-not-allowed' : 'bg-white dark:bg-[#1c1c1f]'}`}
                                    onClick={() => !isSaving && setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                                >
                                    {selectedTags.length === 0 && (
                                        <span className="text-gray-400 dark:text-slate-500 text-sm ml-1">Select tags...</span>
                                    )}

                                    {selectedTags.map(tagId => {
                                        const tagObj = availableTags?.find((t: { id: number; name: string }) => t.id === tagId);
                                        return tagObj ? (
                                            <span key={tagId} className="flex items-center gap-1 bg-blue-100 dark:bg-[#0061EF]/15 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-md font-medium">
                                                {tagObj.name}
                                                <button type="button" onClick={(e) => handleRemoveTag(tagId, e)} className="hover:bg-blue-200 dark:hover:bg-[#0061EF]/30 rounded-full p-0.5 transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ) : null;
                                    })}

                                    <div className="ml-auto">
                                        {isLoadingTags ? (
                                            <Loader2 size={16} className="text-gray-400 animate-spin" />
                                        ) : (
                                            <ChevronDown size={18} className="text-gray-400 dark:text-slate-500" />
                                        )}
                                    </div>
                                </div>
                                {errors.Tags && <span className="text-red-500 text-xs mt-1 block">{errors.Tags.message}</span>}

                                {isTagsDropdownOpen && !isSaving && !isLoadingTags && !isTagsError && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsTagsDropdownOpen(false)}></div>

                                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-[#2a2a2e] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {availableTags.length === 0 ? (
                                                <div className="p-3 text-sm text-gray-500 dark:text-slate-400 text-center">No tags available</div>
                                            ) : (
                                                availableTags.map((tag: { id: number; name: string }) => {
                                                    const isSelected = selectedTags.includes(tag.id);
                                                    return (
                                                        <div
                                                            key={tag.id}
                                                            onClick={() => handleToggleTag(tag.id)}
                                                            className={`flex items-center justify-between p-3 text-sm cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-[#0061EF]/10 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2e] text-gray-700 dark:text-slate-300'
                                                                }`}
                                                        >
                                                            <span>{tag.name}</span>
                                                            {isSelected && <Check size={16} className="text-blue-600" />}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* ================= End Tags ================= */}

                        </div>

                        <div className="bg-gray-50 dark:bg-[#0e0e10] p-6 rounded-lg space-y-4">
                            <h3 className="font-bold mb-2 dark:text-white">Instructor Details</h3>
                            <div>
                                <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Instructor Name</label>
                                <input {...register("instructorName")} className="w-full border border-blue-300 dark:border-[#0061EF]/40 dark:bg-[#1c1c1f] dark:text-white rounded p-2 focus:outline-blue-500" disabled={isSaving} />
                                {errors.instructorName && <span className="text-red-500 text-xs mt-1">{errors.instructorName.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div
                            className={`border border-blue-300 dark:border-[#0061EF]/40 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-blue-600 bg-white dark:bg-[#1c1c1f] hover:bg-blue-50 dark:hover:bg-[#0061EF]/5 cursor-pointer transition-colors relative h-64 overflow-hidden group ${errors.Image ? 'border-red-500' : ''
                                } ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={() => imageInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Course Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Pencil size={24} className="text-white mb-2" />
                                        <span className="text-white text-sm font-medium">Change Photo</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={40} className="mb-2 text-black dark:text-slate-300" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-black dark:text-slate-300 text-sm">Add Course Photo</span>
                                        <Plus size={16} className="text-blue-600" />
                                    </div>
                                </>
                            )}
                            <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageChange} disabled={isSaving} />

                            {/* إظهار خطأ الصورة بشكل أوضح */}
                            {errors?.Image && (
                                <span className="text-red-500 text-xs font-medium absolute bottom-4 bg-white dark:bg-[#1c1c1f] px-2 py-1 rounded">
                                    {errors.Image.message as string}
                                </span>
                            )}
                        </div>

                        {/* Outcomes Field Array */}
                        <div className="bg-gray-50 dark:bg-[#0e0e10] p-6 rounded-lg space-y-4">
                            <h3 className="font-bold dark:text-white">What You'll Learn</h3>
                            {outcomeFields.map((field, index) => (
                                <div key={field.id}>
                                    <div className="flex items-center gap-2">
                                        <input {...register(`LearningOutcomes.${index}.value` as const)} className="flex-1 border border-blue-300 dark:border-[#0061EF]/40 dark:bg-[#1c1c1f] dark:text-white rounded p-2 focus:outline-blue-500" disabled={isSaving} />
                                        <button type="button" onClick={() => removeOutcome(index)} className="text-red-500 hover:text-red-700" disabled={isSaving}><Trash2 size={20} /></button>
                                    </div>
                                    {errors.LearningOutcomes?.[index]?.value && <span className="text-red-500 text-xs">{errors.LearningOutcomes[index]?.value?.message}</span>}
                                </div>
                            ))}
                            <button type="button" onClick={() => appendOutcome({ value: '' })} className="w-full border border-blue-300 dark:border-[#0061EF]/40 border-dashed text-blue-600 rounded p-2 flex justify-center items-center gap-2 hover:bg-blue-50 dark:hover:bg-[#0061EF]/10" disabled={isSaving}>
                                <span className="text-sm">Add outcomes</span><Plus size={16} />
                            </button>
                        </div>

                        {/* Prerequisites Field Array */}
                        <div className="bg-gray-50 dark:bg-[#0e0e10] p-6 rounded-lg space-y-4">
                            <h3 className="font-bold dark:text-white">Prerequisites</h3>
                            {prereqFields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <input {...register(`Prerequisites.${index}.value` as const)} className="flex-1 border border-blue-300 dark:border-[#0061EF]/40 dark:bg-[#1c1c1f] dark:text-white rounded p-2 focus:outline-blue-500" disabled={isSaving} />
                                    <button type="button" onClick={() => removePrereq(index)} className="text-red-500 hover:text-red-700" disabled={isSaving}><Trash2 size={20} /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => appendPrereq({ value: '' })} className="w-full border border-blue-300 dark:border-[#0061EF]/40 border-dashed text-blue-600 rounded p-2 flex justify-center items-center gap-2 hover:bg-blue-50 dark:hover:bg-[#0061EF]/10" disabled={isSaving}>
                                <span className="text-sm">Add Prerequisites</span><Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button type="submit" disabled={isSaving} className={`px-6 py-2 rounded flex items-center gap-2 transition text-white ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {isSaving ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : <>Save & continue <span className="text-xl">→</span></>}
                    </button>
                </div>
            </div>
        </form>
    )
}