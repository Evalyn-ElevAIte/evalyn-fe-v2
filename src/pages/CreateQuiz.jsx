import React, { useState } from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import { creatQuizWithQuestions } from "../services/quiz";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { FiZap, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { ChevronDown, ChevronUp, Sparkles, PlusCircle } from "lucide-react";
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

const draftToQuestion = (draft) => {
  const isChoice = draft.type === "multi_choice" || draft.type === "MULTI_CHOICE" || (draft.options != null && draft.options.length > 0);
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
    expectedAnswer: isChoice ? (draft.expected_answer ?? []) : (draft.expected_answer ?? []).join("\n"),
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
    { outcome: "", mcq_count: 2, essay_count: 0 },
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
    setOutcomes((prev) => [...prev, { outcome: "", mcq_count: 2, essay_count: 0 }]);

  const removeOutcome = (i) =>
    setOutcomes((prev) => prev.filter((_, idx) => idx !== i));

  const updateOutcome = (i, field, value) =>
    setOutcomes((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, [field]: value } : o))
    );

  const handleGenerate = async () => {
    setError("");
    if (!selectedDocId) { setError("Please select a document."); return; }
    if (outcomes.some((o) => !o.outcome.trim())) {
      setError("Please fill in all learning outcome fields."); return;
    }
    if (outcomes.some((o) => (Number(o.mcq_count) || 0) === 0 && (Number(o.essay_count) || 0) === 0)) {
      setError("Each outcome must have at least one MCQ or essay question."); return;
    }
    setIsGenerating(true);
    try {
      setStatusMsg("Checking document status…");
      const statusRes = await getDocumentStatus(Number(selectedDocId));
      if (statusRes.data.status === "processing") {
        setError("Document is still processing. Please wait until it is ready.");
        return;
      }
      if (statusRes.data.status === "failed") {
        setError("Document ingestion failed. Please re-upload the document.");
        return;
      }
    } catch {
      setError("Could not verify document status."); return;
    } finally {
      if (error) { setIsGenerating(false); setStatusMsg(""); return; }
    }
    try {
      setStatusMsg("Generating questions…");
      const payload = outcomes.map((o) => ({
        outcome: o.outcome.trim(),
        mcq_count: Number(o.mcq_count) || 0,
        essay_count: Number(o.essay_count) || 0,
      }));
      const res = await generateQuestions(Number(selectedDocId), payload);
      if (res.status === 200) {
        const newQuestions = (res.data.drafts ?? []).map(draftToQuestion);
        if (newQuestions.length === 0) {
          setError("No questions were generated. Try different outcomes."); return;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer">
          <FiX size={20} />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Sparkles size={18} className="text-blue" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">AI Question Generator</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 ml-13">
          Select a document, define learning outcomes, and AI will draft questions for you.
        </p>

        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Document</label>
        {loadingDocs ? (
          <p className="text-sm text-gray-400 mb-4">Loading documents…</p>
        ) : readyDocs.length === 0 ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-600">
              No ready documents found. Upload a PDF in{" "}
              <a href="/documents" className="underline font-medium">My Documents</a> first.
            </p>
          </div>
        ) : (
          <select
            className="w-full mb-5 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30"
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
          >
            <option value="">— Select a document —</option>
            {readyDocs.map((d) => (
              <option key={d.id} value={String(d.id)}>{d.filename}</option>
            ))}
          </select>
        )}

        <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Outcomes</label>
        <div className="space-y-3 mb-4">
          {outcomes.map((o, i) => (
            <div key={i} className="flex gap-2 items-start bg-gray-50 rounded-xl p-3">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="e.g. Define greenhouse gases"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue/30"
                  value={o.outcome}
                  onChange={(e) => updateOutcome(i, "outcome", e.target.value)}
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Multiple Choice:</span>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      className="w-12 px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue/30"
                      value={o.mcq_count}
                      onChange={(e) => updateOutcome(i, "mcq_count", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Essay:</span>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      className="w-12 px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue/30"
                      value={o.essay_count}
                      onChange={(e) => updateOutcome(i, "essay_count", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {outcomes.length > 1 && (
                <button onClick={() => removeOutcome(i)} className="mt-2 text-red-400 hover:text-red-600 cursor-pointer">
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {outcomes.length < 20 && (
          <button onClick={addOutcome} className="text-sm text-blue hover:text-blue-700 flex items-center gap-1 mb-5 cursor-pointer font-medium">
            <FiPlus size={14} /> Add outcome
          </button>
        )}

        {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4"><p className="text-red-600 text-sm">{error}</p></div>}
        {statusMsg && <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4"><p className="text-blue text-sm">{statusMsg}</p></div>}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-medium">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || readyDocs.length === 0}
            className="px-4 py-2.5 rounded-xl bg-blue text-white text-sm flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50 cursor-pointer font-medium transition-colors"
          >
            <FiZap size={14} />
            {isGenerating ? "Generating…" : "Generate Questions"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Question Card ─────────────────────────────────────────────────────────────
const QuestionCard = ({ q, index, onRemove, onChange, onOptionChange, onToggleExpected, onSetSingleExpected }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-4">
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue text-xs font-bold">
            {index + 1}
          </div>
          <span className="text-sm font-medium text-gray-700 line-clamp-1 max-w-xs">
            {q.question || `Question ${index + 1}`}
          </span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
            {q.type === "single" ? "Single Choice" : q.type === "multiple" ? "Multiple Choice" : "Text"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(index); }}
            className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <FiTrash2 size={14} />
          </button>
          {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
        </div>
      </div>

      {!collapsed && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Question text */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Question</label>
            <input
              type="text"
              placeholder="Write your question here..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/40 focus:bg-white transition"
              value={q.question}
              onChange={(e) => onChange(index, "question", e.target.value)}
            />
          </div>

          {/* Answer type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Answer Type</label>
            <select
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition"
              value={q.type}
              onChange={(e) => onChange(index, "type", e.target.value)}
            >
              <option value="text">Text (free response)</option>
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
          </div>

          {/* Choice options */}
          {(q.type === "single" || q.type === "multiple") && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Answer Options <span className="normal-case text-gray-400 font-normal">(check the correct answer)</span>
              </label>
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type={q.type === "single" ? "radio" : "checkbox"}
                      name={`expected-${index}`}
                      className="accent-blue w-4 h-4 flex-shrink-0"
                      checked={q.expectedAnswer.includes(opt)}
                      onChange={() =>
                        q.type === "single"
                          ? onSetSingleExpected(index, opt)
                          : onToggleExpected(index, opt)
                      }
                    />
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition"
                      value={opt}
                      onChange={(e) => onOptionChange(index, i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text expected answer */}
          {q.type === "text" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Example Answer</label>
              <textarea
                placeholder="Expected answer(s) — paragraph supported"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition overflow-hidden resize-none"
                value={q.expectedAnswer || ""}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  onChange(index, "expectedAnswer", e.target.value);
                }}
              />
            </div>
          )}

          {/* Rubric & Max score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Focus Point / Rubric</label>
              <textarea
                placeholder="Grading rubric for this question..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition resize-none"
                rows={2}
                value={q.rubric}
                onChange={(e) => onChange(index, "rubric", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Max Score</label>
              <input
                type="number"
                min="1"
                placeholder="10"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition"
                value={q.rubricMaxScore}
                onChange={(e) => onChange(index, "rubricMaxScore", parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
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
    if (updated[qIndex].expectedAnswer.includes(oldOption) && value.trim() !== oldOption) {
      updated[qIndex].expectedAnswer = updated[qIndex].expectedAnswer.filter((ans) => ans !== oldOption);
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
      if (!q.question.trim()) { alert(`Please fill in question ${i + 1}.`); return false; }
      if (q.type !== "text" && q.options.some((opt) => !opt.trim())) {
        alert(`Please complete all options in question ${i + 1}.`); return false;
      }
      if (
        (q.type === "text" && (!q.expectedAnswer || q.expectedAnswer.trim() === "")) ||
        ((q.type === "single" || q.type === "multiple") && (!Array.isArray(q.expectedAnswer) || q.expectedAnswer.length === 0))
      ) {
        alert(`Please fill the expected answer for question ${i + 1}.`); return false;
      }
      if (!q.rubric.trim()) { alert(`Please fill in the rubric for question ${i + 1}.`); return false; }
      if (!q.rubricMaxScore || q.rubricMaxScore <= 0) {
        alert(`Please set a valid max score for question ${i + 1}.`); return false;
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
      type: q.type === "text" ? "text" : q.type === "single" ? "single_choice" : "multi_choice",
      options: q.type === "text" ? [] : q.options.filter((opt) => opt.trim() !== ""),
      expected_answer: q.type === "text" ? [q.expectedAnswer || ""] : q.expectedAnswer,
      rubric: q.rubric,
      rubric_max_score: q.rubricMaxScore,
    }));

    const payload = {
      title: quizTitle,
      description,
      start_time,
      end_time,
      duration: parseInt(duration),
      questions: transformedQuestions,
      completed: false,
      lecturer_overall_notes: overallNotes,
    };
    try {
      const createResponse = await creatQuizWithQuestions(payload);
      if (createResponse.status == 200) {
        navigate(`/success-create/${createResponse.data.quiz_id}`);
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

      <div className="min-h-screen bg-white">
        <div className="h-1 w-full bg-gradient-to-r from-blue via-blue/60 to-orange" />

        <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-10 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">New</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Create a Quiz</h1>
          <p className="text-sm text-gray-400 mb-8">
            Fill in the details below. AI will assist in evaluating student responses.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-8">
          {/* Quiz details card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
              Quiz Details
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Quiz Title</label>
                  <AiOutlineQuestionCircle className="text-gray-400 cursor-pointer" data-tooltip-id="quiz-title-tip" size={14} />
                  <Tooltip id="quiz-title-tip" place="right" content="This is the name of your quiz shown to students." />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Philosophy Quiz"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                  <AiOutlineQuestionCircle className="text-gray-400 cursor-pointer" data-tooltip-id="quiz-description-tip" size={14} />
                  <Tooltip id="quiz-description-tip" place="right" content="A short description shown to students before they start." />
                </div>
                <textarea
                  placeholder="Write a short description about this quiz..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition resize-none"
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/);
                    if (words.length <= 200) setDescription(e.target.value);
                    else setDescription(words.slice(0, 200).join(" "));
                  }}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {description.trim().split(/\s+/).filter(Boolean).length}/200 words
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Focus Point</label>
                  <AiOutlineQuestionCircle className="text-gray-400 cursor-pointer" data-tooltip-id="quiz-focus-tip" size={14} />
                  <Tooltip id="quiz-focus-tip" place="right" content="Key areas AI will focus on when evaluating student answers." />
                </div>
                <textarea
                  placeholder="e.g. Participants can explain their answers using concise and fundamental language."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition resize-none"
                  rows={2}
                  value={overallNotes}
                  onChange={(e) => setOverallNotes(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Time</label>
                  <input
                    type="time"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 60"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:bg-white transition"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-800">Questions</h3>
                <span className="text-xs bg-blue-50 text-blue px-2 py-0.5 rounded-full font-medium">
                  {questions.length}
                </span>
              </div>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue text-blue text-sm hover:bg-blue-50 transition cursor-pointer font-medium"
              >
                <FiZap size={14} />
                Generate with AI
              </button>
            </div>

            {questions.map((q, index) => (
              <QuestionCard
                key={index}
                q={q}
                index={index}
                onRemove={removeQuestion}
                onChange={handleQuestionChange}
                onOptionChange={handleOptionChange}
                onToggleExpected={toggleExpectedAnswer}
                onSetSingleExpected={setSingleExpectedAnswer}
              />
            ))}

            <button
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue hover:text-blue hover:bg-blue-50 transition cursor-pointer font-medium mt-2"
            >
              <PlusCircle size={16} /> Add Question
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (validateQuiz()) saveQuiz(); }}
              className="px-6 py-2.5 rounded-xl bg-blue text-white text-sm font-medium hover:bg-blue-600 cursor-pointer transition shadow-sm"
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
