<script lang="ts">
	import '../app.css';
	import Nav from './nav.svelte';

	let { children } = $props();
</script>

<main class="mx-auto flex h-svh w-full max-w-xl flex-col gap-2 py-2">
	{@render children()}

	<Nav />
</main>
