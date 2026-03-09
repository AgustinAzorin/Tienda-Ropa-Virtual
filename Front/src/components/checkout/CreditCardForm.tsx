'use client';

import { Input } from '@/components/ui/Input';

interface CreditCardFormValues {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

interface CreditCardFormProps {
  values: CreditCardFormValues;
  onChange: (values: CreditCardFormValues) => void;
  disabled?: boolean;
}

export function CreditCardForm({ values, onChange, disabled }: CreditCardFormProps) {
  const setField = (key: keyof CreditCardFormValues, value: string) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
      <Input disabled={disabled} label="Numero de tarjeta" value={values.cardNumber} onChange={(e) => setField('cardNumber', e.target.value)} placeholder="XXXX XXXX XXXX XXXX" />
      <Input disabled={disabled} label="Nombre en la tarjeta" value={values.cardName} onChange={(e) => setField('cardName', e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Input disabled={disabled} label="Vencimiento" value={values.expiry} onChange={(e) => setField('expiry', e.target.value)} placeholder="MM/YY" />
        <Input disabled={disabled} label="CVV" value={values.cvv} onChange={(e) => setField('cvv', e.target.value)} placeholder="123" />
      </div>
    </div>
  );
}
