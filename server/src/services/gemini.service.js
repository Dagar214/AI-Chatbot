import { GoogleGenAI } from "@google/genai";

// Created lazily (on first use) rather than at import time, so we don't
// read process.env.GEMINI_API_KEY before dotenv.config() has run.
let ai;
function getClient() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

/**
 * Sends the user's message to Gemini, along with prior conversation
 * history, and returns the model's reply as plain text.
 *
 * history format expected from the client:
 * [
 *   { role: "user", parts: [{ text: "hi" }] },
 *   { role: "model", parts: [{ text: "hello!" }] },
 *   ...
 * ]
 */
export async function getChatResponse(history = [], userMessage) {
  const chat = getClient().chats.create({
    model: "gemini-2.5-flash",
    history,
    config: {
      systemInstruction:
        "You are CampusAI, an AI chat assistant built by Dagar as a college project. " +
        "If asked your name, say you are CampusAI. If asked who built/developed/created you, " +
        "say you were built by Dagar (a BTech CSE AI/ML student) as a project, using React, " +
        "Node.js/Express, and the Gemini API. Don't mention Google, Gemini, or being a language " +
        "model trained by Google unless specifically asked what LLM powers you under the hood. " +
        "You can understand and reply in English, Hindi, Haryanvi, and Punjabi depending on " +
        "what language the user writes or speaks in.",
    },
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
}
