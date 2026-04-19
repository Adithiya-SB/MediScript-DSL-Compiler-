import type { Token, RuleAST, ConditionAST, ActionAST } from './types';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;
  
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }
  
  private peek(): Token {
    return this.tokens[this.pos];
  }
  
  private consume(): Token {
    return this.tokens[this.pos++];
  }
  
  private expect(type: string, value?: string) {
    const current = this.peek();
    if (current.type !== type || (value && current.value !== value)) {
      throw new Error(`Parse Error at line ${current.line}, col ${current.column}: Expected ${value ? `'${value}'` : type}, found '${current.value}'`);
    }
    return this.consume();
  }
  
  public parse(): RuleAST {
    let current = this.peek();
    if (current.type === 'EOF') {
       throw new Error('Parse Error: Empty token stream');
    }

    this.expect('KEYWORD', 'patient');
    
    const conditions: ConditionAST[] = [];
    const logicOperators: string[] = [];
    
    // Parse conditions
    while (this.peek().value !== 'then' && this.peek().type !== 'EOF') {
      if (conditions.length > 0) {
        const opToken = this.consume();
        if (opToken.value !== 'and' && opToken.value !== 'or') {
          throw new Error(`Parse Error at line ${opToken.line}: Expected 'and' or 'or' logic operator`);
        }
        logicOperators.push(opToken.value);
      }
      
      const identToken = this.expect('IDENTIFIER');
      const operatorToken = this.expect('OPERATOR');
      const valToken = this.consume();
      
      if (valToken.type !== 'NUMBER' && valToken.type !== 'STRING') {
        throw new Error(`Parse Error at line ${valToken.line}: Condition value must be NUMBER or STRING`);
      }
      
      conditions.push({
        type: 'Condition',
        identifier: identToken.value,
        operator: operatorToken.value,
        value: valToken.type === 'NUMBER' ? parseFloat(valToken.value) : valToken.value,
      });
    }
    
    this.expect('KEYWORD', 'then');
    
    const actions: ActionAST[] = [];
    // Parse actions
    while (this.peek().value !== 'end' && this.peek().type !== 'EOF') {
      const actIdent = this.expect('KEYWORD'); // diagnose, suggest are keywords
      if (actIdent.value !== 'diagnose' && actIdent.value !== 'suggest') {
          throw new Error(`Parse Error: Expected 'diagnose' or 'suggest' action, found '${actIdent.value}'`);
      }
      
      this.expect('OPERATOR', '=');
      const actVal = this.expect('STRING');
      
      actions.push({
        type: 'Action',
        identifier: actIdent.value,
        value: actVal.value
      });
    }
    
    this.expect('KEYWORD', 'end');
    
    return {
      type: 'Rule',
      conditions,
      logicOperators,
      actions
    };
  }
}
