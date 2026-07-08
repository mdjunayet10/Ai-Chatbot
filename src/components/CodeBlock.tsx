/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-200 shadow-xs">
      {/* Code Block Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 font-mono text-xs text-gray-600">
        <span className="uppercase tracking-wider">{language || "code"}</span>
        <button
          onClick={handleCopy}
          id={`btn-copy-${language}-${Math.floor(Math.random() * 1000)}`}
          className="flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span className="text-emerald-600 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Block Body */}
      <div className="overflow-x-auto bg-gray-950 p-4 text-left">
        <pre className="font-mono text-sm leading-relaxed text-gray-100 selection:bg-gray-700 selection:text-white">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
