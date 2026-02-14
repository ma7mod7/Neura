import { ArrowLeft, Rocket, Construction, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const ComingSoonPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-inter flex flex-col">
            {/* 1. Navbar للحفاظ على الهوية */}
            <NavBar />

            {/* 2. المحتوى الرئيسي في المنتصف */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center relative overflow-hidden">

                    {/* Background Decor (Optional shapes) */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

                    {/* Icon Wrapper with Animation */}
                    <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
                        <Rocket className="text-[#0061EF] animate-bounce" size={40} />
                        {/* أيقونات صغيرة حولها */}
                        <Construction className="text-slate-400 absolute top-0 right-0 animate-pulse" size={20} />
                        <Hammer className="text-slate-400 absolute bottom-2 left-2" size={18} />
                    </div>

                    {/* Texts */}
                    <h1 className="text-3xl font-bold text-slate-800 mb-3">
                        We're Building This!
                    </h1>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                        This feature is currently under construction. <br className="hidden md:block" />
                        We are working hard to bring it to you soon. Stay tuned!
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {/* زر العودة */}
                        <button
                            onClick={() => navigate(-1)} // يرجع للصفحة اللي كان فيها
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ArrowLeft size={20} />
                            Go Back
                        </button>

                        {/* زر رئيسي (اختياري) */}
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0061EF] text-white font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                        >
                            Home Page
                        </button>
                    </div>

                </div>
            </main>

            {/* 3. Footer */}
            <Footer />
        </div>
    );
};

export default ComingSoonPage;