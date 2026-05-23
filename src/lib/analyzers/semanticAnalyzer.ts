import {ParseNode} from "./syntaxAnalyzer";

export interface SemanticError {
  message: string;
  nodeLabel?: string;
  severity: "error" | "warning";
  suggestion?: string;
}

export interface SymbolInfo {
  type: string;
  declaredInScope: number;
  initialized: boolean;
  used: boolean;
}

export interface SemanticResult {
  errors: SemanticError[];
  symbolTable: Record<string, SymbolInfo>;
}

export function semanticAnalyze(root: ParseNode | null): SemanticResult {
  const errors: SemanticError[] = [];
  const symbolTable: Record<string, SymbolInfo> = {};
  let currentScope = 0;
  const scopeStack: Array<Set<string>> = [new Set()];

  const enterScope = () => {
    currentScope++;
    scopeStack.push(new Set());
  };

  const exitScope = () => {
    scopeStack.pop();
    currentScope--;
  };

  const markAsUsed = (varName: string) => {
    if (symbolTable[varName]) {
      symbolTable[varName].used = true;
    }
  };

  const inferValueType = (value: string): string => {
    if (/^-?\d+$/.test(value)) return "int";
    if (/^-?\d+\.\d+$/.test(value)) return "float";
    if (/^".*"$/.test(value) || /^'.*'$/.test(value)) return "string";
    return "unknown";
  };

  const inferExpressionType = (node: ParseNode | null): string => {
    if (!node) return "unknown";

    if (node.label.startsWith("Value: ")) {
      const token = node.label.replace("Value: ", "");
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
        const symbol = symbolTable[token];
        return symbol ? symbol.type : "unknown";
      } else {
        return inferValueType(token);
      }
    }

    if (
      node.label.includes("+") ||
      node.label.includes("-") ||
      node.label.includes("*") ||
      node.label.includes("/")
    ) {
      const left = node.children?.[0] ?? null;
      const right = node.children?.[1] ?? null;
      const leftType = inferExpressionType(left);
      const rightType = inferExpressionType(right);

      if (leftType === "float" || rightType === "float") return "float";
      if (leftType === "int" && rightType === "int") return "int";
      return "unknown";
    }

    return "unknown";
  };

  const traverse = (node: ParseNode | null): string => {
    if (!node) return "void";

    if (
      node.label === "Block" ||
      node.label === "ThenBlock" ||
      node.label === "ElseBlock" ||
      node.label === "Body"
    ) {
      enterScope();
    }

    if (node.label.startsWith("Declaration: ")) {
      const declaredType = node.label.split(": ")[1];
      for (const child of node.children || []) {
        if (child.label.startsWith("Identifier: ")) {
          const varName = child.label.replace("Identifier: ", "");

          // Skip function header like: int main()
          if (varName === "main" && declaredType === "int") continue;

          if (scopeStack[currentScope].has(varName)) {
            errors.push({
              message: `Variable '${varName}' redeclared in the same scope`,
              nodeLabel: child.label,
              severity: "error",
              suggestion: "Rename or remove one of the declarations.",
            });
          } else {
            symbolTable[varName] = {
              type: declaredType,
              declaredInScope: currentScope,
              initialized: false,
              used: false,
            };
            scopeStack[currentScope].add(varName);

            const valueNode = child.children?.[0] ?? null;
            if (valueNode) {
              const rhsType = inferExpressionType(valueNode);
              symbolTable[varName].initialized = true;

              if (
                rhsType !== "unknown" &&
                rhsType !== declaredType &&
                !(declaredType === "float" && rhsType === "int")
              ) {
                errors.push({
                  message: `Type mismatch: cannot assign ${rhsType} to ${declaredType}`,
                  nodeLabel: valueNode.label,
                  severity: "error",
                  suggestion: `Change RHS to match type '${declaredType}'.`,
                });
              }
            }
          }
        }
      }
    }

    if (node.label === "Assignment") {
      const idNode = node.children?.[0] ?? null;
      const exprNode = node.children?.[1] ?? null;

      if (idNode?.label.startsWith("Identifier: ")) {
        const varName = idNode.label.replace("Identifier: ", "");
        const symbol = symbolTable[varName];

        if (!symbol) {
          errors.push({
            message: `Undeclared variable '${varName}' in assignment`,
            nodeLabel: idNode.label,
            severity: "error",
            suggestion: `Declare '${varName}' before using it.`,
          });
        } else {
          symbol.initialized = true;
          markAsUsed(varName);

          const rhsType = inferExpressionType(exprNode);
          if (
            rhsType !== "unknown" &&
            rhsType !== symbol.type &&
            !(symbol.type === "float" && rhsType === "int")
          ) {
            errors.push({
              message: `Type mismatch: cannot assign ${rhsType} to ${symbol.type}`,
              nodeLabel: exprNode?.label,
              severity: "error",
              suggestion: `Fix RHS expression to match type '${symbol.type}'.`,
            });
          }
        }
      }
    }

    if (node.label.startsWith("Value: ")) {
      const token = node.label.replace("Value: ", "");
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
        const symbol = symbolTable[token];
        if (!symbol) {
          errors.push({
            message: `Use of undeclared variable '${token}'`,
            nodeLabel: node.label,
            severity: "error",
            suggestion: `Declare '${token}' before using it.`,
          });
        } else {
          markAsUsed(token);
          if (!symbol.initialized) {
            errors.push({
              message: `Variable '${token}' might be used before initialization`,
              nodeLabel: node.label,
              severity: "warning",
              suggestion: `Initialize '${token}' before use.`,
            });
          }
          return symbol.type;
        }
      } else {
        return inferValueType(token);
      }
    }

    if (
      node.label.startsWith("PrefixOp") ||
      node.label.startsWith("PostfixOp")
    ) {
      const child = node.children?.[0] ?? null;
      if (child?.label.startsWith("Value: ")) {
        const token = child.label.replace("Value: ", "");
        if (!symbolTable[token]) {
          errors.push({
            message: `Cannot apply operator to undeclared variable '${token}'`,
            nodeLabel: node.label,
            severity: "error",
          });
        } else {
          markAsUsed(token);
        }
      }
    }

    for (const child of node.children || []) {
      traverse(child);
    }

    if (
      node.label === "Block" ||
      node.label === "ThenBlock" ||
      node.label === "ElseBlock" ||
      node.label === "Body"
    ) {
      exitScope();
    }

    return "void";
  };

  traverse(root);

  for (const [varName, info] of Object.entries(symbolTable)) {
    if (!info.used) {
      errors.push({
        message: `Variable '${varName}' declared but never used`,
        nodeLabel: varName,
        severity: "warning",
        suggestion: "Consider removing unused variable.",
      });
    }
  }

  return {errors, symbolTable};
}
