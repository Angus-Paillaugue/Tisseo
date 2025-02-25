<script lang="ts">
	interface Props {
		amount?: number;
	}

	let { amount = 100 }: Props = $props();
</script>

{#each Array(amount) as _}
	<div class="bg-card h-16 w-full shrink-0 animate-pulse rounded-sm"></div>
{/each}
