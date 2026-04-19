export type TokenType = 
  | 'KEYWORD' 
  | 'IDENTIFIER' 
  | 'OPERATOR' 
  | 'NUMBER' 
  | 'STRING' 
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface ASTNode {
  type: string;
  [key: string]: any;
}

export interface RuleAST extends ASTNode {
  type: 'Rule';
  conditions: ConditionAST[];
  logicOperators: string[]; // 'and' | 'or' between conditions
  actions: ActionAST[];
}

export interface ConditionAST extends ASTNode {
  type: 'Condition';
  identifier: string;
  operator: string;
  value: string | number;
}

export interface ActionAST extends ASTNode {
  type: 'Action';
  identifier: string; // 'diagnose' or 'suggest'
  value: string;
}

export interface SemanticCheck {
  id: number;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export interface PatientData {
  age: number;
  bp: 'low' | 'normal' | 'high';
  sugar: number;
  temp: number;
  heart_rate: number;
  oxygen: number;
  weight: number;
}

export interface DiagnosisResult {
  diagnose: string;
  suggest: string;
  success: boolean;
  compileTimeMs?: number;
  error?: string;
}
