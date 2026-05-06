import { useState, useEffect, useRef } from 'react';
import {
    Plus, PlaySquare, FileText, ChevronDown, X,
    Pencil, Trash2, GripVertical, UploadCloud, Check,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import FormStep1 from '../components/FormStep1';
import { type CourseApiPayload, type CourseSchemaTypes } from '../schema/CourseFormSchema';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
    createCourseSection,
    deleteCourseSection,
    deleteLesson,
    fetchCourseMetadata,
    saveCourseStep1,
    updateCourseSection,
    type CreateCourseSectionPayload,
    updateLessonArticle,
    publishLesson,
    getSectionLessons,
    createSectionItem,
    getVideoUploadSignature,
    saveLessonVideoMetadata,
    activateCourse,
    deactivateCourse
} from '../api/courseApi';

import { uploadToCloudinary } from '../../../utils/cloudinaryUpload';
import { deleteExam } from '../api/quizApi';
import { RichTextEditor } from '../components/RichTextEditor';
import { QuizEditorModal } from '../components/quiz/QuizEditorModal';
import { useGetCourseContent } from '../../courses/api/useCoursePlayer';

type ItemType = 'lesson' | 'resource' | 'quiz';

interface ContentItem {
    id: string;
    type: ItemType;
    title: string;
    fileName?: string;
    fileUrl?: string;
    position?: number;
    lessonId?: number;
}

interface Section {
    id: string;
    title: string;
    isExpanded: boolean;
    items: ContentItem[];
}

interface ModalConfig {
    isOpen: boolean;
    type: 'section' | ItemType | null;
    action: 'add' | 'edit';
    sectionId?: string;
    itemId?: string;
    initialTitle?: string;
    initialFileName?: string;
}

