<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import type { Ordem } from '#lib/types/ordem';
  import { parseImagens } from '#lib/types/ordem';
  import { SupabaseService } from '#lib/supabase';
  import { PhoneUtils } from '#lib/utils/phone.utils';
  import { CupomService } from '#lib/services/cupom';
  import { WhatsAppService } from '#lib/services/whatsapp';
  import ImageLightbox from '#lib/components/ImageLightbox.svelte';
  import ThemeToggle from '#lib/components/ThemeToggle.svelte';

  let ordem = $state<Ordem | null>(null);
  let loading = $state(true);
  let errorMsg = $state('');

  let lightboxOpen = $state(false);
  let lightboxIndex = $state(0);

  const id = Number(page.params.id);

  onMount(async () => {
    if (!id || isNaN(id)) {
      errorMsg = 'ID da ordem inválido.';
      loading = false;
      return;
    }
    await carregarOrdem();
  });

  async function carregarOrdem() {
    loading = true;
    errorMsg = '';
    try {
      ordem = await SupabaseService.getOrdemById(id);
    } catch (err) {
      console.error(err);
      errorMsg = 'Ordem de serviço não encontrada.';
    } finally {
      loading = false;
    }
  }

  function voltar() {
    goto('/');
  }

  function editar() {
    goto(`/ordem/${id}/editar`);
  }

  function imprimir() {
    if (ordem) CupomService.imprimir(ordem);
  }

  function enviarWhatsApp() {
    if (ordem) WhatsAppService.enviarWhatsApp(ordem);
  }

  async function excluir() {
    if (!ordem) return;
    const confirmar = confirm(`Deseja realmente excluir a Ordem #${ordem.id}?`);
    if (!confirmar) return;

    try {
      await SupabaseService.deleteOrdem(ordem.id, ordem.imagens);
      goto('/');
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir ordem de serviço.');
    }
  }

  function formatarData(dataIso?: string | null): string {
    if (!dataIso) return 'N/A';
    const d = new Date(dataIso);
    if (isNaN(d.getTime())) return dataIso;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatarMoeda(val?: number | null): string {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function abrirLightbox(index: number) {
    lightboxIndex = index;
    lightboxOpen = true;
  }

  let imagens = $derived(parseImagens(ordem?.imagens));
</script>

<div class="container">
  {#if loading}
    <div class="state-box">
      <div class="spinner"></div>
      <p>Carregando detalhes da ordem...</p>
    </div>
  {:else if errorMsg || !ordem}
    <div class="state-box error">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{errorMsg || 'Ordem não encontrada.'}</p>
      <button type="button" class="btn btn-outline" style="margin-top: 14px;" onclick={voltar}>
        <i class="bi bi-arrow-left"></i>
        <span>Voltar para a lista</span>
      </button>
    </div>
  {:else}
    <div class="main-card">
      <!-- Header -->
      <div class="page-header order-header">
        <div class="header-left">
          <button class="back-button" type="button" aria-label="Voltar" onclick={voltar}>
            <i class="bi bi-arrow-left"></i>
          </button>
          <div>
            <h1 class="page-title">
              <span>Ordem #{ordem.id}</span>
            </h1>
            <p class="page-subtitle">Detalhes da ordem de serviço</p>
          </div>
        </div>

        <div class="header-actions">
          <div class="theme-toggle-slot">
            <ThemeToggle />
          </div>

          <div class="actions-group">
            <button
              type="button"
              class="icon-btn action-print"
              onclick={imprimir}
              title="Imprimir Cupom Térmico"
              aria-label="Imprimir Cupom Térmico"
            >
              <i class="bi bi-printer-fill"></i>
            </button>

            <button
              type="button"
              class="icon-btn action-whatsapp"
              onclick={enviarWhatsApp}
              title="Enviar mensagem via WhatsApp"
              aria-label="Enviar mensagem via WhatsApp"
            >
              <i class="bi bi-whatsapp"></i>
            </button>

            <button
              type="button"
              class="icon-btn action-edit"
              onclick={editar}
              title="Editar Ordem"
              aria-label="Editar Ordem"
            >
              <i class="bi bi-pencil-fill"></i>
            </button>

            <button
              type="button"
              class="icon-btn action-delete"
              onclick={excluir}
              title="Excluir Ordem"
              aria-label="Excluir Ordem"
            >
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Banner de Categoria -->
      <div class="category-banner">
        <span
          class="badge"
          class:badge-carcaca={ordem.categoria === 'Carcaça'}
          class:badge-bateria={ordem.categoria === 'Bateria'}
          class:badge-servico={ordem.categoria === 'Serviço'}
        >
          <i class="bi bi-tag-fill"></i>
          Categoria: {ordem.categoria}
        </span>
      </div>

      <!-- Grid de Informações -->
      <div class="details-grid">
        {#if ordem.cliente}
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-person"></i> Cliente</span>
            <span class="detail-value highlight">{ordem.cliente}</span>
          </div>
        {/if}

        <div class="detail-item">
          <span class="detail-label"><i class="bi bi-whatsapp"></i> WhatsApp</span>
          <div class="detail-value whatsapp-line">
            <span>{PhoneUtils.formatPhoneDisplay(ordem.whatsapp)}</span>
            <button
              type="button"
              class="btn-inline-whatsapp"
              onclick={enviarWhatsApp}
              title="Abrir WhatsApp"
            >
              <i class="bi bi-box-arrow-up-right"></i>
              Conversar
            </button>
          </div>
        </div>

        <div class="detail-item">
          <span class="detail-label"><i class="bi bi-calendar3"></i> Data de Criação</span>
          <span class="detail-value">{formatarData(ordem.data_criacao)}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label"><i class="bi bi-credit-card"></i> Pagamento</span>
          <span class="detail-value">{ordem.tipo_pagamento}</span>
        </div>

        <div class="detail-item total-item">
          <span class="detail-label"><i class="bi bi-cash-stack"></i> Valor Total</span>
          <span class="detail-value valor-text">{formatarMoeda(ordem.valor)}</span>
        </div>
      </div>

      <!-- Descrição -->
      <div class="detail-block">
        <span class="detail-label"><i class="bi bi-card-text"></i> Descrição do Serviço</span>
        <div class="block-content">
          <p>{ordem.descricao}</p>
        </div>
      </div>

      <!-- Observações (se houver) -->
      {#if ordem.observacao}
        <div class="detail-block">
          <span class="detail-label"><i class="bi bi-chat-left-text"></i> Observações</span>
          <div class="block-content obs-content">
            <p>{ordem.observacao}</p>
          </div>
        </div>
      {/if}

      <!-- Galeria de Imagens -->
      {#if imagens.length > 0}
        <div class="detail-block">
          <span class="detail-label">
            <i class="bi bi-images"></i> Fotos Anexadas ({imagens.length})
          </span>
          <div class="photos-grid">
            {#each imagens as img, idx}
              <button
                type="button"
                class="photo-card"
                onclick={() => abrirLightbox(idx)}
                title="Clique para visualizar a foto {idx + 1}"
                aria-label="Visualizar foto {idx + 1}"
              >
                <img src={img} alt="Foto da Ordem {idx + 1}" class="photo-item" loading="lazy" />
                <div class="photo-footer-bar">
                  <span class="photo-badge">Foto {idx + 1}</span>
                  <span class="photo-zoom-icon">
                    <i class="bi bi-arrows-fullscreen"></i>
                  </span>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<ImageLightbox images={imagens} currentIndex={lightboxIndex} bind:isOpen={lightboxOpen} />

<style>
  .actions-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .theme-toggle-slot {
    display: flex;
    align-items: center;
  }

  @media (max-width: 600px) {
    .order-header {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      grid-template-areas:
        "left theme"
        "actions actions";
      gap: 14px 10px;
      align-items: center;
    }

    .header-left {
      grid-area: left;
    }

    .header-actions {
      display: contents;
    }

    .theme-toggle-slot {
      grid-area: theme;
      justify-self: end;
    }

    .actions-group {
      grid-area: actions;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      width: 100%;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }

    .actions-group .icon-btn {
      width: 100%;
      height: 42px;
      border-radius: 10px;
    }
  }

  .category-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }

  @media (max-width: 600px) {
    .details-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .detail-item {
      padding: 12px 14px;
    }
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background-color: var(--background);
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
  }

  .detail-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .detail-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .detail-value.highlight {
    color: var(--primary);
  }

  .whatsapp-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn-inline-whatsapp {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background-color: rgba(22, 163, 74, 0.12);
    color: var(--success);
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    border: 1px solid rgba(22, 163, 74, 0.25);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-inline-whatsapp:hover {
    background-color: var(--success);
    color: #fff;
  }

  .total-item {
    background-color: rgba(37, 99, 235, 0.05);
    border-color: rgba(37, 99, 235, 0.2);
  }

  .valor-text {
    font-size: 1.25rem;
    color: var(--primary);
    font-weight: 700;
  }

  .detail-block {
    margin-bottom: 24px;
  }

  .detail-block .detail-label {
    margin-bottom: 8px;
  }

  .block-content {
    background-color: var(--background);
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
  }

  .block-content p {
    margin: 0;
    color: var(--text-primary);
    font-size: 0.95rem;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .obs-content {
    background-color: rgba(245, 158, 11, 0.06);
    border-color: rgba(245, 158, 11, 0.25);
  }

  /* Galeria de Fotos */
  .photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }

  @media (max-width: 600px) {
    .photos-grid {
      grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
      gap: 10px;
    }
  }

  .photo-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 1;
    border: 1.5px solid var(--border);
    background-color: var(--surface);
    cursor: pointer;
    padding: 0;
    display: block;
    width: 100%;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .photo-card:hover {
    transform: translateY(-2px);
    border-color: var(--primary);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }

  .photo-item {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.2s ease;
  }

  .photo-card:hover .photo-item {
    transform: scale(1.05);
  }

  .photo-footer-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 6px 8px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    pointer-events: none;
  }

  .photo-badge {
    font-size: 0.72rem;
    font-weight: 600;
  }

  .photo-zoom-icon {
    font-size: 0.8rem;
    opacity: 0.85;
  }

  /* Ações no Header */
  .action-print:hover {
    color: var(--primary);
    background-color: rgba(37, 99, 235, 0.1);
  }

  .action-whatsapp {
    color: var(--success);
  }

  .action-whatsapp:hover {
    background-color: rgba(22, 163, 74, 0.12);
  }

  .action-edit:hover {
    color: var(--primary);
    background-color: rgba(37, 99, 235, 0.1);
  }

  .action-delete {
    color: var(--error);
  }

  .action-delete:hover {
    background-color: rgba(220, 38, 38, 0.12);
  }
</style>
