import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
    variant?: 'default' | 'compact' | 'auth';
    className?: string;
}

const LanguageSwitcher = ({ variant = 'default', className = '' }: LanguageSwitcherProps) => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.resolvedLanguage === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
    };

    if (variant === 'compact') {
        return (
            <button
                onClick={toggleLanguage}
                className={`p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c1c1f] rounded-full transition-colors ${className}`}
                aria-label="Toggle language"
            >
                <Globe size={18} />
            </button>
        );
    }

    if (variant === 'auth') {
        return (
            <button
                onClick={toggleLanguage}
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors font-medium text-sm ${className}`}
            >
                <Globe size={18} />
                <span>{t('navigation.languageToggle')}</span>
            </button>
        );
    }

    return (
        <button
            onClick={toggleLanguage}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c1f] text-slate-600 dark:text-slate-300 transition-colors font-medium text-sm ${className}`}
        >
            <Globe size={18} />
            <span className="hidden sm:inline">{t('navigation.languageToggle')}</span>
        </button>
    );
};

export default LanguageSwitcher;
