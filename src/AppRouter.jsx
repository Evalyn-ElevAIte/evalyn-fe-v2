import React from "react";
import { Routes, Route, Navigate, createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";
import Activities from "./pages/Activities";
import MyQuizzes from "./pages/MyQuizzes";
import CreateQuiz from "./pages/CreateQuiz";
import SuccessCreate from "./pages/SuccessCreate";
import SuccessJoin from "./pages/SuccessJoin";
import QuizInfo from "./pages/QuizInfo";
import QuizStartPage from "./pages/QuizStartPage";
import SuccessSubmit from "./pages/SuccessSubmit";
import AssessmentResultPage from "./pages/AssessmentResultPage";
import MyDocuments from "./pages/MyDocuments";

const AppRouter = createBrowserRouter([
  // Landing page at root
  {
    path: "/",
    element: <LandingPage />,
  },

  // Auth pages (no layout)
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },

  // Main layout for all app pages (clean URLs)
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "activity",
        element: <Activities />,
      },
      {
        path: "quizzes",
        element: <MyQuizzes />,
      },
      {
        path: "create",
        element: <CreateQuiz />,
      },
      {
        path: "success-create/:quiz_id",
        element: <SuccessCreate />,
      },
      {
        path: "success-join",
        element: <SuccessJoin />,
      },
      {
        path: "quiz-info/:quiz_id",
        element: <QuizInfo />,
      },
      {
        path: "start-quiz/:quiz_id",
        element: <QuizStartPage />,
      },
      {
        path: "/success-submit",
        element: <SuccessSubmit />,
      },
      {
        path: "quiz/assessment-result",
        element: <AssessmentResultPage />,
      },
      {
        path: "documents",
        element: <MyDocuments />,
      },
    ],
  },

  // Optional fallback
  {
    path: "*",
    element: <div>404 - Not Found</div>,
  },
]);

export default AppRouter;
