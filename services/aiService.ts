import { GoogleGenAI } from "@google/genai";
import type { PlanResults } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getAiFinancialAdvice(planResults: PlanResults, userQuestion: string): Promise<string> {
    const { sheets } = planResults;

    const inputs = sheets.find(s => s.sheetName === 'Inputs_Summary')?.data;
    const sip = sheets.find(s => s.sheetName === 'SIP_Plan')?.data;
    const expenses = sheets.find(s => s.sheetName === 'Expenses')?.data;
    const recommendations = sheets.find(s => s.sheetName === 'Recommendations')?.data;

    const summaryParts: string[] = [];
    if (inputs) summaryParts.push(`- Key Inputs: ${inputs.slice(1).map(row => `${row[0]}: ${row[1]}`).join(', ')}`);
    if (expenses) summaryParts.push(`- Total Monthly Expenses: ${expenses[expenses.length - 1][1]}`);
    if (sip) {
        const surplus = sip.find(row => row[0] === 'Available Monthly Surplus')?.[1] || 'N/A';
        const requiredSip = sip.find(row => row[0] === 'Required Monthly SIP')?.[1] || 'N/A';
        const goal = sip.find(row => row[0] === 'Passive Monthly Target')?.[1] || 'N/A';
        const corpusNeeded = sip.find(row => row[0] === 'Corpus Needed for Goal')?.[1] || 'N/A';
        summaryParts.push(`- Financial Goal: Achieve passive income of ${goal}.`);
        summaryParts.push(`- Goal Details: Requires a corpus of ${corpusNeeded}.`);
        summaryParts.push(`- Cash Flow: Monthly Surplus is ${surplus}. Required Monthly SIP for goal is ${requiredSip}.`);
    }
    if (recommendations) {
        summaryParts.push(`- Generated Recommendations:\n${recommendations.slice(1).map(row => `  - ${row[0]}`).join('\n')}`);
    }
    const planSummary = summaryParts.join('\n');

    const prompt = `
User's Financial Plan Summary:
---
${planSummary}
---

User's Question: "${userQuestion}"
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful and supportive AI financial assistant for users in India. Your name is 'FinPal'. Analyze the user's financial plan summary provided and answer their specific question. Provide actionable, concise, and encouraging advice. Do not give generic financial advice that ignores the user's data. Format your response for clarity, using markdown-style lists with '*' for bullet points and bolding with '**' for emphasis.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I encountered an error while analyzing your plan. Please try again later.";
    }
}
