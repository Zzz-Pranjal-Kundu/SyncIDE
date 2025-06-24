export type TokenType =
  | "keyword"
  | "identifier"
  | "number"
  | "string"
  | "operator"
  | "symbol"
  | "preprocessor";

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

const languageOperators: Record<string, string[]> = {
  cpp: [
    "==", "!=", "<=", ">=", "&&", "\\|\\|", "\\+\\+", "--", "\\+=", "-=", "\\*=", "/=", "=",
    "\\+", "-", "\\*", "/", "%", "<", ">", "!", "&", "\\|", "\\^", "~", "<<", ">>"
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

const languageSymbols: Record<string, string[]> = {
  cpp: ["\\(", "\\)", "\\{", "\\}", "\\[", "\\]", ";", ",", "\\.", ":"],
  java: ["\\(", "\\)", "\\{", "\\}", "\\[", "\\]", ";", ",", "\\.", ":"],
  python: ["\\(", "\\)", "\\{", "\\}", "\\[", "\\]", ";", ",", "\\.", ":", "\\\\", "@"],
  javascript: ["\\(", "\\)", "\\{", "\\}", "\\[", "\\]", ";", ",", "\\.", ":", "\\?"]
};

export function analyzeCode(code: string, language: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  const lang = language.toLowerCase().replace("c++", "cpp"); // Normalize language

  const keywords = languageKeywords[lang] ?? new Set();
  const ops = languageOperators[lang] ?? [];
  const syms = languageSymbols[lang] ?? [];

  const sortedOps = [...ops].sort((a, b) => b.length - a.length);
  const operatorRegex = sortedOps.length ? new RegExp(`^(${sortedOps.join("|")})`) : /^$/;
  const symbolRegex = syms.length ? new RegExp(`^(${syms.join("|")})`) : /^$/;

  const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");

  while (pos < cleanCode.length) {
    const chunk = cleanCode.slice(pos);

    // Whitespace
    const whitespace = chunk.match(/^\s+/);
    if (whitespace) {
      pos += whitespace[0].length;
      continue;
    }

    // Preprocessor directive
    const preprocessorMatch = chunk.match(/^#\s*\w+.*(\n|$)/);
    if (preprocessorMatch) {
      tokens.push({ token: preprocessorMatch[0].trim(), type: "preprocessor" });
      pos += preprocessorMatch[0].length;
      continue;
    }

    // String
    const stringMatch = chunk.match(/^(['"])(?:\\.|[^\\])*?\1/);
    if (stringMatch) {
      tokens.push({ token: stringMatch[0], type: "string" });
      pos += stringMatch[0].length;
      continue;
    }

    // Number
    const numberMatch = chunk.match(/^\d+(\.\d+)?/);
    if (numberMatch) {
      tokens.push({ token: numberMatch[0], type: "number" });
      pos += numberMatch[0].length;
      continue;
    }

    // Operator
    const operatorMatch = chunk.match(operatorRegex);
    if (operatorMatch) {
      tokens.push({ token: operatorMatch[0], type: "operator" });
      pos += operatorMatch[0].length;
      continue;
    }

    // Symbol
    const symbolMatch = chunk.match(symbolRegex);
    if (symbolMatch) {
      tokens.push({ token: symbolMatch[0], type: "symbol" });
      pos += symbolMatch[0].length;
      continue;
    }

    // Identifier or Keyword
    const identifierMatch = chunk.match(/^[a-zA-Z_]\w*/);
    if (identifierMatch) {
      const word = identifierMatch[0];
      const tokenType: TokenType = keywords.has(word) ? "keyword" : "identifier";
      tokens.push({ token: word, type: tokenType });
      pos += word.length;
      continue;
    }

    pos++;
  }

  return tokens;
}
