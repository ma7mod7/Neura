
const ConfirmEmail = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 font-sans">
            <div className="max-w-md w-full text-center bg-[#111111] p-10 rounded-[2.5rem] shadow-sm border border-white/5">
                {/* Icon Container */}
                <div className="mb-8 flex justify-center">
                    <div className="bg-blue-50 p-5 rounded-full">
                        <svg
                            className="w-14 h-14 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold text-white mb-4">
                    Verify your email
                </h2>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    We've sent a verification link to your email address. Please click the link to activate your account and get started.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => window.open('https://mail.google.com', '_blank')}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md "
                    >
                        Open Email Inbox
                    </button>

                </div>

            </div>
        </div>
    );
};

export default ConfirmEmail;