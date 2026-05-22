import React, { useEffect, useState } from "react";
import { FaHistory, FaHome } from "react-icons/fa";
import { GoBook } from "react-icons/go";
import { LuSettings } from "react-icons/lu";
import { FiFileText, FiLogOut } from "react-icons/fi";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BsFillPersonFill } from "react-icons/bs";
import { NavLink, useNavigate } from "react-router-dom";
import { getUserQuizzes, getUserQuizzesCreator } from "../services/user";

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isEnrolledOpen, setIsEnrolledOpen] = useState(false);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [enrolledQuizzes, setEnrolledQuizzes] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/signin");
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

  const navLinkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 pl-5 pr-3 py-2.5 text-sm rounded-r-2xl transition-all duration-150 ${
      isActive
        ? "bg-white text-blue font-semibold shadow-sm border border-orange/30"
        : "text-gray-500 hover:bg-white/70 hover:text-gray-700"
    }`;

  const QuizSubItem = ({ quiz, onClick }) => (
    <div
      onClick={onClick}
      className="flex gap-2.5 items-center py-2 px-3 bg-white rounded-xl shadow-sm hover:shadow cursor-pointer text-sm text-gray-600 hover:text-blue transition-all"
    >
      <div className="w-6 h-6 rounded-lg bg-orange/20 text-orange font-bold flex items-center justify-center text-xs flex-shrink-0">
        {quiz.title?.[0]?.toUpperCase() ?? "Q"}
      </div>
      <span className="truncate text-xs font-medium">{quiz.title}</span>
    </div>
  );

  return (
    <div
      className={`fixed top-[80px] left-0 h-[calc(100vh-80px)] bg-[#eaf3fb] flex-col justify-between pr-2 py-4 z-50 transition-all duration-300 ease-in-out overflow-y-auto border-r border-orange/20 shadow-md
        ${isExpanded ? "flex w-64" : "hidden"}
        md:flex ${isExpanded ? "md:w-64" : "md:w-16"}`}
    >
      <nav className="space-y-1 mt-2 px-1">
        <NavLink to="/home" className={navLinkClass}>
          <FaHome size={16} className="flex-shrink-0" />
          {isExpanded && <span>Home</span>}
        </NavLink>

        <NavLink to="/activity" className={navLinkClass}>
          <FaHistory size={16} className="flex-shrink-0" />
          {isExpanded && <span>Activity</span>}
        </NavLink>

        {isExpanded && <div className="border-t border-orange/20 mx-2 my-3" />}

        {/* My Quizzes */}
        <div>
          <div
            className={`flex items-center gap-3 pl-5 pr-3 py-2.5 text-sm rounded-r-2xl cursor-pointer transition-all duration-150 ${
              isQuizOpen ? "bg-white text-blue shadow-sm border border-orange/30" : "text-gray-500 hover:bg-white/70 hover:text-gray-700"
            }`}
            onClick={() => {
              setIsQuizOpen(!isQuizOpen);
              setIsEnrolledOpen(false);
              if (!isExpanded) setIsExpanded(true);
              if (isQuizOpen) navigate("/quizzes");
            }}
          >
            <GoBook size={16} className="flex-shrink-0" />
            {isExpanded && (
              <>
                <span className="flex-1">My Quizzes</span>
                {isQuizOpen ? <ChevronUp size={14} className="text-orange" /> : <ChevronDown size={14} className="text-gray-400" />}
              </>
            )}
          </div>
          {isExpanded && isQuizOpen && (
            <div className="ml-4 mt-1.5 space-y-1.5 pr-1">
              {myQuizzes.length === 0 ? (
                <p className="text-xs text-gray-400 px-3 py-1.5">No quizzes yet.</p>
              ) : (
                myQuizzes.map((quiz, i) => (
                  <QuizSubItem key={i} quiz={quiz} onClick={() => viewQuizHandle(quiz.id)} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Enrolled */}
        <div>
          <div
            className={`flex items-center gap-3 pl-5 pr-3 py-2.5 text-sm rounded-r-2xl cursor-pointer transition-all duration-150 ${
              isEnrolledOpen ? "bg-white text-blue shadow-sm border border-orange/30" : "text-gray-500 hover:bg-white/70 hover:text-gray-700"
            }`}
            onClick={() => {
              setIsEnrolledOpen(!isEnrolledOpen);
              setIsQuizOpen(false);
              if (!isExpanded) setIsExpanded(true);
              if (isEnrolledOpen) navigate("/quizzes");
            }}
          >
            <BsFillPersonFill size={16} className="flex-shrink-0" />
            {isExpanded && (
              <>
                <span className="flex-1">Enrolled</span>
                {isEnrolledOpen ? <ChevronUp size={14} className="text-orange" /> : <ChevronDown size={14} className="text-gray-400" />}
              </>
            )}
          </div>
          {isExpanded && isEnrolledOpen && (
            <div className="ml-4 mt-1.5 space-y-1.5 pr-1">
              {enrolledQuizzes.length === 0 ? (
                <p className="text-xs text-gray-400 px-3 py-1.5">No enrolled quizzes.</p>
              ) : (
                enrolledQuizzes.map((quiz, i) => (
                  <QuizSubItem key={i} quiz={quiz} onClick={() => viewQuizHandle(quiz.id)} />
                ))
              )}
            </div>
          )}
        </div>

        <NavLink to="/documents" className={navLinkClass}>
          <FiFileText size={16} className="flex-shrink-0" />
          {isExpanded && <span>My Documents</span>}
        </NavLink>
      </nav>

      {/* Bottom */}
      <div className="px-1 space-y-1 mb-2">
        {isExpanded && <div className="border-t border-orange/20 mx-2 mb-3" />}
        <NavLink to="/settings" className={navLinkClass}>
          <LuSettings size={16} className="flex-shrink-0" />
          {isExpanded && <span>Settings</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 pl-5 pr-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-r-2xl transition-all duration-150"
        >
          <FiLogOut size={16} className="flex-shrink-0" />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
