import { useState, useEffect, useRef } from 'react';
import {
    Plus, PlaySquare, FileText, ChevronDown, X,
    Pencil, Trash2, GripVertical, UploadCloud, Check,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import FormStep1 from '../components/FormStep1';
import { type CourseApiPayload, type CourseSchemaTypes } from '../schema/CourseFormSchema';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast'; 

// --- General API Imports ---
import {
    createCourseSection,
    deleteCourseSection,
    deleteLesson,
    fetchCourseMetadata,
    saveCourseStep1,
    updateCourseSection,
    type CreateCourseSectionPayload,
    updateLessonArticle
} from '../api/courseApi';

// --- Video Imports ---
import {
    createSectionItem,
    getVideoUploadSignature,
    saveLessonVideoMetadata
} from '../api/courseApi';
import { uploadToCloudinary } from '../../../utils/cloudinaryUpload';

// --- Quiz Imports ---
import { deleteExam } from '../api/quizApi';

// --- Custom Components ---
import { RichTextEditor } from '../components/RichTextEditor';
import { QuizEditorModal } from '../components/quiz/QuizEditorModal';

type ItemType = 'lesson' | 'resource' | 'quiz';

interface ContentItem {
    id: string;
    type: ItemType;
    title: string;
    fileName?: string;
    fileUrl?: string;
    position?: number;
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
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ================= State Declarations =================
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [courseId, setCourseId] = useState<string | null>(() => localStorage.getItem('courseDraftId'));
    const [sections, setSections] = useState<Section[]>([]);
    const [courseBasicData, setCourseBasicData] = useState<Partial<CourseSchemaTypes> | null>(null);
    const [syncStatus, setSyncStatus] = useState<'Loading' | 'Saved' | 'Saving...' | 'Error'>('Loading');

    // --- Modals & Uploads State ---
    const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, type: null, action: 'add' });
    const [modalInputValue, setModalInputValue] = useState('');
    const [modalFileName, setModalFileName] = useState('');
    const [openMenuSectionId, setOpenMenuSectionId] = useState<string | null>(null);
    const [modalFile, setModalFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

    // HTML Content for Resources
    const [modalHtmlContent, setModalHtmlContent] = useState('');

    // Video Upload State
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatusText, setUploadStatusText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Quiz Editor State
    const [quizEditorConfig, setQuizEditorConfig] = useState<{ isOpen: boolean, lessonId: number, title: string }>({
        isOpen: false, lessonId: 0, title: ''
    });

    // ================= Mutations =================

    const saveCourseMutation = useMutation({
        mutationFn: (formData: CourseApiPayload) => saveCourseStep1(formData, courseId),
        onSuccess: (data) => {
            if (!courseId) setCourseId(data);
            setSyncStatus('Saved');
            setCurrentStep(2);
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
            toast.success("Course details saved successfully!");
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            setSyncStatus('Error');
            toast.error("Failed to save course details. Please try again.");
        }
    });

    const deleteItemMutation = useMutation({
        mutationFn: (itemId: string) => deleteLesson(Number(itemId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
        }
    });

    const deleteQuizMutation = useMutation({
        mutationFn: (itemId: string) => deleteExam(Number(itemId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
        }
    });

    const updateArticleMutation = useMutation({
        mutationFn: (variables: { itemId: string; payload: { htmlContent: string } }) =>
            updateLessonArticle(Number(variables.itemId), variables.payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            toast.error("Failed to save the article content.");
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
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
            closeModal();
            toast.success("Section created successfully!");
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            setSyncStatus('Error');
            toast.error("Failed to create section. Please try again.");
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
            toast.success("Section updated successfully!");
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            setSyncStatus('Error');
            toast.error("Failed to update section. Please try again.");
        }
    });

    const deleteSectionMutation = useMutation({
        mutationFn: (sectionId: string) => deleteCourseSection(Number(sectionId)),
        onSuccess: ( sectionId) => {
            setSections(prevSections => prevSections.filter(sec => sec.id !== sectionId));
            setSyncStatus('Saved');
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
            toast.success("Section deleted!");
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            setSyncStatus('Error');
            toast.error("Failed to delete section. Please try again.");
        }
    });

    // ================= Fetch Course Draft =================
    const { data: draftData } = useQuery({
        queryKey: ['courseDraft', courseId],
        queryFn: () => fetchCourseMetadata(courseId!),
        enabled: !!courseId,
        staleTime: Infinity,
    });

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
            setSyncStatus('Saved');
        }
    }, [draftData]);

    // ================= Handlers =================
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
                if (courseId) {
                    setSyncStatus('Saving...');
                    try {
                        await new Promise(res => setTimeout(res, 500));
                    } catch (error) {
                        void error;
                        toast.error("Failed to delete draft from server.");
                        setSyncStatus('Error');
                        return;
                    }
                }
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

    // ================= Main Modal Submit Logic =================
    const handleModalSubmit = async () => {
        if (!modalInputValue.trim()) return;

        // ---------------- 1. SECTION FLOW ----------------
        if (modalConfig.type === 'section') {
            if (modalConfig.action === 'add') {
                if (!courseId) {
                    toast.error("Please save course details before adding a section.");
                    setSyncStatus('Error');
                    closeModal();
                    return;
                }
                createSectionMutation.mutate({
                    courseId,
                    sectionData: { title: modalInputValue, position: sections.length + 1 }
                });
                return;
            } else {
                updateSectionMutation.mutate({
                    sectionId: modalConfig.sectionId!,
                    sectionData: {
                        title: modalInputValue,
                        position: sections.findIndex(sec => sec.id === modalConfig.sectionId) + 1
                    }
                });
                return;
            }
        }

        // ---------------- 2. ITEMS FLOW ----------------
        else if (modalConfig.type && modalConfig.sectionId) {

            const currentSection = sections.find(s => s.id === modalConfig.sectionId);
            const currentItems = currentSection?.items || [];
            const maxPosition = currentItems.reduce((max, item) => Math.max(max, item.position || 0), 0);
            const newPosition = maxPosition + 1;

            // A. Video Lesson Upload Flow
            if (modalConfig.type === 'lesson' && modalConfig.action === 'add') {
                if (!modalFile) {
                    toast.error("Please select a video file first.");
                    return;
                }

                setIsUploading(true);
                setSyncStatus('Saving...');
                let createdItemId: string | null = null; // ⭐ Rollback flag

                try {
                    setUploadStatusText('Creating lesson...');
                    const newLessonResponse = await createSectionItem(Number(modalConfig.sectionId), {
                        title: modalInputValue,
                        type: 1, // ⭐ 1 = Video
                        position: newPosition
                    });

                    const extractedId = newLessonResponse?.data?.id || newLessonResponse?.data?.lessonId 
                    const realLessonId = String(extractedId);

                    if (!extractedId || realLessonId === 'undefined') {
                        throw new Error("Could not extract Lesson ID from backend response.");
                    }
                    
                    createdItemId = realLessonId; // ⭐ Mark for rollback

                    setUploadStatusText('Getting upload permissions...');
                    const signatureData = await getVideoUploadSignature(realLessonId, {
                        fileName: modalFile.name,
                        fileSize: modalFile.size,
                        mimeType: modalFile.type
                    });

                    setUploadStatusText('Uploading video...');
                    const uploadResult = await uploadToCloudinary(modalFile, signatureData, (progress) => {
                        setUploadProgress(progress);
                        setUploadStatusText(`Uploading video... ${progress}%`);
                    });

                    if (!uploadResult.success || !uploadResult.data) {
                        throw new Error(uploadResult.error || "Upload to Cloudinary failed.");
                    }

                    setUploadStatusText('Saving video details...');
                    await saveLessonVideoMetadata(realLessonId, {
                        publicId: uploadResult.data.public_id,
                        videoUrl: uploadResult.data.secure_url,
                        durationSeconds: uploadResult.data.duration,
                        fileSize: uploadResult.data.bytes,
                        format: uploadResult.data.format
                    });

                    const newItem: ContentItem = {
                        id: realLessonId,
                        type: 'lesson',
                        title: modalInputValue,
                        fileName: modalFile.name,
                        fileUrl: uploadResult.data.secure_url,
                        position: newPosition
                    };

                    setSections(prevSections => prevSections.map(sec =>
                        sec.id === modalConfig.sectionId ? { ...sec, items: [...sec.items, newItem] } : sec
                    ));

                    createdItemId = null; // ⭐ Success, clear rollback flag
                    setSyncStatus('Saved');
                    toast.success("Video lesson uploaded successfully!");
                } catch (error) {
                    console.error("Video Upload Error:", error);
                    setSyncStatus('Error');
                    toast.error("An error occurred during video upload. Please try again.");
                    
                    // ⭐ Rollback: Delete the orphaned lesson if upload failed
                    if (createdItemId) {
                        await deleteLesson(Number(createdItemId)).catch(e => console.error("Rollback failed", e));
                    }
                } finally {
                    setIsUploading(false);
                    setUploadProgress(0);
                    setUploadStatusText('');
                    closeModal();
                }
                return;
            }

            // B. Quiz Flow
            if (modalConfig.type === 'quiz') {
                setSyncStatus('Saving...');
                let createdItemId: string | null = null;
                try {
                    if (modalConfig.action === 'add') {
                        const newItemResponse = await createSectionItem(Number(modalConfig.sectionId), {
                            title: modalInputValue,
                            type: 3, // ⭐ 3 = Quiz
                            position: newPosition
                        });

                        const extractedId = newItemResponse?.data?.id || newItemResponse?.data?.lessonId 
                        const realItemId = Number(extractedId);

                        if (!realItemId) throw new Error("Failed to get Quiz ID");
                        createdItemId = String(realItemId);

                        const newItem: ContentItem = {
                            id: String(realItemId),
                            type: 'quiz',
                            title: modalInputValue,
                            position: newPosition
                        };

                        setSections(prevSections => prevSections.map(sec =>
                            sec.id === modalConfig.sectionId ? { ...sec, items: [...sec.items, newItem] } : sec
                        ));

                        createdItemId = null; 
                        closeModal();
                        setQuizEditorConfig({ isOpen: true, lessonId: realItemId, title: modalInputValue });
                    }
                    setSyncStatus('Saved');
                } catch (error) {
                    console.error(error);
                    setSyncStatus('Error');
                    toast.error("Failed to initialize quiz.");
                    if (createdItemId) {
                        await deleteLesson(Number(createdItemId)).catch(e => console.error("Rollback failed", e));
                    }
                }
                return;
            }

            // C. Resource Flow
            setSyncStatus('Saving...');
            let createdItemId: string | null = null; // ⭐ Rollback flag
            try {
                if (modalConfig.action === 'add') {
                    if (modalConfig.type === 'resource' && (!modalHtmlContent || modalHtmlContent === '<p></p>')) {
                        toast.error("Please enter some content for the resource.");
                        setSyncStatus('Error');
                        return;
                    }

                    const newItemResponse = await createSectionItem(Number(modalConfig.sectionId), {
                        title: modalInputValue,
                        type: 2, // ⭐ 2 = Article (Resource)
                        position: newPosition
                    });

                    const extractedId = newItemResponse?.data?.id || newItemResponse?.data?.lessonId 
                    const realItemId = String(extractedId);

                    if (!extractedId || realItemId === 'undefined') {
                        throw new Error("Could not extract Item ID from backend response.");
                    }
                    
                    createdItemId = realItemId; // ⭐ Mark for rollback

                    if (modalConfig.type === 'resource') {
                        await updateArticleMutation.mutateAsync({
                            itemId: realItemId,
                            payload: { htmlContent: modalHtmlContent }
                        });
                    }

                    const newItem: ContentItem = {
                        id: realItemId,
                        type: modalConfig.type as ItemType,
                        title: modalInputValue,
                        position: newPosition,
                        fileUrl: modalConfig.type === 'resource' ? modalHtmlContent : undefined
                    };

                    setSections(prevSections => prevSections.map(sec =>
                        sec.id === modalConfig.sectionId ? { ...sec, items: [...sec.items, newItem] } : sec
                    ));
                    
                    createdItemId = null; // ⭐ Success, clear rollback flag
                    toast.success("Resource added successfully!");

                } else {
                    // Edit Mode for Resource
                    if (modalConfig.type === 'resource') {
                        await updateArticleMutation.mutateAsync({
                            itemId: modalConfig.itemId!,
                            payload: { htmlContent: modalHtmlContent }
                        });
                    }

                    setSections(prevSections => prevSections.map(sec =>
                        sec.id === modalConfig.sectionId ? {
                            ...sec,
                            items: sec.items.map(item => item.id === modalConfig.itemId ? {
                                ...item,
                                title: modalInputValue,
                                fileUrl: modalConfig.type === 'resource' ? modalHtmlContent : item.fileUrl
                            } : item)
                        } : sec
                    ));
                    toast.success("Resource updated successfully!");
                }
                setSyncStatus('Saved');
            } catch (error) {
                console.error(error);
                setSyncStatus('Error');
                toast.error("Failed to save resource.");
                
                // ⭐ Rollback: Delete the orphaned resource if updating article failed
                if (createdItemId) {
                    await deleteLesson(Number(createdItemId)).catch(e => console.error("Rollback failed", e));
                }
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
                    console.error(error);
                    setSyncStatus('Error');
                    toast.error(`Failed to delete ${itemType}. Please try again.`);
                }
            }
        });
    };

    const toggleSection = (id: string) => {
        setSections(sections.map(sec => sec.id === id ? { ...sec, isExpanded: !sec.isExpanded } : sec));
    };

    // ================= Drag and Drop Logic =================
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
            console.error(error);
        }
    };

    const handlePublishCourse = async () => {
        if (sections.length === 0) {
            toast.error("Please add at least one section and lesson before publishing.");
            return;
        }

        try {
            setSyncStatus('Saving...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            localStorage.removeItem('courseDraftId');
            toast.success("Course Published Successfully!");
            navigate('/admin/course-list');
        } catch (error) {
            console.error("Error publishing course:", error);
            setSyncStatus('Error');
            toast.error("Failed to publish course. Please try again.");
        }
    }

    return (
        <div className="flex min-h-screen bg-[#EAEAEA] font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Create New Course</h1>

                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">
                            {syncStatus === 'Saving...' && <span className="text-yellow-600 animate-pulse">Saving changes...</span>}
                            {syncStatus === 'Saved' && <span className="text-green-600 flex items-center gap-1"><Check size={16} /> Saved</span>}
                            {syncStatus === 'Error' && <span className="text-red-500 flex items-center gap-1"><X size={16} /> Error</span>}
                        </div>

                        <button
                            type="button"
                            onClick={handleClearDraft}
                            className="text-sm text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-50 transition"
                        >
                            Clear Draft
                        </button>
                    </div>
                </div>

                {/* ====== Stepper ====== */}
                <div className="flex justify-center mb-10 relative">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex flex-col items-center cursor-pointer" onClick={() => handleStepClick(1)}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
                            <span className={`text-xs mt-2 font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>Course Details</span>
                        </div>
                        <div className="w-32 h-0.5 bg-gray-300 -mt-6"></div>
                        <div className="flex flex-col items-center cursor-pointer" onClick={() => handleStepClick(2)}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
                            <span className={`text-xs mt-2 font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Course Content</span>
                        </div>
                    </div>
                </div>

                {/* ====== Form (Step 1) ====== */}
                <FormStep1
                    currentStep={currentStep}
                    onSubmitData={handleStep1Submit}
                    isSaving={syncStatus === 'Saving...'}
                    initialData={courseBasicData}
                />

                {/* ====== Step 2: Course Content ====== */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col gap-4 max-w-4xl mx-auto min-h-[500px]">

                        <button type="button" onClick={() => openModal('section', 'add')} className="w-full border border-blue-300 border-dashed text-blue-600 rounded-lg p-3 flex justify-center items-center gap-2 hover:bg-blue-50 transition mb-4">
                            Add Section <Plus size={16} />
                        </button>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="course-board" type="SECTION">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                                        {sections.map((section, index) => (
                                            <Draggable key={section.id} draggableId={section.id} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} className="border rounded-lg overflow-hidden bg-white">

                                                        <div className="bg-blue-100/50 p-4 flex justify-between items-center group">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-blue-600">
                                                                    <GripVertical size={18} />
                                                                </div>

                                                                <div
                                                                    className="flex items-center gap-2 font-medium text-sm cursor-pointer select-none flex-1"
                                                                    onClick={() => toggleSection(section.id)}
                                                                >
                                                                    <ChevronDown size={18} className={`transition-transform duration-300 ${section.isExpanded ? "rotate-180" : "rotate-0"}`} />
                                                                    {section.title}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-gray-500 mr-2">{section.items.length} items</span>
                                                                <button onClick={() => openModal('section', 'edit', section.id, undefined, section.title)} className="text-gray-400 hover:text-blue-600 transition-colors">
                                                                    <Pencil size={16} />
                                                                </button>
                                                                <button onClick={() => deleteSection(section.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                                                    <Trash2 size={16} />
                                                                </button>
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
                                                                                        <div
                                                                                            ref={provided.innerRef}
                                                                                            {...provided.draggableProps}
                                                                                            className="flex justify-between items-center p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                                                                                        >
                                                                                            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                                                                                <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-blue-600">
                                                                                                    <GripVertical size={16} />
                                                                                                </div>
                                                                                                {item.type === 'lesson' && <PlaySquare size={16} className="text-blue-500" />}
                                                                                                {item.type === 'resource' && <FileText size={16} className="text-blue-500" />}
                                                                                                {item.type === 'quiz' && <FileText size={16} className="text-yellow-500" />}
                                                                                                <div className="flex flex-col">
                                                                                                    <span>{item.title}</span>
                                                                                                    {item.fileName && <span className="text-xs text-gray-400 font-normal">{item.fileName}</span>}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                {(item.type === 'resource' || item.type === 'quiz') && (
                                                                                                    <button
                                                                                                        onClick={() => {
                                                                                                            if (item.type === 'resource') {
                                                                                                                openModal('resource', 'edit', section.id, item.id, item.title);
                                                                                                            } else if (item.type === 'quiz') {
                                                                                                                setQuizEditorConfig({ isOpen: true, lessonId: Number(item.id), title: item.title });
                                                                                                            }
                                                                                                        }}
                                                                                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                                                                                    >
                                                                                                        <Pencil size={16} />
                                                                                                    </button>
                                                                                                )}
                                                                                                <button onClick={() => deleteItem(section.id, item.id, item.type)} className="text-gray-400 hover:text-red-600 transition-colors">
                                                                                                    <Trash2 size={16} />
                                                                                                </button>
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
                                                                        <button type="button" onClick={() => setOpenMenuSectionId(section.id)} className="w-full border border-blue-300 border-dashed text-blue-600 rounded p-2 flex justify-center items-center gap-2 hover:bg-blue-50 text-sm">
                                                                            Add item <Plus size={16} />
                                                                        </button>
                                                                    ) : (
                                                                        <div className="bg-blue-100 rounded p-2 w-48 text-sm flex flex-col gap-2 shadow-md z-10">
                                                                            <div onClick={() => openModal('lesson', 'add', section.id)} className="bg-blue-400 text-white rounded p-1.5 flex justify-between items-center cursor-pointer hover:bg-blue-500 transition-colors">
                                                                                Lesson <ChevronDown size={14} />
                                                                            </div>
                                                                            <div onClick={() => openModal('resource', 'add', section.id)} className="p-1.5 cursor-pointer hover:bg-blue-200 rounded font-medium text-gray-700 transition-colors">Resource</div>
                                                                            <div onClick={() => openModal('quiz', 'add', section.id)} className="p-1.5 cursor-pointer hover:bg-blue-200 rounded font-medium text-gray-700 transition-colors">Quiz</div>
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

                        <div className="flex justify-end mt-auto pt-8">
                            <button
                                type="button"
                                onClick={handlePublishCourse}
                                disabled={syncStatus === 'Saving...'}
                                className={`px-6 py-2 rounded flex items-center gap-2 transition ${syncStatus === 'Saving...' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                            >
                                Publish Course <span className="text-xl">→</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* ====== Unified Modal ====== */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-200 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl animate-in zoom-in-95">
                        <div className="bg-gray-300 px-4 py-3 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-gray-800 capitalize">
                                {modalConfig.action} {modalConfig.type}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-black bg-white rounded-full p-0.5"><X size={16} /></button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <input
                                type="text"
                                value={modalInputValue}
                                onChange={(e) => setModalInputValue(e.target.value)}
                                placeholder={`Title of the ${modalConfig.type}`}
                                className="w-full border-none rounded bg-blue-100 p-3 focus:outline-blue-500"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && modalConfig.type !== 'resource') {
                                        handleModalSubmit();
                                    }
                                }}
                            />

                            {modalConfig.type === 'lesson' && (
                                <div
                                    className="border-2 border-dashed border-gray-400 bg-white rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <UploadCloud size={24} className="text-blue-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-[#d0d0E0] text-center">
                                        {modalFileName ? modalFileName : 'Click to upload Video'}
                                    </span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            )}

                            {modalConfig.type === 'resource' && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Content</label>
                                    <RichTextEditor
                                        content={modalHtmlContent}
                                        onChange={(html) => setModalHtmlContent(html)}
                                    />
                                </div>
                            )}

                            {isUploading && modalConfig.type === 'lesson' && (
                                <div className="mt-2 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                        <span>{uploadStatusText}</span>
                                        <span className="text-blue-600">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleModalSubmit}
                                disabled={isUploading || syncStatus === 'Saving...'}
                                className={`w-full text-white rounded py-3 font-medium capitalize transition-colors ${isUploading || syncStatus === 'Saving...' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isUploading ? 'Uploading...' : (modalConfig.action === 'add' ? 'Add' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== Quiz Full-Screen Editor ====== */}
            <QuizEditorModal
                isOpen={quizEditorConfig.isOpen}
                onClose={() => setQuizEditorConfig({ isOpen: false, lessonId: 0, title: '' })}
                lessonId={quizEditorConfig.lessonId}
                quizTitle={quizEditorConfig.title}
            />

            {/* ====== Confirm Dialog ====== */}
            {confirmDialog?.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{confirmDialog.title}</h3>
                        <p className="text-gray-600 mb-6 text-sm">{confirmDialog.message}</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmDialog.onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}