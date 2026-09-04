import { Injectable, Logger } from '@nestjs/common';

/**
 * Stub de la pasarela N1CO — deshabilitado durante beta cerrada.
 * Todos los métodos retornan valores vacíos sin lanzar excepciones.
 * Implementar cuando se active el modelo de pago post-beta.
 */
@Injectable()
export class N1coPaymentService {
  private readonly logger = new Logger(N1coPaymentService.name);

  generatePaymentLink(_clinicId: string, _amount: number): Promise<string> {
    this.logger.warn('N1CO payment gateway not implemented — beta mode');
    return Promise.resolve('');
  }

  createCustomer(_clinicData: unknown): Promise<string> {
    this.logger.warn('N1CO createCustomer not implemented — beta mode');
    return Promise.resolve('');
  }

  createSubscription(_customerId: string, _planId: string): Promise<null> {
    this.logger.warn('N1CO createSubscription not implemented — beta mode');
    return Promise.resolve(null);
  }

  handleWebhook(_payload: unknown, _signature: string): Promise<void> {
    this.logger.warn('N1CO handleWebhook not implemented — beta mode');
    return Promise.resolve();
  }
}
