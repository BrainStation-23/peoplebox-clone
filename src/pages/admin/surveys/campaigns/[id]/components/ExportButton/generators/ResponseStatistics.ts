import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FONTS, TABLE_STYLES, PAGE_SETTINGS } from "../utils/pdfStyles";
import { createPieChartConfig, createBarChartConfig, addChartToPDF } from "../utils/chartUtils";
import type { ResponseStatistics, DemographicData } from "../types";
import Chart from "chart.js/auto";

async function generateChartImage(config: any): Promise<string> {
  // Create a hidden canvas
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 300;
  document.body.appendChild(canvas);

  // Create and render the chart
  const chart = new Chart(canvas, config);
  const imageData = canvas.toDataURL("image/png");

  // Clean up
  chart.destroy();
  document.body.removeChild(canvas);

  return imageData;
}

export async function generateResponseStatistics(
  doc: jsPDF,
  statistics: ResponseStatistics,
  demographicData: DemographicData
) {
  doc.addPage();
  doc.setFontSize(FONTS.heading.size);
  doc.text("Response Statistics", PAGE_SETTINGS.margin, 20);

  let currentY = 40;

  // Status Distribution Chart
  const statusLabels = ["Completed", "Pending"];
  const statusData = [
    statistics.statusDistribution.completed,
    statistics.statusDistribution.pending,
  ];
  
  const statusChartConfig = {
    type: "pie",
    data: {
      labels: statusLabels,
      datasets: [{
        data: statusData,
        backgroundColor: ["#22c55e", "#ef4444"],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
        },
      },
    },
  };

  const statusChartImage = await generateChartImage(statusChartConfig);
  doc.addImage(statusChartImage, "PNG", 20, currentY, 170, 85);
  currentY += 100;

  // Gender Distribution
  if (demographicData.gender.length > 0) {
    const genderLabels = demographicData.gender.map(item => item.category);
    const genderData = demographicData.gender.map(item => item.count);
    
    const genderChartConfig = {
      type: "bar",
      data: {
        labels: genderLabels,
        datasets: [{
          data: genderData,
          backgroundColor: "#4299E1",
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Gender Distribution",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    const genderChartImage = await generateChartImage(genderChartConfig);
    doc.addImage(genderChartImage, "PNG", 20, currentY, 170, 85);
    currentY += 100;
  }

  // Location Distribution
  if (demographicData.location.length > 0) {
    if (currentY > 700) {  // Check if we need a new page
      doc.addPage();
      currentY = 40;
    }
    
    const locationLabels = demographicData.location.map(item => item.category);
    const locationData = demographicData.location.map(item => item.count);
    
    const locationChartConfig = {
      type: "bar",
      data: {
        labels: locationLabels,
        datasets: [{
          data: locationData,
          backgroundColor: "#48BB78",
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Location Distribution",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

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
    
    const employmentChartConfig = {
      type: "pie",
      data: {
        labels: employmentLabels,
        datasets: [{
          data: employmentData,
          backgroundColor: ["#4299E1", "#48BB78", "#F6AD55", "#F56565", "#9F7AEA"],
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          title: {
            display: true,
            text: "Employment Type Distribution",
          },
        },
      },
    };

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
    
    const sbuChartConfig = {
      type: "bar",
      data: {
        labels: sbuLabels,
        datasets: [{
          data: sbuData,
          backgroundColor: "#9F7AEA",
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Department Distribution",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    const sbuChartImage = await generateChartImage(sbuChartConfig);
    doc.addImage(sbuChartImage, "PNG", 20, currentY, 170, 85);
  }
}