import type { RuleAST, PatientData, DiagnosisResult } from './types';

export class ExecutionEngine {
  private ast: RuleAST;
  private patient: PatientData;

  constructor(ast: RuleAST, patient: PatientData) {
    this.ast = ast;
    this.patient = patient;
  }

  public execute(): DiagnosisResult {
    const defaultRes: DiagnosisResult = {
      diagnose: 'Healthy',
      suggest: 'No critical condition matched. Routine checkup.',
      success: true
    };
    
    if (this.ast.conditions.length === 0) return defaultRes;

    let evalResults: boolean[] = [];

    for (const cond of this.ast.conditions) {
      const pVal = this.patient[cond.identifier as keyof PatientData];
      let res = false;
      if (typeof pVal === 'number' && typeof cond.value === 'number') {
        switch (cond.operator) {
          case '>': res = pVal > cond.value; break;
          case '<': res = pVal < cond.value; break;
          case '>=': res = pVal >= cond.value; break;
          case '<=': res = pVal <= cond.value; break;
          case '==': res = pVal === cond.value; break;
          case '!=': res = pVal !== cond.value; break;
        }
      } else if (typeof pVal === 'string' && typeof cond.value === 'string') {
         switch (cond.operator) {
          case '==': res = pVal === cond.value; break;
          case '!=': res = pVal !== cond.value; break;
        }
      }
      evalResults.push(res);
    }
    
    let finalResult = evalResults[0] ?? false;
    for (let i = 0; i < this.ast.logicOperators.length; i++) {
        const op = this.ast.logicOperators[i];
        const nextRes = evalResults[i + 1] ?? false;
        if (op === 'and') {
            finalResult = finalResult && nextRes;
        } else if (op === 'or') {
            finalResult = finalResult || nextRes;
        }
    }
    
    if (finalResult) {
        const diagAction = this.ast.actions.find(a => a.identifier === 'diagnose')?.value || 'Unknown Diagnosis';
        const sugAction = this.ast.actions.find(a => a.identifier === 'suggest')?.value || 'No suggestion available';
        return {
           diagnose: diagAction,
           suggest: sugAction,
           success: true
        };
    }
    
    return defaultRes;
  }
}
