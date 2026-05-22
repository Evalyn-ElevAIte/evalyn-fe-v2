import React, { useState } from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import { creatQuizWithQuestions } from "../services/quiz";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { FiZap, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  listMyDocuments,
  getDocumentStatus,
  generateQuestions,
} from "../services/document";

const initialQuestion = {
  question: "",
  type: "text",
  options: ["", "", "", ""],
  expectedAnswer: [],
  rubric: "",
  rubricMaxScore: 10,
};

// Map API draft to form question format
const draftToQuestion = (draft) => {
  const isChoice = draft.type === "MULTI_CHOICE" || draft.options?.length > 0;
  const type =
    !isChoice
      ? "text"
      : (draft.expected_answer ?? []).length === 1
      ? "single"
      : "multiple";

  return {
    question: draft.text ?? "",
    type,
    options:
      isChoice
        ? [...(draft.options ?? []), ...Array(Math.max(0, 4 - (draft.options?.length ?? 0))).fill("")]
        : ["", "", "", ""],
    expectedAnswer: isChoice ? (draft.expected_answer ?? []) : [],
    rubric: draft.rubric ?? "",
    rubricMaxScore: draft.rubric_max_score ?? 10,
  };
};

// ── Generate Questions Modal ──────────────────────────────────────────────────
const GenerateModal = ({ onClose, onAppend }) => {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [outcomes, setOutcomes] = useState([
    { outcome: "", questions_per_outcome: 2 },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");

  React.useEffect(() => {
    listMyDocuments()
      .then((res) => {
        if (res.status === 200) {
          setDocuments(res.data);
          const ready = res.data.find((d) => d.status === "ready");
          if (ready) setSelectedDocId(String(ready.id));
        }
      })
      .catch(() => setError("Could not load documents."))
      .finally(() => setLoadingDocs(false));
  }, []);

  const addOutcome = () =>
    setOutcomes((prev) => [
      ...prev,
      { outcome: "", questions_per_outcome: 2 },
    ]);

  const removeOutcome = (i) =>
    setOutcomes((prev) => prev.filter((_, idx) => idx !== i));

  const updateOutcome = (i, field, value) =>
    setOutcomes((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, [field]: value } : o))
    );

  const handleGenerate = async () => {
    setError("");
    if (!selectedDocId) {
      setError("Please select a document.");
      return;
    }
    if (outcomes.some((o) => !o.outcome.trim())) {
      setError("Please fill in all learning outcome fields.");
      return;
    }

    setIsGenerating(true);

    // Ensure document is ready before generating
    try {
      setStatusMsg("Checking document status…");
      const statusRes = await getDocumentStatus(Number(selectedDocId));
      if (statusRes.data.status === "processing") {
        setError(
          "Document is still processing. Please wait until it is ready."
        );
        setIsGenerating(false);
        setStatusMsg("");
        return;
      }
      if (statusRes.data.status === "failed") {
        setError(
          "Document ingestion failed. Please re-upload the document."
        );
        setIsGenerating(false);
        setStatusMsg("");
        return;
      }
    } catch {
      setError("Could not verify document status.");
      setIsGenerating(false);
      setStatusMsg("");
      return;
    }

    try {
      setStatusMsg("Generating questions…");
      const payload = outcomes.map((o) => ({
        outcome: o.outcome.trim(),
        questions_per_outcome: Number(o.questions_per_outcome) || 1,
      }));
      const res = await generateQuestions(Number(selectedDocId), payload);
      if (res.status === 200) {
        const newQuestions = (res.data.drafts ?? []).map(draftToQuestion);
        if (newQuestions.length === 0) {
          setError("No questions were generated. Try different outcomes.");
          return;
        }
        onAppend(newQuestions);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.detail ?? "Generation failed.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsGenerating(false);
      setStatusMsg("");
    }
  };

  const readyDocs = documents.filter((d) => d.status === "ready");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <FiX size={20} />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Generate Questions from Document
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Select a ready document, define learning outcomes, and AI will draft
          questions for you.
        </p>

        {/* Document selector */}
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Document
        </label>
        {loadingDocs ? (
          <p className="text-sm text-gray-400 mb-4">Loading documents…</p>
        ) : readyDocs.length === 0 ? (
          <p className="text-sm text-red-500 mb-4">
            No ready documents found. Upload a PDF in{" "}
            <a href="/documents" className="underline text-blue-600">
              My Documents
            </a>{" "}
            first.
          </p>
        ) : (
          <select
            className="w-full mb-5 px-3 py-2 border border-gray-200 rounded-xl text-sm"
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
          >
            <option value="">— Select a document —</option>
            {readyDocs.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.filename}
              </option>
            ))}
          </select>
        )}

        {/* Outcomes */}
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Learning Outcomes
        </label>
        <div className="space-y-3 mb-4">
          {outcomes.map((o, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  placeholder={`e.g. Define greenhouse gases`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={o.outcome}
                  onChange={(e) => updateOutcome(i, "outcome", e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Questions:</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                    value={o.questions_per_outcome}
                    onChange={(e) =>
                      updateOutcome(i, "questions_per_outcome", e.target.value)
                    }
                  />
                </div>
              </div>
              {outcomes.length > 1 && (
                <button
                  onClick={() => removeOutcome(i)}
                  className="mt-2 text-red-400 hover:text-red-600 cursor-pointer"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {outcomes.length < 20 && (
          <button
            onClick={addOutcome}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-5 cursor-pointer"
          >
            <FiPlus size={14} /> Add outcome
          </button>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        {statusMsg && (
          <p className="text-blue-500 text-sm mb-4">{statusMsg}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || readyDocs.length === 0}
            className="px-4 py-2 rounded-xl bg-blue text-white text-sm flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
          >
            <FiZap size={14} />
            {isGenerating ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const CreateQuiz = () => {
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState([initialQuestion]);
  const [overallNotes, setOverallNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "type") {
      updated[index].type = value;
      updated[index].expectedAnswer = [];
      updated[index].options = ["", "", "", ""];
    } else {
      updated[index][field] = value;
    }
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    const oldOption = updated[qIndex].options[optIndex];
    updated[qIndex].options[optIndex] = value;
    if (
      updated[qIndex].expectedAnswer.includes(oldOption) &&
      value.trim() !== oldOption
    ) {
      updated[qIndex].expectedAnswer = updated[qIndex].expectedAnswer.filter(
        (ans) => ans !== oldOption
      );
    }
    setQuestions(updated);
  };

  const toggleExpectedAnswer = (qIndex, optionValue) => {
    const updated = [...questions];
    const isSelected = updated[qIndex].expectedAnswer.includes(optionValue);
    updated[qIndex].expectedAnswer = isSelected
      ? updated[qIndex].expectedAnswer.filter((a) => a !== optionValue)
      : [...updated[qIndex].expectedAnswer, optionValue];
    setQuestions(updated);
  };

  const setSingleExpectedAnswer = (qIndex, optionValue) => {
    const updated = [...questions];
    updated[qIndex].expectedAnswer = [optionValue];
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...initialQuestion, options: ["", "", "", ""], expectedAnswer: [] }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const appendGeneratedQuestions = (newQuestions) => {
    setQuestions((prev) => [...prev, ...newQuestions]);
  };

  const validateQuiz = () => {
    if (!quizTitle.trim() || !dueDate || !dueTime || !duration) {
      alert("Please fill in all required quiz fields.");
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Please fill in question ${i + 1}.`);
        return false;
      }
      if (q.type !== "text" && q.options.some((opt) => !opt.trim())) {
        alert(`Please complete all options in question ${i + 1}.`);
        return false;
      }
      if (
        (q.type === "text" &&
          (!q.expectedAnswer || q.expectedAnswer.trim() === "")) ||
        ((q.type === "single" || q.type === "multiple") &&
          (!Array.isArray(q.expectedAnswer) || q.expectedAnswer.length === 0))
      ) {
        alert(`Please fill the expected answer for question ${i + 1}.`);
        return false;
      }
      if (!q.rubric.trim()) {
        alert(`Please fill in the rubric for question ${i + 1}.`);
        return false;
      }
      if (!q.rubricMaxScore || q.rubricMaxScore <= 0) {
        alert(`Please set a valid max score for question ${i + 1}.`);
        return false;
      }
    }
    return true;
  };

  const saveQuiz = async () => {
    setIsLoading(true);
    const end_time = new Date(`${dueDate}T${dueTime}`).toISOString();
    const start_time = new Date().toISOString();

    const transformedQuestions = questions.map((q) => ({
      text: q.question,
      type:
        q.type === "text"
          ? "text"
          : q.type === "single"
          ? "single_choice"
          : "multi_choice",
      options:
        q.type === "text" ? [] : q.options.filter((opt) => opt.trim() !== ""),
      expected_answer:
        q.type === "text" ? [q.expectedAnswer || ""] : q.expectedAnswer,
      rubric: q.rubric,
      rubric_max_score: q.rubricMaxScore,
    }));

    const payload = {
      title: quizTitle,
      description: description,
      start_time: start_time,
      end_time: end_time,
      duration: parseInt(duration),
      questions: transformedQuestions,
      completed: false,
      lecturer_overall_notes: overallNotes,
    };
    try {
      const createResponse = await creatQuizWithQuestions(payload);
      if (createResponse.status == 200) {
        const quiz_id = createResponse.data.quiz_id;
        navigate(`/success-create/${quiz_id}`);
      }
    } catch (error) {
      console.log("error :", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      {showGenerateModal && (
        <GenerateModal
          onClose={() => setShowGenerateModal(false)}
          onAppend={appendGeneratedQuestions}
        />
      )}

      <div className="mx-auto">
        <div className="bg-blue-50 px-6 py-12 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Quiz
          </h2>
          <p className="text-sm text-gray-600">
            Fill in the details below to design your quiz. AI will assist in
            evaluating student responses later.
          </p>
        </div>

        <div className="mx-32 mt-8 px-12 py-8 rounded-4xl shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">Quiz Title</h2>
            <div className="relative group">
              <AiOutlineQuestionCircle
                className="text-gray-500 cursor-pointer"
                data-tooltip-id="quiz-title-tip"
              />
              <Tooltip
                id="quiz-title-tip"
                place="right"
                content="This is the name of your quiz shown to students."
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="e.g. Introduction to Philosophy Quiz"
            className="w-full mb-4 px-4 py-2 border border-gray-200 rounded-xl"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />

          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">Description (optional)</h2>
            <div className="relative group">
              <AiOutlineQuestionCircle
                className="text-gray-500 cursor-pointer"
                data-tooltip-id="quiz-description-tip"
              />
              <Tooltip
                id="quiz-description-tip"
                place="right"
                content="You can explained the details of the quiz"
              />
            </div>
          </div>
          <textarea
            placeholder="Write a short description about this quiz..."
            className="w-full mb-3 px-4 py-2 border border-gray-200 rounded-xl"
            value={description}
            onChange={(e) => {
              const input = e.target.value;
              const words = input.trim().split(/\s+/);
              if (words.length <= 200) {
                setDescription(input);
              } else {
                setDescription(words.slice(0, 200).join(" "));
              }
            }}
          />

          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">Focus Point Quiz</h2>
            <div className="relative group">
              <AiOutlineQuestionCircle
                className="text-gray-500 cursor-pointer"
                data-tooltip-id="quiz-focus-tip"
              />
              <Tooltip
                id="quiz-focus-tip"
                place="right"
                content={`You can add the focus point that will analyze by AI\n Example: Participants can explain their answers in detail using concise and fundamental language.`}
              />
            </div>
          </div>
          <textarea
            placeholder="Write a short description the focus point."
            className="w-full mb-3 px-4 py-2 border border-gray-200 rounded-xl"
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          {/* Questions header with generate button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue text-blue text-sm hover:bg-blue-50 transition cursor-pointer"
            >
              <FiZap size={14} />
              Generate from Document
            </button>
          </div>

          {questions.map((q, index) => (
            <div
              key={index}
              className="bg-blue-50 border rounded-4xl border-orange-200 p-8 mb-6"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Question
              </label>
              <input
                type="text"
                placeholder="Write your question here..."
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-xl"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(index, "question", e.target.value)
                }
              />

              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Answer Type
              </label>
              <select
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-xl"
                value={q.type}
                onChange={(e) =>
                  handleQuestionChange(index, "type", e.target.value)
                }
              >
                <option value="text">Text</option>
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
              </select>

              {(q.type === "single" || q.type === "multiple") && (
                <div className="space-y-2 mb-3">
                  <label className="block font-semibold text-sm text-gray-700 mb-1">
                    Answer Options
                  </label>
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type={q.type === "single" ? "radio" : "checkbox"}
                        name={`expected-${index}`}
                        className="accent-blue-600"
                        checked={q.expectedAnswer.includes(opt)}
                        onChange={() =>
                          q.type === "single"
                            ? setSingleExpectedAnswer(index, opt)
                            : toggleExpectedAnswer(index, opt)
                        }
                      />
                      <input
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        className="w-full px-3 py-2 border rounded"
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(index, i, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {q.type === "text" && (
                <>
                  <label className="block font-semibold text-sm text-gray-700 mb-1">
                    Example Answer (optional)
                  </label>
                  <textarea
                    placeholder="Expected answer(s), paragraph supported"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl overflow-hidden resize-none"
                    value={q.expectedAnswer || ""}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                      handleQuestionChange(index, "expectedAnswer", e.target.value);
                    }}
                  />
                </>
              )}

              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Focus Point
              </label>
              <textarea
                placeholder="Rubric for this question..."
                className="w-full mb-3 px-3 py-2 border rounded"
                value={q.rubric}
                onChange={(e) =>
                  handleQuestionChange(index, "rubric", e.target.value)
                }
              />

              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Max Score
              </label>
              <input
                type="number"
                min="1"
                placeholder="Maximum score for this question"
                className="w-full mb-3 px-3 py-2 border rounded"
                value={q.rubricMaxScore}
                onChange={(e) =>
                  handleQuestionChange(index, "rubricMaxScore", parseInt(e.target.value))
                }
              />

              <div className="text-right mt-3">
                <button
                  onClick={() => removeQuestion(index)}
                  className="text-red-500 text-sm hover:underline cursor-pointer"
                >
                  Remove Question
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="text-blue cursor-pointer border border-blue px-4 py-2 rounded mb-6 hover:bg-blue-50"
          >
            + Add Question
          </button>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                if (validateQuiz()) {
                  saveQuiz();
                }
              }}
              className="px-4 py-2 rounded bg-blue text-white hover:bg-blue-600 cursor-pointer"
            >
              Publish Quiz
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateQuiz;
