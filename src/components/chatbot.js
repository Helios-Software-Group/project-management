"use client";

import { useState, useRef, useEffect } from "react";
import { processQuery } from "../lib/chat-engine";

export default function Chatbot({ parishes, mvpCategories, stories }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: 'Ask me anything about the rollout or MVP progress. Try "summary" or "compare categories".',
      suggestions: ["Summary", "What's blocked?", "Compare categories"],
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = (text) => {
    const query = (text || input).trim();
    if (!query) return;

    const userMsg = { role: "user", text: query };
    const response = processQuery(query, {
      parishes,
      mvpCategories,
      stories,
    });
    const botMsg = { role: "bot", ...response };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const latestSuggestions =
    [...messages].reverse().find((m) => m.suggestions)?.suggestions || [];

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open dashboard assistant"}
      >
        {open ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="chat-panel"
          role="dialog"
          aria-label="Dashboard assistant"
        >
          <div className="chat-header">
            <span className="chat-title">Dashboard Assistant</span>
            <button
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {latestSuggestions.length > 0 && (
            <div className="chat-suggestions">
              {latestSuggestions.map((s, i) => (
                <button
                  key={i}
                  className="chat-suggestion"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Ask a question
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              className="chat-input"
              type="text"
              placeholder="Ask about the data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="chat-send"
              disabled={!input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
