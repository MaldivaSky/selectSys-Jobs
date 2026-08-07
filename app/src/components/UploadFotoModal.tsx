import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../dados/supabase';

interface Props {
  onPhotoUploaded: (urlOrKey: string) => void;
  fotoAtualUrl?: string;
}

export const UploadFotoModal: React.FC<Props> = ({ onPhotoUploaded, fotoAtualUrl }) => {
  const [carregando, setCarregando] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(fotoAtualUrl || null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processarECompressorImagem = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Falha ao obter contexto 2D do Canvas.');

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject('Falha ao converter imagem para Blob JPEG.');
          },
          'image/jpeg',
          0.85 // Qualidade JPEG (85%)
        );
      };
      img.onerror = () => reject('Erro ao carregar imagem selecionada.');
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCarregando(true);
    setMensagemErro(null);

    try {
      // 1. Processamento e compressão client-side (compatível com iOS Safari)
      const compressedBlob = await processarECompressorImagem(file);
      const tempPreview = URL.createObjectURL(compressedBlob);
      setPreviewUrl(tempPreview);

      // 2. Upload para Supabase Storage se configurado, caso contrário gera data URL para modo offline/demo
      if (supabase) {
        const fileName = `foto_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const { data, error } = await supabase.storage
          .from('candidatos-fotos')
          .upload(fileName, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (error) {
          console.warn('Aviso no upload Supabase Storage:', error.message);
          // Fallback para preview local se a bucket ainda não for criada
          onPhotoUploaded(tempPreview);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('candidatos-fotos')
            .getPublicUrl(data.path);
          
          onPhotoUploaded(publicUrlData.publicUrl);
        }
      } else {
        onPhotoUploaded(tempPreview);
      }
    } catch (err: any) {
      setMensagemErro(err?.toString() || 'Erro ao processar imagem.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl text-center space-y-4">
      <h4 className="text-base font-semibold text-white flex items-center justify-center gap-2">
        <Camera className="w-5 h-5 text-blue-400" /> Foto do Candidato (Padrão Passaporte/EPI)
      </h4>

      {previewUrl ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-36 h-44 rounded-lg overflow-hidden border-2 border-blue-500/80 shadow-lg shadow-blue-950/40">
            <img src={previewUrl} alt="Preview do Candidato" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Substituir Foto
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 p-8 rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900/50 transition-all group"
        >
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="w-10 h-10 text-slate-500 group-hover:text-blue-400 transition-colors" />
            <p className="text-sm font-medium text-slate-300">Tire uma foto ou escolha um arquivo</p>
            <p className="text-xs text-slate-500">Formatos aceitos: JPG, PNG • Redimensionamento e compressão automáticos</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {carregando && (
        <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
          <RefreshCw className="w-4 h-4 animate-spin" /> Otimizando e enviando imagem...
        </div>
      )}

      {mensagemErro && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 p-2 rounded">
          {mensagemErro}
        </p>
      )}
    </div>
  );
};
