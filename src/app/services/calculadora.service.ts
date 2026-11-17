import { Injectable } from '@angular/core';

export interface Calculation {
  expression: string;
  result: string;
}

@Injectable({
  providedIn: 'root',
})
export class CalculadoraService {
  private readonly history: Calculation[] = [];

  sumar(a: number, b: number): number { return a + b; }
  restar(a: number, b: number): number { return a - b; }
  multiplicar(a: number, b: number): number { return a * b; }

  dividir(a: number, b: number): number {
    if (b === 0) {
      throw new Error('No se puede dividir entre cero.');
    }
    return a / b;
  }

  raizCuadrada(value: number): number {
    if (value < 0) {
      throw new Error('La raíz cuadrada requiere un número no negativo.');
    }
    return Math.sqrt(value);
  }

  potencia(base: number, exponent: number): number {
    return Math.pow(base, exponent);
  }

  logaritmo(value: number, base: 10 | 'natural' = 10): number {
    if (value <= 0) {
      throw new Error('El logaritmo requiere un número positivo.');
    }
    return base === 'natural' ? Math.log(value) : Math.log10(value);
  }

  evaluar(expression: string): number {
    const parser = new ExpressionParser(expression, this);
    const result = parser.parse();
    if (!Number.isFinite(result)) {
      throw new Error('La operación produce un resultado inválido.');
    }
    return result;
  }

  guardar(expression: string, result: number): void {
    this.history.unshift({ expression, result: this.formatear(result) });
  }

  obtenerHistorial(): Calculation[] {
    return [...this.history];
  }

  limpiarHistorial(): void {
    this.history.length = 0;
  }

  formatear(value: number): string {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(10)));
  }
}

class ExpressionParser {
  private position = 0;
  private readonly tokens: string[];

  constructor(private readonly expression: string, private readonly calculator: CalculadoraService) {
    this.tokens = expression.match(/(?:\d+(?:\.\d*)?|\.\d+|[a-z]+|[()+\-*/%^])/gi) ?? [];
    if (this.tokens.join('') !== expression.replace(/\s/g, '')) {
      throw new Error('La expresión contiene caracteres inválidos.');
    }
  }

  parse(): number {
    if (!this.tokens.length) {
      throw new Error('Ingresa una operación.');
    }
    const value = this.parseAddition();
    if (this.position !== this.tokens.length) {
      throw new Error('La expresión está incompleta.');
    }
    return value;
  }

  private parseAddition(): number {
    let value = this.parseMultiplication();
    while (this.match('+', '-')) {
      const operator = this.previous();
      const right = this.parseMultiplication();
      value = operator === '+' ? this.calculator.sumar(value, right) : this.calculator.restar(value, right);
    }
    return value;
  }

  private parseMultiplication(): number {
    let value = this.parsePower();
    while (this.match('*', '/')) {
      const operator = this.previous();
      const right = this.parsePower();
      value = operator === '*' ? this.calculator.multiplicar(value, right) : this.calculator.dividir(value, right);
    }
    return value;
  }

  private parsePower(): number {
    let value = this.parseUnary();
    if (this.match('^')) {
      value = this.calculator.potencia(value, this.parsePower());
    }
    return value;
  }

  private parseUnary(): number {
    if (this.match('+')) return this.parseUnary();
    if (this.match('-')) return -this.parseUnary();

    let value = this.parsePrimary();
    while (this.match('%')) value /= 100;
    return value;
  }

  private parsePrimary(): number {
    if (this.match('(')) {
      const value = this.parseAddition();
      this.consume(')', 'Falta cerrar un paréntesis.');
      return value;
    }

    const token = this.advance();
    if (!token) throw new Error('La expresión está incompleta.');
    if (/^\d|^\./.test(token)) return Number(token);

    const functions = ['sqrt', 'log', 'ln', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
    if (!functions.includes(token.toLowerCase())) {
      throw new Error(`Operación desconocida: ${token}.`);
    }
    this.consume('(', 'La función requiere un paréntesis de apertura.');
    const argument = this.parseAddition();
    this.consume(')', 'Falta cerrar un paréntesis.');
    return this.applyFunction(token.toLowerCase(), argument);
  }

  private applyFunction(name: string, value: number): number {
    switch (name) {
      case 'sqrt': return this.calculator.raizCuadrada(value);
      case 'log': return this.calculator.logaritmo(value);
      case 'ln': return this.calculator.logaritmo(value, 'natural');
      case 'sin': return Math.sin(value);
      case 'cos': return Math.cos(value);
      case 'tan': return Math.tan(value);
      case 'asin':
        if (value < -1 || value > 1) throw new Error('asin requiere un valor entre -1 y 1.');
        return Math.asin(value);
      case 'acos':
        if (value < -1 || value > 1) throw new Error('acos requiere un valor entre -1 y 1.');
        return Math.acos(value);
      case 'atan': return Math.atan(value);
      default: throw new Error('Operación científica inválida.');
    }
  }

  private match(...expected: string[]): boolean {
    if (!expected.includes(this.tokens[this.position])) return false;
    this.position++;
    return true;
  }

  private previous(): string {
    return this.tokens[this.position - 1];
  }

  private advance(): string | undefined {
    return this.tokens[this.position++];
  }

  private consume(expected: string, message: string): void {
    if (!this.match(expected)) throw new Error(message);
  }
}
