<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SvelteHTMLElements } from 'svelte/elements';

	type Props = ({ href: string } & SvelteHTMLElements['a']) | SvelteHTMLElements['div'];

	const { children, class: className, ...restProps }: Props = $props();

	let tagName = 'href' in restProps ? 'a' : 'div';
</script>

<svelte:element
	this={tagName}
	class={cn('bg-card flex flex-col rounded-lg p-4', className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
