// Generates the full project plan as .docx (Word) and .pdf.
// Run: npm run gen:docs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  ExternalHyperlink
} from "docx";
import PDFDocument from "pdfkit";
import { DOC_TITLE, DOC_SUBTITLE, DOC_META, SECTIONS, SPEC_LINK, SPEC_LINK_LABEL } from "./doc-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../docs");
fs.mkdirSync(OUT, { recursive: true });

const TEAL = "1B9E8F";
const NAVY = "0D1224";
const GREY = "555555";
const CJK_FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf";

// ─────────────────────────────────────────────────────────────────────────────
// WORD (.docx)
// ─────────────────────────────────────────────────────────────────────────────
function runs(text, opts = {}) {
  return new TextRun({ text, font: "Microsoft YaHei", ...opts });
}

function buildDocxTable(rows) {
  const [header, ...body] = rows;
  const mkCell = (text, isHeader) =>
    new TableCell({
      width: { size: Math.floor(100 / rows[0].length), type: WidthType.PERCENTAGE },
      shading: isHeader ? { type: ShadingType.CLEAR, fill: TEAL, color: "auto" } : undefined,
      margins: { top: 60, bottom: 60, left: 90, right: 90 },
      children: [
        new Paragraph({
          children: [runs(text, { bold: isHeader, color: isHeader ? "FFFFFF" : "222222", size: 19 })]
        })
      ]
    });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE" }
    },
    rows: [
      new TableRow({ tableHeader: true, children: header.map((c) => mkCell(c, true)) }),
      ...body.map((r) => new TableRow({ children: r.map((c) => mkCell(c, false)) }))
    ]
  });
}

async function buildDocx() {
  const children = [];

  // Cover
  children.push(
    new Paragraph({ spacing: { before: 2400 }, alignment: AlignmentType.CENTER, children: [runs(DOC_TITLE, { bold: true, size: 44, color: NAVY })] }),
    new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [runs(DOC_SUBTITLE, { size: 26, color: TEAL })] }),
    new Paragraph({ spacing: { before: 200, after: 300 }, alignment: AlignmentType.CENTER, children: [runs(DOC_META, { size: 18, color: GREY })] }),
    new Paragraph({
      spacing: { before: 200 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: SPEC_LINK_LABEL + ":  ", font: "Microsoft YaHei", bold: true, size: 20, color: NAVY }),
        new ExternalHyperlink({
          link: SPEC_LINK,
          children: [new TextRun({ text: SPEC_LINK, font: "Microsoft YaHei", size: 18, color: "1B9E8F", underline: {} })]
        })
      ]
    }),
    new Paragraph({ pageBreakBefore: true, children: [] })
  );

  for (const b of SECTIONS) {
    switch (b.type) {
      case "h1":
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 140 }, children: [runs(b.text, { bold: true, size: 30, color: NAVY })] }));
        break;
      case "h2":
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 }, children: [runs(b.text, { bold: true, size: 24, color: TEAL })] }));
        break;
      case "h3":
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 180, after: 80 }, children: [runs(b.text, { bold: true, size: 21 })] }));
        break;
      case "p":
        children.push(new Paragraph({ spacing: { after: 120, line: 320 }, children: [runs(b.text, { size: 21, color: "333333" })] }));
        break;
      case "quote":
        children.push(new Paragraph({ spacing: { before: 120, after: 160, line: 320 }, indent: { left: 200 }, border: { left: { style: BorderStyle.SINGLE, size: 24, color: TEAL, space: 12 } }, children: [runs(b.text, { italics: true, size: 21, color: "444444" })] }));
        break;
      case "bullet":
        b.items.forEach((it) => children.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 60, line: 300 }, children: [runs(it, { size: 21, color: "333333" })] })));
        break;
      case "num":
        b.items.forEach((it, i) => children.push(new Paragraph({ numbering: { reference: "numbered", level: 0 }, spacing: { after: 60, line: 300 }, children: [runs(it, { size: 21, color: "333333" })] })));
        break;
      case "table":
        children.push(buildDocxTable(b.rows));
        children.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
        break;
    }
  }

  const doc = new Document({
    numbering: {
      config: [{ reference: "numbered", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }] }]
    },
    styles: { default: { document: { run: { font: "Microsoft YaHei" } } } },
    sections: [{ properties: { page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } } }, children }]
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT, "广告素材裂变Agent-项目计划书.docx"), buf);
  console.log("✓ Word 已生成: docs/广告素材裂变Agent-项目计划书.docx");
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF — 精美排版:封面 / 目录 / 分节色带 / 页脚页码 / 高亮链接卡片 / 斑马纹表格
// ─────────────────────────────────────────────────────────────────────────────
const PDF = {
  navy: "#0D1224",
  navy2: "#141A33",
  teal: "#1B9E8F",
  tealLight: "#2FF3D6",
  magenta: "#C43BB0",
  ink: "#2A2E3A",
  sub: "#5B6478",
  hair: "#E4E8F0",
  zebra: "#F5F8FB",
  band: "#EAF6F3"
};

