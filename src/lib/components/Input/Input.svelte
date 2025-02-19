<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SvelteHTMLElements } from 'svelte/elements';

	interface MyProps {
		label?: string;
		id: string;
		debounce?: number;
		onValueChange?: (val: string) => void;
	}

	let {
		class: className,
		debounce = 0,
		value = $bindable(''),
		label,
		id,
		...restProps
	}: SvelteHTMLElements['input'] & MyProps = $props();
	const baseClasses =
		'rounded-sm disabled:cursor-not-allowed disabled:bg-card/50 w-full bg-card focus:outline-hidden outline-hidden focus:ring-2 transition-all ring-primary test-foreground px-3 py-1 text-base font-sans font-normal';

	const finalClasses = cn(baseClasses, className);
</script>

{#snippet input()}
	<input
		class={finalClasses}
		bind:value
		{id}
		name={id}
		{...restProps}
	/>
{/snippet}

{#if label}
	<div class="flex flex-col gap-1">
		<label for={id} class="font-sans text-sm font-medium">{label}</label>
		{@render input()}
	</div>
{:else}
	{@render input()}
{/if}
