export interface CartItem {
  id: string;
  productName: string;
  thumbnail?: string;
  variantId: string;
  variantTitle?: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  currency: string;
  triedOn3D: boolean;
  maxStock?: number;
  outOfStock?: boolean;
}

export interface CartSnapshot {
  cartId: string;
  localCartId: string | null;
  items: CartItem[];
  subtotal: number;
  total: number;
  currency: string;
}

export interface InstallmentConfig {
  id: string;
  payment_method: string;
  installments: number;
  interest_rate: number;
  cft: number;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
}
