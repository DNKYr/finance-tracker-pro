
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Transaction } from '../types';

// This assumes process.env.API_KEY is set in the execution environment.
// Do NOT add UI or prompts for API key.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
  // Potentially throw an error or disable AI features if not handled gracefully elsewhere
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Non-null assertion, assuming it's configured

const generatePrompt = (statementText: string): string => {
  return `
You are an expert financial assistant. Analyze the following text extracted from a bank or credit card statement and extract all financial transactions.
For each transaction, provide:
1.  date: The date of the transaction in YYYY-MM-DD format. Infer the year from the statement period if explicitly mentioned (e.g., "STATEMENT FROM MMM DD TO MMM DD, YYYY" or similar phrases like "Period Ending YYYY-MM-DD"). If only month and day are present for a transaction, use the inferred year. If no year can be inferred from the statement text, use the current year.
2.  description: A concise description of the transaction. Ensure this string value is valid JSON: any double quotes (") within the description must be escaped as \\", any backslashes (\\) as \\\\, and newlines as \\n.
3.  category: A relevant category for the transaction (e.g., Groceries, Transportation, Utilities, Dining Out, Shopping, Travel, Health, Entertainment, Services, Credit Card Payment, Salary, Investment, Refund, Other). If unsure, use "Other". This should also be a valid JSON string, following the same escaping rules as the description.
4.  amount: The transaction amount as a positive number (e.g., 123.45). Do not include currency symbols or commas. This must be a JSON number, not a string.
5.  type: The type of transaction, either "income" or "expense". This must be one of the literal strings "income" or "expense" enclosed in double quotes.

    *   For credit card statements:
        *   Regular purchases are "expense".
        *   Payments made TO the credit card (reducing the balance owed, often indicated by descriptions like "PAYMENT THANK YOU", "AUTOMATIC PAYMENT", or negative amounts in the original statement if amounts are signed) should be "income" with a category like "Credit Card Payment".
        *   Refunds or credits from merchants (e.g., "REFUND xyz") should be "income".
        *   Cash advances are "expense".
    *   For bank account statements:
        *   Deposits or incoming transfers are "income".
        *   Withdrawals, payments, or outgoing transfers are "expense".

Return the result STRICTLY as a JSON array of objects. Each object should represent a transaction.
The JSON object structure must be: { "date": "YYYY-MM-DD", "description": "string", "category": "string", "amount": number, "type": "income" | "expense" }

Example of expected JSON output format:
[
  { "date": "2024-07-15", "description": "GROCERY STORE PURCHASE", "category": "Groceries", "amount": 55.25, "type": "expense" },
  { "date": "2024-07-16", "description": "ONLINE PAYMENT RECEIVED", "category": "Salary", "amount": 1200.00, "type": "income" },
  { "date": "2024-07-17", "description": "AUTOMATIC PAYMENT - THANK YOU", "category": "Credit Card Payment", "amount": 250.00, "type": "income" }
]

If no transactions can be reliably extracted, or if the text does not appear to be a financial statement, return an empty JSON array [].
Do not include any explanations, comments, or any text outside of the JSON array itself.
Ensure the entire output is a single, valid JSON array string.

Statement Text:
---
${statementText}
---
`;
};

export const extractTransactionsFromPdfText = async (pdfText: string): Promise<Omit<Transaction, 'id'>[]> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. AI processing is unavailable.");
  }
  
  const model = "gemini-2.5-flash-preview-04-17"; // Correct model
  const prompt = generatePrompt(pdfText);
  let jsonStr: string = ''; // Declare jsonStr here to make it accessible in catch block

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Omit thinkingConfig to use default (enabled) for higher quality.
      }
    });

    jsonStr = response.text; // Assign raw text first
    jsonStr = jsonStr.trim(); // Trim the raw text
    
    // Remove markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim(); // Trim the extracted content itself
    }

    const parsedData = JSON.parse(jsonStr);

    if (!Array.isArray(parsedData)) {
      console.error("Gemini response is not a JSON array:", parsedData);
      throw new Error("AI failed to return a valid list of transactions. The format was incorrect.");
    }
    
    // Validate basic structure of transactions
    const validTransactions: Omit<Transaction, 'id'>[] = [];
    for (const item of parsedData) {
      if (
        typeof item.date === 'string' &&
        typeof item.description === 'string' &&
        typeof item.category === 'string' &&
        typeof item.amount === 'number' && item.amount > 0 && // Amount should be positive as per prompt
        (item.type === 'income' || item.type === 'expense') &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date) // Basic date format check
      ) {
        validTransactions.push({
          date: item.date,
          description: item.description,
          category: item.category,
          amount: item.amount,
          type: item.type,
        });
      } else {
        console.warn("Skipping invalid transaction item from AI:", item);
      }
    }
    return validTransactions;

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    // Log the problematic JSON string for easier debugging if parsing failed
    if (error instanceof SyntaxError) { // Specifically if it's a JSON parsing error
        console.error("Problematic JSON string received from AI:", jsonStr); // Use jsonStr here
    }
    if (error instanceof Error) {
        throw new Error(`AI processing failed: ${error.message}. Please check the console for more details or try manual input.`);
    }
    throw new Error("An unknown error occurred during AI processing.");
  }
};
