interface AddressCardProps {
  alias?: string | null;
  street: string;
  number: string;
  city: string;
  province: string;
  selected?: boolean;
  onUse: () => void;
}

export function AddressCard({ alias, street, number, city, province, selected, onUse }: AddressCardProps) {
  return (
    <article className={[
      'rounded-xl border bg-white/5 p-3',
      selected ? 'border-[#C9A84C]' : 'border-white/10',
    ].join(' ')}>
      <p className="text-sm text-[#F5F0E8]">{alias || 'Direccion guardada'}</p>
      <p className="text-xs text-[#F5F0E8]/65">{street} {number}, {city}, {province}</p>
      <button type="button" onClick={onUse} className="mt-2 text-xs text-[#C9A84C]">Usar esta direccion</button>
    </article>
  );
}
