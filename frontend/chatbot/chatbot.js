/* ================================================================
   MediQuick – AI Chatbot Widget Logic
   ================================================================ */

(function () {
  "use strict";

  // ── Config ─────────────────────────────────────────────────────
  const API_URL = "/api/chatbot/chat";

  const QUICK_SUGGESTIONS = [
    "What is Paracetamol?",
    "I have fever, what to take?",
    "Side effects of Ibuprofen?",
    "What is Azithromycin used for?",
  ];

  const WELCOME_MSG =
    "👋 Hi! I'm **MediBot**, your AI medical assistant.\n\nI can help you with:\n• Medicine details & dosages\n• Symptoms & what medicines to use\n• Drug interactions & side effects\n• First-aid guidance\n\nHow can I help you today?";

  // ── State ───────────────────────────────────────────────────────
  let chatHistory = []; // { role, text }
  let isOpen = false;
  let isLoading = false;

  // ── Inject DOM ──────────────────────────────────────────────────
  function injectHTML() {
    const html = `
      <!-- Floating Action Button -->
      <button id="medibot-fab" title="Ask MediBot" aria-label="Open AI Medical Assistant">
        <span class="fab-icon">💊</span>
      </button>

      <!-- Chat Window -->
      <div id="medibot-window" role="dialog" aria-label="MediBot Chat">
        <!-- Header -->
        <div class="medibot-header">
          <div class="medibot-avatar">🤖</div>
          <div class="medibot-header-info">
            <h4>MediBot <span class="medibot-online-dot"></span></h4>
            <p>AI Medical Assistant · Usually instant</p>
          </div>
          <button class="medibot-close-btn" id="medibot-close-btn" aria-label="Close chat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Messages -->
        <div class="medibot-messages" id="medibot-messages"></div>

        <!-- Quick Suggestions -->
        <div class="medibot-suggestions" id="medibot-suggestions"></div>

        <!-- Input -->
        <div class="medibot-input-row">
          <textarea
            id="medibot-input"
            placeholder="Ask about medicines, symptoms..."
            rows="1"
            maxlength="500"
            aria-label="Type your medical question"
          ></textarea>
          <button id="medibot-send-btn" title="Send" aria-label="Send message">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>

        <!-- Disclaimer -->
        <div class="medibot-disclaimer">
          For informational purposes only · Not a substitute for professional medical advice
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  // ── Inject Stylesheet ───────────────────────────────────────────
  function injectStyles() {
    // Check if already injected
    if (document.querySelector('link[data-medibot-css]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/chatbot/chatbot.css";
    link.setAttribute("data-medibot-css", "1");
    document.head.appendChild(link);
  }

  // ── Toggle Chat Window ──────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById("medibot-window");
    const fab = document.getElementById("medibot-fab");
    win.classList.toggle("open", isOpen);
    fab.classList.toggle("open", isOpen);

    if (isOpen) {
      renderSuggestions();
      setTimeout(() => {
        document.getElementById("medibot-input")?.focus();
        scrollToBottom();
      }, 300);
    }
  }

  // ── Render Welcome + Suggestions ────────────────────────────────
  function renderSuggestions() {
    const container = document.getElementById("medibot-suggestions");
    if (!container) return;
    const suggestionsVisible = chatHistory.length === 0;
    container.style.display = suggestionsVisible ? "flex" : "none";
    if (!suggestionsVisible) return;

    container.innerHTML = QUICK_SUGGESTIONS.map(
      (q) =>
        `<button class="suggestion-chip" onclick="window.__medibotSend(this.textContent)">${q}</button>`
    ).join("");
  }

  // ── Render a Single Message Bubble ──────────────────────────────
  function renderMessage(role, text) {
    const container = document.getElementById("medibot-messages");
    if (!container) return;

    const isBot = role === "model";
    const div = document.createElement("div");
    div.className = `medibot-msg ${isBot ? "bot-msg" : "user-msg"}`;

    // Convert simple markdown bold **text** → <strong>
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");

    div.innerHTML = `
      <div class="msg-avatar">${isBot ? "🤖" : "👤"}</div>
      <div class="msg-bubble">${formattedText}</div>
    `;
    container.appendChild(div);
    scrollToBottom();
  }

  // ── Show / Remove Typing Indicator ──────────────────────────────
  function showTyping() {
    const container = document.getElementById("medibot-messages");
    if (!container) return;
    const div = document.createElement("div");
    div.className = "medibot-msg bot-msg medibot-typing";
    div.id = "medibot-typing";
    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    container.appendChild(div);
    scrollToBottom();
  }

  function removeTyping() {
    document.getElementById("medibot-typing")?.remove();
  }

  // ── Scroll Messages to Bottom ────────────────────────────────────
  function scrollToBottom() {
    const container = document.getElementById("medibot-messages");
    if (container) container.scrollTop = container.scrollHeight;
  }

  // ── Send Message ─────────────────────────────────────────────────
  async function sendMessage(message) {
    message = message.trim();
    if (!message || isLoading) return;

    // Hide suggestions after first message
    const sugDiv = document.getElementById("medibot-suggestions");
    if (sugDiv) sugDiv.style.display = "none";

    // Render user bubble
    renderMessage("user", message);
    chatHistory.push({ role: "user", text: message });

    // Clear input
    const input = document.getElementById("medibot-input");
    if (input) {
      input.value = "";
      input.style.height = "auto";
    }

    // Disable send while loading
    isLoading = true;
    const sendBtn = document.getElementById("medibot-send-btn");
    if (sendBtn) sendBtn.disabled = true;

    showTyping();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: chatHistory.slice(0, -1), // send history without current message
        }),
      });

      removeTyping();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get response");
      }

      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't generate a response.";

      renderMessage("model", reply);
      chatHistory.push({ role: "model", text: reply });

      // Limit history size to avoid sending too much data
      if (chatHistory.length > 20) {
        chatHistory = chatHistory.slice(-20);
      }
    } catch (err) {
      removeTyping();
      const errorMsg =
        err.message === "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file."
          ? "⚠️ The AI assistant isn't configured yet. Please add your Gemini API key to the server's `.env` file."
          : "⚠️ Sorry, I couldn't connect right now. Please try again in a moment.";
      renderMessage("model", errorMsg);
    } finally {
      isLoading = false;
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  // ── Auto-resize Textarea ─────────────────────────────────────────
  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }

  // ── Initialize ───────────────────────────────────────────────────
  function init() {
    injectStyles();
    injectHTML();

    const fab = document.getElementById("medibot-fab");
    const closeBtn = document.getElementById("medibot-close-btn");
    const input = document.getElementById("medibot-input");
    const sendBtn = document.getElementById("medibot-send-btn");

    // Show welcome message on first open
    let welcomed = false;
    fab.addEventListener("click", () => {
      toggleChat();
      if (isOpen && !welcomed) {
        welcomed = true;
        setTimeout(() => renderMessage("model", WELCOME_MSG), 200);
      }
    });

    closeBtn.addEventListener("click", toggleChat);

    sendBtn.addEventListener("click", () => {
      sendMessage(input.value);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });

    input.addEventListener("input", () => autoResize(input));

    // Expose to global for suggestion chips
    window.__medibotSend = sendMessage;

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) toggleChat();
    });
  }

  // ── Boot ─────────────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
