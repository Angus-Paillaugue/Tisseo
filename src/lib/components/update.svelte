<script lang="ts">
	import { Button } from '$lib/components';
	import { Check, RefreshCcw } from 'lucide-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { scale } from 'svelte/transition';

	interface Props {
		updatedAt: Date;
		fetchData: () => void;
	}

	let { updatedAt, fetchData }: Props = $props();

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
		Last update:
		{#if deltaSinceUpdate() < 5}
			<span class="font-sans">Just now</span>
		{:else}
			<span class="font-mono">{Math.floor(deltaSinceUpdate())}</span>s ago
		{/if}
	</p>
	<Button variant="primary" class="shrink-0" onclick={fetchData}>
		{#if deltaSinceUpdate() < 2}
			<span class="size-5" in:scale>
				<Check class="size-full" />
			</span>
		{:else}
			<span class="size-5" in:scale>
				<RefreshCcw class="size-full" />
			</span>
		{/if}
		Refresh
	</Button>
</div>
