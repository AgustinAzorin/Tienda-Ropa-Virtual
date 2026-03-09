import TryonPageClient from './TryonPageClient';

export default async function ProbadorPage({
  params,
}: {
  params: Promise<{ productoId: string }>;
}) {
  const { productoId } = await params;

  return <TryonPageClient productoId={productoId} />;
}
