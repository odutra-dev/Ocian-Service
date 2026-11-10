<script lang="ts">
  let {
    images = [],
    currentIndex = 0,
    isOpen = $bindable(false)
  }: {
    images: string[];
    currentIndex: number;
    isOpen: boolean;
  } = $props();

  let activeIndex = $state(0);
  let imageLoading = $state(true);

  $effect(() => {
    if (isOpen) {
      activeIndex = currentIndex >= 0 && currentIndex < images.length ? currentIndex : 0;
      imageLoading = true;
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }
  });

  function close() {
    isOpen = false;
  }

  function prev() {
    imageLoading = true;
    if (activeIndex > 0) {
      activeIndex--;
    } else {
      activeIndex = images.length - 1;
    }
  }

  function next() {
    imageLoading = true;
    if (activeIndex < images.length - 1) {
      activeIndex++;
    } else {
      activeIndex = 0;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && images.length > 0}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="lightbox-overlay" onclick={close}>
    <div class="lightbox-content" onclick={(e) => e.stopPropagation()}>
      <button class="lightbox-close" onclick={close} title="Fechar (Esc)" aria-label="Fechar">
        <i class="bi bi-x-lg"></i>
      </button>

      {#if images.length > 1}
        <button class="lightbox-nav prev" onclick={prev} title="Anterior (←)" aria-label="Anterior">
          <i class="bi bi-chevron-left"></i>
        </button>
      {/if}

      <div class="image-wrapper">
        {#if imageLoading}
          <div class="img-spinner-wrapper">
            <div class="spinner"></div>
          </div>
        {/if}

        <img
          src={images[activeIndex]}
          alt="Foto da Ordem {activeIndex + 1}"
          class="lightbox-img"
          class:hidden={imageLoading}
          onload={() => (imageLoading = false)}
          onerror={() => (imageLoading = false)}
        />

        <div class="lightbox-footer">
          <span class="footer-count">Foto {activeIndex + 1} de {images.length}</span>
          <a
            href={images[activeIndex]}
            target="_blank"
            rel="noopener noreferrer"
            class="lightbox-download-link"
            title="Abrir foto em tamanho original"
          >
            <i class="bi bi-box-arrow-up-right"></i>
            Abrir original
          </a>
        </div>
      </div>

      {#if images.length > 1}
        <button class="lightbox-nav next" onclick={next} title="Próxima (→)" aria-label="Próxima">
          <i class="bi bi-chevron-right"></i>
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(10, 15, 30, 0.92);
    backdrop-filter: blur(8px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.18s ease;
  }

  .lightbox-content {
    position: relative;
    max-width: 92vw;
    max-height: 92vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 90vw;
    max-height: 85vh;
  }

  .img-spinner-wrapper {
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lightbox-img {
    max-width: 85vw;
    max-height: 75vh;
    border-radius: 12px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
    object-fit: contain;
    background-color: #0b1120;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: opacity 0.2s ease;
  }

  .lightbox-img.hidden {
    display: none;
  }

  .lightbox-footer {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: #e2e8f0;
    font-size: 0.92rem;
    font-weight: 500;
  }

  .footer-count {
    background: rgba(255, 255, 255, 0.12);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .lightbox-download-link {
    color: #60a5fa;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.88rem;
    text-decoration: none;
    background: rgba(37, 99, 235, 0.2);
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid rgba(96, 165, 250, 0.3);
    transition: all 0.2s;
  }

  .lightbox-download-link:hover {
    background: rgba(37, 99, 235, 0.4);
    color: #93c5fd;
  }

  .lightbox-close {
    position: absolute;
    top: -48px;
    right: 0;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .lightbox-close:hover {
    background: rgba(255, 255, 255, 0.35);
  }

  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.22);
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    z-index: 10;
  }

  .lightbox-nav:hover {
    background: rgba(255, 255, 255, 0.45);
    transform: translateY(-50%) scale(1.06);
  }

  .lightbox-nav.prev {
    left: -58px;
  }

  .lightbox-nav.next {
    right: -58px;
  }

  @media (max-width: 768px) {
    .lightbox-nav.prev {
      left: 10px;
      width: 44px;
      height: 44px;
      background: rgba(0, 0, 0, 0.6);
      font-size: 1.25rem;
    }

    .lightbox-nav.next {
      right: 10px;
      width: 44px;
      height: 44px;
      background: rgba(0, 0, 0, 0.6);
      font-size: 1.25rem;
    }

    .lightbox-close {
      position: fixed;
      top: max(14px, env(safe-area-inset-top, 14px));
      right: max(14px, env(safe-area-inset-right, 14px));
      width: 44px;
      height: 44px;
      font-size: 1.35rem;
      background: rgba(0, 0, 0, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.2);
      z-index: 100001;
    }

    .lightbox-img {
      max-width: 92vw;
      max-height: 68vh;
    }

    .lightbox-footer {
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 12px;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
