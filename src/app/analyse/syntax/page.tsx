"use client";

import { useEffect, useState } from "react";
import { analyzeCode } from "../lexical/_components/lexicalAnalyzer";
import {
  syntaxAnalyze,
  Token as SyntaxToken,
  ParseNode,
} from "./_components/tree";
import { Token } from "./_components/tree";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import Tree from "react-d3-tree";
import Header from "./_components/Header";

export default function SyntaxPage() {
  const language = useCodeEditorStore(state => state.language);
  const [tokens, setTokens] = useState<SyntaxToken[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [parseTree, setParseTree] = useState<ParseNode | null>(null);

  const placeholderCode = `x = 3;
y = 5;
ans = 0;
if (x < y) {
  ans = x;
} else {
  ans = x;
}
while (x < 10) {
  x = x + 1;
}`;

  const [code, setCode] = useState(placeholderCode);


  // useEffect(() => {
  //   const saved = localStorage.getItem(`editor-code-${language}`);
  //   if (saved) setCode(saved);
  // }, [language]);

  const handleAnalyze = () => {
    const lexicalTokens = analyzeCode(code, language);

    const syntaxTokens: SyntaxToken[] = lexicalTokens.map(tokenObj => ({
      token: tokenObj.token,
      type: tokenObj.type as SyntaxToken["type"],
      value: tokenObj.token,
    }));

    const result = syntaxAnalyze(syntaxTokens);

    setTokens(syntaxTokens);
    setErrors(result.errors);
    setParseTree(result.root);
  };

  const convertToTreeData = (node: ParseNode): any => ({
    name: node.label,
    children: (node.children || []).filter(Boolean).map(convertToTreeData),
  });

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col bg-[#12121f] text-white font-sans">
      <Header />

      <main className="flex flex-col md:flex-row gap-12 max-w-7xl mx-auto w-full">
        {/* Left pane: Code input on top, Parse tree below */}
        <section className="flex flex-col w-full md:w-2/3 gap-8">
          <div className="bg-[#1f213a] rounded-xl p-8 border border-[#2f3051] shadow-lg min-h-[320px] flex flex-col">
            <h2 className="text-3xl font-semibold mb-6 text-indigo-300">
              Code Input
            </h2>
            <textarea
              spellCheck={false}
              className="flex-grow bg-[#16172d] text-white font-mono text-lg p-6 rounded-md border border-[#3c3f62] resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500 transition"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={placeholderCode}
              rows={12}
            />
            <button
              onClick={handleAnalyze}
              className="mt-6 self-start bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-12 py-3 rounded-lg font-semibold tracking-wide transition shadow-lg"
            >
              Analyze Syntax
            </button>
          </div>

          <div className="bg-[#1f213a] rounded-xl p-6 border border-[#2f3051] shadow-lg min-h-[320px] overflow-auto">
            <h2 className="text-3xl font-semibold mb-5 text-indigo-300">
              Parse Tree
            </h2>
            {parseTree ? (
              <div
                className="bg-[#ffffff] rounded p-4 overflow-auto border border-[#3c3f62] shadow-inner"
                style={{ height: "480px", width: "100%" }}
              >
                <Tree
                  data={convertToTreeData(parseTree)}
                  orientation="vertical"
                  translate={{ x: 250, y: 180 }}
                  pathFunc="step"
                  zoomable={true}
                  scaleExtent={{ min: 0.5, max: 1.5 }}
                  nodeSize={{ x: 250, y: 100 }}
                  renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                    <g
                      style={{ cursor: "pointer" }}
                      onClick={toggleNode}
                      onMouseEnter={e =>
                        e.currentTarget
                          .querySelector("circle")
                          ?.setAttribute("filter", "url(#glow)")
                      }
                      onMouseLeave={e =>
                        e.currentTarget
                          .querySelector("circle")
                          ?.removeAttribute("filter")
                      }
                    >
                      <defs>
                        <filter
                          id="glow"
                          height="250%"
                          width="250%"
                          x="-75%"
                          y="-75%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="0"
                            stdDeviation="4"
                            floodColor="#a78bfa"
                            floodOpacity="0.9"
                          />
                        </filter>
                      </defs>
                      <circle
                        r={20}
                        fill={nodeDatum.children ? "#8b5cf6" : "#22c55e"}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                      <text
                        fill="black"
                        stroke="black"
                        strokeWidth="0.25"
                        x={25}
                        y={-25}
                        textAnchor="start"
                        fontWeight="bold"
                        fontSize="16px"
                        style={{
                          userSelect: "none",
                          pointerEvents: "none",
                          paintOrder: "stroke",
                        }}
                      >
                        {nodeDatum.name}
                      </text>
                    </g>
                  )}
                />
              </div>
            ) : (
              <p className="text-gray-400 italic">No parse tree available.</p>
            )}
          </div>
        </section>

        {/* Right pane: Tokens and Errors stacked */}
        <section className="flex flex-col w-full md:w-1/3 gap-8">
          <div className="bg-[#1f213a] rounded-xl p-6 border border-[#2f3051] shadow-lg overflow-auto min-h-[320px] h-[583px]">
            <h2 className="text-3xl font-semibold mb-5 text-indigo-300">
              Tokens
            </h2>
            <pre className="bg-[#16172d] p-5 rounded h-[400px] overflow-auto text-sm font-mono text-white leading-relaxed whitespace-pre-wrap">
              {tokens.length
                ? tokens
                    .map((t, i) => `${i + 1}. ${t.token} (${t.type})`)
                    .join("\n")
                : "No tokens found."}
            </pre>
          </div>

          <div className="bg-[#1f213a] rounded-xl p-6 border border-[#2f3051] shadow-lg overflow-auto min-h-[320px] h-[583px]">
            <h2 className="text-3xl font-semibold mb-5 text-indigo-300">
              Syntax Errors
            </h2>
            <pre
              className={`p-5 rounded overflow-auto text-sm font-mono whitespace-pre-wrap ${
                errors.length
                  ? "bg-red-900 text-red-400 shadow-inner"
                  : "bg-green-900 text-green-400 shadow-inner"
              }`}
            >
              {errors.length ? errors.join("\n") : "No syntax errors found."}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}
