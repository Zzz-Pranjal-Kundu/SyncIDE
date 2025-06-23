export type TokenType =
  | "keyword"
  | "identifier"
  | "number"
  | "string"
  | "operator"
  | "symbol";

export interface Token {
  token: string;
  type: TokenType;
}

// Keywords by language
const languageKeywords: Record<string, Set<string>> = {
  cpp: new Set([
    "alignas", "alignof", "and", "and_eq", "asm", "auto", "bitand", "bitor",
    "bool", "break", "case", "catch", "char", "char8_t", "char16_t", "char32_t",
    "class", "compl", "concept", "const", "consteval", "constexpr", "constinit",
    "const_cast", "continue", "co_await", "co_return", "co_yield", "decltype",
    "default", "delete", "do", "double", "dynamic_cast", "else", "enum",
    "explicit", "export", "extern", "false", "float", "for", "friend", "goto",
    "if", "inline", "int", "long", "mutable", "namespace", "new", "noexcept",
    "not", "not_eq", "nullptr", "operator", "or", "or_eq", "private", "protected",
    "public", "register", "reinterpret_cast", "requires", "return", "short",
    "signed", "sizeof", "static", "static_assert", "static_cast", "struct",
    "switch", "template", "this", "thread_local", "throw", "true", "try", "typedef",
    "typeid", "typename", "union", "unsigned", "using", "virtual", "void",
    "volatile", "wchar_t", "while", "xor", "xor_eq"
    ]),
  java: new Set([
    "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
    "class", "const", "continue", "default", "do", "double", "else", "enum",
    "extends", "final", "finally", "float", "for", "goto", "if", "implements",
    "import", "instanceof", "int", "interface", "long", "native", "new", "null",
    "package", "private", "protected", "public", "return", "short", "static",
    "strictfp", "super", "switch", "synchronized", "this", "throw", "throws",
    "transient", "try", "void", "volatile", "while", "true", "false"
    ]),
  python: new Set([
    "False", "None", "True", "and", "as", "assert", "async", "await", "break",
    "class", "continue", "def", "del", "elif", "else", "except", "finally",
    "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
    "not", "or", "pass", "raise", "return", "try", "while", "with", "yield"
    ]),
  javascript: new Set([
    "await", "break", "case", "catch", "class", "const", "continue", "debugger",
    "default", "delete", "do", "else", "enum", "export", "extends", "false",
    "finally", "for", "function", "if", "import", "in", "instanceof", "let",
    "new", "null", "package", "private", "protected", "public", "return", "static",
    "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void",
    "while", "with", "yield"
    ]),
};

// Operators by language
const languageOperators: Record<string, string[]> = {
  cpp: [
    "==", "!=", "<=", ">=", "&&", "\\|\\|", "\\+\\+", "--", "\\+=", "-=", "\\*=", "/=", "=", 
    "\\+", "-", "\\*", "/", "%", "<", ">", "!", "&", "\\|", "\\^", "~"
  ],
  java: [
    "==", "!=", "<=", ">=", "&&", "\\|\\|", "\\+\\+", "--", "\\+=", "-=", "\\*=", "/=", "=", 
    "\\+", "-", "\\*", "/", "%", "<", ">", "!", "&", "\\|", "\\^", "~"
  ],
  python: [
    "==", "!=", "<=", ">=", "=", "\\+", "-", "\\*", "/", "%", "<", ">", "\\*\\*", "//",
    "\\+=", "-=", "\\*=", "/=", "%=", "//=", "\\*\\*="
  ],
  javascript: [
    "===", "!==", "==", "!=", "<=", ">=", "&&", "\\|\\|", "\\+\\+", "--", "\\+=", "-=",
    "\\*=", "/=", "=", "\\+", "-", "\\*", "/", "%", "<", ">", "!", "&", "\\|", "\\^", "~"
  ],
};

// Symbols by language
const languageSymbols: Record<string, string[]> = {
  cpp: ["\\(", "\\)", "\\{", "\\}", "\\[", "\\]", ";", ",", "\\.", ":"],
  java: ["\\(", "\\)", "\\{", "\\}", "\\[", "\\]", ";", ",", "\\.", ":"],
  python: ["\\(", "\\)", "\\{", "\\}", "\\[", "\\]", ";", ",", "\\.", ":", "\\\\", "@"],
  javascript: ["\\(", "\\)", "\\{", "\\}", "\\[", "\\]", ";", ",", "\\.", ":", "\\?"]
};

export function analyzeCode(code: string, language: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  const keywords = languageKeywords[language.toLowerCase()] || new Set();
  const ops = languageOperators[language.toLowerCase()] || [];
  const syms = languageSymbols[language.toLowerCase()] || [];

  const operatorRegex = new RegExp(`^(${ops.join("|")})`);
  const symbolRegex = new RegExp(`^(${syms.join("|")})`);

  const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ""); // remove comments

  while (pos < cleanCode.length) {
    const chunk = cleanCode.slice(pos);

    if (/^\s+/.test(chunk)) {
      pos += chunk.match(/^\s+/)![0].length;
      continue;
    }

    // String
    if (/^(['"])(?:\\.|[^\\])*?\1/.test(chunk)) {
      const match = chunk.match(/^(['"])(?:\\.|[^\\])*?\1/)!;
      tokens.push({ token: match[0], type: "string" });
      pos += match[0].length;
      continue;
    }

    // Number
    if (/^\d+(\.\d+)?/.test(chunk)) {
      const match = chunk.match(/^\d+(\.\d+)?/)!;
      tokens.push({ token: match[0], type: "number" });
      pos += match[0].length;
      continue;
    }

    // Operator
    if (operatorRegex.test(chunk)) {
      const match = chunk.match(operatorRegex)!;
      tokens.push({ token: match[0], type: "operator" });
      pos += match[0].length;
      continue;
    }

    // Symbol
    if (symbolRegex.test(chunk)) {
      const match = chunk.match(symbolRegex)!;
      tokens.push({ token: match[0], type: "symbol" });
      pos += match[0].length;
      continue;
    }

    // Identifier or Keyword
    if (/^[a-zA-Z_]\w*/.test(chunk)) {
      const match = chunk.match(/^[a-zA-Z_]\w*/)!;
      const tokenType: TokenType = keywords.has(match[0])
        ? "keyword"
        : "identifier";
      tokens.push({ token: match[0], type: tokenType });
      pos += match[0].length;
      continue;
    }
    pos++;
  }

  return tokens;
}
