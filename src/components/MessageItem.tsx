/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { ChatMessage, Persona } from "../types";
import CodeBlock from "./CodeBlock";
import { Bot, User, CornerDownRight } from "lucide-react";

interface MessageItemProps {
  message: ChatMessage;
  persona: Persona;
}

export default function MessageItem({ message, persona }: MessageItemProps) {
  const isUser = message.role === "user";

  // Predefined persona Tailwind color mappings for theme consistency
  const themeColors: Record<string, { bg: string; text: string; border: string; accent: string }> = {
    indigo: { bg: "bg-indigo-50 text-indigo-900", text: "text-indigo-600", border: "border-indigo-100", accent: "bg-indigo-600 text-white hover:bg-indigo-700" },
    emerald: { bg: "bg-emerald-50 text-emerald-900", text: "text-emerald-600", border: "border-emerald-100", accent: "bg-emerald-600 text-white hover:bg-emerald-700" },
    amber: { bg: "bg-amber-50 text-amber-900", text: "text-amber-600", border: "border-amber-100", accent: "bg-amber-600 text-white hover:bg-amber-700" },
    rose: { bg: "bg-rose-50 text-rose-900", text: "text-rose-600", border: "border-rose-100", accent: "bg-rose-600 text-white hover:bg-rose-700" },
    sky: { bg: "bg-sky-50 text-sky-900", text: "text-sky-600", border: "border-sky-100", accent: "bg-sky-600 text-white hover:bg-sky-700" },
    violet: { bg: "bg-violet-50 text-violet-900", text: "text-violet-600", border: "border-violet-100", accent: "bg-violet-600 text-white hover:bg-violet-700" },
  };

  const activeTheme = themeColors[persona.themeColor] || themeColors.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full gap-3 py-4 md:gap-4 ${
        isUser ? "justify-end" : "justify-start border-b border-gray-50"
      }`}
      id={`msg-container-${message.id}`}
    >
      {/* Assistant Icon (Only on the left for model responses) */}
      {!isUser && (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-xs ${activeTheme.bg} ${activeTheme.border}`}
        >
          <Bot size={18} className={activeTheme.text} />
        </div>
      )}

      {/* Main Message Bubble */}
      <div className={`flex max-w-[85%] md:max-w-[75%] flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        {/* User Image Attachment View */}
        {isUser &&
          message.parts.map((part, index) => {
            if (part.inlineData) {
              return (
                <div key={index} className="relative mb-2 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-sm max-w-sm">
                  <img
                    src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                    alt="Uploaded attachment"
                    className="max-h-60 rounded-md object-contain"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                    <CornerDownRight size={10} />
                    <span>Image</span>
                  </div>
                </div>
              );
            }
            return null;
          })}

        {/* Text Body */}
        {isUser ? (
          // Simple, clean pill for user messages
          <div className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm text-white shadow-xs leading-relaxed break-words whitespace-pre-wrap">
            {message.parts.find(p => p.text)?.text || ""}
          </div>
        ) : (
          // Richly styled Markdown container for AI responses
          <div className="prose prose-sm max-w-full text-gray-800 leading-relaxed break-words">
            <ReactMarkdown
              components={{
                h1({ children }) {
                  return <h1 className="font-sans font-semibold tracking-tight text-gray-900 text-lg mt-4 mb-2">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="font-sans font-semibold tracking-tight text-gray-900 text-base mt-3.5 mb-1.5">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="font-sans font-medium tracking-tight text-gray-800 text-sm mt-3 mb-1">{children}</h3>;
                },
                p({ children }) {
                  return <p className="mb-3 text-sm leading-relaxed last:mb-0">{children}</p>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm">{children}</ol>;
                },
                ul({ children }) {
                  return <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">{children}</ul>;
                },
                li({ children }) {
                  return <li className="text-gray-700 pl-0.5">{children}</li>;
                },
                strong({ children }) {
                  return <strong className="font-semibold text-gray-900">{children}</strong>;
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="text-indigo-600 underline hover:text-indigo-800 font-medium break-all"
                    >
                      {children}
                    </a>
                  );
                },
                table({ children }) {
                  return (
                    <div className="my-4 overflow-x-auto rounded-lg border border-gray-100 shadow-2xs">
                      <table className="min-w-full divide-y divide-gray-200 text-left text-xs text-gray-700">
                        {children}
                      </table>
                    </div>
                  );
                },
                thead({ children }) {
                  return <thead className="bg-gray-50 text-gray-700 font-semibold">{children}</thead>;
                },
                tbody({ children }) {
                  return <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>;
                },
                tr({ children }) {
                  return <tr>{children}</tr>;
                },
                th({ children }) {
                  return <th className="px-3 py-2 font-medium tracking-wider uppercase border-b border-gray-100">{children}</th>;
                },
                td({ children }) {
                  return <td className="px-3 py-2 text-gray-600 whitespace-normal">{children}</td>;
                },
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeContent = String(children).replace(/\n$/, "");
                  const isInline = !match && !codeContent.includes("\n");

                  if (isInline) {
                    return (
                      <code
                        className="bg-gray-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs font-semibold"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <CodeBlock
                      language={match ? match[1] : "code"}
                      code={codeContent}
                    />
                  );
                },
              }}
            >
              {message.parts.find(p => p.text)?.text || ""}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp / Metainfo line */}
        <span className="font-sans text-[10px] text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* User Icon (Only on the right for user messages) */}
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 shadow-xs">
          <User size={18} className="text-indigo-600" />
        </div>
      )}
    </motion.div>
  );
}