export default function CreateCourse() {
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();

    const [currentStep, setCurrentStep] = useState<number>(1);
    const [courseId, setCourseId] = useState<string | null>(() => {
        if (id) return id;
        return localStorage.getItem('courseDraftId');
    });
    const [sections, setSections] = useState<Section[]>([]);
    const [courseBasicData, setCourseBasicData] = useState<Partial<CourseSchemaTypes> | null>(null);
    const [syncStatus, setSyncStatus] = useState<'Loading' | 'Saved' | 'Saving...' | 'Error'>('Loading');
    
    // ⭐ الاعتماد على الـ status بدلاً من isActive
    const [courseStatus, setCourseStatus] = useState<number>(1);
    // ⭐ الحالة رقم 2 تعني Active (تعديل الرقم لو الباك إند بيستخدم رقم مختلف)
    const isCourseActive = courseStatus === 2;

    const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, type: null, action: 'add' });
    const [modalInputValue, setModalInputValue] = useState('');
    const [modalFileName, setModalFileName] = useState('');
    const [openMenuSectionId, setOpenMenuSectionId] = useState<string | null>(null);
    const [modalFile, setModalFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
    const [modalHtmlContent, setModalHtmlContent] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatusText, setUploadStatusText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [quizEditorConfig, setQuizEditorConfig] = useState<{ isOpen: boolean, lessonId: number, title: string, action: 'add' | 'edit' }>({
        isOpen: false, lessonId: 0, title: '', action: 'add'
    });

    const saveCourseMutation = useMutation({
        mutationFn: (formData: CourseApiPayload) => saveCourseStep1(formData, courseId),
        onSuccess: (data) => {
            if (!courseId) setCourseId(data);
            setSyncStatus('Saved');
            setCurrentStep(2);
            queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
            queryClient.invalidateQueries({ queryKey: ['course-content'] });
            toast.success("Course details saved successfully!");
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            setSyncStatus('Error');
            toast.error("Failed to save course details. Please try again.");
        }
    });

    // ⭐ تم تعديل المنطق ليمرر courseId مباشرة ويقرأ رسالة الخطأ من السيرفر
    const toggleCourseMutation = useMutation({
        mutationFn: async ({ courseId, action }: { courseId: string; action: 'activate' | 'deactivate' }) => {
            if (action === 'activate') return activateCourse(courseId);
            return deactivateCourse(courseId);
        },
        onSuccess: (_, variables) => {
            toast.success(`Course ${variables.action === 'activate' ? 'activated' : 'deactivated'} successfully!`);
            setSyncStatus('Saved');
            // تحديث البيانات في الخلفية لجلب الحالة الجديدة
            queryClient.invalidateQueries({ queryKey: ['course-content'] });
            queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
        },
        onError: (error: any) => {
            // قراءة رسالة الخطأ القادمة من الباك إند
            const backendErrors = error.response?.data?.errors;
            
            if (Array.isArray(backendErrors) && backendErrors.length > 0) {
                toast.error(backendErrors.join(" - ")); 
            } else {
                toast.error("Failed to update course status.");
            }
            setSyncStatus('Error');
        }
    });

    const deleteItemMutation = useMutation({
        mutationFn: (itemId: string) => deleteLesson(Number(itemId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-content'] });
            queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
        }
    });

    const deleteQuizMutation = useMutation({
        mutationFn: (lessonId: string) => deleteExam(Number(lessonId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-content'] });
            queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
        }
    });

    const updateArticleMutation = useMutation({
        mutationFn: (variables: { itemId: string; payload: { htmlContent: string } }) =>
            updateLessonArticle(Number(variables.itemId), variables.payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-content'] });
            queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
        }
    });

    const createSectionMutation = useMutation({
        mutationFn: (variables: { courseId: string; sectionData: CreateCourseSectionPayload }) =>
            createCourseSection(variables.courseId, variables.sectionData),
        onSuccess: (data) => {
            const realSectionId = String(data.id || data.data?.id);
            setSections(prevSections => [
                ...prevSections,
                { id: realSectionId, title: modalInputValue, isExpanded: true, items: [] }
            ]);
            setSyncStatus('Saved');
            queryClient.invalidateQueries({ queryKey: ['course-content'] });
            queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
            closeModal();
            queryClient.invalidateQueries({ queryKey: ['course-content'] });
            toast.success("Section created successfully!");
        }
    });

    const updateSectionMutation = useMutation({
        mutationFn: (variables: { sectionId: string; sectionData: CreateCourseSectionPayload }) =>
            updateCourseSection(variables.sectionId, variables.sectionData),
        onSuccess: (variables) => {
            setSections(prevSections =>
                prevSections.map(sec =>
                    sec.id === variables.sectionId ? { ...sec, title: modalInputValue } : sec
                )
            );
            setSyncStatus('Saved');
            closeModal();
            queryClient.invalidateQueries({ queryKey: ['course-content'] });
            toast.success("Section updated successfully!");
        }
    });

    const deleteSectionMutation = useMutation({
        mutationFn: (sectionId: string) => deleteCourseSection(Number(sectionId)),
        onSuccess: (sectionId) => {
            setSections(prevSections => prevSections.filter(sec => sec.id !== sectionId));
            setSyncStatus('Saved');
            queryClient.invalidateQueries({ queryKey: ['course-content'] });
            queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
            location.reload()
            toast.success("Section deleted!");
        }
    });

    const { data: draftData } = useQuery({
        queryKey: ['courseDraft', courseId],
        queryFn: () => fetchCourseMetadata(courseId!),
        enabled: !!courseId,
    });
    
    const { data: courseContentData } = useGetCourseContent(courseId ?? '');

    useEffect(() => {
        if (courseContentData?.sections?.length && sections.length === 0) {
            setSections(courseContentData.sections.map((sec: any) => ({
                id: String(sec.id),
                title: sec.title,
                isExpanded: true,
                items: (sec.lessons || sec.items || sec.sectionItems || []).map((item: any) => ({
                    id: String(item.id),
                    lessonId: item.lessonId ? Number(item.lessonId) : undefined,
                    type: item.type?.toLowerCase() === 'quiz' ? 'quiz'
                        : item.type?.toLowerCase() === 'article' ? 'resource'
                        : 'lesson',
                    title: item.title,
                    position: item.position || item.order || 0,
                }))
            })));
        }
    }, [courseContentData, sections.length]);

    useEffect(() => {
        if (draftData) {
            const mappedData: Partial<CourseSchemaTypes> = {
                Title: draftData.title || '',
                description: draftData.description || '',
                price: draftData.price ? draftData.price.toString() : '',
                instructorName: draftData.instructorName || '',
                LearningOutcomes: draftData.learningOutcomes?.length
                    ? draftData.learningOutcomes.map(text => ({ value: text }))
                    : [{ value: '' }],
                Prerequisites: draftData.prerequisites?.length
                    ? draftData.prerequisites.map(text => ({ value: text }))
                    : [{ value: '' }],
                Tags: draftData.tags || [],
            };
            setCourseBasicData(mappedData);
            
            // ⭐ تحديث حالة الكورس كـ رقم بدلاً من boolean
            if (draftData.status !== undefined) {
                setCourseStatus(draftData.status);
            }

            if (draftData.sections?.length) {
                setSections(draftData.sections.map((sec: any) => ({
                    id: String(sec.id),
                    title: sec.title,
                    isExpanded: true,
                    items: (sec.lessons || sec.items || sec.sectionItems || []).map((item: any) => ({
                        id: String(item.id),
                        lessonId: item.lessonId ? Number(item.lessonId) : undefined,
                        type: item.type?.toLowerCase() === 'quiz' ? 'quiz' 
                            : item.type?.toLowerCase() === 'article' ? 'resource' 
                            : 'lesson',
                        title: item.title,
                    }))
                })));
            }
            setSyncStatus('Saved');
        }
    }, [draftData]);
    
    useEffect(() => {
        if (id) {
            setCourseId(id);
        } else {
            setCourseId(localStorage.getItem('courseDraftId'));
        }
    }, [id]);

    const handleStep1Submit = async (data: CourseSchemaTypes) => {
        setSyncStatus('Saving...');
        const formattedData = {
            ...data,
            LearningOutcomes: data.LearningOutcomes.map((item) => item.value),
            Prerequisites: data.Prerequisites.map((item) => item.value),
        };
        saveCourseMutation.mutate(formattedData);
    };

    const handleStepClick = (stepNumber: number) => {
        if (stepNumber === 2 && !courseId) {
            toast.error("Please save course details first to continue.");
            return;
        }
        setCurrentStep(stepNumber);
    };

    const handleClearDraft = () => {
        setConfirmDialog({
            isOpen: true,
            title: "Clear Draft",
            message: "Are you sure you want to delete this draft completely? This cannot be undone.",
            onConfirm: async () => {
                setConfirmDialog(null);
                setCourseId(null);
                setSections([]);
                setCurrentStep(1);
                localStorage.removeItem('courseDraftId');
                setSyncStatus('Saved');
                toast.success("Draft cleared successfully.");
            }
        });
    };

    const openModal = (type: 'section' | ItemType, action: 'add' | 'edit', sectionId?: string, itemId?: string, initialTitle: string = '', initialFileName: string = '') => {
        setModalConfig({ isOpen: true, type, action, sectionId, itemId });
        setModalInputValue(initialTitle);
        setModalFileName(initialFileName);
        setOpenMenuSectionId(null);
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: null, action: 'add' });
        setModalInputValue('');
        setModalFileName('');
        setModalFile(null);
        setModalHtmlContent('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setModalFile(file);
            setModalFileName(file.name);
        }
    };

    const handleModalSubmit = async () => {
        if (!modalInputValue.trim()) return;

        if (modalConfig.type === 'section') {
            if (modalConfig.action === 'add') {
                createSectionMutation.mutate({
                    courseId: courseId!,
                    sectionData: { title: modalInputValue, position: sections.length + 1 }
                });
            } else {
                updateSectionMutation.mutate({
                    sectionId: modalConfig.sectionId!,
                    sectionData: {
                        title: modalInputValue,
                        position: sections.findIndex(sec => sec.id === modalConfig.sectionId) + 1
                    }
                });
            }
            return;
        }

        else if (modalConfig.type && modalConfig.sectionId) {
           let newPosition = 1;
            try {
                const existingLessons = await getSectionLessons(modalConfig.sectionId!);
                const lessons = Array.isArray(existingLessons) 
                    ? existingLessons 
                    : existingLessons.lessons || [];
                newPosition = lessons.length + 1;
            } catch {
                newPosition = (sections.find(s => s.id === modalConfig.sectionId)?.items?.length || 0) + 1;
            }

            if (modalConfig.type === 'lesson' && modalConfig.action === 'add') {
                if (!modalFile) return toast.error("Please select a video file first.");
                setIsUploading(true);
                setSyncStatus('Saving...');
                try {
                    setUploadStatusText('Creating lesson...');
                    const newLessonResponse = await createSectionItem(Number(modalConfig.sectionId), {
                        title: modalInputValue, type: 1, position: newPosition
                    });
                    const realLessonId = String(newLessonResponse?.id || newLessonResponse?.lessonId);
                    
                    setUploadStatusText('Getting upload permissions...');
                    const signatureData = await getVideoUploadSignature(realLessonId, {
                        fileName: modalFile.name, fileSize: modalFile.size, mimeType: modalFile.type
                    });

                    setUploadStatusText('Uploading video...');
                    const uploadResult = await uploadToCloudinary(modalFile, signatureData, (progress) => {
                        setUploadProgress(progress);
                        setUploadStatusText(`Uploading video... ${progress}%`);
                    });

                    await saveLessonVideoMetadata(realLessonId, {
                        publicId: uploadResult.data!.public_id,
                        videoUrl: uploadResult.data!.secure_url,
                        durationSeconds: uploadResult.data!.duration,
                        fileSize: uploadResult.data!.bytes,
                        format: uploadResult.data!.format
                    });

                    await publishLesson(realLessonId);
                    const newItem: ContentItem = { id: realLessonId, type: 'lesson', title: modalInputValue, fileName: modalFile.name, fileUrl: uploadResult.data!.secure_url, position: newPosition };
                    setSections(prev => prev.map(sec => sec.id === modalConfig.sectionId ? { ...sec, items: [...sec.items, newItem] } : sec));
                    setSyncStatus('Saved');
                    toast.success("Video lesson uploaded!");
                    
                    queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
                    queryClient.invalidateQueries({ queryKey: ['course-content'] });
                } catch (error) {
                    setSyncStatus('Error');
                    toast.error("Video upload failed.");
                } finally {
                    setIsUploading(false); setUploadProgress(0); setUploadStatusText(''); closeModal();
                }
                return;
            }

            if (modalConfig.type === 'quiz') {
                setSyncStatus('Saving...');
                try {
                    if (modalConfig.action === 'add') {
                        const newItemResponse = await createSectionItem(Number(modalConfig.sectionId), {
                            title: modalInputValue, type: 3, position: newPosition
                        });
                        const realItemId = Number(newItemResponse?.id || newItemResponse?.lessonId);

                        const newItem: ContentItem = {
                            id: String(realItemId), lessonId: realItemId, type: 'quiz', title: modalInputValue, position: newPosition
                        };
                        setSections(prev => prev.map(sec => sec.id === modalConfig.sectionId ? { ...sec, items: [...sec.items, newItem] } : sec));
                        
                        closeModal();
                        
                        setQuizEditorConfig({ isOpen: true, lessonId: realItemId, title: modalInputValue, action: 'add' });
                        
                        queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
                        queryClient.invalidateQueries({ queryKey: ['course-content'] });
                    }
                    setSyncStatus('Saved');
                } catch (error) {
                    setSyncStatus('Error'); toast.error("Failed to initialize quiz.");
                }
                return;
            }

            // =========================
            // Validation for Resource
            // =========================
            const isEmptyHtml = !modalHtmlContent || 
                                modalHtmlContent === '<p></p>' || 
                                modalHtmlContent === '<p><br></p>' || 
                                modalHtmlContent.replace(/<[^>]*>?/gm, '').trim() === '';

            if (modalConfig.action === 'add') {
                if (isEmptyHtml) {
                    toast.error("Please enter some content for the resource before saving.", {
                        icon: '⚠️',
                        duration: 4000
                    });
                    return;
                }
            } else {
                if (isEmptyHtml) {
                    toast.error("Resource content cannot be empty.", {
                        icon: '⚠️',
                        duration: 4000
                    });
                    return;
                }
            }

            setSyncStatus('Saving...');
            try {
                if (modalConfig.action === 'add') {
                    const newItemResponse = await createSectionItem(Number(modalConfig.sectionId), {
                        title: modalInputValue, type: 2, position: newPosition
                    });
                    const realItemId = String(newItemResponse?.id || newItemResponse?.lessonId);

                    await updateArticleMutation.mutateAsync({ itemId: realItemId, payload: { htmlContent: modalHtmlContent } });
                    await publishLesson(realItemId);

                    const newItem: ContentItem = { id: realItemId, type: 'resource', title: modalInputValue, position: newPosition, fileUrl: modalHtmlContent };
                    setSections(prev => prev.map(sec => sec.id === modalConfig.sectionId ? { ...sec, items: [...sec.items, newItem] } : sec));
                    toast.success("Resource added successfully!");
                } else {
                    await updateArticleMutation.mutateAsync({ itemId: modalConfig.itemId!, payload: { htmlContent: modalHtmlContent } });
                    setSections(prev => prev.map(sec => sec.id === modalConfig.sectionId ? {
                        ...sec, items: sec.items.map(item => item.id === modalConfig.itemId ? { ...item, title: modalInputValue, fileUrl: modalHtmlContent } : item)
                    } : sec));
                    toast.success("Resource updated!");
                }
                
                queryClient.invalidateQueries({ queryKey: ['courseDraft', courseId] });
                queryClient.invalidateQueries({ queryKey: ['course-content'] });
                setSyncStatus('Saved');
            } catch (error) {
                setSyncStatus('Error'); toast.error("Failed to save resource.");
            } finally {
                closeModal();
            }
        }
    };

    const deleteSection = (id: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Section",
            message: "Are you sure you want to delete this section? All lessons inside will be removed.",
            onConfirm: () => {
                setConfirmDialog(null);
                setSyncStatus('Saving...');
                deleteSectionMutation.mutate(id);
                
            }
        });
    };

    const deleteItem = (sectionId: string, itemId: string, itemType: ItemType) => {
        setConfirmDialog({
            isOpen: true,
            title: `Delete ${itemType}`,
            message: `Are you sure you want to delete this ${itemType}? This action cannot be undone.`,
            onConfirm: async () => {
                setConfirmDialog(null);
                setSyncStatus('Saving...');
                try {
                    if (itemType === 'quiz') {
                        await deleteQuizMutation.mutateAsync(itemId);
                    } else {
                        await deleteItemMutation.mutateAsync(itemId);
                    }

                    setSections(prevSections =>
                        prevSections.map(sec =>
                            sec.id === sectionId ? { ...sec, items: sec.items.filter(item => item.id !== itemId) } : sec
                        )
                    );
                    setSyncStatus('Saved');
                    toast.success(`${itemType} deleted successfully!`);
                } catch (error) {
                    setSyncStatus('Error');
                    toast.error(`Failed to delete ${itemType}.`);
                }
            }
        });
    };

    const toggleSection = (id: string) => {
        setSections(sections.map(sec => sec.id === id ? { ...sec, isExpanded: !sec.isExpanded } : sec));
    };

    const onDragEnd = async (result: any) => {
        const { destination, source, type } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newSections = Array.from(sections);

        if (type === 'SECTION') {
            const [movedSection] = newSections.splice(source.index, 1);
            newSections.splice(destination.index, 0, movedSection);
            setSections(newSections);
        } else if (type === 'ITEM') {
            const sourceSectionIndex = newSections.findIndex(s => s.id === source.droppableId);
            const destSectionIndex = newSections.findIndex(s => s.id === destination.droppableId);

            const sourceItems = Array.from(newSections[sourceSectionIndex].items);
            const destItems = source.droppableId === destination.droppableId ? sourceItems : Array.from(newSections[destSectionIndex].items);

            const [movedItem] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, movedItem);

            newSections[sourceSectionIndex] = { ...newSections[sourceSectionIndex], items: sourceItems };
            if (source.droppableId !== destination.droppableId) {
                newSections[destSectionIndex] = { ...newSections[destSectionIndex], items: destItems };
            }
            setSections(newSections);
        }

        setSyncStatus('Saving...');
        try {
            await new Promise(res => setTimeout(res, 400));
            setSyncStatus('Saved');
        } catch (error) {
            setSyncStatus('Error');
        }
    };

    const handleToggleStatus = () => {
        if (sections.length === 0) return toast.error("Please add at least one section and lesson before activating.");
        setSyncStatus('Saving...');
        
        if (isCourseActive) {
            toggleCourseMutation.mutate({ courseId: courseId!, action: 'deactivate' });
        } else {
            toggleCourseMutation.mutate({ courseId: courseId!, action: 'activate' });
        }
    };

    return (
        <div className="flex min-h-screen bg-[#EAEAEA] dark:bg-[#0e0e10] font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="flex justify-between items-center mb-6 ">
                    <h1 className="text-2xl font-bold dark:text-[#E0E0E0]">Create New Course</h1>

                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">
                            {syncStatus === 'Saving...' && <span className="text-yellow-600 animate-pulse">Saving changes...</span>}
                            {syncStatus === 'Saved' && <span className="text-green-600 flex items-center gap-1"><Check size={16} /> Saved</span>}
                            {syncStatus === 'Error' && <span className="text-red-500 flex items-center gap-1"><X size={16} /> Error</span>}
                        </div>
                        <button type="button" onClick={handleClearDraft} className="text-sm text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                            Clear Draft
                        </button>
                    </div>
                </div>

                <div className="flex justify-center mb-10 relative">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex flex-col items-center cursor-pointer" onClick={() => handleStepClick(1)}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-[#2a2a2e] text-gray-600 dark:text-[#d0d0E0]'}`}>1</div>
                            <span className={`text-xs mt-2 font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-gray-500 dark:text-[#d0d0E0]'}`}>Course Details</span>
                        </div>
                        <div className="w-32 h-0.5 bg-gray-300 dark:bg-[#2a2a2e] -mt-6"></div>
                        <div className="flex flex-col items-center cursor-pointer" onClick={() => handleStepClick(2)}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-[#2a2a2e] text-gray-600 dark:text-[#d0d0E0]'}`}>2</div>
                            <span className={`text-xs mt-2 font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500 dark:text-[#d0d0E0]'}`}>Course Content</span>
                        </div>
                    </div>
                </div>

                <FormStep1 currentStep={currentStep} onSubmitData={handleStep1Submit} isSaving={syncStatus === 'Saving...'} initialData={courseBasicData} />

                {currentStep === 2 && (
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-8 shadow-sm flex flex-col gap-4 max-w-4xl mx-auto min-h-[500px]">
                        <button type="button" onClick={() => openModal('section', 'add')} className="w-full border border-blue-300 dark:border-blue-500/50 border-dashed text-blue-600 dark:text-blue-400 rounded-lg p-3 flex justify-center items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition mb-4">
                            Add Section <Plus size={16} />
                        </button>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="course-board" type="SECTION">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                                        {sections.map((section, index) => (
                                            <Draggable key={section.id} draggableId={section.id} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} className="border dark:border-[#2a2a2e] rounded-lg overflow-hidden bg-white dark:bg-[#1A1A1A]">
                                                        <div className="bg-blue-100/50 dark:bg-blue-500/10 p-4 flex justify-between items-center group">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 dark:text-[#d0d0E0] hover:text-blue-600 dark:hover:text-blue-400">
                                                                    <GripVertical size={18} />
                                                                </div>
                                                                <div className="flex items-center gap-2 font-medium text-sm cursor-pointer select-none flex-1 dark:text-[#E0E0E0]" onClick={() => toggleSection(section.id)}>
                                                                    <ChevronDown size={18} className={`transition-transform duration-300 ${section.isExpanded ? "rotate-180" : "rotate-0"}`} />
                                                                    {section.title}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-gray-500 dark:text-[#d0d0E0] mr-2">{section.items.length} items</span>
                                                                <button onClick={() => openModal('section', 'edit', section.id, undefined, section.title)} className="text-gray-400 dark:text-[#d0d0E0] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Pencil size={16} /></button>
                                                                <button onClick={() => deleteSection(section.id)} className="text-gray-400 dark:text-[#d0d0E0] hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>

                                                        {section.isExpanded && (
                                                            <div className="p-4 flex flex-col">
                                                                <Droppable droppableId={section.id} type="ITEM">
                                                                    {(provided) => (
                                                                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 mb-4 min-h-[10px]">
                                                                            {section.items.map((item, itemIndex) => (
                                                                                <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                                                                    {(provided) => (
                                                                                        <div ref={provided.innerRef} {...provided.draggableProps} className="flex justify-between items-center p-3 border dark:border-[#2a2a2e] rounded-md bg-gray-50 dark:bg-[#0e0e10] hover:bg-gray-100 dark:hover:bg-[#2a2a2e] transition-colors">
                                                                                            <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-[#d0d0E0]">
                                                                                                <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 dark:text-[#d0d0E0] hover:text-blue-600 dark:hover:text-blue-400"><GripVertical size={16} /></div>
                                                                                                {item.type === 'lesson' && <PlaySquare size={16} className="text-blue-500" />}
                                                                                                {item.type === 'resource' && <FileText size={16} className="text-blue-500" />}
                                                                                                {item.type === 'quiz' && <FileText size={16} className="text-yellow-500" />}
                                                                                                <div className="flex flex-col">
                                                                                                    <span>{item.title}</span>
                                                                                                    {item.fileName && <span className="text-xs text-gray-400 dark:text-[#d0d0E0]/60 font-normal">{item.fileName}</span>}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                {(item.type === 'resource' || item.type === 'quiz') && (
                                                                                                    <button
                                                                                                        onClick={() => {
                                                                                                            if (item.type === 'resource') {
                                                                                                                openModal('resource', 'edit', section.id, item.id, item.title);
                                                                                                            } else if (item.type === 'quiz') {
                                                                                                                const realLessonId = item.lessonId ?? Number(item.id);
                                                                                                                setQuizEditorConfig({ isOpen: true, lessonId: realLessonId, title: item.title, action: 'edit' });
                                                                                                            }
                                                                                                        }}
                                                                                                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                                                                    >
                                                                                                        <Pencil size={16} />
                                                                                                    </button>
                                                                                                )}
                                                                                                <button onClick={() => deleteItem(section.id, item.id, item.type)} className="text-gray-400 dark:text-[#d0d0E0] hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </Draggable>
                                                                            ))}
                                                                            {provided.placeholder}
                                                                        </div>
                                                                    )}
                                                                </Droppable>

                                                                <div className="relative w-1/2 self-center flex flex-col items-center">
                                                                    {openMenuSectionId !== section.id ? (
                                                                        <button type="button" onClick={() => setOpenMenuSectionId(section.id)} className="w-full border border-blue-300 dark:border-blue-500/50 border-dashed text-blue-600 dark:text-blue-400 rounded p-2 flex justify-center items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-sm">Add item <Plus size={16} /></button>
                                                                    ) : (
                                                                        <div className="bg-blue-100 dark:bg-blue-500/20 rounded p-2 w-48 text-sm flex flex-col gap-2 shadow-md z-10">
                                                                            <div onClick={() => openModal('lesson', 'add', section.id)} className="bg-blue-400 text-white rounded p-1.5 flex justify-between items-center cursor-pointer hover:bg-blue-500 transition-colors">Lesson <ChevronDown size={14} /></div>
                                                                            <div onClick={() => openModal('resource', 'add', section.id)} className="p-1.5 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded font-medium text-gray-700 dark:text-[#d0d0E0] transition-colors">Resource</div>
                                                                            <div onClick={() => openModal('quiz', 'add', section.id)} className="p-1.5 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded font-medium text-gray-700 dark:text-[#d0d0E0] transition-colors">Quiz</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        <div className="flex justify-end mt-auto pt-8 border-t border-gray-200 dark:border-[#2a2a2e]">
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2a2a2e] px-6 py-4 rounded-xl shadow-sm w-full max-w-sm">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800 dark:text-[#E0E0E0]">
                                        Course Status
                                    </span>
                                    <span className={`text-xs mt-1 font-medium ${isCourseActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-[#d0d0E0]'}`}>
                                        {courseStatus === 1 && "Pending"}
                                        {courseStatus === 2 && "Active (Visible to students)"}
                                        {courseStatus === 3 && "Deactivated (Hidden)"}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleToggleStatus}
                                    disabled={toggleCourseMutation.isPending || syncStatus === 'Saving...'}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                                        isCourseActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-[#3a3a3e]'
                                    } ${(toggleCourseMutation.isPending || syncStatus === 'Saving...') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                        isCourseActive ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </main>

            {modalConfig.isOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-200 dark:bg-[#1A1A1A] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl animate-in zoom-in-95">
                        <div className="bg-gray-300 dark:bg-[#2a2a2e] px-4 py-3 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-gray-800 dark:text-[#E0E0E0] capitalize">{modalConfig.action} {modalConfig.type}</h3>
                            <button onClick={closeModal} className="text-gray-500 dark:text-[#d0d0E0] hover:text-black dark:hover:text-white bg-white dark:bg-[#1A1A1A] rounded-full p-0.5"><X size={16} /></button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <input type="text" value={modalInputValue} onChange={(e) => setModalInputValue(e.target.value)} placeholder={`Title of the ${modalConfig.type}`} className="w-full border-none rounded bg-blue-100 dark:bg-[#2a2a2e] dark:text-[#E0E0E0] dark:placeholder:text-[#d0d0E0]/50 p-3 focus:outline-blue-500" autoFocus onKeyDown={(e) => { if (e.key === 'Enter' && modalConfig.type !== 'resource') handleModalSubmit(); }} />
                            {modalConfig.type === 'lesson' && (
                                <div className="border-2 border-dashed border-gray-400 dark:border-[#3a3a3e] bg-white dark:bg-[#0e0e10] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2e] transition" onClick={() => fileInputRef.current?.click()}>
                                    <UploadCloud size={24} className="text-blue-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-[#d0d0E0] text-center">{modalFileName ? modalFileName : 'Click to upload Video'}</span>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
                                </div>
                            )}
                            {modalConfig.type === 'resource' && (
                                <div className="mt-4"><label className="block text-sm font-medium text-gray-700 dark:text-[#E0E0E0] mb-1">Resource Content</label><RichTextEditor content={modalHtmlContent} onChange={setModalHtmlContent} /></div>
                            )}
                            {isUploading && modalConfig.type === 'lesson' && (
                                <div className="mt-2 mb-4 bg-gray-50 dark:bg-[#0e0e10] p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2e]">
                                    <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-[#E0E0E0] mb-2"><span>{uploadStatusText}</span><span className="text-blue-600">{uploadProgress}%</span></div>
                                    <div className="w-full bg-gray-200 dark:bg-[#2a2a2e] rounded-full h-2 overflow-hidden"><div className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div></div>
                                </div>
                            )}
                            <button onClick={handleModalSubmit} disabled={isUploading || syncStatus === 'Saving...'} className={`w-full text-white rounded py-3 font-medium capitalize transition-colors ${isUploading || syncStatus === 'Saving...' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {isUploading ? 'Uploading...' : (modalConfig.action === 'add' ? 'Add' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <QuizEditorModal
                isOpen={quizEditorConfig.isOpen}
                onClose={() => setQuizEditorConfig({ isOpen: false, lessonId:0, title: '', action: 'add' })}
                lessonId={quizEditorConfig.lessonId}
                quizTitle={quizEditorConfig.title}
                action={quizEditorConfig.action} 
            />

            {confirmDialog?.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-[#E0E0E0] mb-2">{confirmDialog.title}</h3>
                        <p className="text-gray-600 dark:text-[#d0d0E0] mb-6 text-sm">{confirmDialog.message}</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#E0E0E0] hover:bg-gray-100 dark:hover:bg-[#2a2a2e] rounded-lg transition-colors">Cancel</button>
                            <button onClick={confirmDialog.onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}