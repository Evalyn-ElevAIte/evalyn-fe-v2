import React, { useState, useEffect } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { Bell } from "lucide-react";
import EvalynLogo from "../assets/logo/evalyn_logo.png";
import DummyPhoto from "../assets/images/dummy_profile.jpg";
import { NavLink, useNavigate } from "react-router-dom";
import { getUser } from "../services/user";

const Topbar = ({ isExpanded, setIsExpanded }) => {
  const [hasNotification] = useState(true);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const user = await getUser();
        if (user.status === 200) setUserName(user.data.name);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="flex justify-between items-center px-4 sm:px-8 h-[80px]">
        {/* Left */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? <IoClose size={22} /> : <IoMenu size={22} />}
          </button>

          <NavLink to="/home">
            <img
              src={EvalynLogo}
              alt="Evalyn"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </NavLink>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell size={18} />
            {hasNotification && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <img
              src={
                userName
                  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a89cf&color=fff`
                  : DummyPhoto
              }
              alt={userName || "User"}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover"
            />
            {userName && (
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {userName.split(" ")[0]}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
