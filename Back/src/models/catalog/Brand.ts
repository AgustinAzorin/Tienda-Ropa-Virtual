export interface Brand {
  id: string; // uuid PK
  name: string;
  slug: string; // UNIQUE
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
}
