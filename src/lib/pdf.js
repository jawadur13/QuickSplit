// Branded PDF reports. jsPDF is loaded on demand to keep the first load light.
import { getFormatter } from "./format.js";

const C = {
  brand: [31, 58, 52],
  gold: [184, 146, 90],
  ink: [20, 22, 28],
  ink2: [91, 96, 112],
  line: [230, 226, 216],
  ivory: [247, 245, 240],
  pos: [47, 125, 91],
  neg: [180, 81, 60],
};

const PAGE_W = 210;
const M = 16; // side margin
const W = PAGE_W - M * 2;

const newDoc = async () => {
  const { jsPDF } = await import("jspdf");
  return new jsPDF();
};

const header = (doc, title, subtitle) => {
  doc.setFillColor(...C.brand);
  doc.rect(0, 0, PAGE_W, 38, "F");
  doc.setFillColor(...C.gold);
  doc.rect(0, 38, PAGE_W, 1.2, "F");

  doc.setTextColor(...C.gold);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("QUICKSPLIT", M, 14, { charSpace: 1.5 });

  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "normal");
  doc.setFontSize(22);
  doc.text(title, M, 27);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 226, 222);
  doc.text(subtitle, PAGE_W - M, 27, { align: "right" });
  return 52;
};

const ensureSpace = (doc, y, needed) => {
  if (y + needed > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    return 20;
  }
  return y;
};

const footer = (doc) => {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...C.line);
    doc.setLineWidth(0.3);
    doc.line(M, h - 14, PAGE_W - M, h - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.ink2);
    doc.text("Generated with QuickSplit · quicksplit.pro.bd", M, h - 8);
    doc.text(`${i} / ${pages}`, PAGE_W - M, h - 8, { align: "right" });
  }
};

const today = () => new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

export const buildSummaryDoc = async (summary, currency) => {
  const f = getFormatter(currency);
  const amt = (n) => `${f.plain(n)} ${currency}`;
  const doc = await newDoc();
  let y = header(doc, "Group Summary", today());

  // Overview strip
  doc.setFillColor(...C.ivory);
  doc.roundedRect(M, y, W, 22, 3, 3, "F");
  const cols = [
    ["TOTAL SPENT", amt(summary.total)],
    ["MEMBERS", String(summary.members.length)],
    ["EXPENSES", String(summary.ready)],
    ["SKIPPED", String(summary.skipped)],
  ];
  cols.forEach(([label, value], i) => {
    const x = M + 6 + i * (W / 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.ink2);
    doc.text(label, x, y + 8, { charSpace: 0.6 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.ink);
    doc.text(value, x, y + 16);
  });
  y += 34;

  summary.members.forEach((m) => {
    y = ensureSpace(doc, y, 40);

    // Name + net
    doc.setFont("times", "normal");
    doc.setFontSize(15);
    doc.setTextColor(...C.ink);
    doc.text(m.name, M, y);

    const label = m.net > 0 ? "GETS BACK" : m.net < 0 ? "OWES" : "SETTLED";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.ink2);
    // No charSpace here: jsPDF ignores it when right-aligning, which pushes text past the margin.
    doc.text(label, PAGE_W - M, y - 6, { align: "right" });
    doc.setFontSize(12);
    doc.setTextColor(...(m.net > 0 ? C.pos : m.net < 0 ? C.neg : C.ink2));
    doc.text(amt(Math.abs(m.net)), PAGE_W - M, y, { align: "right" });

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.ink2);
    doc.text(`Paid ${amt(m.paid)}   ·   Share ${amt(m.consumed)}`, M, y);
    y += 6;

    if (m.breakdown.length) {
      // Table header
      doc.setDrawColor(...C.gold);
      doc.setLineWidth(0.4);
      doc.line(M, y, PAGE_W - M, y);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.ink2);
      doc.text("EXPENSE", M, y);
      doc.text("PAID", PAGE_W - M - 40, y, { align: "right" });
      doc.text("SHARE", PAGE_W - M, y, { align: "right" });
      y += 2.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      m.breakdown.forEach((b) => {
        y = ensureSpace(doc, y, 8);
        y += 4.5;
        doc.setTextColor(...C.ink);
        doc.text(doc.splitTextToSize(b.title, W - 90)[0], M, y);
        doc.text(b.paid ? amt(b.paid) : "—", PAGE_W - M - 40, y, { align: "right" });
        doc.text(b.consumed ? amt(b.consumed) : "—", PAGE_W - M, y, { align: "right" });
        y += 2.5;
        doc.setDrawColor(...C.line);
        doc.setLineWidth(0.2);
        doc.line(M, y, PAGE_W - M, y);
      });
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("No activity for this member.", M, y + 3);
    }
    y += 14;
  });

  footer(doc);
  return doc;
};

export const buildTransfersDoc = async (transfers, currency) => {
  const f = getFormatter(currency);
  const doc = await newDoc();
  let y = header(doc, "Settle Up", today());

  if (!transfers.length) {
    doc.setFont("times", "normal");
    doc.setFontSize(16);
    doc.setTextColor(...C.pos);
    doc.text("Everyone is settled. No transfers needed.", PAGE_W / 2, y + 10, { align: "center" });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...C.ink2);
    doc.text(`${transfers.length} transfer${transfers.length > 1 ? "s" : ""} settle everything.`, M, y);
    y += 8;

    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.4);
    doc.line(M, y, PAGE_W - M, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("FROM", M + 4, y);
    doc.text("TO", M + 80, y);
    doc.text("AMOUNT", PAGE_W - M - 4, y, { align: "right" });
    y += 4;

    transfers.forEach((t, i) => {
      y = ensureSpace(doc, y, 12);
      if (i % 2 === 0) {
        doc.setFillColor(...C.ivory);
        doc.rect(M, y, W, 11, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...C.ink);
      doc.text(t.from, M + 4, y + 7.2);
      doc.setTextColor(...C.gold);
      doc.text("->", M + 66, y + 7.2);
      doc.setTextColor(...C.ink);
      doc.text(t.to, M + 80, y + 7.2);
      doc.setFont("helvetica", "bold");
      doc.text(`${f.plain(t.amount)} ${currency}`, PAGE_W - M - 4, y + 7.2, { align: "right" });
      y += 11;
    });
  }

  footer(doc);
  return doc;
};

export const downloadPdf = async (build, filename) => (await build()).save(filename);

// The tab is opened synchronously so popup blockers treat it as part of the click.
export const previewPdf = async (build) => {
  const win = window.open("", "_blank");
  const doc = await build();
  const url = doc.output("bloburl");
  if (win) win.location.href = url;
  else window.open(url, "_blank");
};
