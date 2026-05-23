"use client";

import { Token } from "@/lib/analyzers/lexicalAnalyzer";

interface TokenTableProps {
  tokens: Token[];
}

const colorMap: Record<string, string> = {
  keyword: "text-rose-400 font-bold",
  identifier: "text-purple-400",
  number: "text-amber-400",
  string: "text-emerald-400",
  operator: "text-sky-400",
  symbol: "text-pink-400",
  comment: "text-zinc-500 italic",
  whitespace: "text-zinc-600",
  unknown: "text-red-400 bg-red-500/10 px-1 rounded border border-red-500/20",
};

export default function TokenTable({ tokens }: TokenTableProps) {
  if (!tokens.length)
    return (
      <p className="text-zinc-500 text-center mt-20 text-lg font-medium">
        No tokens to display.
      </p>
    );

  return (
    <div className="overflow-x-auto max-h-[600px] rounded-xl border border-zinc-800 shadow-2xl bg-[#1e1e2e]/60 backdrop-blur-md">
      <table className="min-w-full text-base font-mono text-zinc-300">
        <thead className="bg-[#282a36]/60 text-zinc-400 border-b border-zinc-800">
          <tr>
            <th className="px-5 py-3 text-left font-semibold border-b border-zinc-800">
              #
            </th>
            <th className="px-5 py-3 text-left font-semibold border-b border-zinc-800">
              Token
            </th>
            <th className="px-5 py-3 text-left font-semibold border-b border-zinc-800">
              Type
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {tokens.map(({ token, type }, i) => (
            <tr
              key={i}
              className="hover:bg-[#282a36]/40 transition-colors"
            >
              <td className="px-5 py-3.5 text-zinc-500 font-medium">
                {i + 1}
              </td>
              <td className={`px-5 py-3.5 font-semibold ${colorMap[type] || "text-zinc-300"}`}>
                {token}
              </td>
              <td className="px-5 py-3.5 text-zinc-400 capitalize">
                {type}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
