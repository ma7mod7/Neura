import { FacebookIcon, Github, Linkedin } from 'lucide-react'
import Logo from '../../assets/logo.jpg'

const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Achievements', href: '#achievements' },
    { name: 'Services', href: '#services' },
    { name: 'Courses', href: '#courses' },
];
const Footer = () => {
    return (
        <div>
            {/* --- FOOTER (Reused from your previous pages) --- */}
            <footer className="bg-[#0A0A0A] text-white pt-16 pb-8 px-6">
                <div className="mx-auto max-w-[1450px]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10 pb-12 text-center md:text-left">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img src={Logo} alt="" className="h-12 rounded-full w-auto object-contain" />

                            </div>
                            <span className="text-2xl font-bold tracking-tight">Neura</span>
                        </div>
                        <div className="flex items-center gap-5">
                            {[{ icon: <FacebookIcon size={20} />, label: "Facebook" }, { icon: <Linkedin size={20} />, label: "LinkedIn" }, { icon: <Github size={20} />, label: "GitHub" }].map((social, idx) => (
                                <a key={idx} href="#" aria-label={social.label} className="w-12 h-12 rounded-full border border-[#0066FF] flex items-center justify-center text-[#0066FF] hover:bg-[#0066FF] hover:text-white transition-all">
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-4">
                            <h4 className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em]">Fast Links</h4>
                            <nav className="flex flex-wrap justify-center gap-x-6 lg:gap-x-8 gap-y-2">
                                {navLinks.map((link) => (
                                    <a key={link.name} href={link.href} className="text-slate-300 hover:text-[#0066FF] transition-colors font-medium">{link.name}</a>
                                ))}
                            </nav>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">© 2026 Neura Community. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Footer