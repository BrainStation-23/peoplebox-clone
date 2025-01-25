import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ResponseStatistics, DemographicData } from "../types";
import { generateChartImage, createPieChartConfig, createBarChartConfig } from "../utils/chartGenerator";

export async function generateResponseStatistics(
  doc: jsPDF,
  statistics: ResponseStatistics,
  demographicData: DemographicData
) {
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Response Statistics", 20, 20);

  let currentY = 40;

  // Status Distribution Chart
  const statusLabels = ["Completed", "Pending"];
  const statusData = [
    statistics.statusDistribution.completed,
    statistics.statusDistribution.pending,
  ];
  
  const statusChartConfig = createPieChartConfig(
    statusLabels, 
    statusData, 
    "Response Status Distribution"
  );

  try {
    const statusChartImage = await generateChartImage(statusChartConfig);
    doc.addImage(statusChartImage, "PNG", 20, currentY, 170, 85);
    currentY += 100;

    // Gender Distribution
    if (demographicData.gender.length > 0) {
      const genderLabels = demographicData.gender.map(item => item.category);
      const genderData = demographicData.gender.map(item => item.count);
      
      const genderChartConfig = createBarChartConfig(
        genderLabels,
        genderData,
        "Gender Distribution"
      );

      const genderChartImage = await generateChartImage(genderChartConfig);
      
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 40;
      }
      
      doc.addImage(genderChartImage, "PNG", 20, currentY, 170, 85);
      currentY += 100;
    }

    // Location Distribution
    if (demographicData.location.length > 0) {
      if (currentY > 700) {
        doc.addPage();
        currentY = 40;
      }
      
      const locationLabels = demographicData.location.map(item => item.category);
      const locationData = demographicData.location.map(item => item.count);
      
      const locationChartConfig = createBarChartConfig(
        locationLabels,
        locationData,
        "Location Distribution"
      );

      const locationChartImage = await generateChartImage(locationChartConfig);
      doc.addImage(locationChartImage, "PNG", 20, currentY, 170, 85);
      currentY += 100;
    }

    // Employment Type Distribution
    if (demographicData.employmentType.length > 0) {
      if (currentY > 700) {
        doc.addPage();
        currentY = 40;
      }

      const employmentLabels = demographicData.employmentType.map(item => item.category);
      const employmentData = demographicData.employmentType.map(item => item.count);
      
      const employmentChartConfig = createPieChartConfig(
        employmentLabels,
        employmentData,
        "Employment Type Distribution"
      );

      const employmentChartImage = await generateChartImage(employmentChartConfig);
      doc.addImage(employmentChartImage, "PNG", 20, currentY, 170, 85);
      currentY += 100;
    }

    // Department (SBU) Distribution
    if (demographicData.sbu.length > 0) {
      if (currentY > 700) {
        doc.addPage();
        currentY = 40;
      }
      
      const sbuLabels = demographicData.sbu.map(item => item.category);
      const sbuData = demographicData.sbu.map(item => item.count);
      
      const sbuChartConfig = createBarChartConfig(
        sbuLabels,
        sbuData,
        "Department Distribution"
      );

      const sbuChartImage = await generateChartImage(sbuChartConfig);
      doc.addImage(sbuChartImage, "PNG", 20, currentY, 170, 85);
    }
  } catch (error) {
    console.error('Error generating charts:', error);
    // Add a text note in the PDF if chart generation fails
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("Error generating charts. Please check the console for details.", 20, currentY);
  }
}