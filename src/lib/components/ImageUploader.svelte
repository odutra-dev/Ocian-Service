<script lang="ts">
  import { SupabaseService } from '#lib/supabase';
  import ImageLightbox from './ImageLightbox.svelte';

  let {
    images = $bindable([]),
    label = 'Fotos / Imagens da Peça (opcional)'
  }: {
    images: string[];
    label?: string;
  } = $props();

  let uploading = $state(false);
  let uploadProgress = $state('');
  let fileInput: HTMLInputElement;
  let cameraInput: HTMLInputElement;
  let errorMessage = $state('');

  let lightboxOpen = $state(false);
  let lightboxIndex = $state(0);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    errorMessage = '';
    uploading = true;
    const total = files.length;

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < total; i++) {
        uploadProgress = `Enviando ${i + 1} de ${total}...`;
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          continue;
        }
        const url = await SupabaseService.uploadImagem(file);
        newUrls.push(url);
      }
      images = [...images, ...newUrls];
    } catch (err: any) {
      console.error(err);
      errorMessage = 'Erro ao enviar imagem. Verifique a conexão.';
    } finally {
      uploading = false;
      uploadProgress = '';
      if (fileInput) fileInput.value = '';
      if (cameraInput) cameraInput.value = '';
    }
  }

  function openFilePicker() {
    fileInput?.click();
  }

  function openCamera() {
    cameraInput?.click();
  }

  async function removeImage(index: number) {
    const urlToRemove = images[index];
    images = images.filter((_, i) => i !== index);
    // Remove do storage em background
    if (urlToRemove) {
      SupabaseService.deleteImagem(urlToRemove).catch((e: unknown) => console.warn(e));
    }
  }

  function openLightbox(index: number) {
    lightboxIndex = index;
    lightboxOpen = true;
  }
</script>

<div class="uploader-container">
  <div class="uploader-header">
    <span class="form-label mb-0">
      <i class="bi bi-images"></i>
      {label}
    </span>
    <span class="image-count">
      {images.length} {images.length === 1 ? 'imagem' : 'imagens'}
    </span>
  </div>

  <!-- Hidden inputs -->
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    multiple
    class="hidden-input"
    onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
  />

  <input
    bind:this={cameraInput}
    type="file"
    accept="image/*"
    capture="environment"
    class="hidden-input"
    onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
  />

  <!-- Actions: Add files & Camera -->
  <div class="action-buttons">
    <button
      type="button"
      class="btn btn-outline btn-upload"
      onclick={openFilePicker}
      disabled={uploading}
    >
      <i class="bi bi-cloud-arrow-up"></i>
      <span>Adicionar Fotos</span>
    </button>

    <button
      type="button"
      class="btn btn-outline btn-upload"
      onclick={openCamera}
      disabled={uploading}
      title="Tirar foto com a câmera"
    >
      <i class="bi bi-camera"></i>
      <span>Tirar Foto</span>
    </button>
  </div>

  {#if uploading}
    <div class="upload-state">
      <div class="spinner"></div>
      <p>{uploadProgress || 'Processando imagens...'}</p>
    </div>
  {/if}

  {#if errorMessage}
    <div class="upload-error">
      <i class="bi bi-exclamation-circle"></i>
      <span>{errorMessage}</span>
    </div>
  {/if}

  <!-- Gallery grid of attached images -->
  {#if images.length > 0}
    <div class="thumbnails-grid">
      {#each images as imgUrl, index}
        <div class="thumb-card">
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <img
            src={imgUrl}
            alt="Foto #{index + 1}"
            class="thumb-image"
            onclick={() => openLightbox(index)}
          />
          <div class="thumb-actions">
            <button
              type="button"
              class="thumb-action-btn view-btn"
              onclick={() => openLightbox(index)}
              title="Ampliar foto"
              aria-label="Ampliar foto"
            >
              <i class="bi bi-arrows-fullscreen"></i>
            </button>
            <button
              type="button"
              class="thumb-action-btn delete-btn"
              onclick={() => removeImage(index)}
              title="Remover foto"
              aria-label="Remover foto"
            >
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<ImageLightbox images={images} currentIndex={lightboxIndex} bind:isOpen={lightboxOpen} />

<style>
  .uploader-container {
    margin-bottom: 18px;
  }

  .uploader-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .mb-0 {
    margin-bottom: 0 !important;
  }

  .image-count {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .hidden-input {
    display: none;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .btn-upload {
    flex: 1;
    padding: 10px 14px;
    font-size: 0.88rem;
    gap: 6px;
    border-style: dashed;
  }

  .upload-state {
    padding: 16px;
    text-align: center;
    background: var(--background);
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .upload-state p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 4px 0 0 0;
  }

  .upload-error {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(220, 38, 38, 0.08);
    color: var(--error);
    border-radius: 8px;
    font-size: 0.85rem;
    margin-bottom: 12px;
  }

  .thumbnails-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    margin-top: 8px;
  }

  .thumb-card {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    aspect-ratio: 1;
    border: 1.5px solid var(--border);
    background: #000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .thumb-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .thumb-image:hover {
    transform: scale(1.05);
  }

  .thumb-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 4px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    display: flex;
    justify-content: flex-end;
    gap: 4px;
  }

  .thumb-action-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: #fff;
    border: none;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.5);
    transition: background 0.15s;
  }

  .thumb-action-btn:hover {
    background: rgba(0, 0, 0, 0.85);
  }

  .thumb-action-btn.delete-btn:hover {
    background: var(--error);
  }
</style>
