import {Token, TokenType} from "./lexicalAnalyzer";

export type {Token, TokenType};

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

  // Parse expressions with relational operators for conditions
  function parseExpression(): ParseNode | null {
    return parseRelational();
  }

  // Relational operators: <, <=, >, >=, ==, !=
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
    while (
      current() &&
      (current()!.token === "+" || current()!.token === "-")
    ) {
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
    while (
      current() &&
      (current()!.token === "*" || current()!.token === "/")
    ) {
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

    // Handle prefix ++ or --
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

    // Parenthesized expression
    if (token.token === "(") {
      advance();
      const expr = parseExpression();
      if (!matchToken(")")) {
        errors.push("Expected ')' after expression");
      }
      return expr;
    }

    // Identifier, number, or string literal
    if (
      token.type === "identifier" ||
      token.type === "number" ||
      token.type === "string"
    ) {
      advance();
      const node: ParseNode = {label: `Value: ${token.token}`};

      // Check postfix ++ or --
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
    const node: ParseNode = {label: "Block", children: []};
    if (!matchToken("{")) {
      errors.push("Expected '{' to start block");
      return node;
    }

    while (current() && current()?.token !== "}") {
      const stmt = parseStatement();
      if (stmt) node.children!.push(stmt);
    }

    if (!matchToken("}")) {
      errors.push("Expected '}' to close block");
    }

    return node;
  }

  function parseIfStatement(): ParseNode {
    const node: ParseNode = {label: "IfStatement", children: []};
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
    node.children!.push({label: "ThenBlock", children: thenBlock.children});

    if (current()?.token === "else") {
      advance();
      const elseBlock = parseBlock();
      node.children!.push({label: "ElseBlock", children: elseBlock.children});
    }

    return node;
  }

  function parseWhileStatement(): ParseNode {
    const node: ParseNode = {label: "WhileStatement", children: []};
    advance(); // consume 'while'

    if (!matchToken("(")) {
      errors.push("Expected '(' after 'while'");
    }

    const condition = parseExpression();
    node.children!.push({
      label: "Condition",
      children: condition ? [condition] : [],
    });

    if (!matchToken(")")) {
      errors.push("Expected ')' after condition");
    }

    const body = parseBlock();
    node.children!.push({label: "Body", children: body.children});

    return node;
  }

  // Parse output statement: cout << expr << expr ... ;
  function parseOutputStatement(): ParseNode | null {
    const node: ParseNode = {label: "OutputStatement", children: []};
    advance(); // consume 'cout'

    while (current() && current()?.token === "<<") {
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

  // Parse multiple declarators separated by commas: int y=0, x=0, a=0;
  function parseDeclaration(): ParseNode | null {
    const typeToken = current();
    if (!matchType("keyword")) return null;

    const declNode: ParseNode = {
      label: `Declaration: ${typeToken!.token}`,
      children: [],
    };

    // Parse first declarator
    const firstDecl = parseDeclarator();
    if (!firstDecl) {
      errors.push("Expected identifier in declaration");
      return null;
    }
    declNode.children!.push(firstDecl);

    // Parse more declarators separated by commas
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

  // Parse a declarator: identifier [= expression]
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

  function parseFunction(): ParseNode | null {
    const returnType = current();
    if (!matchType("keyword")) return null;

    const identifier = current();
    if (!matchType("identifier")) return null;

    if (!matchToken("(")) {
      errors.push("Expected '(' after function name");
      return null;
    }

    if (!matchToken(")")) {
      errors.push("Expected ')' after function parameters");
      return null;
    }

    const body = parseBlock();

    return {
      label: `Declaration: ${returnType!.token}`,
      children: [
        {
          label: `Identifier: ${identifier!.token}`,
          children: [body],
        },
      ],
    };
  }

  function parseReturnStatement(): ParseNode {
    const node: ParseNode = {label: "ReturnStatement", children: []};
    advance(); // consume 'return'

    const expr = parseExpression();
    if (expr) node.children!.push(expr);

    if (!matchToken(";")) {
      errors.push("Expected ';' after return statement");
    }

    return node;
  }

  function parseStatement(): ParseNode | null {
    const token = current();
    if (!token) return null;

    if (token.type === "keyword" && token.token === "if") {
      return parseIfStatement();
    }

    if (token.type === "keyword" && token.token === "return") {
      return parseReturnStatement();
    }

    if (token.type === "keyword" && token.token === "while") {
      return parseWhileStatement();
    }

    if (token.token === "{") {
      return parseBlock();
    }

    if (token.type === "keyword") {
      return parseDeclaration();
    }

    if (token.type === "identifier" && token.token === "cout") {
      return parseOutputStatement();
    }

    if (token.type === "identifier") {
      const stmt: ParseNode = {label: "Assignment", children: []};
      stmt.children!.push({label: `Identifier: ${token.token}`});
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

    errors.push(`Unknown statement starting with '${token.token}'`);
    advance();
    return null;
  }

  while (index < tokens.length) {
    const token = current();

    // Detect function declaration (e.g., int main() { ... })
    if (
      token?.type === "keyword" &&
      tokens[index + 1]?.type === "identifier" &&
      tokens[index + 2]?.token === "("
    ) {
      const func = parseFunction();
      if (func) root.children!.push(func);
      continue;
    }

    // Fallback to regular statement
    const stmt = parseStatement();
    if (stmt) root.children!.push(stmt);
  }

  return {root, errors};
}
