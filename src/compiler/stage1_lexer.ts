import type { Token, TokenType } from './types';

export class Lexer {
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private source: string;
  
  private KEYWORDS = ['patient', 'and', 'or', 'then', 'diagnose', 'suggest', 'end', 'if', 'else'];
  
  constructor(source: string) {
    this.source = source;
  }
  
  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.source.length) {
      const char = this.source[this.pos];
      
      // Skip whitespace
      if (/[\s\n\r\t]/.test(char)) {
        if (char === '\n') {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }
        this.pos++;
        continue;
      }
      
      // Operators
      if (/[<>=!]/.test(char)) {
        let op = char;
        let c = this.column;
        this.pos++;
        this.column++;
        if (this.pos < this.source.length && this.source[this.pos] === '=') {
          op += '=';
          this.pos++;
          this.column++;
        }
        tokens.push({ type: 'OPERATOR', value: op, line: this.line, column: c });
        continue;
      }
      
      // Numbers
      if (/[0-9]/.test(char)) {
        let numStart = this.pos;
        let c = this.column;
        let hasDot = false;
        while (this.pos < this.source.length && /[0-9.]/.test(this.source[this.pos])) {
          if (this.source[this.pos] === '.') {
            if (hasDot) break;
            hasDot = true;
          }
          this.pos++;
          this.column++;
        }
        tokens.push({ type: 'NUMBER', value: this.source.slice(numStart, this.pos), line: this.line, column: c });
        continue;
      }
      
      // Strings
      if (char === '"' || char === "'") {
        let quote = char;
        let c = this.column;
        this.pos++;
        this.column++;
        let strStart = this.pos;
        while (this.pos < this.source.length && this.source[this.pos] !== quote) {
          this.pos++;
          this.column++;
        }
        let val = this.source.slice(strStart, this.pos);
        this.pos++; // skip closing quote
        this.column++;
        tokens.push({ type: 'STRING', value: val, line: this.line, column: c });
        continue;
      }
      
      // Words (Keywords, Identifiers)
      if (/[a-zA-Z_]/.test(char)) {
        let wordStart = this.pos;
        let c = this.column;
        while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.pos])) {
          this.pos++;
          this.column++;
        }
        let word = this.source.slice(wordStart, this.pos);
        let type: TokenType = 'IDENTIFIER';
        if (this.KEYWORDS.includes(word)) {
          type = 'KEYWORD';
        }
        tokens.push({ type, value: word, line: this.line, column: c });
        continue;
      }
      
      // Unknown char
      this.pos++;
      this.column++;
    }
    
    tokens.push({ type: 'EOF', value: '', line: this.line, column: this.column });
    return tokens;
  }
}
