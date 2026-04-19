import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, CheckCircle2, Save, Sun, Moon,
  Download, Link2, Activity, Settings2, Code, ShieldCheck, Cpu, PlayCircle, Loader2, Check, X, AlertTriangle
} from 'lucide-react';

import SplashScreen from './SplashScreen';
import { Lexer, Parser, SemanticAnalyzer, CodeGenerator, ExecutionEngine } from './compiler';
import type { Token, RuleAST, SemanticCheck, PatientData, DiagnosisResult } from './compiler';

const SAMPLE_PATIENTS: Record<string, PatientData> = {
  'Arjun (65)':    { age: 65, bp: 'high',   sugar: 220, temp: 38.5, heart_rate: 95, oxygen: 94, weight: 80 },
  'Priya (45)':    { age: 45, bp: 'normal', sugar: 95,  temp: 37.2, heart_rate: 98, oxygen: 98, weight: 65 },
  'Karthik (55)':  { age: 55, bp: 'high',   sugar: 150, temp: 37.8, heart_rate: 93, oxygen: 90, weight: 90 },
  'Divya (8)':     { age: 8,  bp: 'normal', sugar: 85,  temp: 40.0, heart_rate: 99, oxygen: 99, weight: 25 },
  'Rahul (70)':    { age: 70, bp: 'high',   sugar: 280, temp: 38.1, heart_rate: 91, oxygen: 85, weight: 85 },
  'Sneha (35)':    { age: 35, bp: 'low',    sugar: 78,  temp: 37.0, heart_rate: 99, oxygen: 99, weight: 58 },
  'Vikram (52)':   { age: 52, bp: 'high',   sugar: 170, temp: 37.5, heart_rate: 94, oxygen: 94, weight: 95 },
  'Ananya (28)':   { age: 28, bp: 'normal', sugar: 88,  temp: 37.1, heart_rate: 99, oxygen: 99, weight: 55 },
  'Suresh (68)':   { age: 68, bp: 'high',   sugar: 310, temp: 38.9, heart_rate: 88, oxygen: 92, weight: 92 },
  'Meena (15)':    { age: 15, bp: 'normal', sugar: 92,  temp: 39.4, heart_rate: 98, oxygen: 98, weight: 48 },
};

const EXAMPLES = {
  'Diabetes Detection': `patient age > 60\nand sugar > 200\nand bp == "high"\nthen\n  diagnose = "diabetes risk critical"\n  suggest = "consult endocrinologist immediately"\nend`,
  'Heart Risk': `patient age > 50\nand heart_rate > 100\nand bp == "high"\nand oxygen < 95\nthen\n  diagnose = "cardiac arrest risk high"\n  suggest = "emergency cardiology consult"\nend`,
  'Normal Patient': `patient age > 20\nand sugar < 100\nand bp == "normal"\nand oxygen > 97\nthen\n  diagnose = "patient is healthy"\n  suggest = "routine checkup in 6 months"\nend`,
  'Fever Detection': `patient temp > 103\nand age < 10\nthen\n  diagnose = "critical fever in child"\n  suggest = "immediate pediatric attention"\nend`
};

