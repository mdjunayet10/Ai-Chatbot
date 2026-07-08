import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Prefer local developer overrides, then fallback to default .env.
dotenv.config({ path: ".env.local", override: true });
dotenv.config();

function resolveGeminiApiKey(): string | null {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  ];

  for (const candidate of candidates) {
    const key = candidate?.trim();
    if (key) {
      return key;
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support JSON parsing with a high limit for multimodal base64 image chat inputs
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Lazy initialize Gemini API client to ensure clean failure reporting if the API Key is not set
  let ai: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!ai) {
      const apiKey = resolveGeminiApiKey();
      if (!apiKey) {
        throw new Error(
          "Gemini API key is missing. Set GEMINI_API_KEY (or GOOGLE_API_KEY) in .env.local or your shell environment."
        );
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  }

  // Health-check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Chat completion endpoint using gemini-3.5-flash
  app.post("/api/chat", async (req, res) => {
    try {
      const { contents, systemInstruction } = req.body;

      if (!contents || !Array.isArray(contents)) {
        return res.status(400).json({ error: "Invalid request payload. 'contents' array is required." });
      }

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
        },
      });

      // Extract generated text content safely using .text property
      const generatedText = response.text || "No response text was generated.";
      res.json({ text: generatedText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred with Gemini." });
    }
  });

  // Integrate Vite dev server or serve production build
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    if (!resolveGeminiApiKey()) {
      console.warn("[startup] Gemini API key is not set. Add GEMINI_API_KEY to .env.local before sending chat messages.");
    }
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start fullstack server:", err);
});
