export type TokenType =
  | "keyword"
  | "identifier"
  | "number"
  | "string"
  | "operator"
  | "symbol"
  | "whitespace"
  | "comment"
  | "unknown";

export interface Token {
  token: string;
  type: TokenType;
  line: number;
  column: number;
}

const keywords = new Set([
  "int",
  "float",
  "char",
  "double",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "break",
  "continue",
  "void",
  "public",
  "private",
  "class",
  "static",
  "def",
  "import",
  "from",
  "try",
  "except",
  "finally",
  "new",
  "this",
  "true",
  "false",
  "null",
  "None",
]);

const operators = [
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "<<",
  ">>",
  "<",
  ">",
  "!",
  "&",
  "|",
  "^",
  "~",
];

const symbols = ["(", ")", "{", "}", "[", "]", ";", ",", ".", ":"];

function escapeRegex(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

const operatorsSorted = [...operators].sort((a, b) => b.length - a.length);
const operatorRegex = new RegExp(
  `^(${operatorsSorted.map(escapeRegex).join("|")})`
);
const symbolRegex = new RegExp(`^(${symbols.map(escapeRegex).join("|")})`);

// Unicode letter class for identifiers, simplified version
const identifierStart = /[\p{L}_]/u; // Unicode letter or underscore
const identifierPart = /[\p{L}\p{N}_]/u; // letters, numbers, underscore

export function analyzeCode(code: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let column = 1;

  const advance = (n: number) => {
    for (let i = 0; i < n; i++) {
      if (code[pos] === "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
      pos++;
    }
  };

  while (pos < code.length) {
    const chunk = code.slice(pos);

    // Whitespace
    const wsMatch = chunk.match(/^\s+/);
    if (wsMatch) {
      advance(wsMatch[0].length);
      continue; // skip whitespace tokens optionally, or store if needed
    }

    // Comments: Single-line //
    if (chunk.startsWith("//")) {
      const endIdx = chunk.indexOf("\n");
      const commentText = endIdx === -1 ? chunk : chunk.slice(0, endIdx);
      tokens.push({token: commentText, type: "comment", line, column});
      advance(commentText.length);
      continue;
    }

    // Comments: Multi-line /* ... */
    if (chunk.startsWith("/*")) {
      const endIdx = chunk.indexOf("*/", 2);
      const commentText = endIdx === -1 ? chunk : chunk.slice(0, endIdx + 2);
      tokens.push({token: commentText, type: "comment", line, column});
      advance(commentText.length);
      continue;
    }

    // String literals (single or double quotes) with escape support
    if (/^(['"])/.test(chunk)) {
      const quote = chunk[0];
      let str = quote;
      let i = 1;
      let closed = false;
      while (pos + i < code.length) {
        const c = code[pos + i];
        str += c;
        if (c === "\\" && pos + i + 1 < code.length) {
          // escape next char
          i++;
          str += code[pos + i];
        } else if (c === quote) {
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) {
        // unterminated string literal, still tokenize what we have
      }
      tokens.push({token: str, type: "string", line, column});
      advance(str.length);
      continue;
    }

    // Number literals (integer, float, scientific notation)
    if (/^\d/.test(chunk)) {
      const numMatch = chunk.match(/^\d+(\.\d+)?([eE][+-]?\d+)?/);
      if (numMatch) {
        tokens.push({token: numMatch[0], type: "number", line, column});
        advance(numMatch[0].length);
        continue;
      }
    }

    // Operators
    const opMatch = chunk.match(operatorRegex);
    if (opMatch) {
      tokens.push({token: opMatch[0], type: "operator", line, column});
      advance(opMatch[0].length);
      continue;
    }

    // Symbols
    const symMatch = chunk.match(symbolRegex);
    if (symMatch) {
      tokens.push({token: symMatch[0], type: "symbol", line, column});
      advance(symMatch[0].length);
      continue;
    }

    // Identifiers or keywords - Unicode aware
    if (identifierStart.test(chunk[0])) {
      let i = 1;
      while (pos + i < code.length && identifierPart.test(code[pos + i])) i++;
      const id = code.slice(pos, pos + i);
      const type: TokenType = keywords.has(id) ? "keyword" : "identifier";
      tokens.push({token: id, type, line, column});
      advance(id.length);
      continue;
    }

    // If none matched, mark as unknown token
    tokens.push({token: chunk[0], type: "unknown", line, column});
    advance(1);
  }

  return tokens;
}
