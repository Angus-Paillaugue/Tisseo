<script lang="ts">
	import type { Line } from '$lib/types';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props {
		line: Line;
	}

	const { line, class: className, ...restProps }: Props & SvelteHTMLElements['div'] = $props();
</script>

<div
	class={cn('rounded-sm px-2 py-0.5 font-mono text-base font-extrabold', className)}
	style="color: {line.fgXmlColor}; background-color: {line.bgXmlColor};"
	{...restProps}
>
	{line.shortName}
</div>
