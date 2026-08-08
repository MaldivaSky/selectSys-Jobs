-- ═══════════════════════════════════════════════════════════════════════════
-- BUCKET PRIVADO PARA O MODELO DA FICHA FUJIARTE
-- ---------------------------------------------------------------------------
-- Por que este bucket existe
--
-- O modelo da ficha é material da FUJIARTE. Publicá-lo é quebra de compliance
-- com o cliente, e até aqui ele estava exposto em dois lugares ao mesmo tempo:
-- versionado no repositório (público no GitHub) e servido pelo site em
-- /templates/ficha_fujiarte_template.xlsx, baixável por qualquer pessoa sem
-- login.
--
-- A partir daqui o modelo mora SÓ aqui. `public = false`, e nenhuma policy de
-- SELECT é criada para `anon` ou `authenticated`: ninguém lê pelo navegador.
-- Quem lê é a edge function `gerar-ficha-excel`, que roda com `service_role` e
-- portanto passa por cima da RLS de storage.objects por desenho.
--
-- Consequência de projeto: a geração do .xlsx deixa de acontecer no browser.
-- O navegador não tem — e não deve ter — como alcançar este arquivo.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-templates',
  'app-templates',
  false,
  10485760, -- 10 MB: o modelo tem ~90 KB, a folga cobre revisões futuras
  ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Faxina de segurança: se em algum momento alguém tiver criado uma policy de
-- leitura pública sobre este bucket, ela sai. O bucket é privado e ponto.
DROP POLICY IF EXISTS "public_read_app_templates" ON storage.objects;
DROP POLICY IF EXISTS "anon_read_app_templates"   ON storage.objects;

-- Nenhuma policy de SELECT/INSERT é criada de propósito. `service_role` não
-- precisa de policy, e é o único que deve tocar neste bucket.
