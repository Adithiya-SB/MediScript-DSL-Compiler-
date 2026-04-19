import type { RuleAST } from './types';

export class CodeGenerator {
  private ast: RuleAST;
  private ir: string[] = [];

  constructor(ast: RuleAST) {
    this.ast = ast;
  }
  
  public generate(): string {
    this.ir.push('define i32 @diagnose_patient(');
    
    this.ir.push('    i32 %age,');
    this.ir.push('    i8* %bp,');
    this.ir.push('    i32 %sugar,');
    this.ir.push('    float %temp,');
    this.ir.push('    i32 %heart_rate,');
    this.ir.push('    i32 %oxygen,');
    this.ir.push('    float %weight) {');
    this.ir.push('entry:');
    
    let condRefs: string[] = [];
    
    this.ast.conditions.forEach((cond, index) => {
      const typeStr = cond.identifier === 'temp' || cond.identifier === 'weight' ? 'float' : (cond.identifier === 'bp' ? 'i8*' : 'i32');
      const opStr = this.getLLVMCompOp(cond.operator, typeStr === 'float');
      const valStr = cond.identifier === 'bp' ? `"${cond.value}"` : cond.value;
      const refName = `%cond${index + 1}`;
      
      this.ir.push(`  ${refName} = icmp ${opStr} ${typeStr} %${cond.identifier}, ${valStr}`);
      condRefs.push(refName);
    });
    
    // Logic Operators
    let lastRef = condRefs[0];
    for (let i = 0; i < this.ast.logicOperators.length; i++) {
        const op = this.ast.logicOperators[i]; // 'and' | 'or'
        const nextRef = condRefs[i + 1];
        const newRef = i === this.ast.logicOperators.length - 1 ? '%final' : `%res${i + 1}`;
        this.ir.push(`  ${newRef} = ${op} i1 ${lastRef}, ${nextRef}`);
        lastRef = newRef;
    }
    
    const finalCondRef = condRefs.length === 1 ? condRefs[0] : '%final';
    this.ir.push(`  br i1 ${finalCondRef}, label %then, label %else`);
    this.ir.push('');
    this.ir.push('then:');
    const diag = this.ast.actions.find(a => a.identifier === 'diagnose')?.value || '';
    this.ir.push(`  ret i8* "${diag}"`);
    this.ir.push('');
    this.ir.push('else:');
    this.ir.push(`  ret i8* "no critical condition"`);
    this.ir.push('}');
    
    return this.ir.join('\n');
  }

  private getLLVMCompOp(op: string, isFloat: boolean): string {
    const floatOps: Record<string, string> = { '>': 'ogt', '<': 'olt', '==': 'oeq', '!=': 'one', '>=': 'oge', '<=': 'ole' };
    const intOps: Record<string, string> = { '>': 'sgt', '<': 'slt', '==': 'eq', '!=': 'ne', '>=': 'sge', '<=': 'sle' };
    return isFloat ? floatOps[op] || 'eq' : intOps[op] || 'eq';
  }
}
