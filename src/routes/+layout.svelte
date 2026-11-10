<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import favicon from '#lib/assets/favicon.svg';
	import { themeManager } from '#lib/services/theme.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => {
		themeManager.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Chaveiro Ocian</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
</svelte:head>

{@render children()}
