// src/App.js
import React, { useState, useEffect } from "react";
import FileUploader from "./components/FileUploader";
import PreviewPanel from "./components/PreviewPanel";
import AuthPage from "./components/AuthPage";
import { previewAssignment, downloadAssignment } from "./services/api";
import { getUser, isLoggedIn, logout } from "./services/auth";
import PaymentModal from "./components/PaymentModal";
import "./App.css";

const LOADING_STAGES = [
  "Reading your assignment file...",
  "Sending to Hugging Face AI model...",
  "AI is writing your assignment (this may take 1-2 minutes)...",
  "Formatting and structuring the content...",
];

export default function App() {
  const [user, setUser]               = useState(null);
  const [file, setFile]               = useState(null);
  const [subjectName, setSubjectName] = useState("");
  const [outputFormat, setOutputFormat] = useState("auto");
  const [loading, setLoading]         = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [preview, setPreview]         = useState(null);
  const [error, setError]             = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");
  const [showPayment, setShowPayment] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (isLoggedIn()) setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setPreview(null);
    setFile(null);
  };

  const startLoadingCycle = () => {
    setLoadingStage(0);
    let stage = 0;
    const interval = setInterval(() => {
      stage = Math.min(stage + 1, LOADING_STAGES.length - 1);
      setLoadingStage(stage);
    }, 15000);
    return interval;
  };

  const getActualFormat = () => {
    if (outputFormat !== "auto") return outputFormat;
    if (!file) return "docx";
    return file.name.split(".").pop().toLowerCase() === "pdf" ? "pdf" : "docx";
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(""); setPreview(null); setSuccessMsg("");
    if (!file) return setError("Please upload your assignment file.");

    setLoading(true);
    const interval = startLoadingCycle();
    try {
      // Use logged-in user's name and enrollment automatically
      const data = await previewAssignment(file, user.full_name, user.enrollment_no, subjectName.trim());
      setPreview(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Show payment modal first
    setShowPayment(true);
  };

  const handlePaymentConfirmed = async () => {
    setShowPayment(false);
    setIsDownloading(true); setSuccessMsg("");
    const fmt = getActualFormat();
    try {
      const filename = await downloadAssignment(file, user.full_name, user.enrollment_no, fmt, subjectName.trim());
      setSuccessMsg(`✅ "${filename}" downloaded successfully!`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Download failed.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setFile(null); setSubjectName(""); setOutputFormat("auto");
    setPreview(null); setError(""); setSuccessMsg("");
  };

  // Show login/signup if not authenticated
  if (!user) return <AuthPage onAuth={(u) => setUser(u)} />;

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <div>
              <h1>AssignmentAI</h1>
              
            </div>
          </div>
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">👤 {user.full_name}</span>
              <span className="user-enroll">{user.enrollment_no}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="main">
        {/* LEFT FORM */}
        <section className="form-section">
          <div className="card">
            <h2 className="card-title"><span>📋</span> Generate Your Assignment</h2>
            <p className="card-subtitle">
              Upload your assignment questions and get a complete AI-written solution.
            </p>

            {/* Logged in user info box */}
            <div className="user-box">
              <div className="user-box-row"><span>Name:</span><strong>{user.full_name}</strong></div>
              <div className="user-box-row"><span>Enrollment:</span><strong>{user.enrollment_no}</strong></div>
            </div>

            <form onSubmit={handleGenerate} className="form">
              <div className="field">
                <label>Subject Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Network and Cyber Security (CSE900TR1)"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="field">
                <label>Upload Assignment File * (.docx / .doc / .pdf)</label>
                <FileUploader onFileSelect={setFile} selectedFile={file} />
              </div>

              <div className="field">
                <label>Output Format</label>
                <div className="format-selector">
                  {[
                    { value: "auto",  label: "🔄 Auto" },
                    { value: "pdf",   label: "📕 PDF" },
                    { value: "docx",  label: "📄 Word" },
                  ].map((opt) => (
                    <button key={opt.value} type="button"
                      className={`format-btn ${outputFormat === opt.value ? "format-btn-active" : ""}`}
                      onClick={() => setOutputFormat(opt.value)} disabled={loading}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error    && <div className="error-box">❌ {error}</div>}
              {successMsg && <div className="success-box">{successMsg}</div>}

              <button type="submit" className="submit-btn" disabled={loading || !file}>
                {loading ? "⏳ Generating..." : "🚀 Generate Assignment"}
              </button>

              {preview && (
                <button type="button" className="reset-btn" onClick={handleReset}>🔄 Start New</button>
              )}
            </form>
          </div>

          <div className="how-it-works">
            <h3>How It Works</h3>
            <div className="steps">
              {[
                "Login — your name & enrollment are set automatically",
                "Upload your assignment .docx or .pdf with questions",
                "Choose output format: PDF or Word",
                "AI writes complete answers with your details in header",
              ].map((text, i) => (
                <div className="step" key={i}>
                  <span className="step-num">{i + 1}</span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT PREVIEW */}
        <section className="preview-section">
          {loading ? (
            <div className="loading-card">
              <div className="spinner"></div>
              <h3>AI is writing your assignment</h3>
              <p className="loading-stage">{LOADING_STAGES[loadingStage]}</p>
              <p className="loading-note">Please wait while your assignment is being generated...</p>
              <div className="loading-bar"><div className="loading-bar-fill"></div></div>
            </div>
          ) : preview ? (
            <PreviewPanel
              studentName={preview.studentName}
              enrollment={preview.enrollment}
              content={preview.generatedContent}
              wordCount={preview.wordCount}
              outputFormat={getActualFormat()}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <h3>Your Assignment Preview</h3>
              <p>Upload your assignment file and click <strong>Generate Assignment</strong>.</p>
              
            </div>
          )}
        </section>
      </main>
      {showPayment && (
        <PaymentModal
          onConfirm={handlePaymentConfirmed}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}