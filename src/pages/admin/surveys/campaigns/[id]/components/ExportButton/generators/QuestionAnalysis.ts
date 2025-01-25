import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { FONTS, TABLE_STYLES, PAGE_SETTINGS } from "../utils/pdfStyles";
import type { Question, ResponseData } from "../types";

export async function generateQuestionAnalysis(
  doc: jsPDF,
  questions: Question[],
  responses: ResponseData[]
) {
  doc.addPage();
  doc.setFontSize(FONTS.heading.size);
  doc.text("Question Analysis", PAGE_SETTINGS.margin, 20);

  let currentY = 40;

  questions.forEach((question, index) => {
    // Check if we need a new page
    if (currentY > doc.internal.pageSize.height - 100) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(FONTS.subheading.size);
    doc.text(`${index + 1}. ${question.title}`, PAGE_SETTINGS.margin, currentY);
    currentY += 10;

    const questionData = processQuestionResponses(question, responses);
    
    if (question.type === "boolean") {
      generateBooleanAnalysis(doc, questionData, currentY);
      currentY += 60;
    } else if (question.type === "rating" || question.type === "nps") {
      generateRatingAnalysis(doc, questionData, currentY);
      currentY += 80;
    } else if (question.type === "text" || question.type === "comment") {
      generateTextAnalysis(doc, questionData as string[], currentY);
      currentY += 100;
    }

    currentY += 20; // Add spacing between questions
  });
}

function processQuestionResponses(question: Question, responses: ResponseData[]) {
  const answers = responses.map(r => r.answers[question.name]?.answer);
  
  switch (question.type) {
    case "boolean":
      return {
        "Yes": answers.filter(a => a === true).length,
        "No": answers.filter(a => a === false).length
      };
    
    case "rating":
    case "nps":
      const ratings = new Array(11).fill(0);
      answers.forEach(rating => {
        if (typeof rating === "number" && rating >= 0 && rating <= 10) {
          ratings[rating]++;
        }
      });
      return ratings;
    
    case "text":
    case "comment":
      return answers.filter(a => typeof a === "string" && a.trim() !== "");
    
    default:
      return [];
  }
}

function generateBooleanAnalysis(doc: jsPDF, data: Record<string, number>, startY: number) {
  const tableData = Object.entries(data).map(([response, count]) => [
    response,
    count.toString(),
    `${((count / Object.values(data).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`
  ]);

  autoTable(doc, {
    ...TABLE_STYLES,
    startY,
    head: [["Response", "Count", "Percentage"]],
    body: tableData,
  });
}

function generateRatingAnalysis(doc: jsPDF, data: number[], startY: number) {
  const total = data.reduce((a, b) => a + b, 0);
  const tableData = data.map((count, rating) => [
    rating.toString(),
    count.toString(),
    `${((count / total) * 100).toFixed(1)}%`
  ]);

  autoTable(doc, {
    ...TABLE_STYLES,
    startY,
    head: [["Rating", "Count", "Percentage"]],
    body: tableData,
  });
}

function generateTextAnalysis(doc: jsPDF, responses: string[], startY: number) {
  // Show response count and sample responses
  doc.setFontSize(FONTS.body.size);
  doc.text(`Total Responses: ${responses.length}`, PAGE_SETTINGS.margin, startY);

  const sampleResponses = responses.slice(0, 3);
  if (sampleResponses.length > 0) {
    doc.text("Sample Responses:", PAGE_SETTINGS.margin, startY + 10);
    sampleResponses.forEach((response, index) => {
      const truncatedResponse = response.length > 100 
        ? response.substring(0, 97) + "..."
        : response;
      doc.text(`${index + 1}. ${truncatedResponse}`, 
        PAGE_SETTINGS.margin + 10, 
        startY + 20 + (index * 10)
      );
    });
  }
}