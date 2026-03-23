// src/services/api.js

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Preview the generated assignment (returns JSON text)
 */
export async function previewAssignment(file, studentName, enrollment, subjectName = "") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("studentName", studentName);
  formData.append("enrollment", enrollment);
  formData.append("subjectName", subjectName);

  const response = await axios.post(`${BASE_URL}/preview`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });

  if (!response.data.success) throw new Error(response.data.error || "Preview failed");
  return response.data;
}

/**
 * Generate and download the completed assignment as PDF or DOCX
 * @param {File} file
 * @param {string} studentName
 * @param {string} enrollment
 * @param {string} outputFormat - "pdf" or "docx"
 */
export async function downloadAssignment(file, studentName, enrollment, outputFormat, subjectName = "") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("studentName", studentName);
  formData.append("enrollment", enrollment);
  formData.append("outputFormat", outputFormat);
  formData.append("subjectName", subjectName); // "pdf" or "docx"

  const response = await axios.post(`${BASE_URL}/generate`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob",
    timeout: 180000,
  });

  const isPdf = outputFormat === "pdf";
  const mimeType = isPdf
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const blob = new Blob([response.data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const safeName = studentName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `assignment_${safeName}_${enrollment}.${outputFormat}`;

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);

  return filename;
}