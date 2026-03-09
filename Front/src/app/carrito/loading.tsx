export default function CarritoLoading() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-3">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-28 w-full" />
        <div className="skeleton h-28 w-full" />
      </div>
    </main>
  );
}
