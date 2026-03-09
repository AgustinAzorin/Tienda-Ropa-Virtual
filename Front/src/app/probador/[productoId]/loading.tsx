import { TryonLoading } from '@/components/tryon/TryonLoading';

export default function ProbadorLoading() {
  return (
    <main className="h-[100dvh] bg-[#0D0A08]">
      <TryonLoading progress={18} />
    </main>
  );
}
