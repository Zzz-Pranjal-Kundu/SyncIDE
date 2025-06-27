"use client";

import { useEffect, useState } from "react";
import { analyzeCode } from "../lexical/_components/lexicalAnalyzer";
import {
  syntaxAnalyze,
  Token as SyntaxToken,
  ParseNode,
} from "../syntax/_components/tree";
import { semanticAnalyze, SemanticError } from "./_components/semantics";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import Tree from "react-d3-tree";
import AnalyzeHeader from "../../../../src/components/Header";

export default function SemanticPage() {
  const language = useCodeEditorStore(state => state.language);
  const [semanticErrors, setSemanticErrors] = useState<SemanticError[]>([]);
  const [symbolTable, setSymbolTable] = useState<Record<string, any>>({});
  const [parseTree, setParseTree] = useState<ParseNode | null>(null);
  const [code, setCode] = useState("int q = 0;\nint main() {\n    cout << \"Semantic Check\";\n    int n = 3;\n\n    /*int x = 23.0;\n    int y = 2;\n    float x1 = 23.0;\n    float y1 = 2;*/\n\n    if (n <= 0) {\n        cout << \"Not a positive number.\";\n    } \n    else {\n        cout << \"Positive number\";\n    }\n    cout << \"Global variable: \" << q ;\n    return 0;\n}");

  // useEffect(() => {
  //   const saved = localStorage.getItem(`editor-code-${language}`);
  //   if (saved) setCode(saved);
  // }, [language]);

  const handleAnalyze = () => {
    const lexicalTokens = analyzeCode(code, language);

    const syntaxTokens: SyntaxToken[] = lexicalTokens.map(t => ({
      ...t,
      value: t.token,
    }));

    const syntaxResult = syntaxAnalyze(syntaxTokens);
    setParseTree(syntaxResult.root);

    const semanticResult = semanticAnalyze(syntaxResult.root);
    setSemanticErrors(semanticResult.errors);
    setSymbolTable(semanticResult.symbolTable);
  };

  const convertToTreeData = (node: ParseNode): any => ({
    name: node.label,
    children: (node.children || []).filter(Boolean).map(convertToTreeData),
  });

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col bg-[#12121f] text-white font-sans">
      <AnalyzeHeader text="Semantic Analyzer" />
      
      <main className="flex flex-col md:flex-row gap-12 max-w-7xl mx-auto w-full">
        {/* Left Section */}
        <section className="flex flex-col w-full md:w-2/3 gap-8">
          {/* Code Input */}
          <div className="bg-[#1f213a] rounded-xl p-8 border border-[#2f3051] shadow-lg min-h-[320px] flex flex-col">
            <h2 className="text-3xl font-semibold mb-6 text-blue-300">
              Code Input
            </h2>
            <textarea
              spellCheck={false}
              className="flex-grow bg-[#16172d] text-white font-mono text-lg p-6 rounded-md border border-[#3c3f62] resize-none focus:outline-none focus:ring-4 focus:ring-blue-500 transition"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Enter code for semantic analysis..."
              rows={12}
            />
            <button
              onClick={handleAnalyze}
              className="mt-6 self-start bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800 text-white px-12 py-3 rounded-lg font-semibold tracking-wide transition shadow-lg">
              Analyze Semantics
            </button>
          </div>

          {/* Parse Tree */}
          <div className="bg-[#1f213a] rounded-xl p-6 border border-[#2f3051] shadow-lg min-h-[320px] overflow-auto">
            <h2 className="text-3xl font-semibold mb-5 text-blue-300">
              Parse Tree
            </h2>
            {parseTree ? (
              <div
                className="bg-white rounded p-4 overflow-auto border border-[#3c3f62] shadow-inner"
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
                    <g style={{ cursor: "pointer" }} onClick={toggleNode}>
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
                            floodColor="#60a5fa"
                            floodOpacity="0.9"
                          />
                        </filter>
                      </defs>
                      <circle
                        r={20}
                        fill={nodeDatum.children ? "#3b82f6" : "#10b981"}
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

        {/* Right Section */}
        <section className="flex flex-col w-full md:w-1/3 gap-8">
          {/* Semantic Errors & Warnings */}
          <div className="bg-[#1f213a] rounded-xl p-6 border border-[#2f3051] shadow-lg overflow-auto min-h-[400px] h-[590px]">
            <h2 className="text-3xl font-semibold mb-5 text-blue-300">
              Semantic Errors & Warnings
            </h2>
            {semanticErrors.length ? (
              <div className="space-y-4 h-[420px] overflow-auto">
                {semanticErrors.map((e, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-md font-mono text-sm whitespace-pre-wrap border-l-4 ${
                      e.severity === "error"
                        ? "bg-red-950 text-red-400 border-red-500"
                        : "bg-yellow-950 text-yellow-300 border-yellow-500"
                    }`}
                  >
                    <strong>{i + 1}. {e.severity.toUpperCase()}:</strong> {e.message}
                    {e.nodeLabel && <div><em>Node:</em> {e.nodeLabel}</div>}
                    {e.suggestion && <div><em>Suggestion:</em> {e.suggestion}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="bg-green-900 text-green-400 p-4 rounded shadow-inner font-mono text-sm">
                No semantic errors found.
              </p>
            )}
          </div>

          {/* Symbol Table - Bottom Right (Shorter) */}
          <div className="bg-[#1f213a] rounded-xl p-6 border border-[#2f3051] shadow-lg overflow-auto min-h-[380px] h-[580px]">
            <h2 className="text-3xl font-semibold mb-5 text-blue-300">
              Symbol Table
            </h2>
            {Object.keys(symbolTable).length > 0 ? (
              <div className="h-[540px] overflow-auto rounded">
                <table className="w-full table-fixed border-collapse border border-[#3c3f62] text-sm text-white">
                  <thead className="bg-[#2f3051] text-blue-300">
                    <tr>
                      <th className="border border-[#3c3f62] px-2 py-1 w-[25%]">Name</th>
                      <th className="border border-[#3c3f62] px-2 py-1 w-[20%]">Type</th>
                      <th className="border border-[#3c3f62] px-2 py-1 w-[15%]">Scope</th>
                      <th className="border border-[#3c3f62] px-2 py-1 w-[20%]">Initialized</th>
                      <th className="border border-[#3c3f62] px-2 py-1 w-[20%]">Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(symbolTable).map(([name, info], idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-[#1f213a]" : "bg-[#16172d]"}
                      >
                        <td className="border border-[#3c3f62] px-2 py-1 truncate">{name}</td>
                        <td className="border border-[#3c3f62] px-2 py-1 truncate">{info.type}</td>
                        <td className="border border-[#3c3f62] px-2 py-1">{info.declaredInScope}</td>
                        <td className="border border-[#3c3f62] px-2 py-1">{info.initialized ? "Yes" : "No"}</td>
                        <td className="border border-[#3c3f62] px-2 py-1">{info.used ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 italic">No symbols to display.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