function buildPdf() {
  return new Promise((resolve, reject) => {
    // Arial Unicode has no emoji glyphs → strip emoji/pictographs so they don't
    // render as tofu boxes in the PDF (Word keeps them fine). Arrows (→) and
    // check marks (✓) DO exist in the font, so we keep them.
    const clean = (s) =>
      String(s).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\uFE0F]/gu, "").replace(/\s{2,}/g, " ").trim();
    const M = 56; // page margin
    const doc = new PDFDocument({ size: "A4", margins: { top: M, bottom: M + 24, left: M, right: M }, autoFirstPage: false, bufferPages: true });
    const file = path.join(OUT, "广告素材裂变Agent-项目计划书.pdf");
    const stream = fs.createWriteStream(file);
    doc.pipe(stream);

    const hasFont = fs.existsSync(CJK_FONT);
    if (hasFont) doc.registerFont("cjk", CJK_FONT);
    const F = hasFont ? "cjk" : "Helvetica";
    const PW = 595.28, PH = 841.89;
    const contentW = PW - M * 2;
    const bottomLimit = PH - M - 24;

    let h1Count = 0; // roman-ish counter for section numbering label

    const ensureSpace = (need) => {
      if (doc.y + need > bottomLimit) doc.addPage();
    };

    // ── Cover ────────────────────────────────────────────────────────────────
    doc.addPage();
    doc.rect(0, 0, PW, PH).fill(PDF.navy);
    // decorative glow bands
    doc.save();
    doc.rect(0, 0, PW, 6).fill(PDF.tealLight);
    doc.rect(0, PH - 6, PW, 6).fill(PDF.magenta);
    doc.restore();
    // helix-ish dots
    doc.save();
    for (let i = 0; i < 14; i++) {
      const yy = 90 + i * 18;
      const xx = 70 + Math.sin(i / 1.6) * 26;
      doc.circle(xx, yy, 3).fill(i % 2 ? PDF.tealLight : PDF.magenta);
      doc.circle(PW - xx, yy, 3).fill(i % 2 ? PDF.magenta : PDF.tealLight);
    }
    doc.restore();

    doc.fill("#7FE9DA").font(F).fontSize(12).text("CREATIVE FISSION AGENT · 黑客松项目计划书", M, 250, { width: contentW, align: "center", characterSpacing: 1 });
    doc.fill("#FFFFFF").font(F).fontSize(30).text(DOC_TITLE, M, 300, { width: contentW, align: "center" });
    doc.fill(PDF.tealLight).fontSize(16).text(DOC_SUBTITLE, M, 372, { width: contentW, align: "center" });
    doc.fill("#9AA4C0").fontSize(11).text(DOC_META, M, 412, { width: contentW, align: "center" });

    // Spec link card on cover
    const cardY = 500, cardH = 92, cardW = contentW - 40, cardX = M + 20;
    doc.save();
    doc.roundedRect(cardX, cardY, cardW, cardH, 10).fillAndStroke(PDF.navy2, PDF.teal);
    doc.fill(PDF.tealLight).font(F).fontSize(13).text(clean(SPEC_LINK_LABEL), cardX + 20, cardY + 18, { width: cardW - 40 });
    doc.fill("#B9C4DE").fontSize(9.5).text("完整版在线说明书(飞书 Wiki),含实时更新的产品细节、演示与附录:", cardX + 20, cardY + 42, { width: cardW - 40 });
    doc.fill("#8FD8FF").fontSize(9).text(SPEC_LINK, cardX + 20, cardY + 60, { width: cardW - 40, underline: true, link: SPEC_LINK });
    doc.restore();

    // ── Table of contents ─────────────────────────────────────────────────────
    doc.addPage();
    doc.fill(PDF.navy).font(F).fontSize(20).text("目录 · Contents", M, M);
    doc.moveTo(M, doc.y + 6).lineTo(M + 60, doc.y + 6).lineWidth(3).strokeColor(PDF.tealLight).stroke();
    doc.moveDown(1.2);
    const h1s = SECTIONS.filter((s) => s.type === "h1");
    h1s.forEach((s, i) => {
      const y = doc.y;
      doc.fill(PDF.teal).font(F).fontSize(11).text(String(i + 1).padStart(2, "0"), M, y, { continued: false, width: 30 });
      doc.fill(PDF.ink).font(F).fontSize(11.5).text(clean(s.text), M + 34, y, { width: contentW - 34 });
      doc.moveDown(0.55);
    });

    // Prominent spec-link callout inside TOC page too
    doc.moveDown(1);
    const cY = doc.y;
    doc.save();
    doc.roundedRect(M, cY, contentW, 60, 8).fillAndStroke(PDF.band, PDF.teal);
    doc.fill(PDF.navy).font(F).fontSize(11).text("本文件为项目计划书精编版。完整项目说明书(在线,持续更新)见:", M + 16, cY + 12, { width: contentW - 32 });
    doc.fill(PDF.teal).fontSize(10).text(SPEC_LINK, M + 16, cY + 34, { width: contentW - 32, underline: true, link: SPEC_LINK });
    doc.restore();

    // ── Body ────────────────────────────────────────────────────────────────
    doc.addPage();

    const drawTable = (rows) => {
      const cols = rows[0].length;
      const colW = contentW / cols;
      const cellPad = 6;
      rows.forEach((row, ri) => {
        doc.font(F).fontSize(9);
        let maxH = 0;
        row.forEach((c) => {
          const h = doc.heightOfString(clean(c), { width: colW - cellPad * 2, lineGap: 1.5 });
          if (h > maxH) maxH = h;
        });
        const rowH = maxH + cellPad * 2;
        if (doc.y + rowH > bottomLimit) doc.addPage();
        const y0 = doc.y;
        row.forEach((c, ci) => {
          const x0 = M + ci * colW;
          if (ri === 0) {
            doc.rect(x0, y0, colW, rowH).fill(PDF.teal);
          } else {
            doc.rect(x0, y0, colW, rowH).fillAndStroke(ri % 2 ? "#FFFFFF" : PDF.zebra, PDF.hair);
          }
          doc.fill(ri === 0 ? "#FFFFFF" : PDF.ink).font(F).fontSize(9)
            .text(clean(c), x0 + cellPad, y0 + cellPad, { width: colW - cellPad * 2, lineGap: 1.5 });
        });
        doc.y = y0 + rowH;
      });
      doc.moveDown(0.9);
    };

    for (const b of SECTIONS) {
      switch (b.type) {
        case "h1": {
          h1Count++;
          // section band
          ensureSpace(56);
          if (doc.y > M + 4) doc.moveDown(0.5);
          const y0 = doc.y;
          const bandH = 30;
          doc.save();
          doc.roundedRect(M, y0, contentW, bandH, 6).fill(PDF.navy);
          doc.rect(M, y0, 5, bandH).fill(PDF.tealLight);
          doc.fill("#FFFFFF").font(F).fontSize(14).text(clean(b.text), M + 16, y0 + 7, { width: contentW - 30 });
          doc.restore();
          doc.y = y0 + bandH + 10;
          break;
        }
        case "h2":
          ensureSpace(40);
          doc.moveDown(0.3);
          doc.fill(PDF.teal).font(F).fontSize(12.5).text(clean(b.text), { width: contentW });
          doc.moveTo(M, doc.y + 2).lineTo(M + 40, doc.y + 2).lineWidth(2).strokeColor(PDF.tealLight).stroke();
          doc.moveDown(0.35);
          break;
        case "h3":
          ensureSpace(28);
          doc.fill(PDF.navy).font(F).fontSize(11).text(clean(b.text), { width: contentW });
          doc.moveDown(0.2);
          break;
        case "p":
          doc.fill(PDF.ink).font(F).fontSize(10).text(clean(b.text), { width: contentW, align: "justify", lineGap: 4 });
          doc.moveDown(0.5);
          break;
        case "quote": {
          ensureSpace(50);
          const qy = doc.y;
          const qtext = clean(b.text);
          // measure first (invisible pass not needed; compute via heightOfString)
          const qh = doc.heightOfString(qtext, { width: contentW - 40, lineGap: 4 }) + 16;
          doc.save();
          doc.roundedRect(M, qy, contentW, qh, 6).fillAndStroke(PDF.band, PDF.teal);
          doc.rect(M, qy, 4, qh).fill(PDF.teal);
          doc.restore();
          doc.fill(PDF.navy).font(F).fontSize(10.5).text(qtext, M + 22, qy + 8, { width: contentW - 40, lineGap: 4 });
          doc.y = qy + qh + 8;
          doc.moveDown(0.4);
          break;
        }
        case "bullet":
          b.items.forEach((it) => {
            ensureSpace(20);
            const by = doc.y;
            doc.circle(M + 6, by + 6, 2).fill(PDF.teal);
            doc.fill(PDF.ink).font(F).fontSize(10).text(clean(it), M + 16, by, { width: contentW - 20, lineGap: 4 });
            doc.moveDown(0.2);
          });
          doc.moveDown(0.3);
          break;
        case "num":
          b.items.forEach((it, i) => {
            ensureSpace(20);
            const ny = doc.y;
            doc.fill(PDF.teal).font(F).fontSize(10).text(`${i + 1}.`, M, ny, { width: 18 });
            doc.fill(PDF.ink).font(F).fontSize(10).text(clean(it), M + 20, ny, { width: contentW - 24, lineGap: 4 });
            doc.moveDown(0.2);
          });
          doc.moveDown(0.3);
          break;
        case "table":
          drawTable(b.rows);
          break;
      }
    }

    // ── Footer with page numbers on every non-cover page ──────────────────────
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      if (i === range.start) continue; // skip cover
      const fy = PH - M - 6;
      doc.save();
      doc.moveTo(M, fy).lineTo(PW - M, fy).lineWidth(0.5).strokeColor(PDF.hair).stroke();
      doc.fill(PDF.sub).font(F).fontSize(8).text("广告素材裂变 Agent · Powered by Zhipu GLM", M, fy + 4, { width: contentW / 2, align: "left" });
      doc.fill(PDF.sub).font(F).fontSize(8).text(`${i - range.start} / ${range.count - 1}`, M + contentW / 2, fy + 4, { width: contentW / 2, align: "right" });
      doc.restore();
    }

    doc.end();
    stream.on("finish", () => { console.log("✓ PDF 已生成: docs/广告素材裂变Agent-项目计划书.pdf"); resolve(); });
    stream.on("error", reject);
  });
}

await buildDocx();
await buildPdf();
console.log("全部文档生成完成 → docs/");
