import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function ExplorarLoading() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="skeleton h-12 w-full rounded-[8px]" />
        <div className="skeleton h-8 w-44" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
