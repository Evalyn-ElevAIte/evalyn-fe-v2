import api from "./api";
const token = localStorage.getItem("evalyn_token");

// ai
export const analyzeQuiz = (quiz_id) => {
  return api.post(
    `/ai/analyze-quiz/${quiz_id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
