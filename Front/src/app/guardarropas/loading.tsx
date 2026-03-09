export default function GuardarropasLoading() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <div className="skeleton h-12 w-64 rounded-[10px]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-56 rounded-[12px]" />
          ))}
        </div>
      </div>
    </main>
  );
}
