import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiTrash2, FiFile, FiRefreshCw } from "react-icons/fi";
import {
  uploadDocument,
  listMyDocuments,
  deleteDocument,
  getDocumentStatus,
} from "../services/document";

const StatusBadge = ({ status }) => {
  const styles = {
    processing: "bg-yellow-100 text-yellow-800",
    ready: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
};

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const res = await listMyDocuments();
      if (res.status === 200) setDocuments(res.data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Poll status for any documents still processing
  useEffect(() => {
    const processingDocs = documents.filter((d) => d.status === "processing");
    if (processingDocs.length === 0) {
      clearInterval(pollingRef.current);
      return;
    }

    clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      const updates = await Promise.all(
        processingDocs.map((d) =>
          getDocumentStatus(d.id).then((r) => ({ id: d.id, ...r.data })).catch(() => null)
        )
      );
      setDocuments((prev) =>
        prev.map((doc) => {
          const update = updates.find((u) => u && u.id === doc.id);
          if (!update) return doc;
          return { ...doc, status: update.status, num_chunks: update.num_chunks, error_message: update.error_message };
        })
      );
    }, 3000);

    return () => clearInterval(pollingRef.current);
  }, [documents]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    setUploadError("");

    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File must be under 50 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadDocument(file);
      if (res.status === 200) {
        setDocuments((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      const msg = err.response?.data?.detail ?? "Upload failed.";
      setUploadError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (doc.status === "processing") {
      alert("Cannot delete a document while it is still processing.");
      return;
    }
    if (!confirm(`Delete "${doc.filename}"? This cannot be undone.`)) return;

    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      const msg = err.response?.data?.detail ?? "Delete failed.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto">
      <div className="bg-blue-50 px-6 py-12 rounded-t-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Documents</h2>
        <p className="text-sm text-gray-600">
          Upload PDF files here. Once ready, use them to generate quiz questions
          automatically in the Create Quiz page.
        </p>
      </div>

      <div className="mx-32 mt-8 px-12 py-8 rounded-4xl shadow-xl">
        {/* Upload area */}
        <div
          className="border-2 border-dashed border-blue-300 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:bg-blue-50 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <FiUpload size={32} className="text-blue-400" />
          <p className="text-gray-600 text-sm">
            {isUploading ? "Uploading…" : "Click to upload a PDF (max 50 MB)"}
          </p>
          {uploadError && (
            <p className="text-red-500 text-xs">{uploadError}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </div>

        {/* Document list */}
        <div className="mt-8 space-y-3">
          {documents.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">
              No documents yet. Upload a PDF to get started.
            </p>
          )}

          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-blue-50 border border-orange-100 rounded-2xl px-6 py-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FiFile size={20} className="text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate max-w-[400px]">
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <StatusBadge status={doc.status} />
                    {doc.status === "processing" && (
                      <FiRefreshCw
                        size={12}
                        className="text-yellow-600 animate-spin"
                      />
                    )}
                    {doc.num_chunks > 0 && (
                      <span className="text-xs text-gray-400">
                        {doc.num_chunks} chunks
                      </span>
                    )}
                    {doc.error_message && (
                      <span className="text-xs text-red-500 truncate max-w-[300px]">
                        {doc.error_message}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(doc)}
                disabled={deletingId === doc.id}
                className="text-red-400 hover:text-red-600 transition cursor-pointer disabled:opacity-40"
                title="Delete document"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
