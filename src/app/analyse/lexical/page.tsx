// "use client";

// import { useState, useEffect } from "react";
// import TokenTable from "../_components/TokenTable";
// import AnalyzeHeader from "../_components/Header";

// // Define the Token type
// type Token = {
//   type: string;
//   value: string;
// };

// // Simple C/C++ lexer logic
// function analyzeCode(code: string): Token[] {
//   const keywords = [
//     "int", "float", "char", "double", "return", "if", "else", "for", "while", "do", "switch", "case", "break",
//   ];
//   const operators = ["+", "-", "*", "/", "%", "=", "==", "!=", "<", "<=", ">", ">=", "&&", "||", "!", "++", "--"];
//   const delimiters = ["(", ")", "{", "}", "[", "]", ";", ","];

//   const tokens: Token[] = [];
//   const words = code.split(/(\s+|[()+\-*/%={};,<>!&|[\]])/).filter(Boolean);

//   for (const word of words) {
//     if (keywords.includes(word)) {
//       tokens.push({ type: "Keyword", value: word });
//     } else if (operators.includes(word)) {
//       tokens.push({ type: "Operator", value: word });
//     } else if (delimiters.includes(word)) {
//       tokens.push({ type: "Delimiter", value: word });
//     } else if (/^\d+$/.test(word)) {
//       tokens.push({ type: "Number", value: word });
//     } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word)) {
//       tokens.push({ type: "Identifier", value: word });
//     } else if (word.trim() !== "") {
//       tokens.push({ type: "Unknown", value: word });
//     }
//   }

//   return tokens;
// }

// export default function LexicalPage() {
//   const [code, setCode] = useState<string>("int main() {\n  return 0;\n}");
//   const [tokens, setTokens] = useState<Token[]>([]);

//   useEffect(() => {
//     const language = "cpp";
//     const savedCode = localStorage.getItem(`editor-code-${language}`);
//     if (savedCode) setCode(savedCode);
//   }, []);

//   function handleAnalyze() {
//     const result = analyzeCode(code);
//     setTokens(result);
//   }

//   return (
//     <div className="min-h-screen px-4 py-3 flex flex-col relative">
//       <AnalyzeHeader />

//       <header className="max-w-6xl mx-auto mb-10 flex items-center justify-center">
//         <h1 className="text-white text-4xl font-bold">Lexical Analysis</h1>
//       </header>

//       <main className="flex flex-col md:flex-row gap-10 flex-1 max-w-12xl mx-auto px-4 md:px-8 w-full">
//         <section className="w-full md:w-[66.666vw] flex flex-col bg-[#1e1e2e] rounded-xl px-6 p-8 border border-[#313244] shadow-lg min-h-[600px]">
//           <h2 className="text-white text-2xl font-semibold mb-6">Code Input</h2>
//           <textarea
//             spellCheck={false}
//             className="flex-grow bg-[#2a2a3a] text-gray-100 font-mono text-lg p-5 rounded-md border border-[#444a66] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             value={code}
//             onChange={e => setCode(e.target.value)}
//             rows={16}
//           />
//           <button
//             onClick={handleAnalyze}
//             className="mt-8 self-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-3 rounded-md font-semibold transition">
//             Analyze Lexically
//           </button>
//         </section>

//         <section className="w-full md:w-[33.333vw] flex flex-col bg-[#1e1e2e] rounded-xl px-6 p-8 border border-[#313244] shadow-lg overflow-auto min-h-[600px]">
//           <h2 className="text-white text-3xl font-semibold mb-6">Tokens</h2>
//           {tokens.length > 0 ? (
//             <TokenTable tokens={tokens} />
//           ) : (
//             <p className="text-gray-500 text-center mt-24">
//               No tokens to display. Enter code and analyze.
//             </p>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import TokenTable from "./_components/TokenTable";
import AnalyzeHeader from "./_components/Header";

type Token = {
  type: string;
  value: string;
};

// Lexer for multiple languages
function analyzeCode(code: string, language: string): Token[] {
  let keywords: string[] = [];
  const operators = ["+", "-", "*", "/", "%", "=", "==", "!=", "<", "<=", ">", ">=", "&&", "||", "!", "++", "--"];
  const delimiters = ["(", ")", "{", "}", "[", "]", ";", ",", ":", "."];

  if (language === "cpp" || language === "c") {
    keywords = ["int", "float", "char", "double", "return", "if", "else", "for", "while", "do", "switch", "case", "break"];
  } else if (language === "javascript") {
    keywords = ["var", "let", "const", "function", "return", "if", "else", "for", "while"];
  } else if (language === "python") {
    keywords = ["def", "return", "if", "else", "elif", "for", "while", "in", "import", "from"];
  }

  const tokens: Token[] = [];
  const words = code.split(/(\s+|[()+\-*/%={};,<>!&|[\].:])/).filter(Boolean);

  for (const word of words) {
    if (keywords.includes(word)) {
      tokens.push({ type: "Keyword", value: word });
    } else if (operators.includes(word)) {
      tokens.push({ type: "Operator", value: word });
    } else if (delimiters.includes(word)) {
      tokens.push({ type: "Delimiter", value: word });
    } else if (/^\d+$/.test(word)) {
      tokens.push({ type: "Number", value: word });
    } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word)) {
      tokens.push({ type: "Identifier", value: word });
    } else if (word.trim() !== "") {
      tokens.push({ type: "Unknown", value: word });
    }
  }

  return tokens;
}

export default function LexicalPage() {
  const [code, setCode] = useState<string>("int main() {\n  return 0;\n}");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [language, setLanguage] = useState<string>("cpp");

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    if (savedCode) setCode(savedCode);
  }, [language]);

  function handleAnalyze() {
    const result = analyzeCode(code, language);
    setTokens(result);
    localStorage.setItem(`editor-code-${language}`, code);
  }

  return (
    <div className="min-h-screen px-4 py-3 flex flex-col relative">
      <AnalyzeHeader />

      <header className="max-w-6xl mx-auto mb-10 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold">Lexical Analysis</h1>
      </header>

      <main className="flex flex-col md:flex-row gap-10 flex-1 max-w-12xl mx-auto px-4 md:px-8 w-full">
        <section className="w-full md:w-[66.666vw] flex flex-col bg-[#1e1e2e] rounded-xl px-6 p-8 border border-[#313244] shadow-lg min-h-[600px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl font-semibold">Code Input</h2>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="bg-[#2a2a3a] text-white border border-[#444a66] rounded px-3 py-1 text-base focus:outline-none">
              <option value="cpp">C/C++</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>

          <textarea
            spellCheck={false}
            className="flex-grow bg-[#2a2a3a] text-gray-100 font-mono text-lg p-5 rounded-md border border-[#444a66] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={code}
            onChange={e => setCode(e.target.value)}
            rows={16}
          />

          <button
            onClick={handleAnalyze}
            className="mt-6 self-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-3 rounded-md font-semibold transition">
            Analyze Lexically
          </button>

          {tokens.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white text-xl mb-2">Token Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {tokens.map((token, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded bg-blue-800 text-white text-sm font-mono"
                    title={token.type}>
                    {token.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="w-full md:w-[33.333vw] flex flex-col bg-[#1e1e2e] rounded-xl px-6 p-8 border border-[#313244] shadow-lg overflow-auto min-h-[600px]">
          <h2 className="text-white text-3xl font-semibold mb-6">Tokens</h2>
          {tokens.length > 0 ? (
            <TokenTable tokens={tokens} />
          ) : (
            <p className="text-gray-500 text-center mt-24">
              No tokens to display. Enter code and analyze.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
