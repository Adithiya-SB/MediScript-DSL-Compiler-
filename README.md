<div align="center">

<img src="src/assets/splash_bg.png" alt="MediScript Banner" width="100%" style="border-radius:12px; max-height:320px; object-fit:cover;" />

<br/><br/>

<h1>🏥 MediScript — Medical DSL Compiler</h1>

<p><strong>An end-to-end Domain-Specific Language compiler that transforms plain-English medical diagnosis rules into native executable output through a complete 5-stage compilation pipeline.</strong></p>

<br/>

[![Build Status](https://img.shields.io/badge/build-passing-10b981?style=for-the-badge&logo=vite&logoColor=white)](https://github.com/Adithiya-SB/MediScript-DSL-Compiler-)[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-6c47ff?style=for-the-badge)](LICENSE)

<br/>

[**🚀 Deploy Your Own**](https://vercel.com/new/clone?repository-url=https://github.com/Adithiya-SB/MediScript-DSL-Compiler-) · [**📖 Documentation**](#-dsl-language-reference) · [**🐛 Report Bug**](https://github.com/Adithiya-SB/MediScript-DSL-Compiler-/issues/new?labels=bug&template=bug_report.md) · [**✨ Request Feature**](https://github.com/Adithiya-SB/MediScript-DSL-Compiler-/issues/new?labels=enhancement&template=feature_request.md)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [DSL Language Reference](#-dsl-language-reference)
- [Compiler Pipeline](#-compiler-pipeline)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Sample DSL Programs](#-sample-dsl-programs)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**MediScript** is a production-grade compiler project designed for academic and practical demonstration of compiler construction principles. It implements a **custom medical Domain-Specific Language (DSL)** that allows doctors and researchers to write human-readable diagnosis rules, which are then compiled through a **5-stage pipeline** — from raw source text all the way to native executable output.

The project includes a fully interactive **AI2SQL-inspired SaaS web interface** with:
- A **Monaco Code Editor** with custom MediScript syntax highlighting
- Real-time **live syntax validation** as-you-type
- **LLVM-style IR code generation** output
- **10 pre-loaded Indian patient datasets** for instant testing
- **Dark / Light theme** toggle with localStorage persistence
- A **6-second cinematic splash screen** on startup
- **Save custom rules** to browser localStorage

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔤 **Custom DSL Grammar** | A purpose-built medical language with 15+ keywords |
| 🔬 **5-Stage Compiler Pipeline** | Lexer → Parser → Semantic Analyzer → IR Codegen → Execution Engine |
| ⚡ **Real-time Compilation** | Full pipeline executes in under 3ms in-browser |
| 🎨 **Custom Syntax Highlighting** | Monaco Editor with color-coded MediScript tokens |
| 🧠 **Live Syntax Validation** | Errors flagged on every keystroke before compilation |
| 💾 **Save Custom Rules** | Rules persisted to localStorage with dropdown recall |
| 🌙 **Dark / Light Theme** | Toggled from the navbar, preference saved across sessions |
| 🎬 **Cinematic Intro Screen** | 6-second animated splash with medical hologram imagery |
| 🧑‍⚕️ **Patient Data Engine** | 10 pre-loaded patients + fully editable form fields |
| 📦 **LLVM IR Output** | Downloadable `.ll` intermediate representation file |

---

## 🎬 Demo

> Open the app and a 6-second cinematic splash screen plays, followed by the full compiler dashboard.

**Compilation flow:**

```
Write DSL Rule  →  Click Compile  →  View Tokens, AST, Semantic Report, LLVM IR, Result
```

**Example output tabs:**

| Tab | Contents |
|---|---|
| `Tokens` | Full tokenized stream with type, line, and column |
| `AST` | Visual Abstract Syntax Tree with condition and action nodes |
| `Semantic` | ✅/❌ per-check semantic analysis report |
| `IR` | Raw LLVM-style intermediate representation (downloadable) |
| `Result` | Final diagnosis + suggestion + compile time |

---

## 📝 DSL Language Reference

MediScript uses a clean, readable syntax. Rules follow this grammar:

```
patient <field> <operator> <value>
and|or  <field> <operator> <value>
...
then
  diagnose = "<diagnosis string>"
  suggest  = "<suggestion string>"
end
```

### Supported Fields

| Field | Type | Description | Valid Range |
|---|---|---|---|
| `age` | Integer | Patient age in years | 0 – 120 |
| `bp` | String | Blood pressure level | `"low"` \| `"normal"` \| `"high"` |
| `sugar` | Integer | Blood glucose (mg/dL) | 0 – 500 |
| `temp` | Float | Body temperature (°F) | 90 – 115 |
| `heart_rate` | Integer | Beats per minute | 30 – 250 |
| `oxygen` | Integer | SpO₂ percentage | 50 – 100 |
| `weight` | Integer | Weight in kg | 1 – 300 |

### Operators

| Operator | Meaning |
|---|---|
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal |
| `<=` | Less than or equal |
| `==` | Equal to |
| `!=` | Not equal to |

### Keywords

```
patient  and  or  then  diagnose  suggest  end  if  else
```

---

## ⚙️ Compiler Pipeline

```
Source DSL Text
      │
      ▼
┌─────────────────────┐
│  Stage 1: LEXER     │  Tokenizes keywords, identifiers, operators, strings
└──────────┬──────────┘
           │  Token Stream
           ▼
┌─────────────────────┐
│  Stage 2: PARSER    │  Recursive descent → Abstract Syntax Tree (AST)
└──────────┬──────────┘
           │  RuleAST
           ▼
┌──────────────────────────┐
│  Stage 3: SEMANTIC       │  Type checks, field validation, range bounds
│          ANALYZER        │
└──────────┬───────────────┘
           │  Validated AST
           ▼
┌──────────────────────────┐
│  Stage 4: IR CODE        │  Generates LLVM-style Intermediate Representation
│          GENERATOR       │
└──────────┬───────────────┘
           │  IR Code (.ll)
           ▼
┌──────────────────────────┐
│  Stage 5: EXECUTION      │  Evaluates rules against PatientData in-memory
│          ENGINE          │
└──────────┬───────────────┘
           │
           ▼
    Diagnosis Result
  { diagnose, suggest, compileTimeMs }
```

Each stage runs independently and is timed separately. Errors in any stage halt execution and report back to the UI.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 + Custom CSS Variables |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Icons** | Lucide React |
| **Compiler** | Handwritten in TypeScript (no parser generators) |
| **State Management** | React `useState` / `useEffect` |
| **Persistence** | Browser `localStorage` |

---

## 📁 Project Structure

```
src/
├── compiler/
│   ├── types.ts              # Token, AST, SemanticCheck, PatientData types
│   ├── stage1_lexer.ts       # Tokenizer / Lexical analyzer
│   ├── stage2_parser.ts      # Recursive descent parser → AST
│   ├── stage3_semantic.ts    # Semantic validation engine
│   ├── stage4_codegen.ts     # LLVM IR code generator
│   ├── stage5_execution.ts   # In-memory execution engine
│   └── index.ts              # Barrel export
├── assets/
│   └── splash_bg.png         # AI-generated splash screen image
├── SplashScreen.tsx          # Cinematic 6-second intro animation
├── App.tsx                   # Main application + UI layout
├── main.tsx                  # React entry point
└── index.css                 # Tailwind + dual theme CSS variables
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/mediscript-dsl-compiler.git

# 2. Navigate to project directory
cd mediscript-dsl-compiler

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready for deployment on Vercel, Netlify, or any static host.

---

## 📄 Sample DSL Programs

### Diabetes Risk Detection

```
patient age > 60
and sugar > 200
and bp == "high"
then
  diagnose = "diabetes risk critical"
  suggest = "consult endocrinologist immediately"
end
```

### Cardiac Arrest Risk

```
patient age > 50
and heart_rate > 100
and bp == "high"
and oxygen < 95
then
  diagnose = "cardiac arrest risk high"
  suggest = "emergency cardiology consult"
end
```

### Healthy Patient Check

```
patient age > 20
and sugar < 100
and bp == "normal"
and oxygen > 97
then
  diagnose = "patient is healthy"
  suggest = "routine checkup in 6 months"
end
```

### Pediatric Fever

```
patient temp > 103
and age < 10
then
  diagnose = "critical fever in child"
  suggest = "immediate pediatric attention"
end
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please make sure your code follows the existing TypeScript conventions and passes `npm run build` before submitting.

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

**Built with ❤️ using React + TypeScript + Vite**

*End-to-End DSL Compiler Project | Apr 2026*

</div>
