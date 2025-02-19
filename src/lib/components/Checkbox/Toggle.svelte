<script lang="ts">
	import type { RequiredFields } from '$lib/types';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';

	interface MyProps {
		inverted?: boolean;
	}

	let {
		checked = $bindable(),
		id,
		class: className,
		inverted = false,
		...restProps
	}: RequiredFields<SvelteHTMLElements['input'] & MyProps, 'id'> = $props();
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  })
</script>

{#if mounted}
  <label for={id} class={cn("relative inline-flex shrink-0 w-12 h-6 flex-row", className)}>
    <input type="checkbox" id={id} name={id} class="sr-only peer" bind:checked {...restProps} />
    <div class={cn("rounded-full transition-colors absolute inset-0", checked ? 'bg-primary' : 'bg-card-foreground')}></div>
    <span class={cn("absolute bottom-0.5 top-0.5 bg-white aspect-square rounded-full transition-all left-0.5 peer-checked:translate-x-[calc(100%+0.25rem)]")}></span>
  </label>
{:else}
  <div class={cn("relative inline-flex shrink-0 w-12 h-6 flex-row bg-card-foreground rounded-full animate-pulse", className)}></div>
{/if}
