import  { useState } from 'react';
import {
    CheckCircle2,
    CodeXml,
    Database,
    BookOpen,
    PlayCircle,
    Trophy,
    Bell,
    LayoutDashboard,
    MousePointer2,
    Sparkles,
    Menu,
    X,
    ArrowRight
} from 'lucide-react';



import { RiBardLine } from "react-icons/ri";
import Team1 from '../../../assets/team1.jpg';
import Team2 from '../../../assets/team2.jpg';
import Team3 from '../../../assets/team3.jpg';
import OneTeam from '../../../assets/oneTeam.jpg';
import Competion from '../../../assets/competion.jpg';
import whoweare from '../../../assets/whoweare.png';
import OurGoal from '../../../assets/OurGoal.png';
import Balons from '../../../assets/balons.png';
import AchievementsImg from '../../../assets/Achievements.png';
import ServicesImg from '../../../assets/Services.png';
import Course from '../../../assets/course.png';
import Study from '../../../assets/study.png';
import Oursupport from '../../../assets/oursupport.png';
import Logo from '../../../assets/logo.jpg'

import Acpc23 from '../../../assets/acpc23.jpg';
import Acpc24 from '../../../assets/acpc24.jpg';
import Acpc25 from '../../../assets/acpc25.jpg';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../shared/components/Footer';
import { CommentsSection } from '../../../shared/components/CommentsSection';
import { useAuth } from '../../auth/hooks/useAuth';

const achievementsData = [
    {
        id: 1,
        title: "ECPC 2025 Qualifiers",
        description: "3 Ktakeet W Tmra Team",
        rank: "Ranked : 21st",
        image: Acpc25,
        color: "#D32F2F",
        position: "left"
    },
    {
        id: 2,
        title: "ECPC 2025 Qualifiers",
        description: "Tasleem Ahaly Team",
        rank: "Ranked: 46th",
        image: "https://placehold.co/400x250/facc15/black?text=ECPC+2025",
        color: "#FBC02D",
        position: "right"
    },
    {
        id: 3,
        title: "ECPC 2024 Qualifiers",
        description: "El 4ambo El Sodany Team",
        rank: "Ranked: 30th ECPC | Ranked : 21st ACPC",
        image: Acpc24,
        color: "#1976D2",
        position: "left"
    },
    {
        id: 4,
        title: "ACPC 2023 Qualifiers",
        description: "Big OwO(N) Team",
        rank: "",
        image: Acpc23,
        color: "#388E3C",
        position: "right"
    }
];

const servicesData = [
    {
        title: "Full Course Catalog",
        icon: <BookOpen className="w-6 h-6" />,
        description: "Depending on the level you are at, a full explanation of this level will be available to help you understand all the details. PDF for every lecture and sheet of problems on every topic to improve you"
    },
    {
        title: "Interactive Learning",
        icon: <PlayCircle className="w-6 h-6" />,
        description: "Education is delivered through interaction, whether with the mentor during the lecture or through a community specific to each level, which the student can ask any questions."
    },
    {
        title: "Reel-Time Contests",
        icon: <Trophy className="w-6 h-6" />,
        description: "Many competitions are held on an ongoing basis to measure your level and help you develop in an atmosphere of fair competition through the use of a computer vision for monitoring."
    },
    {
        title: "Smart Notifications",
        icon: <Bell className="w-6 h-6" />,
        description: "Sending notifications of lecture and exam dates and any important information periodically through a special notifications page and also via email"
    },
    {
        title: "Personalized Dashboard",
        icon: <LayoutDashboard className="w-6 h-6" />,
        description: "A Dashboard with all your details, such as the courses you are registered for and the number of problems solved, with an analysis of your data and reports on your level to help you improve."
    },
    {
        title: "Friendly use",
        icon: <MousePointer2 className="w-6 h-6" />,
        description: "An easy-to-use platform with no distractions, and a guide to guide you through our most important features."
    }
];

