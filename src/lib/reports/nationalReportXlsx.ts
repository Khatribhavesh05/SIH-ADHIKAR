import ExcelJS from "exceljs";
import type { NationalReportData } from "./nationalReport";

// Mirrors the app's --color-brand / --color-saffron / --color-danger tokens
// (globals.css) as ARGB hex, since ExcelJS fills take raw ARGB rather than
// CSS variables.
const NAVY_DARK = "FF0A192F";
const SAFFRON = "FFD97706";
const DANGER_TINT = "FFFEF2F2";
const WARNING_TINT = "FFFFF7ED";
const DANGER_TEXT = "FFDC2626";
const HAIRLINE = "FFE2E8F0";
const WHITE = "FFFFFFFF";

function thinBorder() {
  return {
    top: { style: "thin" as const, color: { argb: HAIRLINE } },
    left: { style: "thin" as const, color: { argb: HAIRLINE } },
    bottom: { style: "thin" as const, color: { argb: HAIRLINE } },
    right: { style: "thin" as const, color: { argb: HAIRLINE } },
  };
}

export async function generateNationalReportXlsx(data: NationalReportData): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Adhikar — National Land Acquisition Management System";
  workbook.created = new Date();

  // ---- Sheet 1: Executive Summary ----
  const summary = workbook.addWorksheet("Executive Summary", {
    views: [{ showGridLines: false }],
  });
  summary.columns = [{ width: 34 }, { width: 22 }, { width: 22 }];

  summary.mergeCells("A1:C1");
  const title = summary.getCell("A1");
  title.value = "ADHIKAR — National Land Acquisition Report";
  title.font = { size: 14, bold: true, color: { argb: WHITE } };
  title.alignment = { vertical: "middle" };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_DARK } };
  summary.getRow(1).height = 26;

  summary.mergeCells("A2:C2");
  const subtitle = summary.getCell("A2");
  subtitle.value = `Ministry of Rural Development · Dept of Land Resources — Scope: ${data.scopeLabel} — Generated ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
  subtitle.font = { size: 9, italic: true, color: { argb: "FF475569" } };
  summary.getRow(2).height = 18;

  summary.addRow([]);

  const kpiHeaderRow = summary.addRow(["Executive Summary KPI", "Value", "Detail"]);
  kpiHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_DARK } };
    cell.border = thinBorder();
  });

  const kpiRows: [string, number, string][] = [
    ["Total Projects", data.kpis.totalProjects, "Nationwide active records"],
    ["Area Notified (acres)", data.kpis.areaNotifiedAcres, ""],
    ["Area Acquired (acres)", data.kpis.areaAcquiredAcres, `${data.kpis.areaAcquiredPercent}% acquired`],
    ["Compensation Assessed (Rs. Cr)", Number(data.kpis.compensationAssessedCr.toFixed(2)), ""],
    ["Compensation Disbursed (Rs. Cr)", Number(data.kpis.compensationDisbursedCr.toFixed(2)), `${data.kpis.compensationPercent}% disbursed`],
    ["Families Affected", data.kpis.familiesTotal, ""],
    ["Families Resettled", data.kpis.familiesResettled, `${data.kpis.resettledPercent}% resettled`],
  ];

  kpiRows.forEach(([label, value, detail], idx) => {
    const row = summary.addRow([label, value, detail]);
    row.getCell(2).numFmt = "#,##0.00";
    row.eachCell((cell) => (cell.border = thinBorder()));
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      });
    }
  });

  summary.addRow([]);

  // Signature "Cost of Delay" callout — bordered, danger-tinted, same visual
  // emphasis it carries on the dashboard and PDF report.
  const calloutLabelRow = summary.addRow(["COST OF DELAY — NATIONAL LOSS (Rs. Cr)", data.kpis.costOfDelayCr, "Sec 30(3) 12% & 9% statutory delay interest"]);
  calloutLabelRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: DANGER_TEXT } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DANGER_TINT } };
    cell.border = {
      top: { style: "medium", color: { argb: DANGER_TEXT } },
      left: { style: "medium", color: { argb: DANGER_TEXT } },
      bottom: { style: "medium", color: { argb: DANGER_TEXT } },
      right: { style: "medium", color: { argb: DANGER_TEXT } },
    };
  });
  calloutLabelRow.getCell(2).numFmt = "#,##0.00";
  calloutLabelRow.getCell(2).font = { bold: true, size: 13, color: { argb: DANGER_TEXT } };
  calloutLabelRow.height = 22;

  // ---- Sheet 2: Risk & Compliance Priority List ----
  const riskSheet = workbook.addWorksheet("Risk & Compliance List", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  riskSheet.columns = [
    { header: "Project Name", key: "title", width: 38 },
    { header: "State", key: "state", width: 20 },
    { header: "Days Overdue / Remaining", key: "days", width: 24 },
    { header: "Status", key: "status", width: 18 },
  ];

  const headerRow = riskSheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_DARK } };
    cell.border = thinBorder();
    cell.alignment = { vertical: "middle" };
  });
  headerRow.height = 20;

  data.riskRows.forEach((r, idx) => {
    const status = r.daysLeft < 0 ? "Overdue" : r.daysLeft < 30 ? "Upcoming Deadline" : "On Track";
    const row = riskSheet.addRow({
      title: r.title,
      state: r.state,
      days: r.daysLeft,
      status,
    });

    // Real numeric cell for sorting/filtering, but signed so overdue projects
    // read as negative — matches the PDF/CSV's "Nd overdue" semantics without
    // losing the numeric type.
    // Plain signed numeric format (renders as e.g. "-1,526" for overdue,
    // "27" for remaining) — a real, sortable number. The adjacent Status
    // column plus the row's red/amber tint already carry the overdue vs.
    // remaining meaning, so this avoids relying on multi-section conditional
    // formats that not every spreadsheet app renders identically.
    row.getCell("days").numFmt = "#,##0";

    const fill = r.daysLeft < 0 ? DANGER_TINT : r.daysLeft < 30 ? WARNING_TINT : idx % 2 === 1 ? "FFF8FAFC" : undefined;
    row.eachCell((cell) => {
      cell.border = thinBorder();
      if (fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      if (r.daysLeft < 0) cell.font = { color: { argb: DANGER_TEXT } };
    });
  });

  riskSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 4 },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filenameScope = data.scopeLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.download = `adhikar-national-report-${filenameScope}-${dateStamp}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
