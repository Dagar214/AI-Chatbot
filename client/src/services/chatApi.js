import axios from "axios";

// In dev this falls back to localhost:5000. In production (once deployed),
// set VITE_API_BASE_URL in your hosting provider's env vars to your
// deployed backend URL, e.g. https://your-server.onrender.com/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Sends a message + conversation history to the backend and
 * returns the assistant's reply text.
 */
export async function sendMessage(message, history) {
  const response = await axios.post(`${API_BASE_URL}/chat`, {
    message,
    history,
  });
  return response.data.reply;
}