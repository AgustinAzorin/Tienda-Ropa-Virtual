import { NotFoundError } from '@/lib/errors';
import { PricingRepository } from './pricing.repository';
import type { IPricingService, InstallmentResult } from './interfaces/IPricingService';
import type { PriceRecord, SetPriceDto } from './interfaces/IPricingRepository';

export class PricingService implements IPricingService {
  constructor(private readonly repo = new PricingRepository()) {}

  async getCurrentPrice(productId: string): Promise<PriceRecord> {
    const price = await this.repo.findCurrentPrice(productId);
    if (!price) throw new NotFoundError('Precio de producto');
    return price;
  }

  async getPriceHistory(productId: string): Promise<PriceRecord[]> {
    return this.repo.getHistory(productId);
  }

  async setPrice(productId: string, dto: SetPriceDto): Promise<PriceRecord> {
    return this.repo.setPrice(productId, dto);
  }

  async calculateInstallments(
    productId: string,
    installments: number,
    interestRate = 0,
  ): Promise<InstallmentResult> {
    const price       = await this.getCurrentPrice(productId);
    const base        = price.price;
    const totalAmount = base * (1 + interestRate / 100);
    return {
      installments,
      amount_per_installment: Math.ceil(totalAmount / installments),
      total_amount:           totalAmount,
      currency:               price.currency,
    };
  }
}

export const pricingService = new PricingService();
