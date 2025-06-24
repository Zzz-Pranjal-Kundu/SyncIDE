"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { generate3AC, Quad } from "./_components/threeAddressCode";

export default function ThreeAddressGenerator() {
  const [code, setCode] = useState(`int q = 0;\nint main() {\n    int n = 3;\n    cout << n ;\n    cout << "Global variable: " << q ;\n    if ( n<=3) {\n    cout<<n;\n    }\n    else {\n    cout<<n+1;\n    }\n    return 0;\n}`);
  const [threeAC, setThreeAC] = useState<Quad[]>([]);

  const handleGenerate = () => {
    const result = generate3AC(code);
    setThreeAC(result);
  };

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col bg-[#12121f] text-white font-sans">
      <Header text="Three Address Code" />
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2 bg-[#1f213a] p-6 rounded-lg border border-[#2f3051] shadow-lg">
          <h2 className="text-2xl font-bold text-blue-300 mb-4">Code Input</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={20}
            spellCheck={false}
            className="w-full bg-[#16172d] text-white p-4 font-mono rounded border border-[#3c3f62] resize-none"
          />
          <button
            onClick={handleGenerate}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-700 text-white rounded hover:from-green-700 hover:to-blue-800 transition shadow-lg font-semibold"
          >
            Generate 3AC
          </button>
        </div>

        <div className="w-full md:w-1/2 bg-[#1f213a] p-6 rounded-lg border border-[#2f3051] shadow-lg">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">
            Three Address Code (3AC)
          </h2>
          <table className="w-full text-sm font-mono text-white">
            <thead className="bg-[#2f3051] text-purple-200">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Op</th>
                <th className="p-2">Arg1</th>
                <th className="p-2">Arg2</th>
                <th className="p-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {threeAC.map((q, idx) => (
                <tr
                  key={idx}
                  className={
                    q.op === "function" || q.op === "end"
                      ? "bg-[#12121f] text-yellow-400"
                      : idx % 2 === 0
                      ? "bg-[#1f213a]"
                      : "bg-[#16172d]"
                  }
                >
                  <td className="p-2 text-center">
                    {q.op === "function" || q.op === "end" ? "" : idx + 1}
                  </td>
                  <td className="p-2 text-center">{q.op}</td>
                  <td className="p-2 text-center">{q.arg1}</td>
                  <td className="p-2 text-center">{q.arg2}</td>
                  <td className="p-2 text-center">{q.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
