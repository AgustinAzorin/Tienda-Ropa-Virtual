import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('auth_session')?.value === '1';
  const onboardingDone = cookieStore.get('onboarding_done')?.value === '1';

  if (!isAuthenticated) {
    redirect('/auth/login?returnTo=%2Fperfil');
  }

  if (!onboardingDone) {
    redirect('/onboarding/perfil');
  }

  redirect('/home');
}
