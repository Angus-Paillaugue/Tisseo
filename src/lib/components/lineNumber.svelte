<script lang="ts">
	import type { Line } from '$lib/types';

	interface Props {
		line: Line;
	}

	const { line }: Props = $props();
</script>

<div
	class="rounded-sm px-2 py-0.5 font-mono text-base font-extrabold"
	style="color: {line.fgXmlColor}; background-color: {line.bgXmlColor};"
>
	{line.shortName}
</div>
