type Token = {
  type: string;
  token: string;
};

type TokenTableProps = {
  tokens: Token[];
};

export default function TokenTable({ tokens }: TokenTableProps) {
  return (
    <div className="overflow-y-scroll max-h-screen">
      <table className="w-full table-auto border-collapse text-gray-200 min-w-[400px]">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="text-left py-2 px-4 bg-[#2a2a3a]">Type</th>
            <th className="text-left py-2 px-4 bg-[#2a2a3a]">Token</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? "bg-[#252533]" : "bg-[#1f1f2e]"}
            >
              <td className="py-2 px-4 font-mono whitespace-nowrap">
                {token.type}
              </td>
              <td className="py-2 px-4 font-mono whitespace-nowrap">
                {token.token}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
