// ../_components/TokenTable.tsx
import React from "react";

type Token = {
  type: string;
  value: string;
};

type TokenTableProps = {
  tokens: Token[];
};

export default function TokenTable({ tokens }: TokenTableProps) {
  return (
    <table className="w-full table-auto border-collapse text-gray-200">
      <thead>
        <tr className="border-b border-gray-600">
          <th className="text-left py-2 px-4 bg-[#2a2a3a]">Type</th>
          <th className="text-left py-2 px-4 bg-[#2a2a3a]">Value</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token, idx) => (
          <tr
            key={idx}
            className={idx % 2 === 0 ? "bg-[#252533]" : "bg-[#1f1f2e]"}
          >
            <td className="py-2 px-4 font-mono">{token.type}</td>
            <td className="py-2 px-4 font-mono">{token.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
