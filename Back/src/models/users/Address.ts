/** Direcciones normalizadas (reutilizable para perfil y órdenes) */
export interface Address {
  id: string; // uuid PK
  user_id: string; // uuid FK → users.id
  full_name: string;
  phone: string | null;
  street_line1: string;
  street_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  created_at: string; // timestamptz
}
