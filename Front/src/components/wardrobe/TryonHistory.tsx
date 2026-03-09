import Link from 'next/link';
import type { TryonSession } from '@/lib/tryon/types';

interface TryonHistoryProps {
  sessions: TryonSession[];
}

export function TryonHistory({ sessions }: TryonHistoryProps) {
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <article key={session.id} className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm text-[#F5F0E8]">Producto {session.product_id.slice(0, 8)}</p>
              <p className="text-xs text-[#F5F0E8]/65">{new Date(session.created_at).toLocaleDateString('es-AR')}</p>
            </div>
            {session.converted_to_purchase ? (
              <span className="rounded-full bg-[rgba(201,168,76,0.2)] px-2 py-1 text-[10px] font-semibold text-[#C9A84C]">✓ Comprada</span>
            ) : null}
          </div>

          <Link
            href={`/probador/${session.product_id}`}
            className="mt-3 inline-block rounded-[8px] border border-[rgba(255,255,255,0.14)] px-3 py-1.5 text-xs text-[#F5F0E8]/90"
          >
            Volver al probador
          </Link>
        </article>
      ))}
    </div>
  );
}
