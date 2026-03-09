interface CheckoutProgressProps {
  currentStep: number;
  steps: string[];
}

export function CheckoutProgress({ currentStep, steps }: CheckoutProgressProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="hidden items-center gap-2 md:flex">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const completed = stepNumber < currentStep;
          const active = stepNumber === currentStep;
          return (
            <div key={step} className="flex flex-1 items-center gap-2">
              <span className={[
                'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                completed ? 'bg-[#C9A84C] text-[#0D0A08]' : active ? 'border border-[#C9A84C] text-[#C9A84C] animate-pulse-amber' : 'border border-white/20 text-[#F5F0E8]/60',
              ].join(' ')}>
                {completed ? '✓' : stepNumber}
              </span>
              <span className={active ? 'text-sm text-[#F5F0E8]' : 'text-sm text-[#F5F0E8]/65'}>{step}</span>
              {idx < steps.length - 1 && <span className="h-px flex-1 bg-white/10" />}
            </div>
          );
        })}
      </div>

      <div className="md:hidden">
        <p className="text-xs text-[#F5F0E8]/55">Paso {currentStep} de {steps.length}</p>
        <p className="text-sm text-[#F5F0E8]">{steps[currentStep - 1]}</p>
      </div>
    </div>
  );
}
