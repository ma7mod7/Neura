import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPreviewButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      aria-label="Preview landing page"
      title="View landing page"
      className="
        p-2 rounded-full transition-all duration-300
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
      "
    >
      <Home size={20} />
    </button>
  );
};

export default LandingPreviewButton;