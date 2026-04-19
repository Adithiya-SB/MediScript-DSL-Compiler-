import type { RuleAST, SemanticCheck } from './types';

export class SemanticAnalyzer {
  private ast: RuleAST;
  private checks: SemanticCheck[] = [];
  
  private validFields = ['age', 'bp', 'sugar', 'temp', 'heart_rate', 'oxygen', 'weight'];
  
  constructor(ast: RuleAST) {
    this.ast = ast;
  }
  
  public analyze(): SemanticCheck[] {
    let id = 1;
    let hasError = false;
    
    // Check conditions
    for (const cond of this.ast.conditions) {
      if (!this.validFields.includes(cond.identifier)) {
        this.checks.push({ id: id++, type: 'error', message: `Invalid patient field: '${cond.identifier}'` });
        hasError = true;
      } else {
        // Field is valid, check bounds and types
        if (cond.identifier === 'bp') {
          if (cond.operator !== '==' && cond.operator !== '!=') {
            this.checks.push({ id: id++, type: 'error', message: `Field 'bp' only supports '==' or '!=' operators.` });
            hasError = true;
          }
          if (typeof cond.value !== 'string' || !['low', 'normal', 'high'].includes(cond.value)) {
            this.checks.push({ id: id++, type: 'error', message: `Field 'bp' must be "low", "normal", or "high".` });
            hasError = true;
          }
        } else {
          // Numeric fields
          if (typeof cond.value !== 'number') {
            this.checks.push({ id: id++, type: 'error', message: `Field '${cond.identifier}' requires a numeric value.` });
            hasError = true;
          } else {
            // Check bounds warnings
            const val = cond.value as number;
            if (cond.identifier === 'age' && (val < 0 || val > 120)) {
               this.checks.push({ id: id++, type: 'warning', message: `Age ${val} is outside normal bounds (0-120).` });
            }
            if (cond.identifier === 'oxygen' && (val < 0 || val > 100)) {
               this.checks.push({ id: id++, type: 'warning', message: `Oxygen ${val} is outside normal bounds (0-100).` });
            }
            if (cond.identifier === 'sugar' && (val < 0 || val > 500)) {
               this.checks.push({ id: id++, type: 'warning', message: `Sugar ${val} is outside normal bounds (0-500).` });
            }
          }
        }
      }
    }
    
    // Check actions for duplicate diagnose
    let diagnoseCount = 0;
    let suggestCount = 0;
    
    for (const act of this.ast.actions) {
      if (act.identifier === 'diagnose') diagnoseCount++;
      if (act.identifier === 'suggest') suggestCount++;
    }
    
    if (diagnoseCount > 1) {
      this.checks.push({ id: id++, type: 'error', message: `Multiple 'diagnose' statements found.` });
      hasError = true;
    }
    if (suggestCount > 1) {
      this.checks.push({ id: id++, type: 'error', message: `Multiple 'suggest' statements found.` });
      hasError = true;
    }
    if (diagnoseCount === 0) {
       this.checks.push({ id: id++, type: 'error', message: `Missing 'diagnose' statement in actions.` });
       hasError = true;
    }
    
    if (!hasError) {
       this.checks.unshift({ id: id++, type: 'success', message: `All syntax and type checks passed.` });
    }
    
    return this.checks;
  }
}
