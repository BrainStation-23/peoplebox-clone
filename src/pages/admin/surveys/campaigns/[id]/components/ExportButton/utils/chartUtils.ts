import jsPDF from "jspdf";
import { ChartConfiguration } from "chart.js";
import Chart from "chart.js/auto";

export async function generateChartImage(config: ChartConfiguration): Promise<string> {
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

export async function addChartToPDF(doc: jsPDF, chartConfig: ChartConfiguration, y: number, title?: string) {
  const imageData = await generateChartImage(chartConfig);
  
  if (title) {
    doc.setFontSize(12);
    doc.text(title, 20, y - 10);
  }
  
  doc.addImage(imageData, "PNG", 20, y, 170, 85);
  return y + 100; // Return the new Y position after the chart
}

export function createPieChartConfig(labels: string[], data: number[]): ChartConfiguration {
  return {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#4299E1",
          "#48BB78",
          "#F6AD55",
          "#F56565",
          "#9F7AEA",
        ],
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
}

export function createBarChartConfig(labels: string[], data: number[]): ChartConfiguration {
  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: "#4299E1",
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };
}