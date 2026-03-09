import type { InstallmentConfig } from '@/lib/cart/types';

export interface InstallmentQuote {
  configId: string;
  installments: number;
  amountPerInstallment: number;
  totalWithInterest: number;
  cft: number;
  interestRate: number;
  isInterestFree: boolean;
}

export function calculateInstallmentQuotes(total: number, configs: InstallmentConfig[]): InstallmentQuote[] {
  return configs
    .filter((cfg) => cfg.is_active && total >= cfg.min_amount && total <= cfg.max_amount)
    .map((cfg) => {
      const factor = 1 + cfg.interest_rate / 100;
      const totalWithInterest = Math.round(total * factor);
      return {
        configId: cfg.id,
        installments: cfg.installments,
        amountPerInstallment: Math.ceil(totalWithInterest / cfg.installments),
        totalWithInterest,
        cft: cfg.cft,
        interestRate: cfg.interest_rate,
        isInterestFree: cfg.interest_rate === 0,
      };
    })
    .sort((a, b) => {
      if (a.isInterestFree !== b.isInterestFree) return a.isInterestFree ? -1 : 1;
      return a.amountPerInstallment - b.amountPerInstallment;
    });
}
