# ⚡ SyncIDE: An Interactive Compiler Analysis Platform & Web IDE

SyncIDE is a production-grade, highly interactive web-based Integrated Development Environment (IDE) and visual compiler analysis platform. It is engineered to bridge the gap between high-level code editing and the core inner workings of compilers. 

Featuring an industrial code editor, real-time database synchronization, cloud security authentication, and an active visual compilation analysis pipeline, SyncIDE decomposes high-level code constructs into their primary compiler representations (tokens, parse trees, type systems, and intermediate code) dynamically as you type.

🖥️ **Live Production Build:** [https://syncide-two.vercel.app](https://syncide-two.vercel.app)

---

## 🚀 Key Architectural pillars

### 1. High-Performance Coding Workspace
- **Monaco Editor Core:** Powered by the `@monaco-editor/react` library, bringing Microsoft’s VS Code editing ecosystem directly to the browser.
- **Language Configurations:** Dynamic support for **C++**, **Java**, **Python**, and **JavaScript** with personalized code templates, tab indentation, and intelligent workspace preservation.
- **Global State Store:** Driven by a decoupled, lightweight reactive [Zustand](https://zustand-demo.pmnd.rs/) architecture (`useCodeEditorStore.ts`) to maintain synchronized editor states, compilation output, selected active themes, and execution variables.

### 2. Full Compiler Analysis Pipeline (Real-Time)
Unlike static code displays, SyncIDE runs a custom compiler analysis suite written in pure TypeScript (`src/lib/analyzers/`), allowing you to dissect any code block down to the metal:

- **Lexical Analysis (Scanner):** Inspects raw text input character-by-character, applying regular expression patterns and finite automata logic to categorize code into categorized tokens (e.g., `Keyword`, `Identifier`, `Operator`, `Literal`, `Delimiter`). Results are formatted into a searchable, categorized Token Table.
- **Syntax Analysis (Parser):** Validates token sequences against programming grammar rules to reconstruct structural relationships, parsing nested patterns and returning an interactive hierarchical Abstract Syntax Tree (AST).
- **Semantic Analysis:** Performs context-sensitive static analysis. It establishes a Symbol Table, resolves variable bindings, enforces type-safety constraints, and throws custom validation errors for logical violations (e.g., redeclared variables, undefined scopes, or type mismatches).
- **Intermediate Code Generation (IR):** Translates syntax structures into a flat, optimized Intermediate Representation (IR), showcasing how compilers optimize and prepare code for low-level machine execution.

### 3. Serverless Reactive Database Layer
- **Convex Cloud Backend:** Fully reactive cloud storage (`convex/`) designed to save, sync, and load code snippets instantly in real-time, completely bypassing traditional HTTP polling overhead.
- **Clerk Authentication:** Encrypts user workspaces and profiles with advanced multi-tenant authentication protocols, ensuring secure access to personal snippet dashboards and account preferences.
- **Tiered Subscriptions:** Features custom pricing models and active user profile interfaces built to handle premium developer tiers.

---

## 📂 Project Directory Structure

```text
syncide/
├── .npmrc                        # Bypass strict peer-dependency checks on Next.js 15+
├── next.config.ts                # Next.js compiler and build optimization settings
├── postcss.config.mjs            # Style compilation options
├── tailwind.config.ts            # Premium UI theme colors, typography, and spacing
├── tsconfig.json                 # Strict TypeScript typing rules
├── package.json                  # Main dependency registry (React 19, Monaco, Clerk, Convex)
│
├── convex/                       # Serverless database schemas, functions, and queries
│   ├── auth.config.ts            # Clerk database sync configurations
│   ├── schema.ts                 # Real-time document tables definition
│   └── snippets.ts               # CRUD queries for developer snippets
│
├── src/
│   ├── app/                      # Next.js App Router Pages & Layouts
│   │   ├── (root)/               # Main Interactive IDE Workspace
│   │   ├── analyse/              # Compiler Pipeline sub-routes
│   │   │   ├── intermediateCode/ # IR visualization page
│   │   │   ├── lexical/          # Scanner token table page
│   │   │   ├── semantic/         # Semantic type-checking page
│   │   │   └── syntax/           # AST parse tree visualizer page
│   │   ├── pricing/              # Subscriptions tier selection
│   │   ├── profile/              # User profile & developer analytics dashboard
│   │   ├── snippets/             # Public and shared snippets portal
│   │   ├── layout.tsx            # Global layout wrapper
│   │   └── globals.css           # Custom scrollbars, styling tokens, and animations
│   │
│   ├── components/               # Shared visual primitives and layout panels
│   │   ├── Header.tsx            # Context-aware compilation header
│   │   ├── NavigationHeader.tsx  # Dynamic application dashboard navigation
│   │   ├── Footer.tsx            # Static footer branding
│   │   └── providers/            # React 19 Clerk & Convex provider context tree
│   │
│   ├── lib/                      # Pure Logic Modules
│   │   └── analyzers/            # Compilation algorithms
│   │       ├── lexicalAnalyzer.ts            # Automata token scanner
│   │       ├── syntaxAnalyzer.ts             # AST grammar parser
│   │       ├── semanticAnalyzer.ts           # Symbol table & type checking
│   │       └── intermediateCodeGeneration.ts # IR generator
│   │
│   ├── store/                    # Zustand Store definitions
│   │   └── useCodeEditorStore.ts # Editor settings, code state, and language states
│   │
│   └── types/                    # Domain typescript definitions
```

---

## 🛠️ Step-by-Step Developer Setup Guide

### Prerequisites
- Install **Node.js** (v18.0.0 or higher is highly recommended).
- A **Convex** account (for cloud database) and a **Clerk** account (for auth).

### 1. Clone the Repository
```bash
git clone https://github.com/Zzz-Pranjal-Kundu/SyncIDE.git
cd SyncIDE
```

### 2. Install Project Dependencies
To install dependencies safely alongside React 19 and Monaco without strict peer disputes, run:
```bash
npm install --legacy-peer-deps
```

### 3. Setup Your Environment Configurations
Create a `.env.local` file in your root folder and add the following keys from your Clerk and Convex developer dashboards:
```ini
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CONVEX_DEPLOYMENT=dev:...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
```

### 4. Initialize Your Backend Services
In a separate terminal tab, spin up Convex to automatically provision your reactive database schema:
```bash
npx convex dev
```

### 5. Run the Local Development Server
Launch your Next.js frontend workspace:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. Your IDE, editor state, and analyzer modules are fully live and reactive!

---

## 📦 Production Compilation & Deployment

To build the project for production locally or on hosting platforms like Vercel:

```bash
# Compile and build Next.js application
npm run build

# Start optimized server
npm run start
```

*Note: The project includes a pre-configured `.npmrc` file containing `legacy-peer-deps=true` to automatically bypass strict peer dependency conflicts in cloud Vercel installations.*

---

## 🤝 Contributing
Contributions, bug reports, and suggestions are welcome! Feel free to open an Issue or submit a Pull Request to help refine compiler visualization algorithms and Monaco workspace interfaces.

---

Made with love by ZzzPranjalKunduzzZ
