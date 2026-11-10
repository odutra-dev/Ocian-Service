import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Ordem } from '#lib/types/ordem';
import { parseImagens } from '#lib/types/ordem';

const SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL || 'https://rcqcpakqiappxvnaqqsm.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcWNwYWtxaWFwcHh2bmFxcXNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTY1NjY1OCwiZXhwIjoyMDc3MjMyNjU4fQ.8z1uurmBTjHazyAbeLsqsJiCCfXuJMH0ID3CPwnCbaw';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const BUCKET_NAME = 'ordens-imagens';

export class SupabaseService {
  // Buscar todas as ordens
  static async getOrdens(): Promise<Ordem[]> {
    const { data, error } = await supabase
      .from('ordens')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Erro ao buscar ordens:', error);
      throw error;
    }
    return (data || []) as Ordem[];
  }

  // Buscar uma ordem por ID
  static async getOrdemById(id: number): Promise<Ordem> {
    const { data, error } = await supabase
      .from('ordens')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erro ao buscar ordem #${id}:`, error);
      throw error;
    }
    return data as Ordem;
  }

  // Criar nova ordem
  static async createOrdem(ordem: Partial<Ordem>): Promise<Ordem> {
    const { data, error } = await supabase
      .from('ordens')
      .insert(ordem)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar ordem:', error);
      throw error;
    }
    return data as Ordem;
  }

  // Atualizar ordem
  static async updateOrdem(id: number, updates: Partial<Ordem>): Promise<Ordem> {
    const { data, error } = await supabase
      .from('ordens')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao atualizar ordem #${id}:`, error);
      throw error;
    }
    return data as Ordem;
  }

  // Excluir ordem com cascata para remover todas as imagens do Storage
  static async deleteOrdem(id: number, imagens?: unknown): Promise<void> {
    try {
      let rawImagens = imagens;

      // Se as imagens não foram passadas, busca na ordem antes de deletar
      if (rawImagens === undefined) {
        const { data: ordem } = await supabase
          .from('ordens')
          .select('imagens')
          .eq('id', id)
          .maybeSingle();
        rawImagens = ordem?.imagens;
      }

      if (rawImagens) {
        const urls = parseImagens(rawImagens);
        const filePaths = urls
          .map((url) => {
            const parts = url.split(`/${BUCKET_NAME}/`);
            return parts.length > 1 ? decodeURIComponent(parts[1]) : '';
          })
          .filter(Boolean);

        if (filePaths.length > 0) {
          await supabase.storage.from(BUCKET_NAME).remove(filePaths);
        }
      }
    } catch (storageErr) {
      console.warn('Aviso: Erro ao remover fotos em cascata do storage:', storageErr);
    }

    const { error } = await supabase.from('ordens').delete().eq('id', id);

    if (error) {
      console.error(`Erro ao excluir ordem #${id}:`, error);
      throw error;
    }
  }

  // Upload de imagem para o bucket do Supabase
  static async uploadImagem(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fileName = `ordem_${Date.now()}_${randomSuffix}.${cleanExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro no upload de imagem:', uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  // Excluir imagem do bucket pelo URL
  static async deleteImagem(imageUrl: string): Promise<void> {
    try {
      const parts = imageUrl.split(`/${BUCKET_NAME}/`);
      if (parts.length > 1) {
        const filePath = parts[1];
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }
    } catch (e) {
      console.warn('Não foi possível remover imagem do storage:', e);
    }
  }
}
