import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import './styles.css'

// --- Minimal primitives con clases propias ---
const Button = ({ className = "", variant = "default", ...props }) => (
  <button
    className={`btn ${variant === "ghost" ? "btn-ghost" : variant === "outline" ? "btn-outline" : ""} ${className}`}
    {...props}
  />
);

const Card = ({ className = "", ...props }) => (
  <div className={`card ${className}`} {...props} />
);

const Input = ({ className = "", ...props }) => (
  <input className={`input ${className}`} {...props} />
);

const Label = ({ children, className = "" }) => (
  <label className={`label ${className}`}>{children}</label>
);

const Sheet = ({ open, onClose, side = "right", children }) => (
  <div className={`sheet ${open ? "open" : ""} ${side === "left" ? "left" : ""}`} aria-hidden={!open}>
    <div className="sheet__scrim" onClick={onClose} />
    <div className="sheet__panel">{children}</div>
  </div>
);

// --- API Client ---
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json().catch(() => ({}));
}

// --- Auth Store ---
const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) return;
    api("/auth/me", { token })
      .then((d) => setUser(d.user))
      .catch(() => {
        setToken("");
        localStorage.removeItem("auth_token");
        setUser(null);
      });
  }, [token]);

  const login = async (email, password) => {
    const d = await api("/auth/login", { method: "POST", body: { email, password } });
    const t = d.token || d.accessToken || "";
    if (!t) throw new Error("No token recibido");
    localStorage.setItem("auth_token", t);
    setToken(t);
    setUser(d.user || null);
  };

  const register = async (email, password, role = "user") => {
    const d = await api("/auth/register", { method: "POST", body: { email, password, role } });
    const t = d.token || d.accessToken || "";
    if (t) {
      localStorage.setItem("auth_token", t);
      setToken(t);
      setUser(d.user || null);
    }
    return d;
  };


  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken("");
    setUser(null);
  };

  return { token, user, login, register, logout };
};

// --- 3D Mannequin (placeholder) ---
function Mannequin3D() {
  return (
    <div className="card">
      <Canvas style={{ height: 420 }} camera={{ position: [3, 3, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 6, 6]} intensity={0.8} />
        <mesh rotation={[0.4, 0.6, 0]}>
          <capsuleGeometry args={[0.6, 1.6, 12, 24]} />
          <meshStandardMaterial wireframe />
        </mesh>
        <OrbitControls enablePan enableZoom />
      </Canvas>
    </div>
  );
}

// --- Catalog ---
function useCatalog(token) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ category: "", minPrice: "", maxPrice: "", sizes: [] });
  const [sort, setSort] = useState("newest");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (filters.category) p.set("category", filters.category);
    if (filters.minPrice) p.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice) p.set("maxPrice", String(filters.maxPrice));
    if (filters.sizes?.length) p.set("sizes", filters.sizes.join(","));
    if (sort) p.set("sort", sort);
    return p.toString();
  }, [query, filters, sort]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api(`/products?${qs}`);
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [qs]);

  return { items, loading, error, query, setQuery, filters, setFilters, sort, setSort, refresh: fetchItems };
}

function ScorePanel({ score }) {
  const chip = (r) => (
    <div key={r.key} style={{
      display: 'flex', justifyContent: 'space-between', padding: '8px 10px',
      borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff'
    }}>
      <span>{r.label}</span>
      <strong style={{ color: r.value >= 0 ? '#16a34a' : '#dc2626' }}>
        {r.value >= 0 ? `+${r.value}` : r.value}
      </strong>
    </div>
  );
  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Puntuación del outfit</div>
        <div style={{ fontSize: 14, color: '#374151' }}>Qué suma y qué resta</div>
      </div>
      <div style={{
        fontSize: 36, fontWeight: 800, textAlign: 'center',
        padding: '8px 0', borderRadius: 14, background: '#f9fafb'
      }}>
        {score.total}
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {score.reasons.map(chip)}
      </div>
    </div>
  );
}

