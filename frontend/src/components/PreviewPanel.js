// src/components/PreviewPanel.js

import React from "react";
import styles from "./PreviewPanel.module.css";

export default function PreviewPanel({ studentName, enrollment, content, wordCount, outputFormat, onDownload, isDownloading }) {
  const renderContent = () => {
    return content.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={idx} />;

      if (trimmed.startsWith("# "))  return <h2 key={idx} className={styles.h1}>{trimmed.slice(2)}</h2>;
      if (trimmed.startsWith("## ")) return <h3 key={idx} className={styles.h2}>{trimmed.slice(3)}</h3>;
      if (trimmed.startsWith("### ")) return <h4 key={idx} className={styles.h3}>{trimmed.slice(4)}</h4>;

      if (/^(Q\d+[\.\:]|Question\s+\d+[\.\:]|\d+[\.\)])/i.test(trimmed)) {
        return <p key={idx} className={styles.questionHeader}>{trimmed}</p>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <li key={idx} className={styles.bullet}>{trimmed.slice(2)}</li>;
      }
      return <p key={idx} className={styles.para}>{trimmed}</p>;
    });
  };

  const downloadLabel = outputFormat === "pdf" ? "⬇️ Download PDF" : "⬇️ Download .docx";
  const formatBadge   = outputFormat === "pdf" ? "📕 PDF" : "📄 DOCX";
  const badgeClass    = outputFormat === "pdf" ? styles.badgePdf : styles.badgeDocx;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.docHeader}>
        <div className={styles.headerTitle}>ASSIGNMENT SUBMISSION</div>
        <div className={styles.headerInfo}>
          <span><strong>Student:</strong> {studentName}</span>
          <span className={styles.divider}>|</span>
          <span><strong>Enrollment No:</strong> {enrollment}</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className={styles.statsBar}>
        <div className={styles.statsLeft}>
          <span>📝 ~{wordCount?.toLocaleString()} words</span>
          <span className={`${styles.fmtBadge} ${badgeClass}`}>{formatBadge}</span>
        </div>
        <button
          className={`${styles.downloadBtn} ${outputFormat === "pdf" ? styles.downloadBtnPdf : ""}`}
          onClick={onDownload}
          disabled={isDownloading}
        >
          {isDownloading ? "⏳ Preparing..." : downloadLabel}
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.docTitle}>ASSIGNMENT</h1>
        <hr className={styles.dividerLine} />
        {renderContent()}
      </div>
    </div>
  );
}
