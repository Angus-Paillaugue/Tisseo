<script lang="ts">
	import type { Departures, Line, Stop } from '$lib/types';
	import { onMount } from 'svelte';
	import { LineNumber, Update, Loader, Button } from '$lib/components';
	import { ChevronRight } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import { SvelteDate } from 'svelte/reactivity';
	import { cn } from '$lib/utils';
	import { getConfig } from '$lib/config';

	let nextDepartures = $state<Departures>();
	let updatedAt = $state<Date>(new Date());
	let timeDisplayMode = $state<'delay' | 'time'>('delay');
	let now = new SvelteDate();
	let isLoading = $state(true);
	let config = $state<Awaited<ReturnType<typeof getConfig>>>();
	let error = $state<{
		status: boolean;
		retryIn?: number;
		retryFunc?: Function;
		message?: string;
		interval?: ReturnType<typeof setInterval>;
	}>({ status: false, retryIn: -1 });

	const getWalkTime = (lineId: Line['id'], stopId: Stop['id']) => {
		if (!config) return 0;
		const line = config.toTrack.find(
			(line) => line.stopId === stopId && (!line.lineId || line.lineId === lineId)
		);
		return line?.walkTime ?? 0;
	};

	async function fetchData() {
		setError({ status: false });
		const res = await fetch('/api/nextDepartures');
		updatedAt = new Date();
		if (!res.ok) {
			setError({
				status: true,
				retryIn: 30,
				// message: res.statusText,
				retryFunc: fetchData
			});
			isLoading = false;
		}
		const data: Departures = await res.json();
		// Parses dates
		data.departures.forEach((departure) => {
			departure.dateTime = new Date(departure.dateTime);
			departure.walkTime = getWalkTime(departure.line.id, departure.stop.id);
		});
		data.expirationDate = new Date(data.expirationDate);

		nextDepartures = data;
		isLoading = false;
	}

	onMount(() => {
		let interval: ReturnType<typeof setInterval> | undefined;
		// Fetch config
		getConfig().then((result) => {
			config = result;

			// Set time display mode
			if (timeDisplayMode in localStorage) {
				timeDisplayMode = localStorage.getItem('timeDisplayMode') as 'time' | 'delay';
			}

			fetchData();

			interval = setInterval(fetchData, config.pollInterval * 1000);
		});

		return () => {
			if (interval) clearInterval(interval);
		};
	});

	/**
	 * Formats a Date object into> a localized time string in French format (HH:mm:ss)
	 * @param {Date} time - The Date object to format
	 * @returns {string} The formatted time string in 24-hour format with hours, minutes and seconds
	 */
	const formatTime = (time: Date) => {
		return time.toLocaleTimeString('fr-FR', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	};

	/**
	 * Toggles between 'delay' and 'time' display modes and persists the choice in localStorage.
	 * When in 'delay' mode, shows time remaining until departure.
	 * When in 'time' mode, shows actual departure time.
	 * The selected mode is saved in localStorage under 'timeDisplayMode' key.
	 */
	const toggleTimeDisplayMode = () => {
		timeDisplayMode = timeDisplayMode === 'delay' ? 'time' : 'delay';
		localStorage.setItem('timeDisplayMode', timeDisplayMode);
	};

	/**
	 * Formats a time delta into a human-readable string representation in minutes
	 * @param {number} delta - The time delta in minutes
	 * @returns {string} A formatted string showing minutes, with special case for values less than 1 minute
	 * @example
	 * formatDelta(0.5) // returns '<1 min'
	 * formatDelta(5.7) // returns '6 min'
	 */
	const formatDelta = (delta: number) => {
		// Less than 1 minute
		if (delta < 1) {
			return '<1 min';
		}
		return Math.round(delta) + ' min';
	};

	const setError = (config: typeof error) => {
		error = config;
		if (!error?.retryIn) return;
		// Clear ol intervals
		if (error.interval) {
			clearInterval(error.interval);
		}
		console.log('test');
		// Set new one to decrement counter every second
		error.interval = setInterval(() => {
			// If timer has reached 0, call the retry function and clear the interval
			if (error?.retryIn && error.retryIn <= 0) {
				error?.retryFunc?.();
				clearInterval(error.interval);
				return;
			}
			// Else, decrement the seconds counter
			if (error.retryIn) error.retryIn -= 1;
		}, 1000);
	};
</script>

<!-- If the server throws an error, show this no internet popup -->
<!-- We need to do better handling in the future to check the cause of the error and have more precise messages then "no internet" -->
{#if error.status}
	<div
		class="bg-background/50 fixed inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-xs"
	>
		<div class="bg-card flex w-full max-w-md flex-col gap-2 rounded border p-4">
			<h1 class="text-lg font-medium">No internet access</h1>
			<p>It looks like you don't have any internet access.</p>
			<p>{error.message}</p>
			{#if error.retryIn}
				<p>
					We will try to re-send the request in <b>{error.retryIn}</b> second{error.retryIn > 1
						? 's'
						: ''}
				</p>
			{/if}
			{#if error.retryFunc}
				<Button onclick={() => error?.retryFunc?.()}>Retry now</Button>
			{/if}
		</div>
	</div>
{/if}

<Update {updatedAt} {fetchData} />

<!-- Departures -->
<div
	class={cn(
		'no-scrollbar flex grow flex-col gap-2 px-2',
		isLoading ? 'overflow-hidden' : 'overflow-y-auto'
	)}
>
	{#if isLoading}
		<Loader />
	{:else if nextDepartures}
		{#each nextDepartures.departures as departure}
			{@const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)}
			{@const isTomorrow =
				tomorrow.getDate() === departure.dateTime.getDate() &&
				tomorrow.getMonth() === departure.dateTime.getMonth() &&
				tomorrow.getFullYear() === departure.dateTime.getFullYear()}
			{@const departureInNbMinutes = (departure.dateTime.getTime() - now.getTime()) / 1000 / 60}
			{@const shouldLeaveNow = departureInNbMinutes < (departure?.walkTime ?? 0)}
			<div
				class={cn(
					'bg-card relative flex h-18 shrink-0 items-center justify-between overflow-hidden rounded-sm border px-2 text-start transition-all',
					shouldLeaveNow && 'ring-primary ring-2 ring-inset'
				)}
			>
				<div class="flex flex-col gap-1">
					<div class="flex flex-row items-center gap-2">
						<LineNumber line={departure.line} />
						<!-- Colored line number -->
						<span class="text-lg leading-5 font-medium">{departure?.stop?.name}</span>
						<!-- Departure stop name -->
					</div>
					<div class="text-muted flex flex-row items-center">
						<ChevronRight class="size-4" />
						<span class="line-clamp-1 text-sm font-light">{departure.destination}</span>
						<!-- Destination -->
					</div>
				</div>

				<!-- Time until departure / Time of departure -->
				<button onclick={toggleTimeDisplayMode} class="flex flex-col">
					{#if isTomorrow}
						<span class="forn-sans text-sm">Tomorrow</span>
					{/if}
					<time class="font-mono text-2xl" datetime={departure.dateTime.toISOString()}>
						{#if timeDisplayMode === 'delay'}
							<span in:scale>
								{formatDelta(departureInNbMinutes)}
							</span>
						{:else}
							<span in:scale>
								{formatTime(departure.dateTime)}
							</span>
						{/if}
					</time>
				</button>
			</div>
		{:else}
			<p class="text-center text-muted">No departures found</p>
		{/each}
	{/if}
</div>
