"use client";

import { useEffect, useState } from "react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore"; // adjust path if needed

type TokenType =
  | "KEYWORD"
  | "IDENTIFIER"
  | "NUMBER"
  | "STRING"
  | "OPERATOR"
  | "DELIMITER"
  | "WHITESPACE"
  | "COMMENT"
  | "PREPROCESSOR"
  | "UNKNOWN";

interface Token {
  type: TokenType;
  value: string;
}

const keywords = new Set([
  "int", "char", "float", "double", "return", "if", "else", "for", "while", "do", "break", "continue",
  "void", "struct", "switch", "case", "class", "public", "private", "protected", "template", "typename",
  "new", "delete", "this", "namespace", "using", "try", "catch", "throw", "const", "static", "virtual",
  "override", "operator", "sizeof", "inline"
]);

const operators = [
  "==", "!=", "<=", ">=", "++", "--", "->", "&&", "||", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=",
  "<<", ">>", "::", "+", "-", "*", "/", "%", "=", "<", ">", "!", "~", "&", "|", "^", "?", ":"
];

const delimiters = ["(", ")", "{", "}", ";", ",", "[", "]"];

function isLetter(char: string): boolean {
  return /[a-zA-Z_]/.test(char);
}

function isDigit(char: string): boolean {
  return /[0-9]/.test(char);
}

function isWhitespace(char: string): boolean {
  return /\s/.test(char);
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (isWhitespace(char)) {
      i++;
      continue;
    }

    if (char === "/" && input[i + 1] === "/") {
      while (i < input.length && input[i] !== "\n") i++;
      continue;
    }

    if (char === "/" && input[i + 1] === "*") {
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    if (char === "#") {
      let value = "";
      while (i < input.length && input[i] !== "\n") value += input[i++];
      tokens.push({ type: "PREPROCESSOR", value });
      continue;
    }

    if (char === '"') {
      let value = '"';
      i++;
      while (i < input.length && input[i] !== '"') {
        if (input[i] === "\\") value += input[i++];
        value += input[i++];
      }
      value += '"';
      i++;
      tokens.push({ type: "STRING", value });
      continue;
    }

    if (char === "'") {
      let value = "'";
      i++;
      while (i < input.length && input[i] !== "'") {
        if (input[i] === "\\") value += input[i++];
        value += input[i++];
      }
      value += "'";
      i++;
      tokens.push({ type: "STRING", value });
      continue;
    }

    if (isDigit(char)) {
      let value = "";
      while (i < input.length && /[0-9.]/.test(input[i])) value += input[i++];
      tokens.push({ type: "NUMBER", value });
      continue;
    }

    if (isLetter(char)) {
      let value = "";
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) value += input[i++];
      tokens.push({
        type: keywords.has(value) ? "KEYWORD" : "IDENTIFIER",
        value,
      });
      continue;
    }

    const opMatch = operators.find((op) => input.startsWith(op, i));
    if (opMatch) {
      tokens.push({ type: "OPERATOR", value: opMatch });
      i += opMatch.length;
      continue;
    }

    if (delimiters.includes(char)) {
      tokens.push({ type: "DELIMITER", value: char });
      i++;
      continue;
    }

    tokens.push({ type: "UNKNOWN", value: char });
    i++;
  }

  return tokens;
}

export default function CppLexer() {
  const editor = useCodeEditorStore((state) => state.editor); // ✅ Move it here

  useEffect(() => {
    if (!editor) return;

    const currentCode = editor.getValue();
    const tokens = tokenize(currentCode);
    const formattedOutput = tokens.map(t => `${t.type}: "${t.value}"`).join("\n");

    console.log(formattedOutput); // or pass to some output state/UI
  }, [editor]); // ✅ Depend on editor

  return null; // No visible UI, this just runs lexer logic
}

// export default function CppLexer() {
//   const getCode = useCodeEditorStore((s) => s.getCode);
//   const setLexerOutput = useCodeEditorStore((s) => s.setLexerOutput);

//   useEffect(() => {
//     const code = getCode(); // 👈 get latest code from Monaco editor
//     const tokens = tokenize(code); // 👈 your lexer function
//     const formattedOutput = tokens.map((t) => `${t.type}: "${t.value}"`).join("\n");

//     setLexerOutput(formattedOutput);
//   }, [getCode, setLexerOutput]);

//   return null;
// }

// export default function CppLexer() {
//   const getCode = useCodeEditorStore((s) => s.getCode);
//   // No need for setLexerOutput if you want to display inside this component.
  
//   // We'll use local state to store lexer output string
//   const [lexerOutput, setLexerOutput] = useState("");

//   useEffect(() => {
//     // Get latest code from the editor store
//     const code = getCode();

//     // Run lexer on the code
//     const tokens = tokenize(code);

//     // Format the output as string
//     const formattedOutput = tokens.map((t) => `${t.type}: "${t.value}"`).join("\n");

//     // Set the output state
//     setLexerOutput(formattedOutput);
//   }, [getCode]);

//   return (
//     <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "#1e1e1e", color: "#d4d4d4", padding: "1rem", borderRadius: "4px", maxHeight: "300px", overflowY: "auto" }}>
//       {lexerOutput || "No code to tokenize."}
//     </pre>
//   );
// }