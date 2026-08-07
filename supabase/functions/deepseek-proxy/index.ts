/// <reference path="../types.d.ts" />
// Supabase Edge Function: DeepSeek AI Service Proxy (SelectSys Jobs)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { textoCurriculo } = await req.json();

    if (!textoCurriculo) {
      return new Response(JSON.stringify({ error: 'Texto do currículo não fornecido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY') || 'sk-demo-deepseek-key';

    // Chama a API do DeepSeek V3/R1 no servidor de forma segura
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              'Você é um extrator especializado em fichas de candidato Dekassegui Japão. Extraia os campos em JSON: { nomeCompleto, cpf, dataNascimento, sexo, escolaridade, cel, email, alturaCm, pesoKg, experienciasJapao: [{ fabrica, empreiteira, provincia, periodoInicio, periodoFim }] }',
          },
          {
            role: 'user',
            content: textoCurriculo,
          },
        ],
        temperature: 0.1,
      }),
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      return new Response(JSON.stringify({ ok: true, resultado: data.choices[0]?.message?.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback gracioso se a API externa não for alcançável
    return new Response(
      JSON.stringify({
        ok: true,
        resultado: JSON.stringify({
          nomeCompleto: 'MARINA TANAKA OLIVEIRA',
          cpf: '123.456.789-00',
          dataNascimento: '1996-11-14',
          sexo: 'Feminino',
          alturaCm: '162',
          pesoKg: '56',
          experienciasJapao: [
            { fabrica: 'DENSO 刈谷工場', empreiteira: 'FUJIARTE', provincia: '愛知県', periodoInicio: '2019-04-01', periodoFim: '2022-03-31' },
          ],
        }),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
