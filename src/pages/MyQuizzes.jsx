import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserQuizzes, getUserQuizzesCreator } from "../services/user";
import LoadingScreen from "../components/LoadingScreen";
import { BookOpen, Users, Plus, Search, ChevronLeft, ChevronRight, ArrowRight, FileText } from "lucide-react";

const STATUS_STYLE = {
  Published: "bg-blue-100 text-blue-600",
  Done: "bg-emerald-100 text-emerald-600",
  Unfinished: "bg-red-100 text-red-600",
  Submitted: "bg-amber-100 text-amber-600",
  Graded: "bg-emerald-100 text-emerald-600",
};

const QuizCard = ({ quiz, onView }) => (
  <div className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
    <div className="flex justify-between items-start mb-3">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
        <BookOpen size={18} className="text-blue" />
      </div>
      {quiz.status && (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[quiz.status] ?? "bg-gray-100 text-gray-600"}`}>
          {quiz.status}
        </span>
      )}
    </div>
    <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 flex-1">{quiz.title}</h3>
    {quiz.created && (
      <p className="text-xs text-gray-400 mb-1">Created: {quiz.created}</p>
    )}
    {quiz.submissions != null && (
      <p className="text-xs text-gray-400 mb-4">{quiz.submissions} submissions</p>
    )}
    <button
      onClick={() => onView(quiz.id)}
      className="inline-flex items-center gap-1.5 text-blue text-sm font-medium hover:gap-2.5 transition-all mt-auto"
    >
      View Quiz <ArrowRight size={14} />
    </button>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-4 mb-8">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
      >
        <ChevronLeft size={16} />
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`w-8 h-8 rounded-xl text-sm font-medium transition ${
            currentPage === i + 1
              ? "bg-blue text-white shadow-sm"
              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const EmptyState = ({ message, sub }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <FileText size={24} className="text-gray-400" />
    </div>
    <p className="text-gray-500 text-sm font-medium">{message}</p>
    {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
  </div>
);

const MyQuizzes = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPageMyQuizzes, setCurrentPageMyQuizzes] = useState(1);
  const [currentPageEnrolled, setCurrentPageEnrolled] = useState(1);
  const quizzesPerPage = 3;
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [enrolledQuizzes, setEnrolledQuizzes] = useState([]);

  const viewQuizHandle = (quiz_id) => navigate(`/quiz-info/${quiz_id}`);

  useEffect(() => {
    const loadQuizzes = async () => {
      setIsLoading(true);
      try {
        const [myQuizzesResponse, myQuizzesCreatorResponse] = await Promise.all([
          getUserQuizzes(),
          getUserQuizzesCreator(),
        ]);
        if (myQuizzesResponse.status === 200) {
          setEnrolledQuizzes(Array.isArray(myQuizzesResponse.data) ? myQuizzesResponse.data : []);
        }
        if (myQuizzesCreatorResponse.status === 200) {
          setMyQuizzes(Array.isArray(myQuizzesCreatorResponse.data) ? myQuizzesCreatorResponse.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuizzes();
  }, []);

  const filteredMyQuizzes = myQuizzes.filter((q) =>
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredEnrolled = enrolledQuizzes.filter((q) =>
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPagesMyQuizzes = Math.ceil(filteredMyQuizzes.length / quizzesPerPage);
  const totalPagesEnrolled = Math.ceil(filteredEnrolled.length / quizzesPerPage);

  const paginate = (items, page) => {
    const start = (page - 1) * quizzesPerPage;
    return items.slice(start, start + quizzesPerPage);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-blue via-blue/60 to-orange" />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-10 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Library</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Quizzes</h1>
            <p className="text-sm text-gray-400">Manage your quizzes and track student submissions.</p>
          </div>
          <div className="flex gap-3 mt-1">
            {[
              { label: "Created", value: myQuizzes.length, color: "text-blue" },
              { label: "Enrolled", value: enrolledQuizzes.length, color: "text-orange" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2 shadow-sm bg-white">
                <p className={`text-xl font-bold leading-none ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

      <div className="px-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPageMyQuizzes(1);
                setCurrentPageEnrolled(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/50 shadow-sm"
            />
          </div>
          <button
            onClick={() => navigate("/create")}
            className="inline-flex items-center gap-2 bg-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} /> Create Quiz
          </button>
        </div>

        {/* My Quizzes Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <BookOpen size={16} className="text-blue" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Quizzes I Created</h2>
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-medium">
              {filteredMyQuizzes.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {paginate(filteredMyQuizzes, currentPageMyQuizzes).length > 0 ? (
              paginate(filteredMyQuizzes, currentPageMyQuizzes).map((quiz, index) => (
                <QuizCard key={quiz.id ?? index} quiz={quiz} onView={viewQuizHandle} />
              ))
            ) : (
              <EmptyState
                message={searchQuery ? "No quizzes match your search." : "No quizzes created yet."}
                sub={!searchQuery ? "Click \"Create Quiz\" to get started!" : undefined}
              />
            )}
          </div>
          <Pagination
            currentPage={currentPageMyQuizzes}
            totalPages={totalPagesMyQuizzes}
            onPageChange={setCurrentPageMyQuizzes}
          />
        </div>

        {/* Enrolled Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center">
              <Users size={16} className="text-orange" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Enrolled Quizzes</h2>
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-medium">
              {filteredEnrolled.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {paginate(filteredEnrolled, currentPageEnrolled).length > 0 ? (
              paginate(filteredEnrolled, currentPageEnrolled).map((quiz, index) => (
                <QuizCard key={quiz.id ?? index} quiz={quiz} onView={viewQuizHandle} />
              ))
            ) : (
              <EmptyState
                message={searchQuery ? "No enrolled quizzes match your search." : "No enrolled quizzes yet."}
                sub={!searchQuery ? "Join a quiz from the Home page to get started!" : undefined}
              />
            )}
          </div>
          <Pagination
            currentPage={currentPageEnrolled}
            totalPages={totalPagesEnrolled}
            onPageChange={setCurrentPageEnrolled}
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default MyQuizzes;
