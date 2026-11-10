<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Ordem } from '#lib/types/ordem';
  import { parseImagens } from '#lib/types/ordem';
  import { SupabaseService } from '#lib/supabase';
  import { PhoneUtils } from '#lib/utils/phone.utils';
  import { CupomService } from '#lib/services/cupom';
  import { WhatsAppService } from '#lib/services/whatsapp';
  import ThemeToggle from '#lib/components/ThemeToggle.svelte';

  let ordens: Ordem[] = $state([]);
  let loading = $state(true);
  let errorMsg = $state('');
  let termoBusca = $state('');

  onMount(async () => {
    await carregarOrdens();
  });

  async function carregarOrdens() {
    loading = true;
    errorMsg = '';
    try {
      ordens = await SupabaseService.getOrdens();
    } catch (err) {
      console.error(err);
      errorMsg = 'Erro ao carregar ordens de serviço.';
    } finally {
      loading = false;
    }
  }

  function formatarData(dataIso?: string | null): string {
    if (!dataIso) return '';
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

  function formatarWhatsapp(numero: string | number): string {
    return PhoneUtils.formatPhoneDisplay(numero);
  }

  function limparBusca() {
    termoBusca = '';
  }

  function novaOrdem() {
    goto('/nova-ordem');
  }

  function verDetalhes(id: number) {
    goto(`/ordem/${id}`);
  }

  function imprimirCupom(ordem: Ordem, e: MouseEvent) {
    e.stopPropagation();
    CupomService.imprimir(ordem);
  }

  function enviarWhatsApp(ordem: Ordem, e: MouseEvent) {
    e.stopPropagation();
    WhatsAppService.enviarWhatsApp(ordem);
  }

  async function excluirOrdem(ordem: Ordem, e: MouseEvent) {
    e.stopPropagation();
    const confirmar = confirm(`Deseja realmente excluir a Ordem #${ordem.id}?`);
    if (!confirmar) return;

    try {
      await SupabaseService.deleteOrdem(ordem.id, ordem.imagens);
      ordens = ordens.filter((o) => o.id !== ordem.id);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir ordem de serviço.');
    }
  }

  // Filtra estritamente por número da ordem e WhatsApp do cliente
  let ordensFiltradas = $derived.by(() => {
    const termo = termoBusca.trim().toLowerCase();
    if (!termo) return ordens;

    const termoNumeros = termo.replace(/\D/g, '');

    return ordens.filter((ordem) => {
      // 1. Número da ordem (ID)
      const idMatch = ordem.id.toString().includes(termoNumeros || termo);
      if (idMatch) return true;

      // 2. WhatsApp
      const whatsLimpo = (ordem.whatsapp || '').toString().replace(/\D/g, '');
      if (termoNumeros && whatsLimpo.includes(termoNumeros)) {
        return true;
      }

      return false;
    });
  });
</script>

<div class="container">
  <!-- Header da Lista -->
  <div class="page-header app-header">
    <div class="header-left">
      <div class="brand-badge">
        <i class="bi bi-key-fill"></i>
      </div>
      <div>
        <h1 class="page-title">Chaveiro Ocian</h1>
        <p class="page-subtitle">Gerenciamento de ordens de serviço</p>
      </div>
    </div>
    <div class="header-actions">
      <ThemeToggle />
      <button type="button" class="btn btn-primary btn-nova-ordem" onclick={novaOrdem}>
        <i class="bi bi-plus-lg"></i>
        <span>Nova Ordem</span>
      </button>
    </div>
  </div>

  <!-- Barra de Busca (apenas Número da Ordem e WhatsApp) -->
  <div class="search-bar-container">
    <div class="search-input-wrapper">
      <i class="bi bi-search search-icon"></i>
      <input
        type="text"
        class="search-input"
        placeholder="Buscar por nº da ordem ou WhatsApp..."
        bind:value={termoBusca}
        aria-label="Buscar ordens por número ou WhatsApp"
      />
      {#if termoBusca}
        <button
          type="button"
          class="btn-clear-search"
          onclick={limparBusca}
          title="Limpar busca"
          aria-label="Limpar busca"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      {/if}
    </div>
  </div>

  <!-- Loading ou Erro -->
  {#if loading}
    <div class="state-box">
      <div class="spinner"></div>
      <p>Carregando ordens de serviço...</p>
    </div>
  {:else if errorMsg}
    <div class="state-box error">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{errorMsg}</p>
      <button type="button" class="btn btn-outline" style="margin-top: 14px;" onclick={carregarOrdens}>
        <i class="bi bi-arrow-clockwise"></i> Tentar novamente
      </button>
    </div>
  {:else if ordensFiltradas.length > 0}
    <!-- Lista de Ordens -->
    <div class="ordens-list">
      {#each ordensFiltradas as ordem (ordem.id)}
        {@const imgs = parseImagens(ordem.imagens)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="ordem-card"
          onclick={() => verDetalhes(ordem.id)}
        >
          <div class="card-inner">
            <!-- Indicador lateral de cor por categoria -->
            <div
              class="label-indicator"
              style:background-color={
                ordem.categoria === 'Carcaça'
                  ? 'var(--label-carcaca)'
                  : ordem.categoria === 'Bateria'
                    ? 'var(--label-bateria)'
                    : 'var(--label-servico)'
              }
            ></div>

            <!-- Conteúdo do card -->
            <div class="info">
              <div class="card-top-row">
                <span class="id-text">Ordem #{ordem.id}</span>
                <span
                  class="badge"
                  class:badge-carcaca={ordem.categoria === 'Carcaça'}
                  class:badge-bateria={ordem.categoria === 'Bateria'}
                  class:badge-servico={ordem.categoria === 'Serviço'}
                >
                  <i class="bi bi-tag-fill"></i>
                  {ordem.categoria}
                </span>
                {#if imgs.length > 0}
                  <span class="img-badge" title="{imgs.length} foto(s)">
                    <i class="bi bi-image"></i>
                    {imgs.length}
                  </span>
                {/if}
              </div>

              <div class="card-meta">
                {#if ordem.cliente}
                  <p class="cliente-text">
                    <i class="bi bi-person"></i>
                    <strong>{ordem.cliente}</strong>
                  </p>
                {/if}
                <p class="data-text">
                  <i class="bi bi-calendar3"></i>
                  {formatarData(ordem.data_criacao)}
                </p>
                <p class="phone-text">
                  <i class="bi bi-whatsapp"></i>
                  {formatarWhatsapp(ordem.whatsapp)}
                </p>
              </div>
            </div>

            <!-- Ações da ordem -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="icon-container" onclick={(e) => e.stopPropagation()}>
              <button
                type="button"
                class="icon-btn-action icon-print"
                onclick={(e) => imprimirCupom(ordem, e)}
                title="Imprimir Cupom"
                aria-label="Imprimir Cupom"
              >
                <i class="bi bi-printer-fill"></i>
              </button>

              <button
                type="button"
                class="icon-btn-action icon-whatsapp"
                onclick={(e) => enviarWhatsApp(ordem, e)}
                title="Enviar no WhatsApp"
                aria-label="Enviar no WhatsApp"
              >
                <i class="bi bi-whatsapp"></i>
              </button>

              <button
                type="button"
                class="icon-btn-action icon-delete"
                onclick={(e) => excluirOrdem(ordem, e)}
                title="Excluir ordem"
                aria-label="Excluir ordem"
              >
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if termoBusca}
    <!-- Busca vazia -->
    <div class="state-box">
      <i class="bi bi-search"></i>
      <p>Nenhuma ordem encontrada para <strong>"{termoBusca}"</strong></p>
      <button type="button" class="btn btn-outline" style="margin-top: 14px;" onclick={limparBusca}>
        <i class="bi bi-x-circle"></i>
        <span>Limpar busca</span>
      </button>
    </div>
  {:else}
    <!-- Sem ordens registradas -->
    <div class="state-box">
      <i class="bi bi-inbox"></i>
      <p>Nenhuma ordem de serviço cadastrada.</p>
    </div>
  {/if}
</div>

<style>
  /* Header da Aplicação */
  .app-header {
    margin-bottom: 20px;
  }

  .btn-nova-ordem {
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.28);
    flex-shrink: 0;
  }

  /* Barra de busca */
  .search-bar-container {
    margin-bottom: 20px;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    color: var(--text-muted);
    font-size: 1.05rem;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 12px 40px 12px 42px;
    font-size: 0.95rem;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background-color: var(--surface);
    color: var(--text-primary);
    outline: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  }

  .search-input:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .btn-clear-search {
    position: absolute;
    right: 12px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    border-radius: 50%;
  }

  .btn-clear-search:hover {
    color: var(--text-primary);
    background-color: var(--border);
  }

  /* Lista de Cards */
  .ordens-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ordem-card {
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .ordem-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.07);
    border-color: rgba(37, 99, 235, 0.3);
  }

  .card-inner {
    display: flex;
    position: relative;
    padding: 16px;
    gap: 14px;
  }

  .label-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    border-top-left-radius: 14px;
    border-bottom-left-radius: 14px;
  }

  .info {
    flex: 1;
    min-width: 0;
    padding-left: 2px;
  }

  .card-top-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .id-text {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .img-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--text-muted);
    background: var(--background);
    padding: 2px 7px;
    border-radius: 6px;
    border: 1px solid var(--border);
  }

  .card-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.88rem;
    margin-bottom: 6px;
  }

  .card-meta p {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
  }

  .card-meta i {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .cliente-text strong {
    color: var(--text-primary);
  }

  .phone-text i {
    color: var(--success);
  }

  /* Botões de Ação no Card */
  .icon-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .icon-btn-action {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background-color: var(--surface);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .icon-btn-action:hover {
    transform: scale(1.06);
  }

  .icon-print:hover {
    background-color: rgba(37, 99, 235, 0.1);
    color: var(--primary);
    border-color: rgba(37, 99, 235, 0.3);
  }

  .icon-whatsapp {
    color: var(--success);
  }

  .icon-whatsapp:hover {
    background-color: rgba(22, 163, 74, 0.12);
    border-color: rgba(22, 163, 74, 0.3);
  }

  .icon-delete {
    color: var(--error);
  }

  .icon-delete:hover {
    background-color: rgba(220, 38, 38, 0.12);
    border-color: rgba(220, 38, 38, 0.3);
  }

  @media (max-width: 600px) {
    .btn-nova-ordem {
      padding: 8px 12px;
      font-size: 0.88rem;
    }

    .card-inner {
      flex-direction: column;
      align-items: stretch;
      padding: 14px 12px;
      gap: 12px;
    }

    .info {
      padding-left: 6px;
    }

    .icon-container {
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      border-top: 1px solid var(--border);
      padding-top: 10px;
      gap: 10px;
      width: 100%;
    }

    .icon-btn-action {
      width: 40px;
      height: 40px;
      font-size: 1.05rem;
      border-radius: 10px;
    }
  }

  @media (max-width: 420px) {
    .search-input {
      font-size: 16px;
      padding: 11px 36px 11px 38px;
    }

    .app-header {
      margin-bottom: 16px;
    }

    .card-top-row {
      gap: 6px;
    }

    .id-text {
      font-size: 1rem;
    }
  }
</style>