// === NUEVO: heurística simple para puntuar ===
// Por ahora usamos datos básicos (nombre, categoría, precio).
// Más adelante cambiamos a tu endpoint real (p.ej. /style/score).
function useOutfitScore(items) {
  // Helpers mínimos
  const inferColor = (name = "") => {
    const n = name.toLowerCase();
    if (/(negro|black)/.test(n)) return "negro";
    if (/(blanco|white)/.test(n)) return "blanco";
    if (/(azul|blue)/.test(n)) return "azul";
    if (/(rojo|red)/.test(n)) return "rojo";
    if (/(verde|green)/.test(n)) return "verde";
    return "otros";
  };
  const getPrice = (p) => Number(p?.variants?.[0]?.price ?? p?.price ?? 0);

  // Métricas simples
  const colors = items.map(p => inferColor(p.name));
  const uniqColors = new Set(colors);
  const hasTop = items.some(p => /remera|camisa|buzo|camiseta|top/i.test(p.category || p.name));
  const hasBottom = items.some(p => /pantal|jean|short|falda|pollera/i.test(p.category || p.name));
  const avgPrice = items.length ? Math.round(items.map(getPrice).reduce((a,b)=>a+b,0) / items.length) : 0;

  // Razones (ejemplo inicial)
  const reasons = [];

  // Diversidad controlada de colores
  if (uniqColors.size === 1 && items.length >= 2) reasons.push({ key:'color-harmony', label:'Armonía de color', value: +8 });
  else if (uniqColors.size > 3) reasons.push({ key:'too-many-colors', label:'Demasiados colores', value: -6 });
  else if (uniqColors.size === 2) reasons.push({ key:'color-balance', label:'Buen balance de 2 colores', value: +4 });

  // Completar parte de arriba y abajo
  if (hasTop && hasBottom) reasons.push({ key:'top-bottom', label:'Conjunto superior+inferior', value: +10 });
  else reasons.push({ key:'missing-piece', label:'Falta completar el conjunto', value: -5 });

  // Rango de precio promedio (placeholder de “accesibilidad”)
  if (avgPrice > 0 && avgPrice <= 25) reasons.push({ key:'good-price', label:'Precio accesible', value: +3 });
  if (avgPrice > 70) reasons.push({ key:'expensive', label:'Precio elevado', value: -4 });

  // Bonus por 3 piezas exactas (look completo liviano)
  if (items.length === 3) reasons.push({ key:'triad', label:'Look de 3 piezas', value: +5 });
  if (items.length > 5) reasons.push({ key:'too-many-items', label:'Demasiadas piezas', value: -4 });

  const total = reasons.reduce((t, r) => t + r.value, 0);
  return { total, reasons };
}

