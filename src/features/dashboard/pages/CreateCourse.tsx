import { useState, useEffect, useRef } from 'react';
import {
    Plus, PlaySquare, FileText, ChevronDown, X,
    Pencil, Trash2, GripVertical, UploadCloud, Check,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import FormStep1 from '../components/FormStep1';
import { type CourseApiPayload, type CourseSchemaTypes } from '../schema/CourseFormSchema';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCourseSection, deleteCourseSection, deleteLesson, fetchCourseMetadata, saveCourseStep1, updateCourseSection, type CreateCourseSectionPayload } from '../api/courseApi';
type ItemType = 'lesson' | 'resource' | 'quiz';

//video imports
import {
    createSectionItem,
    getVideoUploadSignature,
    saveLessonVideoMetadata
} from '../api/courseApi';
import { uploadToCloudinary } from '../../../utils/cloudinaryUpload';

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

    // ================= State Declarations (Must be at the top) =================
    const [currentStep, setCurrentStep] = useState<number>(() => {
        const savedStep = localStorage.getItem('courseDraftStep');
        return savedStep ? parseInt(savedStep) : 1;
    });

    const [courseId, setCourseId] = useState<string | null>(() => localStorage.getItem('courseDraftId'));
    const [sections, setSections] = useState<Section[]>([]);
    const [courseBasicData, setCourseBasicData] = useState<Partial<CourseSchemaTypes> | null>(null);
    const [syncStatus, setSyncStatus] = useState<'Loading' | 'Saved' | 'Saving...' | 'Error'>('Loading');

    // Modals & Uploads State
    const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, type: null, action: 'add' });
    const [modalInputValue, setModalInputValue] = useState('');
    const [modalFileName, setModalFileName] = useState('');
    const [openMenuSectionId, setOpenMenuSectionId] = useState<string | null>(null);
    const [modalFile, setModalFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    //video upload state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatusText, setUploadStatusText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ================= Mutations (Make course metadata) =================
    const saveCourseMutation = useMutation({
        mutationFn: (formData: CourseApiPayload) => saveCourseStep1(formData, courseId),
        onSuccess: (data) => {
            console.log("from query mutation", data)
            if (!courseId) setCourseId(data);
            setSyncStatus('Saved');
            setCurrentStep(2);
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            setSyncStatus('Error');
            alert("Failed to save course details. Please try again.");
        }
    });
    // =================  delete lesson/item =================
    const deleteItemMutation = useMutation({
        mutationFn: (itemId: string) => deleteLesson(Number(itemId)),
        onSuccess: (data) => {
            console.log("from query mutation delete item", data);
            // بنعمل Invalidate علشان لو فيه داتا تانية معتمدة على الدروس تتحدث
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
        }
        // مش هنكتب onError أو تحديث الشاشة هنا، لأننا عاملينهم تحت في الدالة الأصلية جوه try...catch
    });
    // ================= 1. Fetch Draft using TanStack Query =================
    const { data: draftData, } = useQuery({
        queryKey: ['courseDraft', courseId],
        queryFn: () => fetchCourseMetadata(courseId!),
        enabled: !!courseId,
        staleTime: Infinity,
    });
    // =================  mutate course section =================
    const createSectionMutation = useMutation({
        mutationFn: (variables: { courseId: string; sectionData: CreateCourseSectionPayload }) =>
            createCourseSection(variables.courseId, variables.sectionData),
        onSuccess: (data) => {
            const realSectionId = String(data.id);

            setSections(prevSections => [
                ...prevSections,
                { id: realSectionId, title: modalInputValue, isExpanded: true, items: [] }
            ]);

            setSyncStatus('Saved');
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
            closeModal();
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            setSyncStatus('Error');
            alert("Failed to create section. Please try again.");
        }
    });
    // =================  update course section =================

    const updateSectionMutation = useMutation({
        mutationFn: (variables: { sectionId: string; sectionData: CreateCourseSectionPayload }) =>
            updateCourseSection(variables.sectionId, variables.sectionData),

        // ⭐ التعديل الثاني: استلام variables كمتغير ثاني (parameter) في الدالة
        onSuccess: (data, variables) => {
            console.log("from query mutation update section", data);

            setSections(prevSections =>
                prevSections.map(sec =>
                    sec.id === variables.sectionId ? { ...sec, title: modalInputValue } : sec
                )
            );

            setSyncStatus('Saved');
            closeModal();
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            setSyncStatus('Error');
            alert("Failed to update section. Please try again.");
        }
    });
    // =================  delete course section =================
    const deleteSectionMutation = useMutation({
        mutationFn: (sectionId: string) => deleteCourseSection(Number(sectionId)),

        onSuccess: (data, sectionId) => {
            console.log("from query mutation delete section", data);
            setSections(prevSections => prevSections.filter(sec => sec.id !== sectionId));
            setSyncStatus('Saved');
            queryClient.invalidateQueries({ queryKey: ['coursesById', courseId] });
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            setSyncStatus('Error');
            alert("Failed to delete section. Please try again.");
        }
    });

    // ================= Handlers =================
    const handleStep1Submit = async (data: CourseSchemaTypes) => {
        console.log("form step 1", data);
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
            alert("Please save course details first to continue.");
            return;
        }
        setCurrentStep(stepNumber);
    };

    const handleClearDraft = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this draft completely?");
        if (!confirmDelete) return;

        if (courseId) {
            setSyncStatus('Saving...');
            try {
                // TODO: [BACKEND INTEGRATION] Delete draft from DB
                await new Promise(res => setTimeout(res, 500));
            } catch (error) {
                void error
                alert("Failed to delete draft from server.");
                setSyncStatus('Error');
                return;
            }
        }

        setCourseId(null);
        setSections([]);
        setCurrentStep(1);
        localStorage.removeItem('courseDraftStep');
        localStorage.removeItem('courseDraftId');
        setSyncStatus('Saved');

    };

    // ================= Initial Fetch & Storage =================
    useEffect(() => {
        if (draftData) {
            // إعادة تشكيل البيانات (Data Mapping) لتطابق الـ Zod Schema
            const mappedData: Partial<CourseSchemaTypes> = {
                Title: draftData.title || '',
                description: draftData.description || '',
                price: draftData.price ? draftData.price.toString() : '', // تحويل الرقم لنص
                instructorName: draftData.instructorName || '',

                // تحويل مصفوفة النصوص لمصفوفة كائنات علشان تناسب useFieldArray
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

    useEffect(() => {
        localStorage.setItem('courseDraftStep', currentStep.toString());
    }, [currentStep]);

    // ================= Modal & Content Logic =================
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
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setModalFile(file);
            setModalFileName(file.name);
        }
    };

    const handleModalSubmit = async () => {
        // Prevent empty submissions
        if (!modalInputValue.trim()) return;

        // ============================================================================
        // ==================== 1. SECTION FLOW (TanStack Query) ======================
        // ============================================================================
        if (modalConfig.type === 'section') {
            if (modalConfig.action === 'add') {
                // Ensure course is saved first
                if (!courseId) {
                    alert("Please save course details before adding a section.");
                    setSyncStatus('Error');
                    closeModal();
                    return;
                }

                // Trigger TanStack mutation to add a new section
                createSectionMutation.mutate({
                    courseId,
                    sectionData: { title: modalInputValue, position: sections.length + 1 }
                });

                return; // Exit early, onSuccess will handle UI updates and closing modal

            } else {
                // Trigger TanStack mutation to update existing section
                updateSectionMutation.mutate({
                    sectionId: modalConfig.sectionId!,
                    sectionData: {
                        title: modalInputValue,
                        position: sections.findIndex(sec => sec.id === modalConfig.sectionId) + 1
                    }
                });

                return; // Exit early, onSuccess will handle UI updates and closing modal
            }
        }

        // ============================================================================
        // ==================== 2. ITEMS FLOW (Lessons, Resources, Quizzes) ===========
        // ============================================================================
        else if (modalConfig.type && modalConfig.sectionId) {

            // ------------------------------------------------------------------------
            // A. Video Lesson Upload Flow (Add Action Only)
            // ------------------------------------------------------------------------
            if (modalConfig.type === 'lesson' && modalConfig.action === 'add') {
                if (!modalFile) {
                    alert("Please select a video file first.");
                    return;
                }

                setIsUploading(true);
                setSyncStatus('Saving...');

                try {
                    // Step 1: Create the lesson in DB to get the real ID
                    setUploadStatusText('Creating lesson...');
                    const currentSection = sections.find(s => s.id === modalConfig.sectionId);
                    const currentItems = currentSection?.items || [];
                    const maxPosition = currentItems.reduce((max, item) => Math.max(max, item.position || 0), 0);
                    const newPosition = maxPosition + 1;


                    const newLessonResponse = await createSectionItem(Number(modalConfig.sectionId), {
                        title: modalInputValue,
                        type: 1,
                        position: newPosition
                    });
                    console.log("Created lesson response", newLessonResponse);

                    // Extract real ID based on backend response
                    const realLessonId = String(newLessonResponse.data.lessonId || newLessonResponse.data?.id);

                    // Step 2: Request upload signature from backend
                    setUploadStatusText('Getting upload permissions...');
                    const signatureData = await getVideoUploadSignature(realLessonId, {
                        fileName: modalFile.name,
                        fileSize: modalFile.size,
                        mimeType: modalFile.type
                    });

                    // Step 3: Upload video directly to Cloudinary and track progress
                    setUploadStatusText('Uploading video...');
                    const uploadResult = await uploadToCloudinary(modalFile, signatureData, (progress) => {
                        setUploadProgress(progress);
                        setUploadStatusText(`Uploading video... ${progress}%`);
                    });

                    if (!uploadResult.success || !uploadResult.data) {
                        throw new Error(uploadResult.error || "Upload to Cloudinary failed.");
                    }

                    // Step 4: Save video metadata to backend
                    setUploadStatusText('Saving video details...');
                    await saveLessonVideoMetadata(realLessonId, {
                        publicId: uploadResult.data.public_id,
                        videoUrl: uploadResult.data.secure_url,
                        durationSeconds: uploadResult.data.duration,
                        fileSize: uploadResult.data.bytes,
                        format: uploadResult.data.format
                    });

                    // Step 5: Update the UI with the new lesson (Optimistic UI Update)
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

                    setSyncStatus('Saved');
                } catch (error) {
                    console.error("Video Upload Error:", error);
                    setSyncStatus('Error');
                    alert("An error occurred during video upload. Please try again.");
                } finally {
                    // Reset upload states and close modal
                    setIsUploading(false);
                    setUploadProgress(0);
                    setUploadStatusText('');
                    closeModal();
                }

                return; // Exit early, flow is complete
            }

            // ------------------------------------------------------------------------
            // B. Resource / Quiz / Lesson Edit Flow (Mocked for now)
            // ------------------------------------------------------------------------
            setSyncStatus('Saving...');
            let uploadedFileUrl = '';

            // Mock file upload for non-video files
            if (modalFile && modalConfig.type !== 'lesson') {
                setIsUploading(true);
                try {
                    // MOCK File Upload Delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    uploadedFileUrl = `https://mock-storage.com/files/${modalFile.name}`;
                } catch (error) {
                    void error
                    alert("Failed to upload the file.");
                    setIsUploading(false);
                    setSyncStatus('Error');
                    return;
                }
                setIsUploading(false);
            }

            try {
                const payload = {
                    title: modalInputValue,
                    type: modalConfig.type,
                    fileName: modalFileName,
                    fileUrl: uploadedFileUrl
                };

                if (modalConfig.action === 'add') {
                    // MOCK Create Item
                    const newItemId = uuidv4(); // Temporary UUID until connected to API
                    const newItem: ContentItem = { id: newItemId, ...payload };

                    setSections(prevSections => prevSections.map(sec =>
                        sec.id === modalConfig.sectionId ? { ...sec, items: [...sec.items, newItem] } : sec
                    ));
                } else {
                    // MOCK Update Item
                    setSections(prevSections => prevSections.map(sec =>
                        sec.id === modalConfig.sectionId ? {
                            ...sec,
                            items: sec.items.map(item => item.id === modalConfig.itemId ? { ...item, ...payload } : item)
                        } : sec
                    ));
                }
                setSyncStatus('Saved');
            } catch (error) {
                console.error(error);
                setSyncStatus('Error');
            }

            closeModal();
        }
    };

    const deleteSection = (id: string) => {

        setSyncStatus('Saving...');
        deleteSectionMutation.mutate(id);
    };

    const deleteItem = async (sectionId: string, itemId: string) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        setSyncStatus('Saving...');

        try {
            await deleteItemMutation.mutateAsync(itemId);

            setSections(prevSections =>
                prevSections.map(sec =>
                    sec.id === sectionId ? { ...sec, items: sec.items.filter(item => item.id !== itemId) } : sec
                )
            );

            setSyncStatus('Saved');
        } catch (error) {
            console.error(error);
            setSyncStatus('Error');
            alert("Failed to delete item. Please try again.");
        }
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
            // TODO: [BACKEND INTEGRATION] Reorder API
            await new Promise(res => setTimeout(res, 400));
            setSyncStatus('Saved');
        } catch (error) {
            setSyncStatus('Error');
            console.error(error);
        }
    };

    const handlePublishCourse = async () => {
        if (sections.length === 0) {
            alert("Please add at least one section and lesson before publishing.");
            return;
        }

        try {
            setSyncStatus('Saving...');
            // TODO: [BACKEND INTEGRATION] Publish Course API
            await new Promise(resolve => setTimeout(resolve, 1000));

            localStorage.removeItem('courseDraftStep');
            alert("Course Published Successfully!");
            navigate('/admin/course-list');

        } catch (error) {
            console.error("Error publishing course:", error);
            setSyncStatus('Error');
            alert("Failed to publish course. Please try again.");
        }
    }



    return (
        <div className="flex min-h-screen bg-[#EAEAEA] font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Create New Course</h1>

                    <div className="flex items-center gap-4">
                        {/* === Sync Status Indicator === */}
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

                                                                                                <button onClick={() => deleteItem(section.id, item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
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
                    <div className="bg-gray-200 rounded-lg w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95">
                        <div className="bg-gray-300 px-4 py-3 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 capitalize">
                                {modalConfig.action} {modalConfig.type}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-black bg-white rounded-full p-0.5"><X size={16} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <input
                                type="text"
                                value={modalInputValue}
                                onChange={(e) => setModalInputValue(e.target.value)}
                                placeholder={`Title of the ${modalConfig.type}`}
                                className="w-full border-none rounded bg-blue-100 p-3 focus:outline-blue-500"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
                            />

                            {(modalConfig.type === 'lesson' || modalConfig.type === 'resource') && (
                                <div
                                    className="border-2 border-dashed border-gray-400 bg-white rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <UploadCloud size={24} className="text-blue-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-700 text-center">
                                        {modalFileName ? modalFileName : `Click to upload ${modalConfig.type === 'lesson' ? 'Video' : 'File'}`}
                                    </span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept={modalConfig.type === 'lesson' ? "video/*" : ".pdf,.doc,.docx,.ppt,.pptx,.txt"}
                                        onChange={handleFileChange}
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
                                {isUploading ? 'Uploading File...' : (modalConfig.action === 'add' ? 'Add' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}