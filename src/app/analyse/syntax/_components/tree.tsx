import { TokenType } from "../../lexical/_components/lexicalAnalyzer";

interface Token {
  token: string;
  type: TokenType;
  value: string;
}

export type { Token, TokenType };

export interface ParseNode {
  label: string;
  children?: ParseNode[];
}

export interface SyntaxResult {
  root: ParseNode | null;
  errors: string[];
}

export function syntaxAnalyze(tokens: Token[]): SyntaxResult {
  const errors: string[] = [];
  const root: ParseNode = {
    label: "Program",
    children: [],
  };

  let index = 0;

  function current(): Token | null {
    return index < tokens.length ? tokens[index] : null;
  }

  function advance(): void {
    index++;
  }

  function matchToken(expectedToken: string): boolean {
    const token = current();
    if (token && token.token === expectedToken) {
      advance();
      return true;
    } else {
      errors.push(
        `Expected token '${expectedToken}' at position ${index}, found '${token?.token ?? "EOF"}'`
      );
      return false;
    }
  }

  function matchType(expectedType: TokenType): Token | null {
    const token = current();
    if (token && token.type === expectedType) {
      advance();
      return token;
    } else {
      errors.push(
        `Expected token type '${expectedType}' at position ${index}, found '${token?.type ?? "EOF"}'`
      );
      return null;
    }
  }

  function parseExpression(): ParseNode | null {
    return parseRelational();
  }

  function parseRelational(): ParseNode | null {
    let node = parseAdditive();
    const relationalOps = ["<", "<=", ">", ">=", "==", "!="];
    while (current() && relationalOps.includes(current()!.token)) {
      const op = current()!;
      advance();
      const right = parseAdditive();
      node = {
        label: `Op: ${op.token}`,
        children: [node!, right!],
      };
    }
    return node;
  }

  function parseAdditive(): ParseNode | null {
    let node = parseMultiplicative();
    while (current() && (current()!.token === "+" || current()!.token === "-")) {
      const op = current()!;
      advance();
      const right = parseMultiplicative();
      node = {
        label: `Op: ${op.token}`,
        children: [node!, right!],
      };
    }
    return node;
  }

  function parseMultiplicative(): ParseNode | null {
    let node = parsePrimary();
    while (current() && (current()!.token === "*" || current()!.token === "/")) {
      const op = current()!;
      advance();
      const right = parsePrimary();
      node = {
        label: `Op: ${op.token}`,
        children: [node!, right!],
      };
    }
    return node;
  }

  function parsePrimary(): ParseNode | null {
    let token = current();
    if (!token) return null;

    if (token.token === "++" || token.token === "--") {
      const op = token.token;
      advance();
      const operand = parsePrimary();
      if (!operand) {
        errors.push(`Expected expression after prefix '${op}'`);
        return null;
      }
      return {
        label: `PrefixOp: ${op}`,
        children: [operand],
      };
    }

    if (token.token === "(") {
      advance();
      const expr = parseExpression();
      if (!matchToken(")")) {
        errors.push("Expected ')' after expression");
      }
      return expr;
    }

    if (
      token.type === "identifier" ||
      token.type === "number" ||
      token.type === "string"
    ) {
      advance();
      const node: ParseNode = { label: `Value: ${token.token}` };

      token = current();
      if (token && (token.token === "++" || token.token === "--")) {
        const op = token.token;
        advance();
        return {
          label: `PostfixOp: ${op}`,
          children: [node],
        };
      }

      return node;
    }

    errors.push(`Unexpected token '${token.token}' in expression`);
    advance();
    return null;
  }

  function parseBlock(): ParseNode {
    const node: ParseNode = { label: "Block", children: [] };
    if (!matchToken("{")) {
      errors.push("Expected '{' to start block");
      return node;
    }

    while (current() && current()!.token !== "}") {
      const stmt = parseStatement();
      if (stmt) node.children!.push(stmt);
    }

    if (!matchToken("}")) {
      errors.push("Expected '}' to close block");
    }

    return node;
  }

  function parseIfStatement(): ParseNode {
    const node: ParseNode = { label: "IfStatement", children: [] };
    advance(); // consume 'if'

    if (!matchToken("(")) {
      errors.push("Expected '(' after 'if'");
    }

    const condition = parseExpression();
    node.children!.push({
      label: "Condition",
      children: condition ? [condition] : [],
    });

    if (!matchToken(")")) {
      errors.push("Expected ')' after condition");
    }

    const thenBlock = parseBlock();
    node.children!.push({ label: "ThenBlock", children: thenBlock.children });

    if (current()?.token === "else") {
      advance();
      const elseBlock = parseBlock();
      node.children!.push({ label: "ElseBlock", children: elseBlock.children });
    }

    return node;
  }

  function parseWhileStatement(): ParseNode {
    const node: ParseNode = { label: "WhileStatement", children: [] };
    advance(); // consume 'while'

    if (!matchToken("(")) {
      errors.push("Expected '(' after 'while'");
    }

    const condition = parseExpression();
    node.children!.push({
      label: "Condition",
      children: condition ? [condition] : [],
    });

    if (!matchToken(")") && current()?.token !== "{") {
      errors.push("Expected ')' after condition");
    }

    const body = parseBlock();
    node.children!.push({ label: "Body", children: body.children });

    return node;
  }

  function parseOutputStatement(): ParseNode | null {
    const node: ParseNode = { label: "OutputStatement", children: [] };
    advance(); // consume 'cout'

    while (current() && current()!.token === "<<") {
      advance();
      const expr = parseExpression();
      if (expr) node.children!.push(expr);
      else {
        errors.push("Expected expression after '<<'");
        break;
      }
    }

    if (!matchToken(";")) {
      errors.push("Expected ';' after output statement");
    }

    return node;
  }

  function parseDeclaration(): ParseNode | null {
    const typeToken = current();

    const declarationStarters = ["int", "float", "char", "double", "bool", "string", "var", "let", "const"];
    if (
      !typeToken ||
      typeToken.type !== "keyword" ||
      !declarationStarters.includes(typeToken.token)
    ) {
      return null; // Don't push error here to avoid false positives
    }

    advance(); // consume the type token

    const declNode: ParseNode = {
      label: `Declaration: ${typeToken.token}`,
      children: [],
    };

    const firstDecl = parseDeclarator();
    if (!firstDecl) {
      errors.push("Expected identifier in declaration");
      return null;
    }
    declNode.children!.push(firstDecl);

    while (current()?.token === ",") {
      advance();
      const nextDecl = parseDeclarator();
      if (!nextDecl) {
        errors.push("Expected identifier after ',' in declaration");
        break;
      }
      declNode.children!.push(nextDecl);
    }

    if (!matchToken(";")) {
      errors.push("Expected ';' after declaration");
    }

    return declNode;
  }

  function parseDeclarator(): ParseNode | null {
    const identifier = current();
    if (!matchType("identifier")) return null;

    const node: ParseNode = {
      label: `Identifier: ${identifier!.token}`,
      children: [],
    };

    if (current()?.token === "=") {
      advance();
      const expr = parseExpression();
      if (expr) node.children!.push(expr);
    }

    return node;
  }

  function parseStatement(): ParseNode | null {
    const token = current();
    if (!token) return null;

    if (token.type === "keyword" && token.token === "if") {
      return parseIfStatement();
    }

    if (token.type === "keyword" && token.token === "while") {
      return parseWhileStatement();
    }

    if (token.token === "{") {
      return parseBlock();
    }

    const declarationStarters = ["int", "float", "char", "double", "bool", "string", "var", "let", "const"];
    if (token.type === "keyword" && declarationStarters.includes(token.token)) {
      return parseDeclaration();
    }

    if (token.type === "identifier" && token.token === "cout") {
      return parseOutputStatement();
    }

    if (token.type === "identifier") {
      const stmt: ParseNode = { label: "Assignment", children: [] };
      stmt.children!.push({ label: `Identifier: ${token.token}` });
      advance();
      if (matchToken("=")) {
        const expr = parseExpression();
        if (expr) stmt.children!.push(expr);
        if (!matchToken(";")) {
          errors.push("Expected ';' after assignment");
        }
      } else {
        errors.push("Expected '=' after identifier in assignment");
      }
      return stmt;
    }

    // Skip unsupported/unknown statements silently without error
    advance();
    return null;
  }

  while (index < tokens.length) {
    const startIndex = index;
    const stmt = parseStatement();
    if (stmt) root.children!.push(stmt);

    // Ensure we always move forward
    if (index === startIndex) {
      errors.push(`Could not parse token '${tokens[index].token}' at position ${index}`);
      index++;
    }
  }

  return { root, errors };
}

