import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

const width = 600;
const height = 300;

const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
  width, 
  height,
  backgroundColour: 'white',
});

export async function generateChartImage(config: ChartConfiguration): Promise<string> {
  try {
    const image = await chartJSNodeCanvas.renderToDataURL(config);
    return image;
  } catch (error) {
    console.error('Error generating chart:', error);
    throw error;
  }
}

export function createPieChartConfig(labels: string[], data: number[], title: string): ChartConfiguration {
  return {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#4299E1',
          '#48BB78',
          '#F6AD55',
          '#F56565',
          '#9F7AEA',
          '#ED64A6',
        ],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#000000',
          },
        },
        title: {
          display: true,
          text: title,
          color: '#000000',
        },
      },
    },
  };
}

export function createBarChartConfig(labels: string[], data: number[], title: string): ChartConfiguration {
  return {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: '#4299E1',
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
          text: title,
          color: '#000000',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#000000',
          },
        },
        x: {
          ticks: {
            color: '#000000',
          },
        },
      },
    },
  };
}