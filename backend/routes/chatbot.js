const express = require("express");
const router = express.Router();

// ── Gemini REST endpoint (gemini-2.0-flash is the current free model) ─────────
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// ── Medical-only system prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are MediBot, a helpful medical assistant embedded inside MediQuick, 
a medicine delivery and healthcare platform. 

Your ONLY role is to help users with:
- Medicine information (uses, dosage, side effects, interactions, brand vs generic names)
- Symptoms and what medicines or home remedies to consider
- First-aid advice (fever, cold, headache, pain relief, etc.)
- Health conditions and when to see a doctor
- Prescription medicine guidance
- Vitamins, supplements, and nutritional advice
- Drug safety questions (e.g., can I take X with Y?)

If a user asks about anything NOT related to health, medicine, or medical topics, 
you must politely decline and say something like: 
"I'm MediBot, your medical assistant. I can only help with medicine and health-related questions. 
Please ask me about medicines, symptoms, or health conditions!"

Always add a disclaimer at the end of medical advice: 
"⚠️ This is general information only. Please consult a qualified doctor before taking any medicine."

Keep your answers friendly, clear, and easy to understand for everyday users.`;

// ── POST /api/chatbot/chat ────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      return res.status(503).json({
        error:
          "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.",
      });
    }

    // Build conversation history in Gemini format
    // history is an array of { role: "user"|"model", text: "..." }
    const contents = [];

    // Add conversation history
    for (const turn of history) {
      contents.push({
        role: turn.role,
        parts: [{ text: turn.text }],
      });
    }

    // Add the current message
    contents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    const payload = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Gemini API error:", errBody);
      return res.status(502).json({ error: "Failed to get response from AI." });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    res.json({ reply });
  } catch (err) {
    console.error("Chatbot route error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
