import { Component, inject } from '@angular/core';
import { CalculadoraService, Calculation } from '../services/calculadora.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  expression = '';
  display = '0';
  error = '';
  history: Calculation[] = [];
  isHistoryOpen = false;

  readonly basicButtons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '%', '+'];
  readonly scientificButtons = [
    { label: '√', value: 'sqrt(' },
    { label: 'log', value: 'log(' },
    { label: 'ln', value: 'ln(' },
    { label: 'xʸ', value: '^' },
    { label: 'sin', value: 'sin(' },
    { label: 'cos', value: 'cos(' },
    { label: 'tan', value: 'tan(' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
  ];

  private readonly calculator = inject(CalculadoraService);

  add(value: string): void {
    this.error = '';
    this.expression += value;
    this.display = this.expression || '0';
  }

  clear(): void {
    this.expression = '';
    this.display = '0';
    this.error = '';
  }

  calculate(): void {
    try {
      const result = this.calculator.evaluar(this.expression);
      this.calculator.guardar(this.expression, result);
      this.history = this.calculator.obtenerHistorial();
      this.display = this.calculator.formatear(result);
      this.expression = this.display;
      this.error = '';
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudo calcular la expresión.';
    }
  }

  clearHistory(): void {
    this.calculator.limpiarHistorial();
    this.history = [];
  }

  openHistory(): void {
    this.isHistoryOpen = true;
  }

  closeHistory(): void {
    this.isHistoryOpen = false;
  }

}
