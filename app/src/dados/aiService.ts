import { supabase } from './supabase';

/**
 * Serviço de Integração B2B (Adapter Pattern)
 * Utiliza o modelo DeepSeek V3 (preço hiper otimizado) para extrair
 * dezenas de campos de fotos e PDFs de currículos.
 */
export class AIServiceAdapter {
  private static API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''; // Chave pública do env (se necessário) 
  // Nota: Para segurança em produção, a chamada para IA deve ser feita no Node (Edge Function)
  // Como estamos no MVP, chamaremos a API diretamente usando a chave (requer proxy ou CORS no Deepseek)

  /**
   * Envia o texto extraído do currículo para a IA estruturar.
   */
  static async extractCandidateData(rawText: string) {
    if (!this.API_KEY) {
      console.warn("DeepSeek API Key não configurada. Usando fallback de teste.");
      return this.mockExtraction();
    }

    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "Você é um assistente especialista em RH para dekasseguis. Extraia os dados do texto do currículo e responda EXCLUSIVAMENTE em formato JSON com as chaves: nome_completo, data_nascimento, cidade, provincia, descendencia_nikkei, telefone. Não adicione texto adicional, markdown ou explicações. Apenas um JSON válido."
            },
            {
              role: "user",
              content: rawText
            }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error("Falha na comunicação com DeepSeek");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Sanitização básica (tira markdown se vier)
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);

    } catch (err) {
      console.error("Erro na extração IA:", err);
      throw err;
    }
  }

  static mockExtraction() {
    return {
      nome_completo: "ROBERTO KENJI SATO",
      data_nascimento: "1992-05-14",
      cidade: "Hamamatsu",
      provincia: "Shizuoka",
      descendencia_nikkei: "Sansei (3ª Geração)",
      telefone: "+81 90-1234-5678"
    };
  }
}
