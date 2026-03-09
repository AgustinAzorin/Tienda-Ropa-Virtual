import Link from 'next/link';

export function EmptyCart() {
  return (
    <section className="mx-auto mt-16 max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
      <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-3xl">
        🧍
      </div>
      <h1 className="font-display text-4xl italic text-[#F5F0E8]">Tu carrito esta vacio</h1>
      <p className="mt-2 text-sm text-[#F5F0E8]/65">
        Sumá prendas para comenzar a ver cuotas, costos de envio y checkout.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalogo"
          className="rounded-xl bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#0D0A08]"
        >
          Explorar el catalogo
        </Link>
        <Link
          href="/probador"
          className="rounded-xl border border-[#D4614A]/55 px-4 py-2 text-sm text-[#D4614A]"
        >
          Ir al probador
        </Link>
      </div>
    </section>
  );
}
