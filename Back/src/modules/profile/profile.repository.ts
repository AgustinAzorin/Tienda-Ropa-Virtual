import { db } from '@/db/client';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { Profile } from '@/models/users/Profile';
import type { IProfileRepository, CreateProfileDto, UpdateProfileDto } from './interfaces/IProfileRepository';
import { getStoredUser } from '@/lib/auth'; // o tu hook/contexto de usuario
import { UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { hashPassword, issueTokens } from '@/lib/auth';

export class ProfileRepository implements IProfileRepository {

  async findById(id: string): Promise<Profile | null> {
    const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return row ? (row as Profile) : null;
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const [row] = await db.select().from(profiles).where(eq(profiles.username, username)).limit(1);
    return row ? (row as Profile) : null;
  }

  async create(dto: CreateProfileDto): Promise<Profile> {
    const [row] = await db.insert(profiles).values({
      id:           dto.userId,
      username:     dto.username,
      display_name: dto.displayName ?? null,
      avatar_url:   dto.avatar_url ?? null,
    }).returning();
    if (!row) throw new Error('No se pudo crear el perfil');
    return row as Profile;
  }

  async update(id: string, dto: UpdateProfileDto): Promise<Profile> {
    let [row] = await db.update(profiles).set(dto).where(eq(profiles.id, id)).returning();
    if (!row) {
      // Crear perfil si no existe
      [row] = await db.insert(profiles).values({
        id,
        username: dto.display_name
          ? dto.display_name.toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, '')
          : `user_${id.slice(0, 8)}`,
        display_name: dto.display_name ?? null,
        bio: dto.bio ?? null,
        avatar_url: dto.avatar_url ?? null,
      }).returning();
    }
    if (!row) throw new Error('No se pudo actualizar ni crear el perfil');
    return row as Profile;
  }

  async updateAvatarUrl(id: string, url: string): Promise<void> {
    const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    if (!row) throw new NotFoundError('Perfil');
    await db.update(profiles).set({ avatar_url: url }).where(eq(profiles.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }
}

export function LandingNav() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <nav>
      {/* ...otros elementos... */}
      <div>
        {user ? (
          <Link
            href="/perfil"
            className="flex items-center gap-2 px-4 h-9 rounded-[8px] text-sm font-medium bg-[#C9A84C] text-[#0D0A08] hover:bg-[#B8942E] transition-colors duration-150"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <UserCircle2 className="w-6 h-6" />
            )}
            Tu perfil
          </Link>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="px-4 h-9 rounded-[8px] text-sm font-medium text-[rgba(245,240,232,0.7)] hover:text-[#F5F0E8] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-150 inline-flex items-center"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/registro"
              className="px-4 h-9 rounded-[8px] text-sm font-medium bg-[#C9A84C] text-[#0D0A08] hover:bg-[#B8942E] transition-colors duration-150 inline-flex items-center"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export function saveSession(user, accessToken, refreshToken) {
  // ...código existente para guardar tokens...
  console.log('Sesión iniciada correctamente para:', user.email);
  // ...código existente...
}

export function clearSession() {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Si usas cookies, bórralas también
  document.cookie = 'auth_session=; Max-Age=0; Path=/';
  document.cookie = 'onboarding_done=; Max-Age=0; Path=/';
}

async register({ email, password }: RegisterDto): Promise<AuthResult> {
  const existing = await db
    .select({ id: customUsers.id })
    .from(customUsers)
    .where(eq(customUsers.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError('Este email ya está registrado');
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(customUsers)
    .values({ email: email.toLowerCase(), password_hash: passwordHash })
    .returning({ id: customUsers.id, email: customUsers.email });

  // Crear perfil vacío automáticamente al registrar
  await db.insert(profiles).values({
    id: user.id,
    username: `user_${user.id.slice(0, 8)}`,
    display_name: null,
    bio: null,
    avatar_url: null,
  });

  const tokens = await issueTokens(user.id, user.email);
  return { user: { id: user.id, email: user.email }, tokens };
}

export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  try {
    const body = await request.json();

    if (url.searchParams.get('action') === 'register') {
      const result = await authService.register({
        email:    body.email,
        password: body.password,
      });
      return created(result);
    }

    // Default: login
    const result = await authService.loginWithPassword({
      email:    body.email,
      password: body.password,
    });
    return ok(result);
  } catch (err) {
    console.error('Error en registro:', err);
    return handleError(err);
  }
}

if (!res.ok) {
  const msg: string = json.error?.message ?? '';
  setServerError(msg || 'Ocurrió un error. Intentá de nuevo.');
  return;
}
