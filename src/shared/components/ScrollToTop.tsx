import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // إجبار المتصفح على الصعود للأعلى عند تغيير المسار
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant", // استخدم 'smooth' لو فضلت تأثير النعومة
        });
    }, [pathname]);

    // المكون لا يعرض شيئاً (Null) لأنه مجرد Logic
    return null;
};

export default ScrollToTop;