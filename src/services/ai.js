import api from "./api";
const token = localStorage.getItem("evalyn_token");

// ai
export const analyzeQuiz = (quiz_id) => {
  return api.post(
    `/ai/analyze-quiz/${quiz_id}?model_name=azure`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
