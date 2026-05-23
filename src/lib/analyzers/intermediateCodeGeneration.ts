import {ParseNode} from "./syntaxAnalyzer";

export interface IntermediateInstruction {
  op?: string;
  arg1?: string;
  arg2?: string;
  result?: string;
  label?: string;
}

let tempVarCount = 0;
let labelCount = 0;

function newTemp(): string {
  return `t${tempVarCount++}`;
}

function newLabel(): string {
  return `L${labelCount++}`;
}

export function generateIntermediateCode(
  root: ParseNode | null
): IntermediateInstruction[] {
  const instructions: IntermediateInstruction[] = [];
  tempVarCount = 0;
  labelCount = 0;

  function traverse(node: ParseNode | null): string | undefined {
    if (!node) return;
    console.log("Traversing node:", node.label);

    const {label, children = []} = node;

    switch (true) {
      case label === "Assignment": {
        const idNode = children[0];
        const exprNode = children[1];

        if (idNode?.label.startsWith("Identifier: ")) {
          const varName = idNode.label.replace("Identifier: ", "");
          const exprResult = traverse(exprNode);
          if (exprResult !== undefined) {
            instructions.push({op: "=", arg1: exprResult, result: varName});
          }
          return varName;
        }
        break;
      }

      case label.startsWith("Value: "): {
        return label.replace("Value: ", "");
      }

      case label.startsWith("Identifier: "): {
        return label.replace("Identifier: ", "");
      }

      case label.startsWith("Op: ") && children.length === 2: {
        const left = traverse(children[0]);
        const right = traverse(children[1]);
        const operator = label.replace("Op: ", "");
        const temp = newTemp();
        instructions.push({
          op: operator,
          arg1: left,
          arg2: right,
          result: temp,
        });
        return temp;
      }

      case label.startsWith("PrefixOp"): {
        const op = label.replace("PrefixOp: ", "");
        const operand = traverse(children[0]);
        const temp = newTemp();
        instructions.push({op, arg1: operand, result: temp});
        return temp;
      }

      case label.startsWith("PostfixOp"): {
        const op = label.replace("PostfixOp: ", "");
        const operand = traverse(children[0]);
        const temp = newTemp();
        instructions.push({op, arg1: operand, result: temp});
        return temp;
      }

      case label.startsWith("Declaration: "): {
        for (const child of children) {
          if (child.label.startsWith("Identifier: ")) {
            const varName = child.label.replace("Identifier: ", "");
            if (child.children?.length) {
              const initVal = traverse(child.children[0]);
              if (initVal !== undefined) {
                instructions.push({op: "=", arg1: initVal, result: varName});
              }
            }
          }
        }
        break;
      }

      case label.startsWith("If") && children.length >= 2: {
        const condition = traverse(children[0]);
        const thenLabel = newLabel();
        const elseLabel = children.length === 3 ? newLabel() : undefined;
        const endLabel = newLabel();

        instructions.push({op: "ifgoto", arg1: condition, result: thenLabel});
        if (elseLabel) instructions.push({op: "goto", result: elseLabel});

        instructions.push({label: thenLabel});
        traverse(children[1]);
        instructions.push({op: "goto", result: endLabel});

        if (elseLabel) {
          instructions.push({label: elseLabel});
          traverse(children[2]);
        }

        instructions.push({label: endLabel});
        break;
      }

      case label.startsWith("While") && children.length >= 2: {
        const startLabel = newLabel();
        const bodyLabel = newLabel();
        const endLabel = newLabel();

        instructions.push({label: startLabel});
        const condition = traverse(children[0]);
        instructions.push({op: "ifgoto", arg1: condition, result: bodyLabel});
        instructions.push({op: "goto", result: endLabel});

        instructions.push({label: bodyLabel});
        traverse(children[1]);
        instructions.push({op: "goto", result: startLabel});

        instructions.push({label: endLabel});
        break;
      }

      case label.startsWith("Return"): {
        const expr = children[0];
        const result = expr ? traverse(expr) : undefined;
        instructions.push({op: "return", arg1: result});
        return "";
      }

      default: {
        for (const child of children) traverse(child);
        break;
      }
    }

    return;
  }

  traverse(root);
  return instructions;
}
