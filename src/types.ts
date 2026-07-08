/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // Base64 representation without headers
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  parts: MessagePart[];
  timestamp: number;
}

export type PersonaId = "general" | "coder" | "writer" | "tutor" | "brainstormer" | "coach";

export interface Persona {
  id: PersonaId;
  name: string;
  tagline: string;
  iconName: string; // Lucide icon name mapping
  systemInstruction: string;
  promptStarters: string[];
  themeColor: string; // Tailwind accent color
}

export interface ChatThread {
  id: string;
  title: string;
  personaId: PersonaId;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
