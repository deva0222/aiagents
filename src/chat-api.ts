import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

export const chatRouter = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

chatRouter.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Construct conversation history for context
    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });
    }
    
    // Add the current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents,
      config: {
        systemInstruction: `You are an elite AI Solutions Architect & Technical Advisor for 'AI Agents & Web Solutions'. 
Your goal is to consult clients on our 10 core services: AI Agents & AI Automation, Website Development, E-Commerce Development, Mobile App Development, Custom Software Development, UI/UX Design, API & Third-Party Integrations, SEO & Digital Growth, Cloud, Hosting & Deployment, Maintenance & Technical Support.

Guidelines:
- Exhibit deep technical expertise and strategic business acumen.
- Provide actionable, consultative advice tailored to the user's specific business needs or challenges.
- When users ask about AI, explain how custom RAG pipelines, autonomous agents, and process automation can directly reduce operational costs or increase revenue.
- If a user mentions a generic problem (e.g., "I need a website"), ask clarifying questions about their target audience or suggest a comprehensive approach (e.g., Website + SEO + Automation).
- Do NOT sound like a basic generic bot. Sound like a senior Silicon Valley tech consultant.
- Be concise but highly impactful. Do not use heavy markdown formatting. Keep responses scannable.
- Always gently guide the user towards submitting a project request for the most relevant service when appropriate.`,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});
