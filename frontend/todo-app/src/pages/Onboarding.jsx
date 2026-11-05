import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Onboarding = ({ onGetStarted }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    try {
      localStorage.setItem("todo_onboarded", "true");
    } catch {
      console.error("Failed to set onboarding status in localStorage.");
    }

    if (onGetStarted) {
      onGetStarted();
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-3 sm:p-6 lg:p-10">
      {/* Main Container */}
      <div className="w-full max-w-7xl min-h-[650px] bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Blue Section */}
        <div className="relative bg-[#4563ED] min-h-[300px] md:min-h-[650px] flex items-center justify-center overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute -top-16 -right-16 w-52 h-52 border-[25px] border-white/10 rounded-full" />

          {/* Decorative Pattern */}
          <div className="absolute top-20 left-10 text-white/20 text-7xl font-bold">
            ≋
            <br />≋
          </div>

          <div className="absolute bottom-16 right-10 text-white/20 text-7xl font-bold">
            ≋
            <br />≋
          </div>

          {/* Center Content */}
          <div className="relative text-center text-white px-6">
            <div className="text-7xl md:text-8xl mb-6">✓</div>

            <h2 className="text-3xl md:text-4xl font-bold">Stay Organized</h2>

            <p className="mt-4 text-white/80 text-sm md:text-base">
              Plan your day. Track your progress. Get things done.
            </p>
          </div>
        </div>

        {/* Right Content Section */}
        <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-16">
          {/* Heading */}
          <div className="my-auto py-10 md:py-0">
            <span className="text-[#4563ED] font-semibold text-sm uppercase tracking-widest">
              Welcome to Todo
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 leading-tight">
              Manage What
              <span className="block text-[#4563ED]">To Do</span>
            </h1>

            <p className="text-gray-500 text-sm sm:text-base mt-6 leading-7 max-w-md">
              The best way to manage your daily tasks. Organize your schedule,
              track your progress and never forget your important work.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <span className="text-[#4563ED]">✓</span>
                Organize your daily tasks
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <span className="text-[#4563ED]">✓</span>
                Track your weekly progress
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <span className="text-[#4563ED]">✓</span>
                Stay productive every day
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="mt-8">
            <button
              onClick={handleGetStarted}
              className="w-full bg-[#4563ED] text-white py-4 rounded-lg
              font-semibold flex items-center justify-center gap-3
              hover:bg-blue-700 transition-all duration-300
              hover:shadow-lg active:scale-[0.98]"
            >
              Get Started
              <ArrowRight size={20} />
            </button>

            <p className="text-center text-xs text-gray-400 mt-5">
              Organize your life, one task at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