type StageStatus = 'idle' | 'running' | 'success' | 'error';
type OutputTab = 'Tokens' | 'AST' | 'Semantic' | 'IR' | 'Result';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [dsl, setDsl] = useState(EXAMPLES['Diabetes Detection']);
  const [patientName, setPatientName] = useState('Arjun (65)');
  const [patientData, setPatientData] = useState<PatientData>(SAMPLE_PATIENTS['Arjun (65)']);
  const [activeTab, setActiveTab] = useState<OutputTab>('Tokens');
  const [isCompiling, setIsCompiling] = useState(false);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<RuleAST | null>(null);
  const [semanticChecks, setSemanticChecks] = useState<SemanticCheck[]>([]);
  const [llvmCode, setLlvmCode] = useState('');
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('mediscript_theme');
    return stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mediscript_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mediscript_theme', 'light');
    }
  }, [isDark]);

  const [savedRules, setSavedRules] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem('mediscript_rules');
    return stored ? JSON.parse(stored) : {};
  });
  
  const [liveSyntaxStatus, setLiveSyntaxStatus] = useState<{valid: boolean, message: string}>({ valid: true, message: 'Valid Syntax' });

  const [pipeline, setPipeline] = useState<Record<string, { status: StageStatus, time: number }>>({
    'Lexer': { status: 'idle', time: 0 },
    'Parser': { status: 'idle', time: 0 },
    'Semantic': { status: 'idle', time: 0 },
    'Codegen': { status: 'idle', time: 0 },
    'Execute': { status: 'idle', time: 0 },
  });

  useEffect(() => {
    try {
      const lexer = new Lexer(dsl);
      const tkns = lexer.tokenize();
      const parser = new Parser(tkns);
      const parsedAst = parser.parse();
      const semantic = new SemanticAnalyzer(parsedAst);
      const checks = semantic.analyze();
      if (checks.some(c => c.type === 'error')) throw new Error("Semantic Analysis Failed");
      setLiveSyntaxStatus({ valid: true, message: 'Syntax Valid' });
    } catch (e: any) {
      setLiveSyntaxStatus({ valid: false, message: e.message || 'Syntax Error' });
    }
  }, [dsl]);

  const handleSaveRule = () => {
    const name = prompt("Enter a name for your custom rule:");
    if (name) {
      const updated = { ...savedRules, [name]: dsl };
      setSavedRules(updated);
      localStorage.setItem('mediscript_rules', JSON.stringify(updated));
    }
  };

  const handleEditorWillMount = (monaco: any) => {
    monaco.languages.register({ id: 'mediscript' });
    monaco.languages.setMonarchTokensProvider('mediscript', {
      tokenizer: {
        root: [
          [/\b(patient|and|or|then|diagnose|suggest|end|if|else)\b/, "keyword"],
          [/\b(age|bp|sugar|temp|heart_rate|oxygen|weight)\b/, "variable"],
          [/>|<|==|!=|>=|<=|=/, "operator"],
          [/\d+/, "number"],
          [/"[^"]*"/, "string"],
        ]
      }
    });
    monaco.editor.defineTheme('mediscript-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'cba6f7', fontStyle: 'bold' },
        { token: 'variable', foreground: '89dceb', fontStyle: 'italic' },
        { token: 'operator', foreground: 'f38ba8' },
        { token: 'number', foreground: 'fab387' },
        { token: 'string', foreground: 'a6e3a1' },
      ],
      colors: {
        'editor.background': '#1e1e2e'
      }
    });
  };

  const compile = async () => {
    setIsCompiling(true);
    setErrorMsg('');
    setActiveTab('Tokens');
    const perf = window.performance;

    let pState = { ...pipeline };
    Object.keys(pState).forEach(k => pState[k] = { status: 'idle', time: 0 });
    setPipeline({ ...pState });

    try {
      pState['Lexer'].status = 'running'; setPipeline({ ...pState });
      let start = perf.now();
      const lexer = new Lexer(dsl);
      const tkns = lexer.tokenize();
      setTokens(tkns);
      pState['Lexer'].time = parseFloat((perf.now() - start).toFixed(2));
      pState['Lexer'].status = 'success'; setPipeline({ ...pState });

      pState['Parser'].status = 'running'; setPipeline({ ...pState });
      start = perf.now();
      const parser = new Parser(tkns);
      const parsedAst = parser.parse();
      setAst(parsedAst);
      pState['Parser'].time = parseFloat((perf.now() - start).toFixed(2));
      pState['Parser'].status = 'success'; setPipeline({ ...pState });

      pState['Semantic'].status = 'running'; setPipeline({ ...pState });
      start = perf.now();
      const semantic = new SemanticAnalyzer(parsedAst);
      const checks = semantic.analyze();
      setSemanticChecks(checks);
      const hasSemanticError = checks.some(c => c.type === 'error');
      pState['Semantic'].time = parseFloat((perf.now() - start).toFixed(2));
      pState['Semantic'].status = hasSemanticError ? 'error' : 'success'; setPipeline({ ...pState });
      if (hasSemanticError) throw new Error("Semantic Analysis Failed. Check Semantic tab.");

      pState['Codegen'].status = 'running'; setPipeline({ ...pState });
      start = perf.now();
      const codegen = new CodeGenerator(parsedAst);
      const ir = codegen.generate();
      setLlvmCode(ir);
      pState['Codegen'].time = parseFloat((perf.now() - start).toFixed(2));
      pState['Codegen'].status = 'success'; setPipeline({ ...pState });

      pState['Execute'].status = 'running'; setPipeline({ ...pState });
      start = perf.now();
      const exec = new ExecutionEngine(parsedAst, patientData);
      const res = exec.execute();
      pState['Execute'].time = parseFloat((perf.now() - start).toFixed(2));
      pState['Execute'].status = 'success'; setPipeline({ ...pState });
      
      const totalTime = Object.values(pState).reduce((acc, stage) => acc + stage.time, 0);
      setResult({ ...res, compileTimeMs: parseFloat(totalTime.toFixed(2)) });
      setActiveTab('Result');

    } catch (e: any) {
      setErrorMsg(e.message || "Compilation Error");
      const currentStage = Object.keys(pState).find(k => pState[k].status === 'running');
      if (currentStage) {
        pState[currentStage].status = 'error';
        setPipeline({ ...pState });
      }
    } finally {
      setIsCompiling(false);
    }
  };

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setPatientName(name);
    setPatientData(SAMPLE_PATIENTS[name]);
  };

  const handlePatientUpdate = (field: keyof PatientData, value: string | number) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <div className="min-h-screen relative flex flex-col font-sans" style={{backgroundColor:'var(--bg)',color:'var(--text-primary)', opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease'}}>
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10" style={{backgroundColor:'var(--card)'}}>
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-textPrimary tracking-tight">MediScript</span>
        </div>
        <div className="flex items-center space-x-4 text-sm font-medium text-textSecondary">
          <select 
             className="bg-transparent border border-border px-2 py-1 rounded cursor-pointer outline-none hover:border-primary transition-colors focus:outline-none text-textPrimary"
             onChange={(e) => setDsl(e.target.value === 'custom' ? dsl : (EXAMPLES[e.target.value as keyof typeof EXAMPLES] || savedRules[e.target.value]))}
             defaultValue="Diabetes Detection"
          >
             <optgroup label="Examples">
               {Object.keys(EXAMPLES).map(k => <option key={k} value={k}>{k}</option>)}
             </optgroup>
             {Object.keys(savedRules).length > 0 && (
               <optgroup label="Saved Rules">
                 {Object.keys(savedRules).map(k => <option key={`saved-${k}`} value={k}>{k}</option>)}
               </optgroup>
             )}
          </select>
          <a href="#" className="hover:text-primary transition-colors">Docs</a>
          <button
            onClick={() => setIsDark(d => !d)}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg border border-border hover:border-primary text-textSecondary hover:text-primary transition-all"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={compile} className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-lg font-bold flex items-center space-x-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <Play className="h-4 w-4 fill-current" />
            <span>Compile Free</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-textPrimary tracking-tight leading-tight">
            Write Medical Rules in Plain Language.<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Compile to Native Executable.</span>
          </h1>
          <div className="flex justify-center space-x-4">
             <button onClick={() => setDsl(EXAMPLES['Diabetes Detection'])} className="px-6 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-badgePurple transition-colors">
               ▶ Try Diabetes Rule
             </button>
             <button className="px-6 py-3 rounded-lg border border-border text-textSecondary font-semibold transition-colors" style={{backgroundColor:'var(--hover-bg)'}}>
               📖 View Docs
             </button>
          </div>
          <div className="flex justify-center space-x-6 pt-4 text-sm font-medium text-textSecondary">
            <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-1 text-success"/> 5-Stage Pipeline</span>
            <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-1 text-success"/> LLVM IR Output</span>
            <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-1 text-success"/> Real-time Compile</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex items-center justify-between overflow-x-auto">
          {Object.entries(pipeline).map(([stage, info], idx, arr) => (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center min-w-[80px]">
                 <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                     info.status === 'success' ? 'bg-success/10 border-success text-success' :
                     info.status === 'error' ? 'bg-error/10 border-error text-error' :
                     info.status === 'running' ? 'bg-primary/10 border-primary text-primary animate-pulse' :
                     'border-border text-textMuted'
                 }`} style={info.status === 'idle' ? {backgroundColor:'var(--hover-bg)'} : {}}>
                    {info.status === 'success' && <Check className="h-5 w-5" />}
                    {info.status === 'error' && <X className="h-5 w-5" />}
                    {info.status === 'running' && <Loader2 className="h-5 w-5 animate-spin" />}
                    {info.status === 'idle' && <span className="font-bold">{idx + 1}</span>}
                 </div>
                 <span className="mt-2 text-sm font-semibold text-textPrimary tracking-wide uppercase">{stage}</span>
                 {info.time > 0 && <span className="text-xs text-textMuted">{info.time}ms</span>}
              </div>
              {idx < arr.length - 1 && (
                 <div className="flex-grow h-0.5 mx-4 bg-border relative">
                    <div className={`absolute top-0 left-0 h-full bg-success transition-all duration-500 ${info.status === 'success' ? 'w-full' : 'w-0'}`} />
                 </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-4 flex flex-col h-[550px]">
             <div className="flex justify-between items-center">
                 <h2 className="text-lg font-semibold text-textPrimary flex items-center"><Code className="w-5 h-5 mr-2 text-primary"/> DSL input</h2>
                 <div className={`text-xs font-semibold px-2.5 py-1.5 flex items-center rounded-lg shadow-sm border ${liveSyntaxStatus.valid ? 'bg-success/5 text-success border-success/20' : 'bg-error/5 text-error border-error/20'}`}>
                   {liveSyntaxStatus.valid ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />}
                   {liveSyntaxStatus.message.length > 28 ? liveSyntaxStatus.message.substring(0,28) + '...' : liveSyntaxStatus.message}
                 </div>
             </div>
             <div className="flex-grow bg-card rounded-xl border border-border shadow-sm p-2 flex flex-col overflow-hidden relative group">
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={handleSaveRule} className="bg-[#313244]/80 hover:bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-all backdrop-blur-sm shadow-md">
                     <Save className="w-4 h-4 mr-1.5" /> Save Rule
                   </button>
                </div>
                <div className="flex-grow rounded-lg overflow-hidden border border-gray-100 bg-[#1e1e2e]">
                  <Editor 
                     height="100%" 
                     language="mediscript" 
                     theme="mediscript-theme"
                     value={dsl}
                     onChange={(val) => setDsl(val || '')}
                     beforeMount={handleEditorWillMount}
                     options={{ minimap: { enabled: false }, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", padding: { top: 16 } }}
                  />
                </div>
             </div>
             <button onClick={compile} disabled={isCompiling} className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex justify-center items-center">
                {isCompiling ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2 fill-current" />}
                {isCompiling ? 'Compiling Pipeline...' : 'Compile Now'}
             </button>
             {errorMsg && (
                <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl flex items-start">
                   <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                   <p className="text-sm font-medium">{errorMsg}</p>
                </div>
             )}
          </div>

          <div className="space-y-4 flex flex-col h-[550px]">
             <div className="flex justify-between items-center">
                 <h2 className="text-lg font-semibold text-textPrimary flex items-center"><Settings2 className="w-5 h-5 mr-2 text-primary"/> Compiler Output</h2>
             </div>
             <div className="flex-grow bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
                <div className="flex border-b border-border overflow-x-auto" style={{backgroundColor:'var(--hover-bg)'}}>
                  {(['Tokens', 'AST', 'Semantic', 'IR', 'Result'] as OutputTab[]).map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-[80px] py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === tab ? 'text-primary border-primary' : 'text-textSecondary border-transparent hover:text-textPrimary'}`}
                      style={activeTab === tab ? {backgroundColor:'var(--card)'} : {}}>{tab}
                    </button>
                  ))}
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                   
                   {activeTab === 'Tokens' && (
                     <div className="w-full">
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-sm font-semibold text-textSecondary">Token Stream Visualization</span>
                           <span className="bg-badgePurple text-badgeText px-3 py-1 rounded-full text-xs font-bold">{tokens.length} Tokens</span>
                        </div>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-[#6c47ff]/5 border-b border-border text-textSecondary">
                               <tr><th className="p-3">Token</th><th className="p-3">Type</th><th className="p-3">Line</th><th className="p-3">Col</th></tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                               {tokens.map((t, idx) => (
                                 <tr key={idx} className="hover:opacity-80" style={{backgroundColor:'var(--card)'}}>
                                   <td className="p-3 font-mono text-primary font-semibold">{t.value}</td>
                                   <td className="p-3"><span className="text-textSecondary px-2 py-0.5 rounded text-xs border border-border" style={{backgroundColor:'var(--hover-bg)'}}>{t.type}</span></td>
                                   <td className="p-3 text-textMuted">{t.line}</td>
                                   <td className="p-3 text-textMuted">{t.column}</td>
                                 </tr>
                               ))}
                               {tokens.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-textMuted">No tokens generated.</td></tr>}
                            </tbody>
                          </table>
                        </div>
                     </div>
                   )}

                   {activeTab === 'AST' && (
                     <div className="font-mono text-sm">
                       {ast ? (
                         <div className="rounded-lg p-4 border border-border/50 shadow-inner whitespace-pre-wrap" style={{backgroundColor:'var(--hover-bg)'}}>
                            <div className="text-primary font-bold">Rule</div>
                            <div className="ml-4 border-l-2 border-border pl-4 py-2 space-y-4">
                               <div>
                                 <div className="text-secondary font-bold">Conditions</div>
                                 <div className="ml-4 border-l-2 border-border pl-4 py-1 space-y-2 text-textSecondary">
                                    {ast.conditions.map((c, i) => (
                                      <div key={i}>
                                         &#123; <span>id: <span className="text-emerald-500">{c.identifier}</span></span>,
                                         <span> op: <span className="text-orange-500">"{c.operator}"</span></span>,
                                         <span> val: <span className="text-blue-500">{typeof c.value === 'string' ? `"${c.value}"` : c.value}</span></span> &#125;
                                         {i < ast.logicOperators.length && <div className="text-primary font-bold my-1 ms-2">↳ {ast.logicOperators[i].toUpperCase()}</div>}
                                      </div>
                                    ))}
                                 </div>
                               </div>
                               <div>
                                 <div className="text-secondary font-bold">Actions</div>
                                 <div className="ml-4 border-l-2 border-border pl-4 py-1 space-y-1 text-textSecondary">
                                    {ast.actions.map((a, i) => (
                                      <div key={i}>&#123; <span className="text-emerald-500">{a.identifier}</span> = <span className="text-blue-500">"{a.value}"</span> &#125;</div>
                                    ))}
                                 </div>
                               </div>
                            </div>
                         </div>
                       ) : <div className="p-6 text-center text-textMuted">AST not generated.</div>}
                     </div>
                   )}

                   {activeTab === 'Semantic' && (
                     <div className="space-y-3">
                       <h3 className="font-semibold text-textPrimary mb-4">Semantic Analysis Report</h3>
                       {semanticChecks.length === 0 && <div className="p-6 text-center text-textMuted">No semantic checks performed.</div>}
                       {semanticChecks.map((c, i) => (
                         <div key={i} className={`p-3 rounded-lg border flex items-start space-x-3 ${
                            c.type==='success' ? 'bg-success/5 border-success/20 text-success' :
                            c.type==='error' ? 'bg-error/5 border-error/20 text-error' :
                            'bg-warning/5 border-warning/20 text-warning-700'
                         }`}>
                            {c.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                            {c.type === 'error' && <X className="w-5 h-5 flex-shrink-0" />}
                            {c.type === 'warning' && <AlertTriangle className="w-5 h-5 leading-none text-amber-500 flex-shrink-0" />}
                            <span className={`text-sm font-medium ${c.type==='warning'?'text-amber-700':''}`}>{c.message}</span>
                         </div>
                       ))}
                     </div>
                   )}

                   {activeTab === 'IR' && (
                     <div className="relative h-full">
                       <button 
                         onClick={() => {
                           const blob = new Blob([llvmCode], { type: 'text/plain' });
                           const url = URL.createObjectURL(blob);
                           const a = document.createElement('a');
                           a.href = url;
                           a.download = 'mediscript-output.ll';
                           a.click();
                           URL.revokeObjectURL(url);
                         }}
                         className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-colors group" title="Download IR"
                       >
                          <Download className="w-4 h-4" />
                       </button>
                       <div className="bg-[#1e1e2e] text-[#cdd6f4] h-full rounded-lg p-4 font-mono text-[13px] overflow-auto shadow-inner border border-gray-800">
                          <pre><code>{llvmCode || '; LLVM IR Code Generation Not Started'}</code></pre>
                       </div>
                     </div>
                   )}

                   {activeTab === 'Result' && (
                     result ? (
                       <div className="h-full flex flex-col">
                          <div className={`flex-grow rounded-xl border-l-4 p-6 shadow-sm ${
                             result.diagnose.toLowerCase().includes('healthy') || result.diagnose.toLowerCase().includes('normal')
                               ? 'border-l-success bg-success/5 border border-border'
                               : 'border-l-error bg-error/5 border border-border'
                          }`}>
                             <div className="flex items-center mb-6">
                                <ShieldCheck className={`w-6 h-6 mr-2 ${result.diagnose.toLowerCase().includes('healthy') ? 'text-success' : 'text-error'}`} />
                                <h3 className="text-xl font-bold text-textPrimary">Diagnosis Result</h3>
                             </div>

                             <div className="space-y-4">
                                <div>
                                   <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">DIAGNOSIS</p>
                                   <div className={`text-2xl font-black ${result.diagnose.toLowerCase().includes('healthy') ? 'text-success' : 'text-error'}`}>
                                      {result.diagnose.toUpperCase()}
                                   </div>
                                </div>
                                <div className="pt-2">
                                   <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">SUGGESTION</p>
                                   <div className="text-lg font-medium text-textPrimary">
                                      {result.suggest}
                                   </div>
                                </div>
                             </div>
                             
                             <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between text-sm">
                                <div className="flex items-center text-textSecondary">
                                   <Cpu className="w-4 h-4 mr-1"/> Compile Time: <span className="font-bold text-textPrimary ml-1">{result.compileTimeMs}ms</span>
                                </div>
                                <div className="flex items-center text-success font-semibold">
                                   <CheckCircle2 className="w-4 h-4 mr-1"/> Pipeline: Success
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex space-x-3 mt-4">
                             <button className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold text-textPrimary flex justify-center items-center transition-colors" style={{backgroundColor:'var(--card)'}}>
                                <Download className="w-4 h-4 mr-2 text-textMuted"/> Export Report
                             </button>
                             <button className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold text-textPrimary flex justify-center items-center transition-colors" style={{backgroundColor:'var(--card)'}}>
                                <Link2 className="w-4 h-4 mr-2 text-textMuted"/> Share Link
                             </button>
                          </div>
                       </div>
                     ) : (
                       <div className="p-6 text-center text-textMuted">Run compiler to see final result.</div>
                     )
                   )}

                </div>
             </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-4xl mx-auto">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-textPrimary flex items-center"><Activity className="w-6 h-6 mr-2 text-secondary"/> Patient Data Input</h2>
              <div className="flex items-center rounded-lg p-1 border border-border" style={{backgroundColor:'var(--hover-bg)'}}>
                 <select 
                    className="bg-transparent border-none py-1.5 px-3 text-sm font-semibold text-textPrimary outline-none cursor-pointer"
                    value={patientName}
                    onChange={handlePatientSelect}
                 >
                    <option disabled>Load Sample Patient</option>
                    {Object.keys(SAMPLE_PATIENTS).map(k => <option key={k} value={k}>{k}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {(Object.entries(patientData) as [keyof PatientData, string|number][]).map(([key, val]) => (
                 <div key={key} className="space-y-1">
                    <label className="text-xs font-semibold text-textSecondary uppercase">{key.replace('_', ' ')}</label>
                    {key === 'bp' ? (
                       <select value={val} onChange={(e) => handlePatientUpdate('bp', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-textPrimary font-medium" style={{backgroundColor:'var(--input-bg)'}}>
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                       </select>
                    ) : (
                      <input 
                         type="number" 
                         value={val} 
                         onChange={(e) => handlePatientUpdate(key, parseFloat(e.target.value))}
                         className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-textPrimary font-mono font-medium"
                         style={{backgroundColor:'var(--input-bg)'}}
                      />
                    )}
                 </div>
              ))}
           </div>
           
           <div className="flex justify-end">
              <button onClick={() => { setActiveTab('Result'); compile(); }} className="bg-secondary text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow-sm hover:shadow-md transition-all">
                <PlayCircle className="w-4 h-4 mr-2" />
                Run Diagnosis
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
           <div className="border border-border rounded-xl p-6 flex items-center justify-between text-center" style={{backgroundColor:'var(--card)'}}>
              <div className="flex-1">
                 <div className="w-12 h-12 rounded-full bg-badgePurple text-badgeText flex items-center justify-center mx-auto mb-3 font-bold text-lg">1</div>
                 <h4 className="font-semibold text-textPrimary">Write Rule</h4>
                 <p className="text-xs text-textMuted mt-1">Medical DSL snippet</p>
              </div>
              <div className="w-12 h-0.5 bg-border"></div>
              <div className="flex-1">
                 <div className="w-12 h-12 rounded-full bg-badgePurple text-badgeText flex items-center justify-center mx-auto mb-3 font-bold text-lg">2</div>
                 <h4 className="font-semibold text-textPrimary">Compile</h4>
                 <p className="text-xs text-textMuted mt-1">LLVM Generation</p>
              </div>
              <div className="w-12 h-0.5 bg-border"></div>
              <div className="flex-1">
                 <div className="w-12 h-12 rounded-full bg-badgePurple text-badgeText flex items-center justify-center mx-auto mb-3 font-bold text-lg">3</div>
                 <h4 className="font-semibold text-textPrimary">Result</h4>
                 <p className="text-xs text-textMuted mt-1">Actionable Patient Data</p>
              </div>
           </div>
           
           <div className="bg-primary border border-primary/90 text-white rounded-xl p-6 flex items-center justify-around text-center shadow-md bg-gradient-to-br from-[#6c47ff] to-[#4f8ef7]">
              <div>
                 <div className="font-black text-3xl">5</div>
                 <p className="font-semibold text-white/80 text-sm tracking-wide mt-1 uppercase">Pipeline Stages</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div>
                 <div className="font-black text-3xl">10</div>
                 <p className="font-semibold text-white/80 text-sm tracking-wide mt-1 uppercase">Pre-loaded Patients</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div>
                 <div className="font-black text-3xl">&lt;3ms</div>
                 <p className="font-semibold text-white/80 text-sm tracking-wide mt-1 uppercase">Compile Time</p>
              </div>
           </div>
        </div>

      </main>

      <footer className="mt-12 border-t border-border py-8 text-center" style={{backgroundColor:'var(--card)'}}>
         <div className="max-w-7xl mx-auto px-6">
            <h4 className="font-bold text-textPrimary text-lg">MediScript v1.0</h4>
            <p className="text-textMuted mt-1 text-sm">End-to-End DSL Compiler Project | Apr 2026</p>
         </div>
      </footer>
    </div>
    </>
  );
}
