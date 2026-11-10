<script lang="ts">
  import { CurrencyUtils } from '#lib/utils/currency.utils';

  let {
    value = $bindable(0),
    isSubmitted = false,
    label = 'Valor (R$)',
    required = false
  }: {
    value: number;
    isSubmitted?: boolean;
    label?: string;
    required?: boolean;
  } = $props();

  let rawDigits = $state('');
  let displayValue = $state('');
  let touched = $state(false);
  let initialized = false;

  $effect(() => {
    if (!initialized && value !== undefined && value !== null) {
      if (value > 0) {
        rawDigits = CurrencyUtils.doubleToCentsDigits(value);
        displayValue = CurrencyUtils.formatDoubleToCurrency(value);
      } else {
        displayValue = 'R$ 0,00';
        rawDigits = '0';
      }
      initialized = true;
    }
  });

  function handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const clean = input.value.replace(/\D/g, '');
    rawDigits = clean;
    displayValue = CurrencyUtils.formatCentsToCurrency(clean);
    input.value = displayValue;
    value = CurrencyUtils.centsToDouble(clean);
    touched = true;
  }

  function handleBlur() {
    touched = true;
    if (!rawDigits || rawDigits === '0') {
      displayValue = 'R$ 0,00';
      value = 0;
    } else {
      displayValue = CurrencyUtils.formatCentsToCurrency(rawDigits);
    }
  }

  let hasError = $derived(
    required && (touched || isSubmitted) && (!value || value <= 0)
  );
</script>

<div class="currency-wrapper">
  <label for="currency-field" class="form-label">
    <i class="bi bi-cash-stack"></i>
    <span>{label}</span>
    {#if required}
      <span class="required">*</span>
    {/if}
  </label>

  <div class="input-wrapper" class:has-error={hasError}>
    <input
      type="text"
      inputmode="numeric"
      id="currency-field"
      class="form-control currency-field"
      placeholder="R$ 0,00"
      value={displayValue}
      oninput={handleInput}
      onblur={handleBlur}
      autocomplete="off"
    />
  </div>

  {#if hasError}
    <p class="invalid-feedback">O valor deve ser maior que zero</p>
  {/if}
</div>

<style>
  .currency-wrapper {
    margin-bottom: 16px;
  }

  .input-wrapper {
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .currency-field {
    font-size: 1rem;
    font-weight: 600;
  }

  @media (max-width: 600px) {
    .currency-field {
      font-size: 16px;
      min-height: 44px;
    }
  }

  .has-error .currency-field {
    border-color: var(--error);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
  }
</style>
