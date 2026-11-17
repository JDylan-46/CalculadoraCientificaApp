import { CalculadoraService } from './calculadora.service';

describe('CalculadoraService', () => {
  let service: CalculadoraService;

  beforeEach(() => {
    service = new CalculadoraService();
  });

  it('evalúa expresiones respetando la prioridad de operaciones', () => {
    expect(service.evaluar('2+3*4')).toBe(14);
    expect(service.evaluar('sqrt(25)+2^3')).toBe(13);
    expect(service.evaluar('50%')).toBe(0.5);
  });

  it('rechaza división entre cero y logaritmos inválidos', () => {
    expect(() => service.evaluar('10/0')).toThrow('No se puede dividir entre cero.');
    expect(() => service.evaluar('log(-1)')).toThrow('El logaritmo requiere un número positivo.');
  });
});
