import { GoogleGenAI } from '@google/genai';
import { incomeService, expenseService, budgetService } from './financeService';

// Initialize the Gemini SDK
// Note: In a real production app, it is highly recommended to call Gemini from your backend securely.
// Since we have no node backend setup (only Supabase), we are calling it from the client
// but restricting it from being exposed by relying on environment variables.
const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
});

export const aiService = {
    /**
     * Main function to handle the chat input from the user.
     * Fetches context about their finances before asking Gemini.
     */
    askFinancialAssistant: async (userId, userQuery) => {
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            return "⚠️ The Gemini API key (VITE_GEMINI_API_KEY) is not set in your .env file. Please add it to talk to the assistant.";
        }

        try {
            // 1. Fetch the user's financial context
            // Fetching all data might be too heavy for a prompt eventually, 
            // but for a lightweight personal finance app, it's usually okay.
            const [incomeRes, expenseRes] = await Promise.all([
                incomeService.getAll(userId),
                expenseService.getAll(userId),
            ]);

            const incomes = incomeRes.data || [];
            const expenses = expenseRes.data || [];

            // Calculate some quick summaries
            const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
            const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

            // Get the current month's budget to give context on limits
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const { data: budget } = await budgetService.getByMonth(userId, currentMonthStr);

            // Create a contextual payload
            const contextData = {
                totalIncome: totalIncome,
                totalExpenses: totalExpense,
                netBalance: totalIncome - totalExpense,
                currentMonthlyBudgetLimit: budget?.monthly_limit || 0,
                recentExpenses: expenses.slice(0, 10).map(e => ({ amount: e.amount, category: e.category, date: e.date })),
                recentIncomes: incomes.slice(0, 5).map(i => ({ amount: i.amount, source: i.source, date: i.date }))
            };

            // 2. Build the prompt
            const systemInstruction = `
        You are "Aura", a highly intelligent, empathetic, and professional financial assistant inside the 'Aura Finance' personal finance app.
        Your goal is to help the user understand their finances, give advice, and answer questions based strictly on their data.
        
        Here is the user's current financial data context:
        ${JSON.stringify(contextData, null, 2)}
        
        Guidelines:
        1. Keep responses concise, friendly, and easy to read (use emojis sparingly but effectively).
        2. Format currencies with the ₹ symbol unless specified otherwise.
        3. Only use the provided data to answer specific questions about their spending/income. 
        4. If they ask a general financial question, answer it using best practices.
        5. Do NOT make up transaction data that isn't provided in the context. If you don't know, say "I don't have enough data to see that."
        6. Do not output markdown code blocks unless absolutely necessary, use simple bolding for emphasis.
      `;

            // 3. Call the Gemini API using the new `@google/genai` SDK pattern
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userQuery,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                }
            });

            return response.text;
        } catch (error) {
            console.error("AI Service Error:", error);
            return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
        }
    }
};
