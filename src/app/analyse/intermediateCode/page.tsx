"use client";

import {useState} from "react";
import {analyzeCode} from "@/lib/analyzers/lexicalAnalyzer";
import {
  syntaxAnalyze,
  Token as SyntaxToken,
} from "@/lib/analyzers/syntaxAnalyzer";
import {semanticAnalyze} from "@/lib/analyzers/semanticAnalyzer";
import {
  generateIntermediateCode,
  type IntermediateInstruction,
} from "@/lib/analyzers/intermediateCodeGeneration";
import AnalyzeHeader from "@/components/Header";

export default function IntermediateCodePage() {
  const [code, setCode] = useState("int q = 0;\nint main() {\n    int n = 3;\n    cout << n ;\n    cout << \"Global variable: \" << q ;\n    if ( n<=3) {\n    cout<<n;\n    }\n    else {\n    cout<<n+1;\n    }\n    return 0;\n}");
  const [intermediateCode, setIntermediateCode] = useState<
    IntermediateInstruction[]
  >([]);
  const [semanticErrors, setSemanticErrors] = useState<string[]>([]);

  // useEffect(() => {
  //   const saved = localStorage.getItem(`editor-code-${language}`);
  //   if (saved) setCode(saved);
  // }, [language]);

  const handleAnalyze = () => {
    const lexicalTokens = analyzeCode(code);
    const syntaxTokens: SyntaxToken[] = lexicalTokens.map(t => ({
      ...t,
      value: t.token,
    }));
    const {root} = syntaxAnalyze(syntaxTokens);

    if (!root) {
      setSemanticErrors([
        "[ERROR] Syntax tree is null. Fix syntax errors first.",
      ]);
      setIntermediateCode([]);
      return;
    }

    const semantic = semanticAnalyze(root);

    const formattedErrors = semantic.errors.map(e => {
      const label = e.nodeLabel ? ` (${e.nodeLabel})` : "";
      return `[${e.severity.toUpperCase()}] ${e.message}${label}${
        e.suggestion ? ` → Suggestion: ${e.suggestion}` : ""
      }`;
    });

    setSemanticErrors(formattedErrors);

    const icg = generateIntermediateCode(root);
    setIntermediateCode(icg);
  };

  return (
    <div className="min-h-screen px-4 py-3 flex flex-col relative bg-[#12121f] text-white">
      <AnalyzeHeader text="Intermediate Code" />

      <header className="max-w-6xl mx-auto mb-10 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold">
          Intermediate Code Generation
        </h1>
      </header>

      <main className="flex flex-col md:flex-row gap-10 flex-1 max-w-12xl mx-auto px-4 md:px-8 w-full">
        {/* Left: Code Input */}
        <section className="w-full md:w-[66.666vw] flex flex-col bg-[#1e1e2e] rounded-xl p-8 border border-[#313244] shadow-lg min-h-[600px]">
          <h2 className="text-white text-2xl font-semibold mb-6">Code Input</h2>
          <textarea
            spellCheck={false}
            className="flex-grow bg-[#2a2a3a] text-gray-100 font-mono text-lg p-5 rounded-md border border-[#444a66] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={code}
            onChange={e => setCode(e.target.value)}
            rows={14}
          />
          <button
            onClick={handleAnalyze}
            className="mt-8 self-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-3 rounded-md font-semibold transition">
            Generate Code
          </button>
        </section>

        {/* Right: Intermediate Code Output */}
        <section className="w-full md:w-[33.333vw] flex flex-col bg-[#1e1e2e] rounded-xl p-8 border border-[#313244] shadow-lg min-h-[600px] overflow-auto">
          <h2 className="text-white text-3xl font-semibold mb-6">
            TAC Instructions
          </h2>

          {intermediateCode.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-white border border-[#444a66]">
                <thead className="bg-[#2d2f45] text-gray-300">
                  <tr>
                    <th className="px-4 py-2 border">Op</th>
                    <th className="px-4 py-2 border">Arg1</th>
                    <th className="px-4 py-2 border">Arg2</th>
                    <th className="px-4 py-2 border">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {intermediateCode.map((inst, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-[#3a3d5c] hover:bg-[#2a2f4c]">
                      <td className="px-4 py-2">{inst.op || (inst.label ? `${inst.label}:` : "-")}</td>
                      <td className="px-4 py-2">{inst.arg1 || "-"}</td>
                      <td className="px-4 py-2">{inst.arg2 || "-"}</td>
                      <td className="px-4 py-2">{inst.result || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-24">
              No intermediate code generated. Enter code and analyze.
            </p>
          )}

          {semanticErrors.length > 0 && (
            <div className="mt-8">
              <h2 className="text-white text-2xl font-semibold mb-2 text-yellow-300">
                Semantic Issues
              </h2>
              <pre className="bg-[#2a2a3a] text-yellow-300 p-4 rounded whitespace-pre-wrap max-h-60 overflow-auto border border-yellow-500/30">
                {semanticErrors.join("\n")}
              </pre>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
