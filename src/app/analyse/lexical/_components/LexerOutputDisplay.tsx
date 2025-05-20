// LexerOutputDisplay.tsx
"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";

export default function LexerOutputDisplay() {

  return (
    <div className="p-4 bg-gray-900 text-green-400 font-mono whitespace-pre-wrap">
      <h2 className="text-lg font-bold text-white mb-2">Lexer Output:</h2>
    </div>
  );
}
