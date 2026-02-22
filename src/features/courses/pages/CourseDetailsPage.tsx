import { useState } from 'react';
import {
    Star,
    Users,
    Clock,
    CheckCircle2,
    PlayCircle,
    ChevronDown,
    ChevronUp,
    BarChart,
    Calendar,
    Award,

    ArrowLeft,
    Bookmark
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../../shared/components/Footer'; // Assuming you have this based on your previous code
import { CommentsSection } from '../../../shared/components/CommentsSection';
import { useGetCourseById, useGetCourseMetaDataById } from '../api/useGetCourseById';
import { useBookMark } from '../api/useBookMark';
import { useGetInstById } from '../../../shared/api/useGetInsApi';

const supportData = [
    {
        id: '1',
        name: "Mahmoud Emad",
        feedback: "Education is delivered through interaction, whether with the mentor during the lecture or through a community specific to each level, which the student can ask any questions."
    },
    {
        id: '2',
        name: "Mahmoud Emad",
        feedback: "Education is delivered through interaction, whether with the mentor during the lecture or through a community specific to each level, which the student can ask any questions."
    },
    {
        id: '3',
        name: "Mahmoud Emad",
        feedback: "Education is delivered through interaction, whether with the mentor during the lecture or through a community specific to each level, which the student can ask any questions."
    },
    {
        id: '4',
        name: "Mahmoud Emad",
        feedback: "Education is delivered through interaction, whether with the mentor during the lecture or through a community specific to each level, which the student can ask any questions."
    }
];


const CourseDetailsPage = () => {
    const navigate = useNavigate();
    const [openSection, setOpenSection] = useState<number | null>(0);
    const { courseId } = useParams();
    const { data: CourseContent } = useGetCourseById(courseId!);
    const { data: courseMetaData } = useGetCourseMetaDataById(courseId!);
    const { mutate: Bookmarked, isPending: bookMarkPending } = useBookMark()
    const {data:InstructorData}=useGetInstById(courseId!)


    const handleAddBookmark = () => {
        if (bookMarkPending) return;
        Bookmarked(courseId!);
    };
    // --- Mock Data (Matching the Image) ---
    const course = {
        title: "Complete Machine Learning & Data Science Bootcamp",
        description: "Master Machine Learning and Data Science with Python, Build real-world projects and learn ML algorithms from scratch.",
        rating: 4.8,
        ratingCount: "123,433",
        students: "425,893",
        lastUpdated: "December 2024",
        language: "English",
        price: 350,
        instructor: {
            name: "Dr. Angela Yu",
            title: "Lead Instructor at App Brewery",
            image: "https://avatar.iran.liara.run/public/job/doctor/female",
            students: "425,890",
            rating: 4.8,
            courses: 30
        }
    };



    const toggleSection = (id: number) => {
        setOpenSection(openSection === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-inter">

            {/* --- Hero Section --- */}
            <div className="relative bg-[#1a1a1a] text-white overflow-hidden">
                {/* Background Overlay Image Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
                <img
                    src={courseMetaData?.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80'}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />

                <div className="relative z-20 max-w-[1450px] mx-auto px-4 md:px-8 py-12 lg:py-16">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)} className="flex p-2 items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors rounded-xl hover:bg-blue-600">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Courses</span>
                    </button>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex-1 max-w-3xl">
                            {/**tags */}
                            <div className="flex gap-3 mb-4">
                                {courseMetaData?.tags.map((tag) => (
                                    <span key={tag.id} className="bg-[#0061EF] text-xs font-bold px-3 py-1 rounded text-white">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                                {courseMetaData?.title}
                            </h1>
                            <p className="text-lg text-slate-300 mb-6">
                                {courseMetaData?.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <span className="font-bold text-lg">{courseMetaData?.rating}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill="currentColor" />
                                        ))}
                                    </div>
                                    <span className="text-slate-400 underline ml-1">({courseMetaData?.totalReviews} ratings)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={18} />
                                    <span>{courseMetaData?.numberOfStudents} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} />
                                    <span>45h Total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content Grid --- */}
            <main className="max-w-[1450px] mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* LEFT COLUMN (Content) */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        {/* Description */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Description</h2>
                            <p className="text-slate-600 leading-relaxed">
                                {courseMetaData?.description}
                            </p>
                        </section>

                        {/* What You'll Learn */}
                        <section className="bg-white border border-slate-200 p-6 rounded-[1rem]">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">What You'll Learn</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courseMetaData?.learningOutcomes.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="text-[#0061EF] shrink-0 mt-0.5" size={20} />
                                        <span className="text-slate-600 text-sm font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Course Content */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Content</h2>
                            <p className="text-slate-500 text-sm mb-6">{CourseContent?.sections.length} sections • {CourseContent?.sections.reduce((total, section) => total + section.lessons.length, 0)} lessons • {CourseContent?.hours} total hour</p>

                            <div className="border border-slate-200 rounded-[1rem] overflow-hidden bg-white">
                                {CourseContent?.sections.map((section) => (
                                    <div key={section.id} className="border-b border-slate-100 last:border-0">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between p-4 bg-[#F8FAFC] hover:bg-slate-100 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                {openSection === section.id ? <ChevronUp size={20} className="text-slate-600" /> : <ChevronDown size={20} className="text-slate-600" />}
                                                <span className="font-bold text-slate-800">{section.title}</span>
                                            </div>
                                            <span className="text-xs text-slate-500 hidden sm:block">
                                                {section.lessons.length} lessons • {section.totalMinutes} minutes
                                            </span>
                                        </button>

                                        {/* Dropdown Content */}
                                        {openSection === section.id && (
                                            <div className="p-4 bg-white">
                                                <ul className="flex flex-col gap-3">
                                                    {section.lessons.map((item, idx) => (
                                                        <li key={idx} className="flex items-center justify-between text-sm text-slate-600 ml-8">
                                                            <div className="flex items-center gap-3">
                                                                <PlayCircle size={16} className="text-slate-400" />
                                                                <span>{item.title}</span>
                                                            </div>
                                                            <span className="text-slate-400">{item.duration}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Prerequisites */}
                        <section className="bg-white border border-slate-200 p-6 rounded-[1rem]">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <div className="bg-yellow-100 p-1 rounded-full"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div></div>
                                Prerequisites
                            </h2>
                            <p className="text-slate-500 text-sm mb-4">Before taking this course, you should have:</p>
                            <ul className="flex flex-col gap-3">
                                {courseMetaData?.prerequisites.map((prereq, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                                        <CheckCircle2 size={18} className="text-yellow-500" />
                                        <span>{prereq}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 flex flex-col gap-6">

                            {/* Instructor Card */}
                            <div className="bg-white border border-slate-200 rounded-[1rem] p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Instructor</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={InstructorData?.imageUrl} alt="Instructor" className="w-16 h-16 rounded-full object-cover border-2 border-[#0061EF] p-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#0061EF] text-lg">{InstructorData?.name}</h4>
                                        <p className="text-xs text-slate-500">{InstructorData?.headline}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 text-sm text-slate-600 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-slate-400" />
                                        <span>{InstructorData?.totalStudents} Students</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                        <span>{InstructorData?.rating} Instructor Rating</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PlayCircle size={16} className="text-slate-400" />
                                        <span>{InstructorData?.totalCourses} Courses</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Info Card */}
                            <div className="bg-white border border-slate-200 rounded-[1rem] p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-6">Course Info</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <BarChart size={20} className="text-slate-400" />
                                            <span>Level</span>
                                        </div>
                                        <span className="font-semibold text-slate-800">Intermediate</span>
                                    </div>
                                    <div className="border-b border-slate-100"></div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Calendar size={20} className="text-slate-400" />
                                            <span>Last Updated</span>
                                        </div>
                                        <span className="font-semibold text-slate-800">{course.lastUpdated}</span>
                                    </div>
                                    <div className="border-b border-slate-100"></div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Award size={20} className="text-slate-400" />
                                            <span>Certificate</span>
                                        </div>
                                        <span className="font-semibold text-slate-800">Yes</span>
                                    </div>
                                    <div className="border-b border-slate-100"></div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Clock size={20} className="text-slate-400" />
                                            <span>Duration</span>
                                        </div>
                                        <span className="font-semibold text-slate-800">{CourseContent?.hours} hours</span>
                                    </div>
                                </div>
                                {
                                    courseMetaData?.isEnrolled ? (
                                        <div className='flex justify-center items-center gap-4 '>
                                            <button onClick={() => navigate(`/courses/${courseId}/learn`)} className="w-full mt-8 bg-[#0061EF] text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                                Go to Course
                                            </button>
                                            <button
                                                onClick={handleAddBookmark}
                                                className={` mt-6 p-2 rounded-full shadow-md transition-all duration-300 active:scale-90 ${courseMetaData.isBookmarked
                                                    ? 'bg-[#0066FF] text-white' 
                                                    : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-[#0066FF]' // Inactive state
                                                    }`}
                                            >
                                                <Bookmark
                                                    size={16}
                                                    fill={courseMetaData.isBookmarked ? "currentColor" : "none"} // Fills the icon when active
                                                />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => navigate(`/courses/${courseId}/enroll`)} className="w-full mt-8 bg-[#0061EF] text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                            Enroll for {courseMetaData?.price === 0 ? 'Free' : `${courseMetaData?.price} E.L`}
                                        </button>
                                    )
                                }
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* --- Student Opinions (Footer Section) --- */}
            <div className='bg-[#191919]'>

                <div className='max-w-[1450px] mx-auto px-4 md:px-8 py-12 flex flex-col  '>
                    <h1 className="bg-[linear-gradient(120deg,_#4262E4_32%,_#3995B9_69%)] bg-clip-text text-transparent text-2xl md:text-4xl lg:text-[48px] font-bold text-center leading-tight">
                        Student Opinion
                    </h1>
                    <CommentsSection comments={supportData} />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CourseDetailsPage;