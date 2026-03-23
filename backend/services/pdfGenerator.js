// services/pdfGenerator.js
const PDFDocument = require("pdfkit");

async function generatePdf(studentName, enrollmentNumber, generatedContent, subjectName) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    const MARGIN        = 72;
    const HEADER_H      = 35;
    const TOP_MARGIN    = HEADER_H + 100; // tight but clear gap below header line
    const BOTTOM_MARGIN = 50;

    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: TOP_MARGIN, bottom: BOTTOM_MARGIN, left: MARGIN, right: MARGIN },
      bufferPages: true,
      autoFirstPage: false,
      info: { Title: "Assignment", Author: studentName },
    });

    doc.on("data",  (c) => chunks.push(c));
    doc.on("end",   ()  => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const contentWidth = () => doc.page.width - MARGIN * 2;

    // ── HEADER ────────────────────────────────────────────────────────────────
    const drawHeader = () => {
      const W = doc.page.width;
      doc.save();

      doc
        .font("Times-Roman").fontSize(10).fillColor("black")
        .text(studentName, MARGIN, 14, { width: (W - MARGIN * 2) / 2, lineBreak: false });

      doc
        .font("Times-Roman").fontSize(10).fillColor("black")
        .text(enrollmentNumber, MARGIN, 14, { width: W - MARGIN * 2, align: "right", lineBreak: false });



      doc.restore();
    };

    // ── FIRST PAGE ────────────────────────────────────────────────────────────
    doc.addPage();
    drawHeader();
    doc.on("pageAdded", drawHeader);

    // ── TITLE ─────────────────────────────────────────────────────────────────
    doc
      .font("Times-Bold").fontSize(20).fillColor("black")
      .text("Assignment", { align: "center" });

    if (subjectName) {
      doc.moveDown(0.3)
        .font("Times-Roman").fontSize(13).fillColor("black")
        .text(subjectName, { align: "center" });
    }

    doc.moveDown(0.8);

    // ── CLEAN LINES — max 1 consecutive blank line ────────────────────────────
    const rawLines = generatedContent.split("\n");
    const lines = [];
    let blankCount = 0;
    for (const line of rawLines) {
      if (!line.trim()) {
        blankCount++;
        if (blankCount <= 1) lines.push(line);
      } else {
        blankCount = 0;
        lines.push(line);
      }
    }

    // ── RENDER ────────────────────────────────────────────────────────────────
    let isFirstQuestion = true;
    let i = 0;

    while (i < lines.length) {
      const trimmed = lines[i].trim();
      const clean = trimmed
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        .replace(/_(.+?)_/g, "$1");

      // Empty line
      if (!trimmed) {
        doc.moveDown(0.2);
        i++;
        continue;
      }

      // Code block
      if (trimmed.startsWith("```")) {
        let codeLines = [];
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith("```")) {
          codeLines.push(lines[j]);
          j++;
        }
        i = j + 1;
        if (codeLines.length === 0) continue;
        doc.moveDown(0.2);
        for (const cl of codeLines) {
          doc.font("Courier").fontSize(9).fillColor("black")
            .text(cl || " ", { width: contentWidth() - 20, indent: 10, lineGap: 1, lineBreak: true });
        }
        doc.moveDown(0.2);
        continue;
      }

      // ## Question heading → new page (no blank page added)
      if (trimmed.startsWith("## ")) {
        const text = clean.replace(/^##\s+/, "");
        if (!isFirstQuestion) doc.addPage();
        isFirstQuestion = false;
        doc.font("Times-Bold").fontSize(14).fillColor("black")
          .text(text, { width: contentWidth() });
        doc.moveDown(0.3);
        i++;
        continue;
      }

      // ### Sub-heading
      if (trimmed.startsWith("### ")) {
        const text = clean.replace(/^###\s+/, "");
        doc.moveDown(0.25);
        doc.font("Times-Bold").fontSize(12).fillColor("black")
          .text(text, { width: contentWidth() });
        doc.moveDown(0.1);
        i++;
        continue;
      }

      // # Heading
      if (trimmed.startsWith("# ")) {
        const text = clean.replace(/^#\s+/, "");
        doc.moveDown(0.3);
        doc.font("Times-Bold").fontSize(16).fillColor("black")
          .text(text, { width: contentWidth() });
        doc.moveDown(0.15);
        i++;
        continue;
      }

      // Inline label "Introduction:"
      if (clean.endsWith(":") && clean.length < 60 && !/^\d+\./.test(clean) && !/^[-•*]/.test(clean)) {
        doc.moveDown(0.2);
        doc.font("Times-Bold").fontSize(11).fillColor("black")
          .text(clean, { width: contentWidth() });
        doc.moveDown(0.05);
        i++;
        continue;
      }

      // Bullet
      if (/^[-*•]\s/.test(trimmed)) {
        const text = clean.replace(/^[-*•]\s+/, "");
        doc.font("Times-Roman").fontSize(11).fillColor("black")
          .text(`•  ${text}`, { width: contentWidth() - 20, indent: 14, lineGap: 2 });
        i++;
        continue;
      }

      // Numbered list
      if (/^\d+\.\s/.test(trimmed)) {
        const m = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (m) {
          const text = clean.replace(/^\d+\.\s+/, "");
          doc.font("Times-Roman").fontSize(11).fillColor("black")
            .text(`${m[1]}.  ${text}`, { width: contentWidth() - 20, indent: 14, lineGap: 2 });
          i++;
          continue;
        }
      }

      // Normal paragraph
      doc.font("Times-Roman").fontSize(11).fillColor("black")
        .text(clean, { width: contentWidth(), align: "justify", lineGap: 3 });

      i++;
    }

    doc.end();
  });
}

module.exports = { generatePdf };