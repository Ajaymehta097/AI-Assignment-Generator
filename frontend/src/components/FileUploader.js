// src/components/FileUploader.js

import React, { useRef, useState } from "react";
import styles from "./FileUploader.module.css";

export default function FileUploader({ onFileSelect, selectedFile }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const getFileIcon = (file) => {
    if (!file) return "☁️";
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "pdf") return "📕";
    return "📄";
  };

  return (
    <div
      className={`${styles.dropzone} ${dragOver ? styles.dragOver : ""} ${selectedFile ? styles.hasFile : ""}`}
      onClick={() => inputRef.current.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx,.doc,.pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {selectedFile ? (
        <div className={styles.fileInfo}>
          <span className={styles.fileIcon}>{getFileIcon(selectedFile)}</span>
          <div>
            <p className={styles.fileName}>{selectedFile.name}</p>
            <p className={styles.fileSize}>
              {(selectedFile.size / 1024).toFixed(1)} KB · Click to change
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.uploadIcon}>☁️</span>
          <p className={styles.uploadText}>Drag & drop your assignment file here</p>
          <p className={styles.uploadSub}>or click to browse · Supports .docx, .doc, .pdf</p>
        </div>
      )}
    </div>
  );
}
