import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FONTS, TABLE_STYLES, PAGE_SETTINGS } from "../utils/pdfStyles";
import type { ResponseStatistics, DemographicData } from "../types";

export async function generateResponseStatistics(
  doc: jsPDF,
  statistics: ResponseStatistics,
  demographicData: DemographicData
) {
  doc.addPage();
  doc.setFontSize(FONTS.heading.size);
  doc.text("Response Statistics", PAGE_SETTINGS.margin, 20);

  // Status Distribution
  const statusData = [
    ["Completed", statistics.statusDistribution.completed, `${((statistics.statusDistribution.completed / statistics.totalResponses) * 100).toFixed(1)}%`],
    ["Pending", statistics.statusDistribution.pending, `${((statistics.statusDistribution.pending / statistics.totalResponses) * 100).toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: 30,
    head: [["Status", "Count", "Percentage"]],
    body: statusData,
    ...TABLE_STYLES,
  });

  // Demographic Breakdowns
  const sections = [
    { title: "Gender Distribution", data: demographicData.gender },
    { title: "Location Distribution", data: demographicData.location },
    { title: "Employment Type Distribution", data: demographicData.employmentType },
    { title: "Department Distribution", data: demographicData.sbu },
  ];

  let currentY = (doc as any).lastAutoTable.finalY + 20;

  for (const section of sections) {
    // Check if we need a new page
    if (currentY > doc.internal.pageSize.height - 100) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(FONTS.subheading.size);
    doc.text(section.title, PAGE_SETTINGS.margin, currentY);

    const tableData = section.data.map(item => [
      item.category,
      item.count,
      `${item.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [["Category", "Count", "Percentage"]],
      body: tableData,
      ...TABLE_STYLES,
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  }
}