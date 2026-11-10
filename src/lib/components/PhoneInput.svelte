<script lang="ts">
  import { PhoneUtils, COMMON_COUNTRIES } from '#lib/utils/phone.utils';

  let {
    value = $bindable(''),
    isSubmitted = false,
    required = true
  }: {
    value: number | string;
    isSubmitted?: boolean;
    required?: boolean;
  } = $props();

  let ddi = $state('55');
  let rawDigits = $state('');
  let displayValue = $state('');
  let touched = $state(false);
  let initialized = false;

  $effect(() => {
    if (!initialized && value) {
      const parsed = PhoneUtils.parseStoredPhone(value);
      ddi = parsed.ddi;
      rawDigits = parsed.phone;
      displayValue = PhoneUtils.formatInputForDdi(ddi, rawDigits);
      initialized = true;
    }
  });

  function handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const clean = input.value.replace(/\D/g, '');
    const maxLen = PhoneUtils.getMaxLengthForDdi(ddi);
    rawDigits = clean.slice(0, maxLen);
    displayValue = PhoneUtils.formatInputForDdi(ddi, rawDigits);
    input.value = displayValue;
    const combined = PhoneUtils.combineDdiAndNumber(ddi, rawDigits);
    value = combined > 0 ? combined.toString() : '';
    touched = true;
  }

  function handleDdiChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    ddi = select.value;
    const maxLen = PhoneUtils.getMaxLengthForDdi(ddi);
    rawDigits = rawDigits.slice(0, maxLen);
    displayValue = PhoneUtils.formatInputForDdi(ddi, rawDigits);
    const combined = PhoneUtils.combineDdiAndNumber(ddi, rawDigits);
    value = combined > 0 ? combined.toString() : '';
  }

  let validationError = $derived(
    (touched || isSubmitted)
      ? (required || rawDigits ? PhoneUtils.getValidationError(ddi, rawDigits) : null)
      : null
  );
</script>

<div class="phone-input-wrapper">
  <label for="phone-input-field" class="form-label">
    <i class="bi bi-whatsapp"></i>
    <span>WhatsApp</span>
    {#if required}
      <span class="required">*</span>
    {/if}
  </label>

  <div class="input-group" class:has-error={!!validationError}>
    <div class="ddi-select-wrapper">
      <select
        id="ddi-select"
        class="ddi-select"
        value={ddi}
        onchange={handleDdiChange}
        aria-label="Código de discagem internacional"
      >
        {#each COMMON_COUNTRIES as country}
          <option value={country.code}>
            {country.flag} +{country.code} ({country.name})
          </option>
        {/each}
      </select>
      <i class="bi bi-chevron-down ddi-arrow"></i>
    </div>

    <input
      type="tel"
      id="phone-input-field"
      class="form-control phone-field"
      placeholder={PhoneUtils.getPlaceholderForDdi(ddi)}
      value={displayValue}
      oninput={handleInput}
      onblur={() => (touched = true)}
      autocomplete="tel-national"
    />
  </div>

  {#if validationError}
    <p class="invalid-feedback">{validationError}</p>
  {/if}
</div>

<style>
  .phone-input-wrapper {
    margin-bottom: 16px;
  }

  .input-group {
    display: flex;
    align-items: stretch;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background-color: var(--surface);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
  }

  .input-group:focus-within {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .input-group.has-error {
    border-color: var(--error);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
  }

  .ddi-select-wrapper {
    position: relative;
    border-right: 1.5px solid var(--border);
    background-color: var(--background);
    flex-shrink: 0;
    max-width: 140px;
  }

  .ddi-select {
    width: 100%;
    height: 100%;
    appearance: none;
    background: transparent;
    border: none;
    padding: 10px 28px 10px 12px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    outline: none;
  }

  .ddi-arrow {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .phone-field {
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    flex: 1;
    min-width: 0;
  }
</style>