const coursesData = [
    {
        level: "Level 1",
        title: "Foundation",
        description: "Build strong programming fundamentals and problem-solving basics",
        topics: [
            "Programming Basics & Syntax", "Arrays & Strings",
            "Basic Sorting Algorithms", "Linear & Binary Search",
            "Basic Mathematics", "Greedy Algorithms Introduction",
            "Time & Space Complexity", "Problem Decomposition"
        ],
        buttonText: "Explore Foundation Courses",
        image: Study
    },
    {
        level: "Level 2",
        title: "Intermediate",
        description: "Master essential data structures and algorithmic techniques",
        topics: [
            "Stacks & Queues", "Linked Lists",
            "Trees & Binary Search Trees", "Graph Fundamentals (BFS/DFS)",
            "Dynamic Programming Basics", "Recursion & Backtracking",
            "Hash Tables & Maps", "Advanced Sorting Techniques"
        ],
        buttonText: "Explore Intermediate Courses",
        image: Study
    },
    {
        level: "Level 3",
        title: "Advanced",
        description: "Tackle complex algorithms and competitive programming strategies",
        topics: [
            "Advanced Dynamic Programming", "Graph Algorithms (Dijkstra, Floyd-Warshall)",
            "Segment Trees & Fenwick Trees", "String Algorithms (KMP, Z-Algorithm)",
            "Computational Geometry", "Number Theory & Modular Arithmetic",
            "Contest Strategies & Optimization",
        ],
        buttonText: "Explore Advanced Courses",
        image: Study
    }
];

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

