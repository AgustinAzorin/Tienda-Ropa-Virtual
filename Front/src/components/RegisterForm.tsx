import React, { useState } from 'react';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});
    const url = 'http://localhost:3001/api/auth?action=register';
    const opciones = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    };
    try {
      const res = await fetch(url, opciones);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: 'Este email ya está registrado' });
        } else if (json?.error?.message) {
          setServerError(json.error.message);
        } else {
          setServerError('Ocurrió un error. Intentá de nuevo.');
        }
        return;
      }
      // ...proceso normal de éxito (ej: redirigir, limpiar formulario, etc)
    } catch (err) {
      setServerError('Error de conexión. Intentá de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
      {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
      {serverError && <p style={{ color: 'red' }}>{serverError}</p>}
      <button type="submit">Registrar</button>
    </form>
  );
}
