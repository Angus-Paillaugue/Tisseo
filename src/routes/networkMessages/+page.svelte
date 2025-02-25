<script lang="ts">
	import type { TisseoNetworkMessage, TisseoNetworkMessagesResponse } from '$lib/types';
	import { onMount } from 'svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { Modal, Update, Loader } from '$lib/components';
	import { cn } from '$lib/utils';

	const POLLING_INTERVAL = 60 * 1000; // 60 seconds

	let updatedAt = $state<Date>(new Date());
	let now = new SvelteDate();
	let isLoading = $state(true);
	let networkMessages = $state<TisseoNetworkMessagesResponse>([]);
	let networkMessageModal = $state<{ message: TisseoNetworkMessage | null; open: boolean }>({
		open: false,
		message: null
	});

	async function fetchData() {
		const res = await fetch('/api/networkMessages');
		updatedAt = new Date();
		if (!res.ok) {
			throw new Error('Network response was not ok');
		}
		const data: TisseoNetworkMessagesResponse = await res.json();
		networkMessages = data;
		isLoading = false;
	}

	onMount(() => {
		// Fetch network messages
		fetchData();

		const interval = setInterval(fetchData, POLLING_INTERVAL);
		return () => clearInterval(interval);
	});

	// Update `now` time every second
	$effect(() => {
		const interval = setInterval(() => {
			now.setTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<Modal bind:open={networkMessageModal.open}>
	<Modal.Heading>{networkMessageModal.message?.message.title}</Modal.Heading>
	<div class="prose prose-neutral prose-invert prose-sm">
		{@html networkMessageModal.message?.message.content}
	</div>
</Modal>

<Update {updatedAt} {fetchData} />

<!-- Network messages -->
<div
	class={cn(
		'no-scrollbar flex grow flex-col gap-2 px-2',
		isLoading ? 'overflow-hidden' : 'overflow-y-auto'
	)}
>
	{#if isLoading}
		<Loader />
	{:else if networkMessages}
		{#each networkMessages as message}
			<button
				onclick={() => (networkMessageModal = { open: true, message })}
				class="bg-card relative flex w-[100%] shrink-0 flex-col gap-1 rounded-sm border p-2 text-start"
			>
				<!-- Importance level pill -->
				<span
					class={cn(
						'absolute top-1 right-1 rounded px-1.5 py-0.5 text-sm font-medium',
						message.message.importanceLevel === 'important'
							? 'bg-danger'
							: 'bg-card-foreground border'
					)}>{message.message.importanceLevel}</span
				>
				<!-- Message title -->
				<div class="w-5/6">
					<span class="text-lg font-medium">{message.message.title}</span>
				</div>
			</button>
		{/each}
	{/if}
</div>
