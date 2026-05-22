import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import QuizInfoTab from "./tabs/QuizInfoTab";
import PeopleTab from "./tabs/PeopleTab";
import GradesTab from "./tabs/GradesTab";
import { getQuizById } from "../services/quiz";
import LoadingScreen from "../components/LoadingScreen";
import { getAllStudentsAssessments } from "../services/assessments";
import { Info, Users, BarChart2 } from "lucide-react";

const TAB_META = {
  info: { label: "Quiz Info", icon: Info },
  people: { label: "People", icon: Users },
  grades: { label: "My Grades", icon: BarChart2 },
};

const QuizInfo = () => {
  const { quiz_id } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [people, setPeople] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [availableTabs, setAvailableTabs] = useState([]);

  const fetchPeople = async () => {
    try {
      const peopleResponse = await getAllStudentsAssessments(quiz_id);
      if (peopleResponse.status === 200) {
        setPeople(peopleResponse.data.assessments);
      }
    } catch (error) {
      console.error("Failed to load people list:", error);
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await getQuizById(quiz_id);
      if (response.status === 200) {
        setQuizData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
    }
  };

  useEffect(() => {
    fetchQuiz();
    fetchPeople();
  }, [quiz_id]);

  useEffect(() => {
    if (!quizData) return;
    if (!quizData.status && quizData.completed !== null) {
      setAvailableTabs(["info", "people"]);
    } else if (quizData.status === "unfinished" || quizData.status === "submited") {
      setAvailableTabs(["info", "people"]);
    } else if (quizData.status === "graded") {
      setAvailableTabs(["info", "people", "grades"]);
    } else {
      setAvailableTabs(["info"]);
    }
  }, [quizData]);

  const getStatus = () => {
    if (!quizData) return "";
    return quizData.status || (quizData.completed === true ? "done" : "published");
  };

  const renderTab = () => {
    if (!quizData) return <LoadingScreen />;
    const status = getStatus();
    switch (activeTab) {
      case "info":
        return <QuizInfoTab quizData={quizData} status={status} />;
      case "people":
        return (
          <PeopleTab
            quizId={quizData.id}
            status={status}
            people={people}
            quizName={quizData.title}
          />
        );
      case "grades":
        return <GradesTab quizId={quizData.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[80px] z-10">
        <div className="px-4 sm:px-8 flex items-center gap-1">
          {availableTabs.map((tabKey) => {
            const Icon = TAB_META[tabKey]?.icon;
            const label = TAB_META[tabKey]?.label ?? tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150 cursor-pointer ${
                  activeTab === tabKey
                    ? "border-blue text-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {Icon && <Icon size={15} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-0">{renderTab()}</div>
    </div>
  );
};

export default QuizInfo;
