// services/docxGenerator.js
// Generates assignment .docx matching the exact style of the uploaded sample:
// - Centered title "Assignment – 01" (large, bold)
// - Centered subject name below title
// - Each question starts on a NEW PAGE
// - Question heading: bold, 14pt, black, no color
// - Body text: 12pt, normal
// - Sub-headings (Introduction:, Types of...) bold inline
// - Numbered and bullet lists preserved
// - Header: Name left, Enrollment right — plain, no background color
// - Footer: centered page number
// - No extra blank pages

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  TabStopType,
  TabStopPosition,
} = require("docx");

// ── HEADER: Name (left) | Enrollment (right) ─────────────────────────────────
function buildHeader(studentName, enrollmentNumber) {
  return new Header({
    children: [
      new Paragraph({
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000", space: 1 },
        },
        tabStops: [
          { type: TabStopType.RIGHT, position: 9360 },
        ],
        children: [
          new TextRun({ text: studentName, font: "Times New Roman", size: 22, bold: false }),
          new TextRun({ text: "\t", font: "Times New Roman", size: 22 }),
          new TextRun({ text: enrollmentNumber, font: "Times New Roman", size: 22, bold: false }),
        ],
      }),
    ],
  });
}

// ── FOOTER: centered page number ─────────────────────────────────────────────
function buildFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: { style: BorderStyle.SINGLE, size: 4, color: "000000", space: 1 },
        },
        children: [
          new TextRun({ children: [PageNumber.CURRENT], font: "Times New Roman", size: 20 }),
        ],
      }),
    ],
  });
}

// ── PARSE generated text into docx Paragraphs ────────────────────────────────
function parseContent(text) {
  const lines = text.split("\n");
  const paragraphs = [];
  let isFirstQuestion = true;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trimEnd();
    const trimmed = raw.trim();

    // Skip empty lines
    if (!trimmed) {
      paragraphs.push(new Paragraph({ children: [], spacing: { after: 0 } }));
      continue;
    }

    // Strip markdown bold/italic
    const clean = trimmed
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      .replace(/_(.+?)_/g, "$1");

    // ── Question heading: ## Q1. / ## Question 1: ──────────────────────────
    if (trimmed.startsWith("## ")) {
      const headingText = clean.replace(/^##\s+/, "");

      // Every question except the first starts on a new page
      if (!isFirstQuestion) {
        paragraphs.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }
      isFirstQuestion = false;

      paragraphs.push(
        new Paragraph({
          spacing: { before: 240, after: 200 },
          children: [
            new TextRun({
              text: headingText,
              bold: true,
              size: 28,           // 14pt
              font: "Times New Roman",
              color: "000000",    // black — no color
            }),
          ],
        })
      );
      continue;
    }

    // ── Sub-heading: ### ───────────────────────────────────────────────────
    if (trimmed.startsWith("### ")) {
      const headingText = clean.replace(/^###\s+/, "");
      paragraphs.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: headingText,
              bold: true,
              size: 24,
              font: "Times New Roman",
              color: "000000",
            }),
          ],
        })
      );
      continue;
    }

    // ── Top heading: # ─────────────────────────────────────────────────────
    if (trimmed.startsWith("# ")) {
      const headingText = clean.replace(/^#\s+/, "");
      paragraphs.push(
        new Paragraph({
          spacing: { before: 200, after: 160 },
          children: [
            new TextRun({
              text: headingText,
              bold: true,
              size: 32,
              font: "Times New Roman",
              color: "000000",
            }),
          ],
        })
      );
      continue;
    }

    // ── Inline sub-heading like "Introduction:" "Security Services:" ───────
    // Line ends with ":" and is short (likely a section label)
    if (clean.endsWith(":") && clean.length < 60 && !clean.startsWith("•") && !clean.match(/^\d+\./)) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 160, after: 60 },
          children: [
            new TextRun({
              text: clean,
              bold: true,
              size: 24,
              font: "Times New Roman",
              color: "000000",
            }),
          ],
        })
      );
      continue;
    }

    // ── Bullet point ───────────────────────────────────────────────────────
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const bulletText = clean.replace(/^[-*•]\s+/, "");
      paragraphs.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 360, hanging: 360 },
          children: [
            new TextRun({ text: "•\t" + bulletText, size: 24, font: "Times New Roman" }),
          ],
        })
      );
      continue;
    }

    // ── Numbered list: 1. 2. 3. ────────────────────────────────────────────
    if (/^\d+\.\s+/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        const num = numMatch[1];
        const listText = clean.replace(/^\d+\.\s+/, "");
        paragraphs.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: 360, hanging: 360 },
            children: [
              new TextRun({ text: `${num}.\t${listText}`, size: 24, font: "Times New Roman" }),
            ],
          })
        );
        continue;
      }
    }

    // ── Normal body paragraph ──────────────────────────────────────────────
    paragraphs.push(
      new Paragraph({
        spacing: { before: 60, after: 60, line: 360 },
        children: [
          new TextRun({ text: clean, size: 24, font: "Times New Roman", color: "000000" }),
        ],
      })
    );
  }

  return paragraphs;
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
async function generateDocx(studentName, enrollmentNumber, generatedContent, subjectName) {
  const contentParagraphs = parseContent(generatedContent);

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Times New Roman", size: 24 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: { default: buildHeader(studentName, enrollmentNumber) },
        footers: { default: buildFooter() },
        children: [
          // ── Title: "Assignment – 01" centered, large, bold ──
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "Assignment",
                bold: true,
                size: 40,
                font: "Times New Roman",
                color: "000000",
              }),
            ],
          }),

          // ── Subject name centered below title ──
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 400 },
            children: [
              new TextRun({
                text: subjectName || "",
                size: 28,
                font: "Times New Roman",
                color: "000000",
              }),
            ],
          }),

          // ── Generated content ──
          ...contentParagraphs,
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

module.exports = { generateDocx };