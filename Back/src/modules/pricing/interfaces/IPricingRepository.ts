export interface PriceRecord {
  id:         string;
  product_id: string;
  price:      number;
  currency:   string;
  valid_from: string;
  valid_to:   string | null;
  created_at: string;
}

export interface SetPriceDto {
  price:      number;
  currency:   string;
  valid_from: Date;
  valid_to?:  Date;
}

export interface IPricingRepository {
  findCurrentPrice(productId: string): Promise<PriceRecord | null>;
  getHistory(productId: string): Promise<PriceRecord[]>;
  setPrice(productId: string, dto: SetPriceDto): Promise<PriceRecord>;
}
