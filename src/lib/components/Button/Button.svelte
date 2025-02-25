<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SvelteHTMLElements } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'icon' | 'danger' | 'foreground';

	interface MyProps {
		variant?: Variant | Variant[];
	}

	type Props = MyProps &
		(({ href: string } & SvelteHTMLElements['a']) | SvelteHTMLElements['button']);

	const { class: className, variant = 'secondary', children, ...restProps }: Props = $props();

	const baseClasses =
		'rounded transition-colors flex flex-row gap-2 w-fit items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-medium font-sans font-medium';

	const variantClasses = new Map<Variant, string>([
		['primary', 'bg-primary text-foreground'],
		['secondary', 'bg-card hover:bg-card-foreground focus:bg-card-light text-foreground border'],
		['icon', 'hover:bg-secondary/50 focus:bg-secondary/50 text-foreground size-7 p-1']
	]);

	const finalClasses = cn(
		baseClasses,
		Array.isArray(variant)
			? variant.map((v) => variantClasses.get(v)).join(' ')
			: variantClasses.get(variant),
		className
	);

	let tagName = 'href' in restProps ? 'a' : 'button';
</script>

<svelte:element this={tagName} class={finalClasses} {...restProps}>
	{@render children?.()}
</svelte:element>
