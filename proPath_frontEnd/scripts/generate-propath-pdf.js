const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(projectRoot, "docs", "propath-report.md");
const outputPath = path.join(projectRoot, "propath-report.pdf");

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_LEFT = 56;
const MARGIN_TOP = 70;
const MARGIN_BOTTOM = 60;
const BODY_FONT_SIZE = 12;
const TITLE_FONT_SIZE = 24;
const HEADING_FONT_SIZE = 16;
const BODY_LINE_HEIGHT = 18;
const HEADING_GAP = 16;
const SECTION_GAP = 8;
const MAX_TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT * 2;
const AVG_CHAR_WIDTH = BODY_FONT_SIZE * 0.52;
const MAX_CHARS_PER_LINE = Math.max(40, Math.floor(MAX_TEXT_WIDTH / AVG_CHAR_WIDTH));

function escapePdfText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function parseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      blocks.push({ type: "blank" });
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "title", text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: line.slice(3).trim() });
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) lines.push(current);

    if (word.length <= maxChars) {
      current = word;
      continue;
    }

    let remaining = word;
    while (remaining.length > maxChars) {
      lines.push(`${remaining.slice(0, maxChars - 1)}-`);
      remaining = remaining.slice(maxChars - 1);
    }
    current = remaining;
  }

  if (current) lines.push(current);
  return lines;
}

function addTextOperation(ops, x, y, size, text) {
  ops.push(`BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`);
}

function buildPages(blocks) {
  const pages = [];
  let ops = [];
  let y = PAGE_HEIGHT - MARGIN_TOP;

  function newPage() {
    if (ops.length) pages.push(ops);
    ops = [];
    y = PAGE_HEIGHT - MARGIN_TOP;
  }

  function ensureSpace(required) {
    if (y - required < MARGIN_BOTTOM) {
      newPage();
    }
  }

  for (const block of blocks) {
    if (block.type === "blank") {
      y -= SECTION_GAP;
      continue;
    }

    if (block.type === "title") {
      ensureSpace(36);
      addTextOperation(ops, MARGIN_LEFT, y, TITLE_FONT_SIZE, block.text);
      y -= 40;
      continue;
    }

    if (block.type === "heading") {
      ensureSpace(28);
      addTextOperation(ops, MARGIN_LEFT, y, HEADING_FONT_SIZE, block.text);
      y -= 26;
      continue;
    }

    if (block.type === "paragraph") {
      const lines = wrapText(block.text, MAX_CHARS_PER_LINE);
      ensureSpace(lines.length * BODY_LINE_HEIGHT + HEADING_GAP);
      for (const line of lines) {
        addTextOperation(ops, MARGIN_LEFT, y, BODY_FONT_SIZE, line);
        y -= BODY_LINE_HEIGHT;
      }
      y -= HEADING_GAP;
    }
  }

  if (ops.length) pages.push(ops);
  return pages;
}

function buildPdf(pages) {
  const objects = [];

  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");

  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  objects.push(`2 0 obj << /Type /Pages /Count ${pages.length} /Kids [${kids}] >> endobj`);

  pages.forEach((pageOps, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = 4 + index * 2;
    const contentStream = pageOps.join("\n");
    const contentLength = Buffer.byteLength(contentStream, "latin1");

    objects.push(
      `${pageObjectNumber} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectNumber} 0 R >> endobj`,
    );
    objects.push(
      `${contentObjectNumber} 0 obj << /Length ${contentLength} >> stream\n${contentStream}\nendstream\nendobj`,
    );
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${object}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

const markdown = fs.readFileSync(sourcePath, "utf8");
const blocks = parseMarkdown(markdown);
const pages = buildPages(blocks);
const pdf = buildPdf(pages);

fs.writeFileSync(outputPath, pdf);
console.log(`PDF generated: ${outputPath}`);
