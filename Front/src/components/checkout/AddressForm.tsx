'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const provinces = [
  'Buenos Aires','CABA','Catamarca','Chaco','Chubut','Cordoba','Corrientes','Entre Rios','Formosa','Jujuy',
  'La Pampa','La Rioja','Mendoza','Misiones','Neuquen','Rio Negro','Salta','San Juan','San Luis','Santa Cruz',
  'Santa Fe','Santiago del Estero','Tierra del Fuego','Tucuman',
];

const schema = z.object({
  alias: z.string().optional(),
  street: z.string().min(2, 'La calle es requerida'),
  number: z.string().min(1, 'El numero es requerido'),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().min(2, 'La ciudad es requerida'),
  province: z.string().min(2, 'La provincia es requerida'),
  postal_code: z.string().regex(/^\d{4}$/, 'El codigo postal debe tener 4 digitos'),
  saveAddress: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof schema>;

interface AddressFormProps {
  initialValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function AddressForm({ initialValues, onSubmit, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<AddressFormValues>({
    alias: initialValues?.alias ?? '',
    street: initialValues?.street ?? '',
    number: initialValues?.number ?? '',
    floor: initialValues?.floor ?? '',
    apartment: initialValues?.apartment ?? '',
    city: initialValues?.city ?? '',
    province: initialValues?.province ?? '',
    postal_code: initialValues?.postal_code ?? '',
    saveAddress: initialValues?.saveAddress ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await onSubmit(parsed.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <Input label="Alias" value={form.alias} onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))} />
      <Input label="Calle" value={form.street} error={errors.street} onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))} />
      <Input label="Numero" value={form.number} error={errors.number} onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))} />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Piso" value={form.floor} onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value }))} />
        <Input label="Depto" value={form.apartment} onChange={(e) => setForm((p) => ({ ...p, apartment: e.target.value }))} />
      </div>
      <Input label="Ciudad" value={form.city} error={errors.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
      <div>
        <label className="mb-1 block text-sm text-[#F5F0E8]/70">Provincia</label>
        <select
          value={form.province}
          onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
          className="h-11 w-full rounded-[8px] border border-white/10 bg-white/5 px-3 text-sm"
        >
          <option value="">Seleccionar</option>
          {provinces.map((province) => <option key={province} value={province}>{province}</option>)}
        </select>
        {errors.province && <p className="mt-1 text-xs text-[#D4614A]">{errors.province}</p>}
      </div>
      <Input label="Codigo postal" value={form.postal_code} error={errors.postal_code} onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))} />

      <label className="flex items-center gap-2 text-sm text-[#F5F0E8]/80">
        <input
          type="checkbox"
          checked={form.saveAddress}
          onChange={(e) => setForm((p) => ({ ...p, saveAddress: e.target.checked }))}
        />
        Guardar esta direccion para futuras compras
      </label>

      <div className="flex gap-2">
        <Button type="submit" loading={loading}>Guardar direccion</Button>
        {onCancel ? <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button> : null}
      </div>
    </form>
  );
}
