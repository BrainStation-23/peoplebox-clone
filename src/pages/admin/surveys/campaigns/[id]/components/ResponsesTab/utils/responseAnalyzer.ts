import type { Json } from "@/integrations/supabase/types";
import type { 
  QuestionType, 
  SurveyQuestion, 
  ProcessedResponse, 
  QuestionAnalysis,
  QuestionSummary 
} from "../types/reports";

export function detectQuestionType(question: any): QuestionType {
  // Special case for NPS questions
  if (
    question.type === "rating" && 
    question.rateMax === 10 && 
    question.rateMin === 0
  ) {
    return "nps";
  }
  
  // Standard question types
  if ([
    "radiogroup",
    "checkbox",
    "rating",
    "text",
    "matrix",
    "numeric"
  ].includes(question.type)) {
    return question.type as QuestionType;
  }
  
  return "text"; // Default fallback
}

export function processResponses(
  surveyQuestions: Record<string, any>,
  responses: Array<{ response_data: Record<string, Json>; user_id: string; submitted_at: string }>
): QuestionAnalysis[] {
  const questions = Object.entries(surveyQuestions.questions || {}).map(
    ([name, q]: [string, any]) => ({
      name,
      title: q.title,
      type: detectQuestionType(q),
      choices: q.choices,
      rows: q.rows,
      columns: q.columns,
    })
  );

  return questions.map((question) => {
    const processedResponses: ProcessedResponse[] = responses.map((response) => ({
      questionId: question.name,
      answer: response.response_data[question.name],
      respondentId: response.user_id,
      submittedAt: response.submitted_at,
    }));

    return {
      question,
      responses: processedResponses,
      summary: calculateSummary(question, processedResponses),
    };
  });
}

function calculateSummary(
  question: SurveyQuestion,
  responses: ProcessedResponse[]
): QuestionSummary {
  const summary: QuestionSummary = {
    totalResponses: responses.length,
  };

  switch (question.type) {
    case "radiogroup":
    case "checkbox":
      question.choices?.forEach((choice) => {
        summary[choice] = responses.filter((r) => {
          if (Array.isArray(r.answer)) {
            return r.answer.includes(choice);
          }
          return r.answer === choice;
        }).length;
      });
      break;

    case "nps":
      const scores = responses
        .map((r) => Number(r.answer))
        .filter((n) => !isNaN(n));
      
      const promoters = scores.filter((s) => s >= 9).length;
      const passives = scores.filter((s) => s >= 7 && s <= 8).length;
      const detractors = scores.filter((s) => s <= 6).length;
      
      summary.promoters = promoters;
      summary.passives = passives;
      summary.detractors = detractors;
      summary.npsScore = Math.round(
        ((promoters - detractors) / scores.length) * 100
      );
      break;

    case "rating":
      const ratings = responses
        .map((r) => Number(r.answer))
        .filter((n) => !isNaN(n));
      summary.average = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;
      break;

    case "numeric":
      const numbers = responses
        .map((r) => Number(r.answer))
        .filter((n) => !isNaN(n));
      summary.average = numbers.reduce((a, b) => a + b, 0) / numbers.length || 0;
      summary.min = Math.min(...numbers);
      summary.max = Math.max(...numbers);
      break;

    case "matrix":
      const matrixResponses: Record<string, Record<string, number>> = {};
      question.rows?.forEach((row) => {
        matrixResponses[row] = {};
        question.columns?.forEach((col) => {
          matrixResponses[row][col] = 0;
        });
      });

      responses.forEach((r) => {
        if (typeof r.answer === 'object' && r.answer !== null) {
          Object.entries(r.answer as Record<string, string>).forEach(([row, col]) => {
            if (matrixResponses[row]) {
              matrixResponses[row][col as string] = (matrixResponses[row][col as string] || 0) + 1;
            }
          });
        }
      });
      summary.matrixData = matrixResponses;
      break;
  }

  return summary;
}