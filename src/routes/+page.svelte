<script lang="ts">
	import type { Departures, Line, Stop } from '$lib/types';
	import { onMount } from 'svelte';
	import { LineNumber, Update, Loader, Button } from '$lib/components';
	import { ChevronRight } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import { SvelteDate } from 'svelte/reactivity';
	import { cn, tzOffetter } from '$lib/utils';
	import { getConfig } from '$lib/config';
	import { Logger } from '$lib/logger';

	let nextDepartures = $state<Departures>();
	let updatedAt = $state<Date>(new Date());
	let timeDisplayMode = $state<'delay' | 'time'>('delay');
	let now = new SvelteDate();
	let isLoading = $state(true);
	let onMountLoading = $state(true);
	let config = $state<Awaited<ReturnType<typeof getConfig>>>();
	let toExclude: string[] = $state([]);
	let linesToTrack = $state<(Line & { excluded: boolean })[]>([]);
	let fetchAbortController = new AbortController();
	let error = $state<{
		status: boolean;
		retryIn?: number;
		retryFunc?: Function;
		message?: string;
		interval?: ReturnType<typeof setInterval>;
	}>({ status: false, retryIn: -1 });

	/**
	 * Calculates the walk time for a given line and stop.
	 *
	 * @param {Line['id']} lineId - The ID of the line.
	 * @param {Stop['id']} stopId - The ID of the stop.
	 * @returns {number} - The walk time in minutes. Returns -1 if no configuration is found or no walk time is specified.
	 */
	const getWalkTime = (lineId: Line['id'], stopId: Stop['id']) => {
		if (!config) return -1;
		const line = config.toTrack.find(
			(line) => line.stopId === stopId && (!line.lineId || line.lineId === lineId)
		);
		if (!line?.walkTime) Logger.info(`No walk time found for line ${lineId} and stop ${stopId}`);
		return line?.walkTime ?? -1;
	};

	async function getLinesInfo() {
		if (!config) return;
		const res = await fetch('/api/getLinesInfos');
		if (!res.ok) {
			Logger.error('Failed to fetch lines info');
			return;
		}
		const data: Line[] = await res.json();
		// Add excluded property to each line
		linesToTrack = data.map((line) => {
			return {
				...line,
				excluded: false
			};
		});
	}

	async function fetchData() {
		isLoading = true;
		// Abort previous request if exists
		if (fetchAbortController) {
			fetchAbortController.abort();
		}

		// Create new controller for this request
		fetchAbortController = new AbortController();
		setError({ status: false });
		const res = await fetch('/api/nextDepartures?toExclude=' + toExclude.join(','), {
			signal: fetchAbortController.signal
		});
		fetchAbortController = new AbortController();
		updatedAt = new Date();
		if (!res.ok) {
			Logger.error(`Failed to fetch next departures: ${res.statusText}`);
			setError({
				status: true,
				retryIn: 30,
				// message: res.statusText,
				retryFunc: fetchData
			});
			isLoading = false;
			return;
		}
		const data: Departures = await res.json();
		// Parses dates
		data.departures.forEach((departure) => {
			departure.dateTime = tzOffetter.fromUTCToLocale(departure.dateTime);
			departure.walkTime = getWalkTime(departure.line.id, departure.stop.id);
		});
		data.expirationDate = tzOffetter.fromUTCToLocale(data.expirationDate);

		// Concatenate array and filter duplicates because of filtering
		nextDepartures = data;
		isLoading = false;
	}

	onMount(() => {
		let interval: ReturnType<typeof setInterval> | undefined;
		// Fetch config
		getConfig().then(async (result) => {
			config = result;

			// Set time display mode
			if (timeDisplayMode in localStorage) {
				timeDisplayMode = localStorage.getItem('timeDisplayMode') as 'time' | 'delay';
			}

			getLinesInfo();
			await fetchData();
			onMountLoading = false;

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

	/**
	 * Sets an error configuration and manages a retry countdown timer.
	 *
	 * @param {typeof error} config - The error configuration object
	 *
	 * This function:
	 * 1. Updates the error state with the provided configuration
	 * 2. If the error includes a retry timer (retryIn):
	 *    - Clears any existing interval
	 *    - Sets up a new interval that:
	 *      - Decrements the retry counter every second
	 *      - Executes the retry function when the counter reaches zero
	 *      - Cleans up the interval after execution
	 *
	 * The error object should contain:
	 * - retryIn: Number of seconds until retry
	 * - retryFunc: Function to call when retry timer expires
	 * - interval: Reference to the timer interval (managed by this function)
	 */
	const setError = (config: typeof error) => {
		error = config;
		if (!error?.retryIn) return;
		// Clear ol intervals
		if (error.interval) {
			clearInterval(error.interval);
		}
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

	/**
	 * Toggles the 'excluded' status of a given line in the linesToTrack array.
	 * If the line is excluded, it adds the line's id to the toExclude array.
	 * If the line is not excluded, it removes the line's id from the toExclude array.
	 * Finally, it calls the fetchData function to update the data.
	 *
	 * @param {Line} line - The line object to toggle the 'excluded' status for.
	 */
	const toggleExcluded = (line: Line) => {
		const index = linesToTrack.findIndex((l) => l.id === line.id);
		if (index === -1) return;
		linesToTrack[index].excluded = !linesToTrack[index].excluded;
		if (linesToTrack[index].excluded) {
			toExclude.push(line.id);
		} else {
			toExclude = toExclude.filter((id) => id !== line.id);
		}
		fetchData();
	};

	/**
	 * Calculates the sum of an array of numbers, treating `undefined` values as 0.
	 *
	 * @param {Array<number | undefined>} arr - The array of numbers or undefined values.
	 * @returns {number} The sum of the array elements, with `undefined` values treated as 0.
	 */
	const arraySum = (arr: (number | undefined)[]) =>
		arr.reduce((acc, val) => (acc ?? 0) + (val ?? 0), 0);
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

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

<Update {updatedAt} {isLoading} {fetchData} />

<!-- Lines filtering -->
<div class="flex shrink-0 flex-row flex-nowrap gap-2 overflow-x-auto px-2 pt-2 pb-1">
	{#if onMountLoading}
		{#each Array(config?.toTrack?.length ?? 5) as _}
			<div class="bg-card h-[38px] w-[52px] shrink-0 animate-pulse rounded-sm"></div>
		{/each}
	{:else if linesToTrack}
		{#each linesToTrack as line}
			<button
				onclick={() => toggleExcluded(line)}
				class={cn('rounded-sm', line.excluded && 'ring-2 ring-red-600')}
			>
				<LineNumber {line} />
			</button>
		{/each}
	{/if}
</div>

<!-- Departures -->
<div
	class={cn(
		'no-scrollbar flex grow flex-col gap-2 px-2 pt-1',
		isLoading ? 'overflow-hidden' : 'overflow-y-auto'
	)}
>
	{#if onMountLoading}
		<Loader
			amount={config?.toTrack ? arraySum(config.toTrack.map((l) => l.numberOfResults)) : 100}
		/>
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
