-- ════════════════════════════════════════════
-- GORILA CONCURSO — tabela do PROGRESSO de cada pessoa (18/10/2026)
-- Rodar UMA VEZ no Supabase: SQL Editor ➔ New query ➔ colar tudo ➔ Run.
-- Uma linha por conta: o "state" inteiro do site (calendário, cursos, matérias, mapa mental, preferências) em JSON.
-- SEGURANÇA: RLS ligado — cada pessoa só lê, cria, muda e apaga a PRÓPRIA linha (auth.uid() = user_id).
-- Visitante sem conta (anon) não tem acesso nenhum. Tamanho máximo por pessoa: 5 MB (as fotos não vêm para cá).
-- ════════════════════════════════════════════
create table if not exists public.progresso (
  user_id       uuid primary key references auth.users(id) on delete cascade,   -- apagou a conta ➔ apaga o progresso
  dados         jsonb not null,
  atualizado_em timestamptz not null default now(),
  constraint progresso_tamanho check (pg_column_size(dados) <= 5 * 1024 * 1024)
);

alter table public.progresso enable row level security;

drop policy if exists "progresso: ler o proprio"      on public.progresso;
drop policy if exists "progresso: criar o proprio"    on public.progresso;
drop policy if exists "progresso: mudar o proprio"    on public.progresso;
drop policy if exists "progresso: apagar o proprio"   on public.progresso;
create policy "progresso: ler o proprio"    on public.progresso for select to authenticated using ((select auth.uid()) = user_id);
create policy "progresso: criar o proprio"  on public.progresso for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progresso: mudar o proprio"  on public.progresso for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progresso: apagar o proprio" on public.progresso for delete to authenticated using ((select auth.uid()) = user_id);

-- o projeto foi criado SEM "expor automaticamente novas tabelas": libera esta, só para quem está logado
revoke all on public.progresso from anon;
grant select, insert, update, delete on public.progresso to authenticated;
