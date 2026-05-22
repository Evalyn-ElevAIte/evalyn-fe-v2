import api from "./api";

export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/document/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getDocumentStatus = (documentId) =>
  api.get(`/document/${documentId}/status`);

export const listMyDocuments = () => api.get("/document/my-documents");

export const getDocument = (documentId) =>
  api.get(`/document/${documentId}`);

export const deleteDocument = (documentId) =>
  api.delete(`/document/${documentId}`);

export const generateQuestions = (documentId, outcomes) =>
  api.post(`/document/${documentId}/generate-questions`, { outcomes });
