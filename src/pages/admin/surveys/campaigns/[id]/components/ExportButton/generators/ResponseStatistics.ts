import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FONTS, TABLE_STYLES, PAGE_SETTINGS } from "../utils/pdfStyles";
import { createPieChartConfig, createBarChartConfig, addChartToPDF } from "../utils/chartUtils";
import type { ResponseStatistics, DemographicData } from "../types";

export async function generateResponseStatistics(
  doc: jsPDF,
  statistics: ResponseStatistics,
  demographicData: DemographicData
) {
  doc.addPage();
  doc.setFontSize(FONTS.heading.size);
  doc.text("Response Statistics", PAGE_SETTINGS.margin, 20);

  // Status Distribution Chart
  const statusLabels = ["Completed", "Pending"];
  const statusData = [
    statistics.statusDistribution.completed,
    statistics.statusDistribution.pending,
  ];
  
  let currentY = 40;
  currentY = await addChartToPDF(
    doc,
    createPieChartConfig(statusLabels, statusData),
    currentY,
    "Response Status Distribution"
  );

  // Gender Distribution Chart
  if (demographicData.gender.length > 0) {
    const genderLabels = demographicData.gender.map(item => item.category);
    const genderData = demographicData.gender.map(item => item.count);
    
    currentY = await addChartToPDF(
      doc,
      createBarChartConfig(genderLabels, genderData),
      currentY,
      "Gender Distribution"
    );
  }

  // Location Distribution Chart
  if (demographicData.location.length > 0) {
    doc.addPage();
    currentY = 40;
    
    const locationLabels = demographicData.location.map(item => item.category);
    const locationData = demographicData.location.map(item => item.count);
    
    currentY = await addChartToPDF(
      doc,
      createBarChartConfig(locationLabels, locationData),
      currentY,
      "Location Distribution"
    );
  }

  // Employment Type Distribution Chart
  if (demographicData.employmentType.length > 0) {
    const employmentLabels = demographicData.employmentType.map(item => item.category);
    const employmentData = demographicData.employmentType.map(item => item.count);
    
    currentY = await addChartToPDF(
      doc,
      createPieChartConfig(employmentLabels, employmentData),
      currentY,
      "Employment Type Distribution"
    );
  }

  // Department Distribution Chart
  if (demographicData.sbu.length > 0) {
    doc.addPage();
    currentY = 40;
    
    const sbuLabels = demographicData.sbu.map(item => item.category);
    const sbuData = demographicData.sbu.map(item => item.count);
    
    currentY = await addChartToPDF(
      doc,
      createBarChartConfig(sbuLabels, sbuData),
      currentY,
      "Department Distribution"
    );
  }
}