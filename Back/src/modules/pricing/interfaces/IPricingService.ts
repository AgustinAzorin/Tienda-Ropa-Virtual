import type { PriceRecord, SetPriceDto } from './IPricingRepository';

export interface InstallmentResult {
  installments: number;
  amount_per_installment: number;
  total_amount: number;
  currency: string;
}

export interface IPricingService {
  getCurrentPrice(productId: string): Promise<PriceRecord>;
  getPriceHistory(productId: string): Promise<PriceRecord[]>;
  setPrice(productId: string, dto: SetPriceDto): Promise<PriceRecord>;
  calculateInstallments(
    productId: string,
    installments: number,
    interestRate?: number
  ): Promise<InstallmentResult>;
}
