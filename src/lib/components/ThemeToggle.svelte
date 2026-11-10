<script lang="ts">
  import { onMount } from 'svelte';
  import { themeManager } from '#lib/services/theme.svelte';

  onMount(() => {
    themeManager.init();
  });
</script>

<div class="theme-toggle-container">
  <button
    type="button"
    class="theme-btn"
    onclick={() => themeManager.toggle()}
    title={
      themeManager.mode === 'system'
        ? `Tema do Sistema (${themeManager.currentTheme === 'dark' ? 'Escuro' : 'Claro'})`
        : themeManager.mode === 'dark'
          ? 'Tema Escuro (manual)'
          : 'Tema Claro (manual)'
    }
    aria-label="Alternar tema de cores"
  >
    {#if themeManager.mode === 'system'}
      <i class="bi bi-display"></i>
      <span class="mode-indicator" class:dark={themeManager.currentTheme === 'dark'}>
        {#if themeManager.currentTheme === 'dark'}
          <i class="bi bi-moon-fill"></i>
        {:else}
          <i class="bi bi-sun-fill"></i>
        {/if}
      </span>
    {:else if themeManager.mode === 'dark'}
      <i class="bi bi-moon-stars-fill text-warning"></i>
    {:else}
      <i class="bi bi-sun-fill text-amber"></i>
    {/if}
  </button>
</div>

<style>
  .theme-toggle-container {
    display: inline-flex;
    align-items: center;
  }

  .theme-btn {
    position: relative;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background-color: var(--surface);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }

  .theme-btn:hover {
    background-color: var(--background);
    border-color: var(--text-muted);
    transform: translateY(-1px);
  }

  .mode-indicator {
    position: absolute;
    bottom: 3px;
    right: 3px;
    font-size: 0.55rem;
    color: var(--primary);
  }

  .mode-indicator.dark {
    color: var(--warning);
  }

  .text-warning {
    color: #fbbf24;
  }

  .text-amber {
    color: #f59e0b;
  }
</style>
