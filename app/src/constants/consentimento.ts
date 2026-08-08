import { FileText, Award, HeartPulse, Globe } from 'lucide-react';

export const TEXTOS_CONSENTIMENTO = {
  geral_v1: {
    titulo: '1. Termo de Tratamento de Dados Gerais (geral_v1)',
    icone: FileText,
    obrigatorio: true,
    texto:
      'Declaro que as informações desta ficha são verdadeiras e autorizo a empresa a entrar em contato pelos dados fornecidos sobre o resultado da entrevista, promoções e comunicados.',
  },
  descendencia_v1: {
    titulo: '2. Consentimento para comprovação de Ascendência Nikkei (descendencia_v1)',
    icone: Award,
    obrigatorio: true,
    texto:
      'Autorizo o tratamento da informação sobre minha ascendência japonesa (geração e certidão 戸籍謄本) com a finalidade exclusiva de comprovar minha elegibilidade ao visto de descendente perante as autoridades japonesas.',
  },
  saude_v1: {
    titulo: '3. Consentimento para Tratamento de Dados de Saúde (saude_v1)',
    icone: HeartPulse,
    obrigatorio: false,
    texto:
      'Autorizo o tratamento dos meus dados de saúde (perguntas 16 a 31) com a finalidade exclusiva de adequação da função na fábrica. Estes dados são armazenados criptografados, com acesso restrito e registrado. Posso recusar — minha candidatura continua sem eles.',
  },
  transferencia_internacional_v1: {
    titulo: '4. Consentimento para Transferência Internacional (transferencia_internacional_v1)',
    icone: Globe,
    obrigatorio: true,
    texto:
      'Autorizo o envio dos meus dados para a FUJIARTE Co., Ltd., no Japão, para fins de seleção e emissão de visto. Estou ciente de que o Japão possui legislação própria de proteção de dados (APPI) e que a transferência é regida por cláusulas contratuais específicas.',
  },
};
