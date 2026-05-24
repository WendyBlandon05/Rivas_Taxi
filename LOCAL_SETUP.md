# Ejecucion local

Este proyecto es una app Next.js con Supabase para reservar viajes con tres roles: pasajero, conductor y administrador.

## 1. Instalar dependencias

En Windows PowerShell puede fallar `npm` por politica de scripts. Usa `npm.cmd`:

```powershell
npm.cmd install
```

Si tienes pnpm instalado tambien puedes usar:

```powershell
pnpm install
```

## 2. Crear variables de entorno

Copia `.env.example` a `.env.local` y reemplaza los valores con los datos reales de tu proyecto Supabase:

```powershell
Copy-Item .env.example .env.local
```

Necesitas estos valores desde Supabase Dashboard > Project Settings > API:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

La service role key es necesaria para que el administrador pueda crear usuarios conductores desde `/admin`.

## 3. Crear la base de datos

En Supabase Dashboard > SQL Editor, ejecuta en este orden:

```text
scripts/001_create_schema.sql
scripts/002_seed_data.sql
```

Luego crea el primer usuario administrador. La forma mas simple es registrar un usuario normal en `/register` y despues cambiar su rol en SQL:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu-correo-admin@dominio.com';
```

## 4. Ejecutar en local

```powershell
npm.cmd run dev
```

Abre:

```text
http://localhost:3000
```

Rutas importantes:

- `/login`: inicio de sesion para pasajero, conductor y administrador.
- `/register`: registro de pasajeros.
- `/admin`: panel del administrador.
- `/driver`: panel del conductor.
- `/my-trips`: viajes del pasajero.

## 5. Flujo de roles

- Pasajero: se registra desde `/register` y entra desde `/login`.
- Administrador: crea conductores desde `/admin`.
- Conductor: entra desde `/login` con el correo y contrasena que le entrega el administrador.

Para crear el primer administrador:

1. Registrate como pasajero desde `/register`.
2. Ejecuta este SQL en Supabase, cambiando el correo:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu-correo-admin@dominio.com';
```

Despues vuelve a iniciar sesion y entraras al panel `/admin`.

## 6. Verificaciones locales

```powershell
npm.cmd run lint
npm.cmd run build
```

El build necesita variables de Supabase validas en `.env.local`.
