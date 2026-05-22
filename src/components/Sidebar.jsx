import React, { useEffect, useState } from "react";
import { FaHistory, FaHome } from "react-icons/fa";
import { GoBook } from "react-icons/go";
import { LuSettings } from "react-icons/lu";
import { FiFileText } from "react-icons/fi";
import { RiArrowUpSFill, RiArrowDownSFill } from "react-icons/ri";
import { BsFillPersonFill } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { getUserQuizzes, getUserQuizzesCreator } from "../services/user";

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isEnrolledOpen, setIsEnrolledOpen] = useState(false);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [enrolledQuizzes, setEnrolledQuizzes] = useState([]);

  const navigate = useNavigate();
  const sidebarWidth = isExpanded ? "w-72" : "w-20";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizResp, creatorResp] = await Promise.all([
          getUserQuizzes(),
          getUserQuizzesCreator(),
        ]);
        if (quizResp.status === 200) {
          setEnrolledQuizzes(Array.isArray(quizResp.data) ? quizResp.data : []);
        }
        if (creatorResp.status === 200) {
          setMyQuizzes(Array.isArray(creatorResp.data) ? creatorResp.data : []);
        }
      } catch (error) {
        console.error("Sidebar fetch error:", error);
      }
    };

    fetchData();
  }, []);

  const viewQuizHandle = (quiz_id) => navigate(`/quiz-info/${quiz_id}`);

  return (
    <div
      className={`fixed top-[80px] left-0 h-[calc(100vh-80px)] bg-[#e8f1fb] flex-col justify-between pl-0 pr-2 py-4 rounded-r-3xl shadow-md border border-[#F2AA32]/55 z-50 transition-all duration-300 ease-in-out overflow-y-auto
    ${isExpanded ? "flex w-72" : "hidden"}
    md:flex ${isExpanded ? "md:w-72" : "md:w-20"}`}
    >
      <div>
        <nav className="space-y-2 mt-4">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `w-full flex items-center gap-4 pl-8 py-3 text-sm rounded-r-full transition-all duration-200 ${
                isActive
                  ? "bg-white text-blue font-bold border border-[#F2AA32]"
                  : "hover:bg-white hover:shadow-sm text-gray-600"
              }`
            }
          >
            <FaHome size={18} />
            {isExpanded && <span>Home</span>}
          </NavLink>

          <NavLink
            to="/activity"
            className={({ isActive }) =>
              `w-full flex items-center gap-4 pl-8 py-3 text-sm rounded-r-full transition-all duration-200 ${
                isActive
                  ? "bg-white text-blue font-bold border border-[#F2AA32]"
                  : "hover:bg-white hover:shadow-sm text-gray-600"
              }`
            }
          >
            <FaHistory size={18} />
            {isExpanded && <span>Activity</span>}
          </NavLink>

          {isExpanded && <hr className="border-t border-[#F2AA32] mx-6 my-4" />}

          {/* My Quizzes */}
          <div
            className={`pl-8 py-3 flex items-center gap-3 text-sm cursor-pointer hover:bg-white rounded-r-full transition ${
              isQuizOpen ? "border border-orange bg-white shadow-sm" : ""
            }`}
            onClick={() => {
              setIsQuizOpen(!isQuizOpen);
              setIsEnrolledOpen(false);
              if (!isExpanded) setIsExpanded(true);
              if (isQuizOpen) navigate("/quizzes");
            }}
          >
            {isExpanded &&
              (isQuizOpen ? (
                <RiArrowUpSFill className="text-orange" size={20} />
              ) : (
                <RiArrowDownSFill className="text-orange" size={20} />
              ))}
            <GoBook size={18} />
            {isExpanded && <span>My Quizzes</span>}
          </div>

          {isExpanded && isQuizOpen && (
            <div className="ml-8 mt-2 space-y-2">
              {myQuizzes.map((quiz, index) => (
                <div
                  key={index}
                  onClick={() => viewQuizHandle(quiz.id)}
                  className="flex gap-2 items-center py-2 px-4 bg-white rounded-full shadow-sm hover:shadow-md cursor-pointer text-sm text-gray-700 truncate"
                >
                  <div className="bg-[#F2AA32] text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    P
                  </div>
                  <div className="truncate">
                    <div className="font-medium truncate max-w-[140px]">
                      {quiz.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {quiz.end_time &&
                        new Date(quiz.end_time).toLocaleDateString(
                          "en-US",
                          options
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enrolled */}
          <div
            className={`pl-8 py-3 flex items-center gap-3 text-sm cursor-pointer hover:bg-white rounded-r-full transition ${
              isEnrolledOpen ? "border border-orange bg-white shadow-sm" : ""
            }`}
            onClick={() => {
              setIsEnrolledOpen(!isEnrolledOpen);
              setIsQuizOpen(false);
              if (!isExpanded) setIsExpanded(true);
              if (isEnrolledOpen) navigate("/quizzes");
            }}
          >
            {isExpanded &&
              (isEnrolledOpen ? (
                <RiArrowUpSFill className="text-orange" size={20} />
              ) : (
                <RiArrowDownSFill className="text-orange" size={20} />
              ))}
            <BsFillPersonFill size={18} />
            {isExpanded && <span>Enrolled</span>}
          </div>

          {isExpanded && isEnrolledOpen && (
            <div className="ml-6 mt-2 space-y-2">
              {enrolledQuizzes.map((quiz, index) => (
                <div
                  key={index}
                  onClick={() => viewQuizHandle(quiz.id)}
                  className="flex gap-2 items-center py-2 px-4 bg-white rounded-full shadow-sm hover:shadow-md cursor-pointer text-sm text-gray-700 truncate"
                >
                  <div className="bg-[#F2AA32] text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    P
                  </div>
                  <div className="truncate">
                    <div className="font-medium truncate max-w-[140px]">
                      {quiz.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {quiz.dueDate || "No due date"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <NavLink
            to="/documents"
            className={({ isActive }) =>
              `w-full flex items-center gap-4 pl-8 py-3 text-sm rounded-r-full transition-all duration-200 ${
                isActive
                  ? "bg-white text-blue font-bold border border-[#F2AA32]"
                  : "hover:bg-white hover:shadow-sm text-gray-600"
              }`
            }
          >
            <FiFileText size={18} />
            {isExpanded && <span>My Documents</span>}
          </NavLink>
        </nav>
      </div>

      {/* Settings & Logout */}
      <div className="mb-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-4 pl-8 py-3 text-sm rounded-r-full transition-all duration-200 ${
              isActive
                ? "bg-white text-blue font-bold border border-[#F2AA32]"
                : "hover:bg-white hover:shadow-sm text-gray-600"
            }`
          }
        >
          <LuSettings size={18} />
          {isExpanded && <span>Settings</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 pl-8 py-3 text-sm text-red-600 hover:bg-white hover:shadow-sm rounded-r-full"
        >
          <FiLogOut size={18} />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
