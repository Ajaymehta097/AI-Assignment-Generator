// routes/assignment.js

const express = require("express");
const multer = require("multer");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const { generateAssignment } = require("../services/huggingface");
const { generateDocx } = require("../services/docxGenerator");
const { generatePdf } = require("../services/pdfGenerator");

const router = express.Router();

// ─── MULTER: Store uploaded file in memory ────────────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Use ONLY extension — browser mimetypes differ across OS/browser
    const ext = file.originalname.split(".").pop().toLowerCase();
    const allowed = ["docx", "doc", "pdf"];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .docx, .doc, and .pdf files are allowed"), false);
    }
  },
});

// ─── HELPER: Extract text from uploaded file ──────────────────────────────────
async function extractText(file) {
  const ext = file.originalname.split(".").pop().toLowerCase();
  if (ext === "pdf") {
    const data = await pdfParse(file.buffer);
    return data.text.trim();
  } else {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value.trim();
  }
}

// ─── HELPER: Resolve output format ────────────────────────────────────────────
function resolveOutputFormat(file, requestedFormat) {
  if (requestedFormat === "pdf" || requestedFormat === "docx") return requestedFormat;
  const ext = file.originalname.split(".").pop().toLowerCase();
  return ext === "pdf" ? "pdf" : "docx";
}

// ─── POST /api/preview ────────────────────────────────────────────────────────
router.post("/preview", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded." });

    const studentName = (req.body.studentName || "").trim();
    const enrollment  = (req.body.enrollment  || "").trim();

    if (!studentName) return res.status(400).json({ success: false, error: "Student name is required." });
    if (!enrollment)  return res.status(400).json({ success: false, error: "Enrollment number is required." });

    const assignmentText = await extractText(req.file);
    if (!assignmentText || assignmentText.length < 10) {
      return res.status(400).json({ success: false, error: "File appears empty or has no readable text." });
    }

    console.log(`[Preview] ${studentName} (${enrollment}) — ${assignmentText.length} chars`);

    const subjectName = (req.body.subjectName || "").trim();
    const generatedContent = await generateAssignment(assignmentText, studentName, enrollment);

    return res.json({
      success: true,
      studentName,
      enrollment,
      subjectName,
      generatedContent,
      wordCount: generatedContent.split(/\s+/).length,
      inputFormat: req.file.originalname.split(".").pop().toLowerCase(),
    });
  } catch (err) {
    console.error("[Preview] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/generate ───────────────────────────────────────────────────────
router.post("/generate", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded." });

    const studentName     = (req.body.studentName   || "").trim();
    const enrollment      = (req.body.enrollment    || "").trim();
    const requestedFormat = (req.body.outputFormat  || "").trim().toLowerCase();

    if (!studentName) return res.status(400).json({ success: false, error: "Student name is required." });
    if (!enrollment)  return res.status(400).json({ success: false, error: "Enrollment number is required." });

    const assignmentText = await extractText(req.file);
    if (!assignmentText || assignmentText.length < 10) {
      return res.status(400).json({ success: false, error: "File appears empty or has no readable text." });
    }

    console.log(`[Generate] ${studentName} (${enrollment})`);

    const subjectName = (req.body.subjectName || "").trim();
    const generatedContent = await generateAssignment(assignmentText, studentName, enrollment);
    const outputFormat = resolveOutputFormat(req.file, requestedFormat);
    const safeName = studentName.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    if (outputFormat === "pdf") {
      const pdfBuffer = await generatePdf(studentName, enrollment, generatedContent, subjectName);
      const filename  = `assignment_${safeName}_${enrollment}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(pdfBuffer);
    } else {
      const docxBuffer = await generateDocx(studentName, enrollment, generatedContent, subjectName);
      const filename   = `assignment_${safeName}_${enrollment}.docx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(docxBuffer);
    }
  } catch (err) {
    console.error("[Generate] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;