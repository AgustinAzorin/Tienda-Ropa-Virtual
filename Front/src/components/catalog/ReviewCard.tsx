interface ReviewCardProps {
  username: string;
  rating: number;
  fit?: string;
  text: string;
}

export function ReviewCard({ username, rating, fit, text }: ReviewCardProps) {
  return (
    <article className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
      <header className="mb-2 flex items-center justify-between">
        <p className="text-sm text-[#F5F0E8]">@{username}</p>
        <p className="text-xs text-[#C9A84C]">Compra verificada</p>
      </header>
      <p className="text-sm text-[#F5F0E8]/80">{rating.toFixed(1)} ★ {fit ? `· Fit: ${fit}` : ''}</p>
      <p className="mt-2 text-sm text-[#F5F0E8]/72">{text}</p>
    </article>
  );
}
