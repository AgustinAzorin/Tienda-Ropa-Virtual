import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function ProductoLoading() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="skeleton h-[56vh] rounded-[12px]" />
        <div className="space-y-3">
          <div className="skeleton h-10 w-2/3" />
          <div className="skeleton h-7 w-1/2" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </main>
  );
}
