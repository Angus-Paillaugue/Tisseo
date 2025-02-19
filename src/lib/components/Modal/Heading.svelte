<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SvelteHTMLElements } from 'svelte/elements';

	const { children, class: className }: SvelteHTMLElements['h2'] = $props();
</script>

<h2 class={cn('mb-2 border-b pb-1 text-2xl font-bold', className)}>
	{@render children?.()}
</h2>