// === CatalogGrid actualizado: onAddToCart PRODUCT ===
// (le pasamos el producto completo para poder puntuar localmente)
function CatalogGrid({ items, onAddToCart, onToggleFav }) {
  return (
    <div className="catalog-grid">
      {items.map((p) => (
        <Card key={p.id}>
          <div className="aspect-4-5 card center mb-3" style={{ padding: 0 }}>
            {p.images?.[0]?.url ? (
              <img src={p.images[0].url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div>Sin imagen</div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div>{p.category}</div>
              <div style={{ fontWeight: '600' }}>{p.name}</div>
              <div>${p.variants?.[0]?.price ?? p.price ?? "—"}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outline" onClick={() => onToggleFav(p.id)}>♡</Button>
              <Button onClick={() => onAddToCart(p)}>Añadir</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


// --- Pages ---
function LoginPage({ auth }) {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
      nav("/");
    } catch (e) { setErr(e.message); }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <Card>
        <h1>Iniciar sesión</h1>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Contraseña</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <div style={{ color: 'red', fontSize: 14 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit">Entrar</Button>
            <Link to="/register" className="btn btn-outline">Crear cuenta</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

function RegisterPage({ auth }) {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // 👈 nuevo: user o seller
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.register(email, password, role); // 👈 pasamos también el rol
      nav("/");
    } catch (e) { setErr(e.message); }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <Card>
        <h1>Crear cuenta</h1>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Contraseña</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <Label>Tipo de cuenta</Label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Usuario</option>
              <option value="seller">Vendedor</option>
            </select>
          </div>
          {err && <div style={{ color: 'red', fontSize: 14 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit">Registrarme</Button>
            <Link to="/login" className="btn btn-outline">Ya tengo cuenta</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}


function HomePage({ auth }) {
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const c = useCatalog(auth.token);

  // Outfit local (lo usamos para la puntuación; luego lo conectamos al carrito real)
  const [outfitItems, setOutfitItems] = useState([]);
  const score = useOutfitScore(outfitItems);

  const addToCart = async (product) => {
    // 1) lógica API real (si estás logueado)
    if (auth.token) {
      try {
        const variantId = product?.variants?.[0]?.id || product?.id;
        await api("/carts/mine/items/" + variantId, {
          method: "POST",
          token: auth.token,
          body: { variantId, quantity: 1 },
        });
        setCartOpen(true);
      } catch (e) { alert(e.message); }
    }
    // 2) y SIEMPRE actualizamos el outfit local para puntuar
    setOutfitItems(prev => [...prev, product]);
  };

  useEffect(() => {
    const openWl = () => setWishlistOpen(true);
    const openCt = () => setCartOpen(true);
    window.addEventListener('openWishlist', openWl);
    window.addEventListener('openCart', openCt);
    return () => {
      window.removeEventListener('openWishlist', openWl);
      window.removeEventListener('openCart', openCt);
    };
  }, []);


  const toggleFav = async (productId) => {
    if (!auth.token) return alert("Necesitas iniciar sesión");
    try {
      await api("/favorites/mine/" + productId, { method: "POST", token: auth.token });
      setWishlistOpen(true);
    } catch (e) { alert(e.message); }
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Layout 3 columnas: Catálogo (izq) / Mannequí (centro) / Score (der) */}
      <div className="hero-3">
        {/* IZQUIERDA: búsquedas/filtros */}
        <div style={{ display: 'grid', gap: 12 }}>
          <h1>Catálogo</h1>
          <p>Explorá las prendas, ajustá filtros y probá el maniquí 3D.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input placeholder="Buscar..." value={c.query} onChange={(e) => c.setQuery(e.target.value)} />
            <Button variant="outline" onClick={() => setFiltersOpen(true)}>Filtros</Button>
          </div>

          {/* Lista de productos */}
          {c.error && <div style={{ color: 'red' }}>{c.error}</div>}
          {c.loading ? <div>Cargando...</div> : (
            <CatalogGrid items={c.items} onAddToCart={addToCart} onToggleFav={toggleFav} />
          )}
        </div>

        {/* CENTRO: Maniquí */}
        <Mannequin3D />

        {/* DERECHA: Score dinámico */}
        <ScorePanel score={score} />
      </div>

      {/* Drawers con placeholders para visualizar el menú desplegado */}
      <Sheet open={wishlistOpen} onClose={() => setWishlistOpen(false)}>
        <h3>Mi Wishlist</h3>
        <ul>
          <li>👕 Remera negra</li>
          <li>👟 Zapatillas blancas</li>
          <li>🧥 Campera jean</li>
        </ul>
      </Sheet>

      <Sheet open={cartOpen} onClose={() => setCartOpen(false)}>
        <h3>Mi Carrito</h3>
        <ul>
          <li>👖 Jean slim — $20</li>
          <li>👕 Remera azul — $15</li>
        </ul>
        <p>Total: $35</p>
      </Sheet>

      {/* Panel de filtros (igual que antes) */}
      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} side="left">
        <h3>Filtros</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <Label>Categoría</Label>
            <Input placeholder="remeras, pantalones..." value={c.filters.category}
              onChange={(e) => c.setFilters({ ...c.filters, category: e.target.value })}
            />
          </div>
          <div className="grid-2">
            <div>
              <Label>Precio mín.</Label>
              <Input type="number" value={c.filters.minPrice}
                onChange={(e) => c.setFilters({ ...c.filters, minPrice: e.target.value })}
              />
            </div>
            <div>
              <Label>Precio máx.</Label>
              <Input type="number" value={c.filters.maxPrice}
                onChange={(e) => c.setFilters({ ...c.filters, maxPrice: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Ordenar</Label>
            <select className="input" value={c.sort} onChange={(e) => c.setSort(e.target.value)}>
              <option value="newest">Más nuevos</option>
              <option value="price_asc">Precio ↑</option>
              <option value="price_desc">Precio ↓</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => { c.refresh(); setFiltersOpen(false); }}>Aplicar</Button>
            <Button variant="ghost" onClick={() => c.setFilters({ category: "", minPrice: "", maxPrice: "", sizes: [] })}>Limpiar</Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
// --- App Shell ---
function AppShell() {
  const auth = useAuth();
  const [menuOpen, setMenuOpen] = useState(false); // ⬅ NUEVO: estado del menú

  // Helper para saber si es vendedor (ajustá al campo real que te dé /auth/me)
  const isSeller = !!(auth.user?.role === 'seller' || auth.user?.isSeller);

  return (
    <div>
      <header className="app-header">
        <div className="app-header-inner">
          {/* IZQUIERDA: botón hamburguesa + brand */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              title="Menú"
            >
              <svg className="hamburger-icon" viewBox="0 0 24 24" fill="none"
                   xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link to="/" className="brand">Fashion-MVP</Link>
          </div>

          {/* DERECHA: iconos wishlist / carrito + login/logout */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Wishlist */}
            <button
              className="icon-btn wishlist"
              onClick={() => window.dispatchEvent(new CustomEvent('openWishlist'))}
              aria-label="Wishlist"
              title="Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round"
                   className="icon">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </button>

            {/* Carrito */}
            <button
              className="icon-btn cart"
              onClick={() => window.dispatchEvent(new CustomEvent('openCart'))}
              aria-label="Carrito"
              title="Carrito"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round"
                   className="icon">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>

          
          </div>
        </div>
      </header>

      {/* Menú lateral izquierdo (usa el Sheet que ya tenés) */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} side="left">
        <h3 style={{ marginTop: 0 }}>Menú</h3>
        <div className="menu-list">
          {!auth.user && (
            <>
              <Link className="menu-item" to="/login" onClick={() => setMenuOpen(false)}>
                Iniciar sesión
              </Link>
              <Link className="menu-item" to="/register" onClick={() => setMenuOpen(false)}>
                Registrarse
                <span className="menu-note">vendedor o cliente</span>
              </Link>
            </>
          )}

          {auth.user && (
            <>
              <Link className="menu-item" to="/profile" onClick={() => setMenuOpen(false)}>
                Perfil
                <span className="menu-note">{auth.user.email}</span>
              </Link>

              {/* Solo para vendedores */}
              {isSeller && (
                <Link className="menu-item" to="/upload" onClick={() => setMenuOpen(false)}>
                  Subir producto
                </Link>
              )}

              {/* Separador opcional */}
             <div style={{ height: '1px', background: '#e5e7eb', margin: '8px 0' }}></div>

              {/* 🔴 Cerrar sesión dentro del menú */}
              <button
                className="btn-logout"
                onClick={() => { auth.logout(); setMenuOpen(false); }}
                style={{ width: '100%' }}
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </Sheet>


      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage auth={auth} />} />
          <Route path="/login" element={<LoginPage auth={auth} />} />
          <Route path="/register" element={<RegisterPage auth={auth} />} />
          {/* Rutas placeholder para los links del menú */}
          <Route path="/profile" element={<div className="card"><h2>Mi perfil</h2><p>(Próximamente)</p></div>} />
          <Route path="/upload" element={<div className="card"><h2>Subir producto</h2><p>(Sólo vendedores — próximamente)</p></div>} />
        </Routes>
      </main>
    </div>
  );
}




export default function Root() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}