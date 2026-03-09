const REASONS = [
  { value: 'size', label: 'El talle no me quedo bien' },
  { value: 'quality', label: 'La calidad no era la esperada' },
  { value: 'not_as_shown', label: 'No era como se veia en la foto' },
  { value: 'changed_mind', label: 'Cambie de opinion' },
  { value: 'wrong_item', label: 'Recibi el producto incorrecto' },
];

interface ReturnReasonSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReturnReasonSelector({ value, onChange }: ReturnReasonSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-[8px] border border-white/10 bg-white/5 px-3 text-sm"
    >
      <option value="">Seleccionar motivo</option>
      {REASONS.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
    </select>
  );
}