const LandingPage = () => {
    const teamImages = [Team1, Team2, Team3];
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const navigate = useNavigate();
    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About Us', href: '#about' },
        { name: 'Achievements', href: '#achievements' },
        { name: 'Services', href: '#services' },
        { name: 'Courses', href: '#courses' },
    ];
    const { isAuthenticated } = useAuth();

    const handleMainAction = () => {
        if (isAuthenticated) {
            navigate('/announcements');
        } else {
            navigate('auth/login');
        }
    };
    return (
        <div id="home" className="min-h-screen bg-[linear-gradient(100deg,_#D9E8FF_0%,_#FFF1E8_31%,_#B9C5D6_100%)] font-inter text-slate-900 scroll-smooth">
            <title>Neura - Up Your Skills To Be A Good Problem Solver</title>
            <meta name="description" content="The ultimate platform for programming problem solvers" />
            {/* --- HEADER --- */}
            <header className="sticky top-0 py-1 z-[100] w-full px-4 bg-white/10 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-[1450px] items-center justify-between">
                    <div className="flex items-center gap-2">
                                              <img src={Logo} alt="" className="h-12 rounded-full w-auto object-contain" />

                        <span className="text-xl font-bold tracking-tight text-blue-600">NEURA</span>
                    </div>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center text-sm font-medium text-slate-600 bg-[#BFD9FF]/50 px-6 py-3 rounded-full gap-8 lg:gap-16">
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href} className="hover:text-blue-600 transition-colors">
                                {link.name}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4">
                        <button onClick={handleMainAction} className="hidden sm:block rounded-full bg-blue-600 px-6 lg:px-8 py-2 lg:py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all active:scale-95">
                            {isAuthenticated ? (
                                <>
                                    <div className='flex gap-2'>
                                    <span>Go to App</span>
                                    <ArrowRight size={24} />
                                    </div>
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>

                        {/* Hamburger Button */}
                        <button onClick={toggleMenu} className="md:hidden p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-[#BFD9FF] rounded-3xl shadow-2xl p-6 border border-blue-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-lg font-semibold text-slate-700 hover:text-blue-600 px-4 py-2 hover:bg-blue-50 rounded-xl transition-all"
                            >
                                {link.name}
                            </a>
                        ))}
                        <button onClick={handleMainAction} className="w-full mt-2 rounded-2xl bg-blue-600 py-4 text-white font-bold shadow-lg shadow-blue-200">
                                {isAuthenticated ? (
                                <>
                                    <div className='flex gap-2'>
                                    <span>Go to App</span>
                                    <ArrowRight size={24} />
                                    </div>
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </div>
                )}
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative overflow-hidden pt-12 pb-16 lg:pt-24 lg:pb-24 px-4">
                <div className="mx-auto max-w-[1450px] text-center relative">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                        Up Your Skills To Be<br /> a good
                        <span className="bg-[linear-gradient(120deg,_#4262E4_36%,_#3995B9_70%)] bg-clip-text text-transparent"> Problem Solver</span>
                    </h1>
                    <p className="mx-auto mt-6 lg:mt-8 max-w-xl text-base lg:text-lg text-[#737373] text-center font-medium">
                        Welcome to Fayoum ICPC Student Community. Learning, Practicing, and Competing Together in Problem Solving.
                    </p>

                    <svg width="0" height="0" className="absolute">
                        <linearGradient id="icon-gradient" x1="10%" y1="0%" x2="10%" y2="100%">
                            <stop offset="0%" stopColor="#4262E4" />
                            <stop offset="60%" stopColor="#3995B9" />
                        </linearGradient>
                    </svg>

                    <CodeXml strokeWidth={3} stroke="url(#icon-gradient)" className="hidden xl:block absolute top-10 right-[10%] w-14 h-14" />
                    <RiBardLine fill="url(#icon-gradient)" stroke="url(#icon-gradient)" className="hidden xl:block absolute top-15 left-[10%] w-14 h-14" />
                    <Database stroke="url(#icon-gradient)" className="hidden xl:block absolute top-1 left-[10%] w-14 h-14 rotate-12" />

                    <div className="mt-12 lg:mt-20 mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                            <div className="lg:col-span-3 flex flex-col gap-4 p-4 rounded-3xl bg-[#D7E1EF] border border-white shadow-sm">
                                <div className="overflow-hidden rounded-2xl aspect-video lg:aspect-auto lg:max-h-60">
                                    <img src={Competion} alt="Competition" className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                                </div>
                                <p className="bg-[linear-gradient(120deg,_#4B5BE9_32%,_#3B8FC0_69%)] bg-clip-text text-transparent text-2xl lg:text-4xl font-bold text-center tracking-tight">
                                    {'{Competition}'}
                                </p>
                            </div>

                            <div className="lg:col-span-6 flex flex-col gap-4">
                                <div className="flex-1 min-h-[150px] flex items-center justify-center rounded-3xl bg-[#D7E1EF] font-bold border border-white shadow-md ">
                                    <h2 className="bg-[linear-gradient(120deg,_#4B5BE9_32%,_#3B8FC0_69%)] bg-clip-text text-transparent text-2xl md:text-3xl lg:text-[44px] font-bold text-center leading-tight p-2">
                                        We push ourselves forward ;
                                    </h2>
                                </div>
                                <div className="grid grid-cols-3 gap-2 lg:gap-4 bg-[#D7E1EF] p-2 lg:p-4 rounded-3xl border border-white shadow-md">
                                    {teamImages.map((image, i) => (
                                        <div key={i} className="aspect-square rounded-2xl lg:rounded-3xl overflow-hidden shadow-md">
                                            <img src={image} alt="Team member" className="w-full h-full object-cover hover:scale-105 duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-3 flex flex-col gap-4 p-4 rounded-3xl bg-[#D7E1EF] border border-white shadow-md">
                                <div className="overflow-hidden rounded-2xl aspect-video lg:aspect-auto lg:max-h-60">
                                    <img src={OneTeam} alt="One Team" className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                                </div>
                                <p className="bg-[linear-gradient(120deg,_#4B5BE9_32%,_#3B8FC0_69%)] bg-clip-text text-transparent text-2xl lg:text-4xl font-bold text-center tracking-tight">
                                    {'<One Team/>'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-[#FFB800] py-10 lg:h-[200px] mx-auto px-4 flex flex-col lg:flex-row justify-around text-center items-center gap-8 lg:gap-0">
                <div>
                    <p className="text-4xl lg:text-[64px] font-bold text-white">+1000</p>
                    <p className="text-2xl lg:text-[44px] mt-4 ml-2 font-bold text-white/90 tracking-wider">Student</p>
                </div>
                <div>
                    <p className="text-4xl lg:text-[64px] font-bold text-white">+20</p>
                    <p className="text-2xl lg:text-[44px] font-bold mt-4 ml-2 text-white/90 tracking-wider">Explain Course</p>
                </div>
                <div>
                    <p className="text-4xl lg:text-[64px] font-bold text-white">+50</p>
                    <p className="text-2xl lg:text-[44px] font-bold mt-4 ml-2 text-white/90 tracking-wider">Content</p>
                </div>
            </div>

            <section id="about" className="py-12 lg:py-20 px-4 scroll-mt-24">
                <div className="mx-auto max-w-[1450px]">
                    <div className="rounded-[2rem] min-h-[400px] bg-blue-600 px-6 lg:px-12 py-10 flex flex-col lg:flex-row items-center gap-12 text-white">
                        <div className="flex-1 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-[52px] font-bold mb-6">Who We Are?</h2>
                            <ul className="flex flex-col gap-5 lg:gap-7">
                                <li><p className="text-lg lg:text-[20px]">We are a community of passionate programmers dedicated to competitive programming.</p></li>
                                <li><p className="text-lg lg:text-[20px]">United by a love for coding challenges, we foster learning, collaboration, and growth.</p></li>
                                <li><p className="text-lg lg:text-[20px]">Our focus is excellence in algorithmic problem-solving and contests like the ACPC.</p></li>
                            </ul>
                        </div>
                        <div className="flex justify-center w-full lg:w-auto">
                            <img src={whoweare} alt="Who we are" className="max-w-[250px] lg:max-w-xs" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-6 lg:py-1 px-4">
                <div className="mx-auto max-w-[1450px]">
                    <div className="rounded-[2rem] min-h-[400px] bg-blue-600 px-6 lg:px-12 py-10 flex flex-col-reverse lg:flex-row items-center gap-12 text-white">
                        <div className="flex-1 flex justify-center w-full lg:w-auto">
                            <img src={OurGoal} alt="Our Goal" className="max-w-[250px] lg:max-w-xs" />
                        </div>
                        <div className="flex-1 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-[52px] font-bold mb-6">Our Goal</h2>
                            <ul className="flex flex-col gap-5 lg:gap-7">
                                <li><p className="text-lg lg:text-[20px]">Our goal is to develop world-class programmers who shine in ACPC and ICPC.</p></li>
                                <li><p className="text-lg lg:text-[20px]">We aim to qualify teams for World Finals, offer training for all levels, promote mentorship, and build a lasting impact in the programming community.</p></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-10 lg:py-20 px-4">
                <div className="mx-auto max-w-[1450px] flex justify-center">
                    <img src={Balons} alt="Illustration" className="w-full max-w-7xl h-auto" />
                </div>
            </section>

            <section id="achievements" className="py-6 lg:py-20 px-4 scroll-mt-24">
                <div className="mx-auto max-w-[1450px]">
                    <div className="rounded-[2rem] min-h-[400px] bg-blue-600 px-6 lg:px-12 py-10 flex flex-col lg:flex-row items-center gap-12 text-white">
                        <div className="flex-1 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-[52px] font-bold mb-6">Our Achievements</h2>
                            <p className="text-xl lg:text-[26px]">Celebrating our journey of success in competitive programming and ACPC qualifications</p>
                        </div>
                        <div className="flex justify-center w-full lg:w-auto">
                            <img src={AchievementsImg} alt="Achievements" className="max-w-[250px] lg:max-w-xs" />
                        </div>
                    </div>
                </div>

                {/* TIMELINE */}
                <div className="mt-20 overflow-hidden px-4 max-w-7xl mx-auto relative">
                    <div className="space-y-16 lg:space-y-24">
                        {achievementsData.map((item) => (
                            <div key={item.id} className={`relative flex flex-col items-center ${item.position === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                                <div className="w-full lg:w-1/2 flex justify-center px-4 lg:px-12">
                                    <div className="relative group">
                                        <img src={item.image} alt={item.title} className="rounded-[2.5rem] shadow-xl w-full max-w-md object-cover hover:scale-105 transition-transform duration-500 border-4 border-white" />
                                        <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full opacity-50 blur-xl" style={{ backgroundColor: item.color }} />
                                    </div>
                                </div>
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                                    <div className="absolute top-[-80px] left-0 w-[2px] h-20" style={{ backgroundColor: item.color }} />
                                    <div className="relative z-10 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center" style={{ backgroundColor: item.color }}>
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                    <div className={`absolute top-1/2 w-24 h-[2px] -translate-y-1/2 ${item.position === 'left' ? 'right-10' : 'left-10'}`} style={{ backgroundColor: item.color }} />
                                </div>
                                <div className={`w-full lg:w-1/2 mt-8 lg:mt-0 px-4 lg:px-12 text-center ${item.position === 'left' ? 'lg:text-left' : 'lg:text-right'}`}>
                                    <h3 className="text-2xl font-extrabold mb-2 tracking-tight text-slate-800">{item.title}</h3>
                                    <p className="text-slate-600 font-medium text-lg mb-1 italic">{item.description}</p>
                                    <p className="text-slate-500 font-semibold text-sm uppercase tracking-widest">{item.rank}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="services" className="py-10 lg:py-20 px-4 scroll-mt-24">
                <div className="mx-auto max-w-[1450px]">
                    <div className="rounded-[2rem] min-h-[400px] bg-blue-600 px-6 lg:px-12 py-10 flex flex-col lg:flex-row items-center gap-12 text-white">
                        <div className="flex-1 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-[52px] font-bold mb-6">Our Services</h2>
                            <p className="text-xl lg:text-[26px]">A comprehensive platform designed to elevate your competitive programming skills with cutting-edge tools and community support</p>
                        </div>
                        <div className="flex justify-center w-full lg:w-auto">
                            <img src={ServicesImg} alt="Services" className="max-w-[250px] lg:max-w-xs" />
                        </div>
                    </div>
                </div>
                <div className="mt-10 mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {servicesData.map((service, idx) => (
                            <div key={idx} className="bg-[#E3E8EF] p-6 lg:p-8 rounded-[1.2rem] border border-white shadow-sm flex flex-col items-start transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                                <div className="mb-5 bg-[#0066FF] w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-inner">
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{service.title}</h3>
                                <p className="text-[#64748B] text-[15px] leading-relaxed font-medium">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="courses" className="py-10 lg:py-20 px-4 scroll-mt-24">
                <div className="mx-auto max-w-[1450px]">
                    <div className="rounded-[2rem] min-h-[400px] bg-blue-600 px-6 lg:px-12 py-10 flex flex-col lg:flex-row items-center gap-12 text-white">
                        <div className="flex justify-center w-full lg:w-auto">
                            <img src={Course} alt="Training Levels" className="max-w-[250px] lg:max-w-xs" />
                        </div>
                        <div className="flex-1 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-[52px] font-bold mb-6">Training Levels</h2>
                            <p className="text-xl lg:text-[26px]">Structured learning path from fundamentals to advanced competitive programming</p>
                        </div>
                    </div>
                </div>
                <div className="mt-12 mx-auto max-w-7xl px-4">
                    <div className="space-y-8 lg:space-y-12">
                        {coursesData.map((course, i) => (
                            <div key={i} className="relative bg-white p-6 lg:p-14 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                                <div className="absolute top-6 left-6 lg:top-10 lg:left-10 bg-[#FFB800] text-white px-4 py-1 rounded-full text-xs lg:text-sm font-medium">
                                    {course.level}
                                </div>
                                <div className="w-full lg:w-[40%] flex justify-center mt-10 lg:mt-0">
                                    <img src={course.image} alt={course.title} className="w-full max-w-[250px] lg:max-w-sm h-auto object-contain" />
                                </div>
                                <div className="flex-1 w-full text-center lg:text-left">
                                    <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">{course.title}</h3>
                                    <p className="text-slate-500 text-base lg:text-lg mb-8">{course.description}</p>
                                    <div className="mb-8">
                                        <div className="flex items-center justify-center lg:justify-start gap-2 text-[#0066FF] mb-4">
                                            <BookOpen className="w-5 h-5" />
                                            <span className="font-bold text-lg">Topics Covered:</span>
                                        </div>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 lg:gap-y-4 text-left">
                                            {course.topics.map((topic, j) => (
                                                <li key={j} className="flex items-start gap-3 text-[#475569] font-medium text-sm lg:text-[15px]">
                                                    <CheckCircle2 className="h-5 w-5 text-[#0066FF] mt-0.5 shrink-0" />
                                                    <span>{topic}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button className="w-full sm:w-auto bg-[#0066FF] text-white px-8 lg:px-10 py-3 lg:py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all active:scale-95">
                                        {course.buttonText}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SUPPORT --- */}
            <section className="py-10 lg:py-20 px-4">
                <div className="mx-auto max-w-[1450px]">
                    <div className="rounded-[2rem] min-h-[400px] bg-blue-600 px-6 lg:px-12 py-10 flex flex-col lg:flex-row items-center gap-12 text-white">
                        <div className="flex justify-center w-full lg:w-auto">
                            <img src={Oursupport} alt="Support" className="max-w-[250px] lg:max-w-xs" />
                        </div>
                        <div className="flex-1 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-[52px] font-bold mb-6">Our Support</h2>
                            <p className="text-xl lg:text-[26px]">Some words have the power to lift us up, push us forward, and remind us to always do our best no matter how hard things get.</p>
                        </div>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-4 mt-10">
                    <CommentsSection comments={supportData} />
                </div>
            </section>

            <section className="py-10 px-4">
                <div className="mx-auto max-w-[1450px]">
                    <div className="rounded-[3rem] min-h-[400px] lg:h-[450px] bg-[#0066FF] flex flex-col items-center justify-center text-center text-white px-6 py-12 shadow-2xl relative overflow-hidden">
                        <div className="bg-yellow-300/30 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full flex items-center gap-3 mb-8">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <span className="text-sm md:text-base font-medium tracking-wide">Join Our Community</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold mb-6 leading-tight">Ready to Start Your Journey?</h2>
                        <p className="max-w-3xl text-blue-50 text-base lg:text-[20px] leading-relaxed opacity-90 mb-12">
                            Join thousands of students already mastering competitive programming with our comprehensive platform.
                        </p>
                        <button onClick={handleMainAction} className="bg-[#FFB800] text-[#1e1e1e] px-8 lg:px-12 py-4 lg:py-5 rounded-full font-bold text-lg lg:text-xl shadow-xl hover:bg-[#ffa500] transition-all active:scale-95">
                            Get Started Now
                        </button>
                        <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>
            <Footer />

        </div>
    );
};

export default LandingPage;