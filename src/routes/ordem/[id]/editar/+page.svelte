<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import {
    type CategoriaOrdem,
    type TipoPagamento,
    type Ordem,
    CATEGORIAS_ORDEM,
    FORMAS_PAGAMENTO,
    parseImagens
  } from '#lib/types/ordem';
  import { SupabaseService } from '#lib/supabase';
  import PhoneInput from '#lib/components/PhoneInput.svelte';
  import CurrencyInput from '#lib/components/CurrencyInput.svelte';
  import ImageUploader from '#lib/components/ImageUploader.svelte';
  import ThemeToggle from '#lib/components/ThemeToggle.svelte';

  const id = Number(page.params.id);

  let loading = $state(true);
  let saving = $state(false);
  let isSubmitted = $state(false);
  let errorMessage = $state('');

  let cliente = $state('');
  let whatsapp = $state('');
  let categoria = $state<CategoriaOrdem>('Carcaça');
  let descricao = $state('');
  let observacao = $state('');
  let tipoPagamento = $state<TipoPagamento>('Pix');
  let valor = $state(0);
  let imagens = $state<string[]>([]);

  onMount(async () => {
    if (!id || isNaN(id)) {
      errorMessage = 'ID da ordem inválido.';
      loading = false;
      return;
    }

    try {
      const ordem = await SupabaseService.getOrdemById(id);
      cliente = ordem.cliente || '';
      whatsapp = (ordem.whatsapp || '').toString();
      categoria = ordem.categoria || 'Carcaça';
      descricao = ordem.descricao || '';
      observacao = ordem.observacao || '';
      tipoPagamento = ordem.tipo_pagamento || 'Pix';
      valor = Number(ordem.valor) || 0;
      imagens = parseImagens(ordem.imagens);
    } catch (err) {
      console.error(err);
      errorMessage = 'Erro ao carregar dados da ordem.';
    } finally {
      loading = false;
    }
  });

  function goBack() {
    goto(`/ordem/${id}`);
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    isSubmitted = true;
    errorMessage = '';

    if (!whatsapp) {
      errorMessage = 'Por favor, informe um número de WhatsApp válido.';
      return;
    }

    if (!descricao.trim()) {
      errorMessage = 'A descrição do serviço/peça é obrigatória.';
      return;
    }

    saving = true;

    try {
      await SupabaseService.updateOrdem(id, {
        cliente: cliente.trim() || null,
        whatsapp,
        categoria,
        descricao: descricao.trim(),
        observacao: observacao.trim() || null,
        tipo_pagamento: tipoPagamento,
        valor,
        imagens: imagens.length > 0 ? imagens : null
      });

      goto(`/ordem/${id}`);
    } catch (err: any) {
      console.error(err);
      errorMessage = 'Erro ao atualizar ordem de serviço. Tente novamente.';
      saving = false;
    }
  }
</script>

<div class="container">
  {#if loading}
    <div class="state-box">
      <div class="spinner"></div>
      <p>Carregando ordem para edição...</p>
    </div>
  {:else}
    <div class="main-card">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button class="back-button" type="button" aria-label="Voltar" onclick={goBack}>
            <i class="bi bi-arrow-left"></i>
          </button>
          <div>
            <h1 class="page-title">✏ Editar Ordem #{id}</h1>
            <p class="page-subtitle">Modifique as informações necessárias da ordem</p>
          </div>
        </div>
        <div class="header-actions">
          <ThemeToggle />
        </div>
      </div>

      {#if errorMessage}
        <div class="alert-box">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{errorMessage}</span>
        </div>
      {/if}

      <form onsubmit={handleSubmit} novalidate>
        <!-- Seção 1: Cliente & Contato -->
        <div class="form-section-card">
          <div class="section-title">
            <i class="bi bi-person-circle"></i>
            <span>Dados do Cliente</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="cliente-edit-field" class="form-label">
                <i class="bi bi-person"></i>
                Nome do Cliente (opcional)
              </label>
              <input
                type="text"
                id="cliente-edit-field"
                class="form-control"
                placeholder="Ex: João Silva"
                bind:value={cliente}
                autocomplete="off"
              />
            </div>

            <PhoneInput
              bind:value={whatsapp}
              {isSubmitted}
              required={true}
            />
          </div>
        </div>

        <!-- Seção 2: Detalhes do Serviço -->
        <div class="form-section-card">
          <div class="section-title">
            <i class="bi bi-tools"></i>
            <span>Detalhes da Ordem</span>
          </div>

          <div class="form-group">
            <label for="categoria-edit-select" class="form-label">
              <i class="bi bi-tag-fill"></i>
              Categoria <span class="required">*</span>
            </label>
            <select
              id="categoria-edit-select"
              class="form-select"
              bind:value={categoria}
            >
              {#each CATEGORIAS_ORDEM as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="descricao-edit-field" class="form-label">
              <i class="bi bi-card-text"></i>
              Descrição <span class="required">*</span>
            </label>
            <textarea
              id="descricao-edit-field"
              rows="3"
              class="form-control"
              class:is-invalid={isSubmitted && !descricao.trim()}
              placeholder="Digite os detalhes da chave, modelo do carro, tipo de serviço ou bateria..."
              bind:value={descricao}
            ></textarea>
            {#if isSubmitted && !descricao.trim()}
              <p class="invalid-feedback">Descrição é obrigatória</p>
            {/if}
          </div>

          <!-- Upload de Imagens -->
          <ImageUploader bind:images={imagens} />

          <div class="form-group mb-0">
            <label for="observacao-edit-field" class="form-label">
              <i class="bi bi-chat-left-text"></i>
              Observações (opcional)
            </label>
            <textarea
              id="observacao-edit-field"
              rows="2"
              class="form-control"
              placeholder="Avisos internos, defeito prévio na peça, etc."
              bind:value={observacao}
            ></textarea>
          </div>
        </div>

        <!-- Seção 3: Pagamento e Valor -->
        <div class="form-section-card">
          <div class="section-title">
            <i class="bi bi-credit-card"></i>
            <span>Pagamento</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="tipo-pagamento-edit-select" class="form-label">
                <i class="bi bi-wallet2"></i>
                Forma de Pagamento <span class="required">*</span>
              </label>
              <select
                id="tipo-pagamento-edit-select"
                class="form-select"
                bind:value={tipoPagamento}
              >
                {#each FORMAS_PAGAMENTO as forma}
                  <option value={forma}>{forma}</option>
                {/each}
              </select>
            </div>

            <CurrencyInput
              bind:value={valor}
              {isSubmitted}
              label="Valor (R$)"
              required={false}
            />
          </div>
        </div>

        <!-- Ações -->
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-outline"
            onclick={goBack}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="btn btn-primary"
            disabled={saving}
          >
            {#if saving}
              <span class="btn-spinner"></span>
              <span>Salvando alterações...</span>
            {:else}
              <i class="bi bi-check-lg"></i>
              <span>Atualizar Ordem</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>

<style>
  .alert-box {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background-color: rgba(220, 38, 38, 0.08);
    border: 1px solid rgba(220, 38, 38, 0.25);
    border-radius: 12px;
    color: var(--error);
    margin-bottom: 20px;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .mb-0 {
    margin-bottom: 0 !important;
  }
</style>
