export interface Quad {
  op: string;
  arg1: string;
  arg2: string;
  result: string;
}

export function generate3AC(code: string): Quad[] {
  const lines = code.split("\n");
  const result: Quad[] = [];
  let tempVarCount = 1;
  let labelCount = 1;

  const newTemp = () => `t${tempVarCount++}`;
  const newLabel = () => `L${labelCount++}`;

  const parseAndPushStatement = (line: string) => {
    if (line.startsWith("cout")) {
      const contentMatch = line.match(/<<(.*)/);
      const rawContent = contentMatch?.[1];
      if (rawContent) {
        const parts = rawContent.split("<<").map(p => p.replace(";", "").trim());
        if (parts.length === 1) {
          result.push({ op: "print", arg1: parts[0], arg2: "", result: "" });
        } else {
          let temp = parts[0];
          for (let j = 1; j < parts.length; j++) {
            const t = newTemp();
            result.push({ op: "+", arg1: temp, arg2: parts[j], result: t });
            temp = t;
          }
          result.push({ op: "print", arg1: temp, arg2: "", result: "" });
        }
      }
      return;
    }

    if (line.includes("=") && !line.startsWith("if")) {
      const [lhs, rhs] = line.replace(";", "").split("=");
      const rhsTrimmed = rhs.trim();
      const ops = ["+", "-", "*", "/"];
      const opFound = ops.find(op => rhsTrimmed.includes(op));
      if (opFound) {
        const [a, b] = rhsTrimmed.split(opFound);
        const t = newTemp();
        result.push({ op: opFound, arg1: a.trim(), arg2: b.trim(), result: t });
        result.push({ op: "=", arg1: t, arg2: "", result: lhs.trim() });
      } else {
        result.push({ op: "=", arg1: rhsTrimmed, arg2: "", result: lhs.trim() });
      }
      return;
    }
  };

  let functionStarted = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith("//") || line.startsWith("/*")) continue;

    if (/^(int|float)\s+\w+\s*\(.*\)\s*\{?/.test(line)) {
      const funcName = line.match(/^(int|float)\s+(\w+)/)?.[2] ?? "func";
      functionStarted = true;
      result.push({ op: "function", arg1: funcName, arg2: "", result: "" });
      continue;
    }

    if (line.startsWith("int ") || line.startsWith("float ")) {
      const [_, rest] = line.replace(";", "").split(/int |float /);
      if (rest.includes("=")) {
        const [name, value] = rest.split("=");
        result.push({ op: "=", arg1: value.trim(), arg2: "", result: name.trim() });
      }
      continue;
    }

    if (line.startsWith("if")) {
      const condition = line.match(/\((.*)\)/)?.[1];
      if (!condition) continue;

      const parts = condition.split(/([<>=!]=?)/);
      if (parts.length < 3) continue;

      const [a, opRaw, b] = parts;
      const op = opRaw.trim();
      const lTrue = newLabel();
      const lFalse = newLabel();
      const lEnd = newLabel();

      result.push({ op: `if ${op}`, arg1: a.trim(), arg2: b.trim(), result: lTrue });
      result.push({ op: "goto", arg1: "", arg2: "", result: lFalse });
      result.push({ op: "label", arg1: "", arg2: "", result: lTrue });

      while (++i < lines.length && !lines[i].includes("}")) {
        const stmt = lines[i].trim();
        if (stmt) parseAndPushStatement(stmt);
      }

      result.push({ op: "goto", arg1: "", arg2: "", result: lEnd });
      result.push({ op: "label", arg1: "", arg2: "", result: lFalse });

      i++; // Skip else {
      while (++i < lines.length && !lines[i].includes("}")) {
        const stmt = lines[i].trim();
        if (stmt) parseAndPushStatement(stmt);
      }

      result.push({ op: "label", arg1: "", arg2: "", result: lEnd });
      continue;
    }

    if (line.startsWith("return")) {
      const val = line.replace("return", "").replace(";", "").trim();
      result.push({ op: "return", arg1: val, arg2: "", result: "" });
      if (functionStarted) {
        result.push({ op: "end", arg1: "function", arg2: "", result: "" });
        functionStarted = false;
      }
      continue;
    }

    parseAndPushStatement(line);
  }

  return result;
}
