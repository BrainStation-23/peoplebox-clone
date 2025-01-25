import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { FONTS, TABLE_STYLES, PAGE_SETTINGS } from "../utils/pdfStyles";
import type { Campaign, ResponseStatistics } from "../types";

export async function generateCampaignOverview(
  doc: jsPDF,
  campaign: Campaign,
  statistics: ResponseStatistics
) {
  // Title Page
  doc.setFontSize(FONTS.heading.size);
  doc.setFont("helvetica", "bold");
  doc.text("Campaign Report", doc.internal.pageSize.width / 2, 40, { align: "center" });
  
  doc.setFontSize(FONTS.subheading.size);
  doc.text(campaign.name, doc.internal.pageSize.width / 2, 60, { align: "center" });
  
  doc.setFontSize(FONTS.body.size);
  doc.text(format(new Date(), "PPP"), doc.internal.pageSize.width / 2, 80, { align: "center" });

  // Add new page for overview
  doc.addPage();
  
  // Campaign Overview Section
  doc.setFontSize(FONTS.heading.size);
  doc.text("Campaign Overview", PAGE_SETTINGS.margin, 20);

  const overviewData = [
    ["Status", campaign.status],
    ["Start Date", format(new Date(campaign.starts_at), "PPP")],
    ["End Date", campaign.ends_at ? format(new Date(campaign.ends_at), "PPP") : "N/A"],
    ["Survey", campaign.survey.name],
    ["Total Responses", statistics.totalResponses.toString()],
    ["Completion Rate", `${statistics.completionRate.toFixed(1)}%`],
  ];

  autoTable(doc, {
    ...TABLE_STYLES,
    startY: 30,
    head: [["Metric", "Value"]],
    body: overviewData,
  });

  // Add description if available
  if (campaign.description) {
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(FONTS.subheading.size);
    doc.text("Description:", PAGE_SETTINGS.margin, finalY + 15);
    doc.setFontSize(FONTS.body.size);
    const descriptionLines = doc.splitTextToSize(
      campaign.description,
      doc.internal.pageSize.width - 40
    );
    doc.text(descriptionLines, PAGE_SETTINGS.margin, finalY + 25);
  }
}