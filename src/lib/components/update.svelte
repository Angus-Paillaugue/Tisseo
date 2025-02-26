<script lang="ts">
	import { Button } from '$lib/components';
	import { Check, RefreshCcw } from 'lucide-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { scale } from 'svelte/transition';
	import { cn } from '$lib/utils';

	interface Props {
		updatedAt: Date;
		fetchData: () => void;
		isLoading?: boolean;
	}

	let { updatedAt, fetchData, isLoading = false }: Props = $props();

	let now = new SvelteDate();

	// Update `now` time every second
	$effect(() => {
		const interval = setInterval(() => {
			now.setTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});

	const deltaSinceUpdate = () => {
		return (now.getTime() - updatedAt.getTime()) / 1000;
	};
</script>

<div class="flex flex-row justify-between gap-8 pr-2">
	<p class="bg-card grow rounded-r-full border border-l-0 p-1 pl-4 text-start text-base">
		{#if isLoading}
			Loading...
		{:else}
			Last update:
			{#if deltaSinceUpdate() < 5}
				<span class="font-sans">Just now</span>
			{:else}
				<span class="font-mono">{Math.floor(deltaSinceUpdate())}</span>s ago
			{/if}
		{/if}
	</p>
	<Button variant="primary" class="shrink-0" onclick={fetchData}>
		{#if deltaSinceUpdate() < 2 && !isLoading}
			<span class="size-5" in:scale>
				<Check class="size-full" />
			</span>
		{:else}
			<span class={cn('size-5 transition-transform', isLoading && 'animate-spin')} in:scale>
				<RefreshCcw class="size-full" />
			</span>
		{/if}
		Refresh
	</Button>
</div>
