-- ========================================================
-- Schema Supabase para o Chaveiro Ocian
-- ========================================================

-- 1. Criação da tabela de ordens de serviço
CREATE TABLE IF NOT EXISTS public.ordens (
  id BIGSERIAL PRIMARY KEY,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  cliente TEXT,
  whatsapp BIGINT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Carcaça', 'Bateria', 'Serviço')),
  descricao TEXT NOT NULL,
  imagens JSONB,
  observacao TEXT,
  tipo_pagamento TEXT NOT NULL CHECK (tipo_pagamento IN ('Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'A pagar')),
  valor NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.ordens ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para anon / authenticated
CREATE POLICY "Permitir leitura pública das ordens"
ON public.ordens FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção pública de ordens"
ON public.ordens FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de ordens"
ON public.ordens FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de ordens"
ON public.ordens FOR DELETE
USING (true);

-- 3. Bucket de Armazenamento para Fotos das Ordens
-- (Caso não tenha sido criado via dashboard, crie o bucket 'ordens-imagens')
INSERT INTO storage.buckets (id, name, public)
VALUES ('ordens-imagens', 'ordens-imagens', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de acesso para o storage de fotos
CREATE POLICY "Acesso público às fotos de ordens"
ON storage.objects FOR SELECT
USING (bucket_id = 'ordens-imagens');

CREATE POLICY "Permitir upload de fotos de ordens"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ordens-imagens');

CREATE POLICY "Permitir remoção de fotos de ordens"
ON storage.objects FOR DELETE
USING (bucket_id = 'ordens-imagens');
