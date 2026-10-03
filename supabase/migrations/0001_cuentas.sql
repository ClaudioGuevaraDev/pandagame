-- PandaGame: progreso en la nube y registro de respuestas.
-- Ejecutar una vez en Supabase > SQL Editor.

-- Progreso del jugador (un documento JSON por usuario, el mismo formato que localStorage).
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "progress: leer el propio" on public.progress
  for select to authenticated using (auth.uid() = user_id);
create policy "progress: crear el propio" on public.progress
  for insert to authenticated with check (auth.uid() = user_id);
create policy "progress: actualizar el propio" on public.progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Registro de respuestas: cada ejecución, cada "Correr tests", pistas y soluciones vistas.
create table if not exists public.answers (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  client_at timestamptz,
  kind text not null check (kind in ('challenge_run', 'challenge_test', 'tutorial_run', 'hint', 'solution')),
  challenge_id text,
  lesson_slug text,
  snippet int,
  code text,
  passed boolean,
  tests_passed int,
  tests_total int,
  error text,
  stdout text,
  attempt int,
  hint int
);

create index if not exists answers_user_created_idx on public.answers (user_id, created_at);
create index if not exists answers_challenge_idx on public.answers (challenge_id);

alter table public.answers enable row level security;

create policy "answers: insertar las propias" on public.answers
  for insert to authenticated with check (auth.uid() = user_id);
create policy "answers: leer las propias" on public.answers
  for select to authenticated using (auth.uid() = user_id);
