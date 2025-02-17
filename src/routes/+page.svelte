<script lang="ts">
	import { type Departure } from "$lib/types";
	import { onMount } from "svelte";
	import LineNumber from "./lineNumber.svelte";
	import { ChevronRight } from "lucide-svelte";
	import { scale } from "svelte/transition";

  let nextDepartures = $state<Departure[]>([]);
  let refreshedAt = $state<Date | null>(null);
  let timeDisplayMode = $state<'time' | 'delay'>("delay");

  const timeDelay = 1000 * 60 * 3; // 3 minutes

  async function fetchData() {
    const res = await fetch("/api/nextDepartures");
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    // Parses dates
    data.departures.forEach((departure: Departure) => {
      departure.date = new Date(departure.date);
    });
    refreshedAt = new Date(data.refreshedAt);
    nextDepartures = data.departures;
  }

  onMount(() => {
    fetchData();
    if (timeDisplayMode in localStorage) {
      timeDisplayMode = localStorage.getItem("timeDisplayMode") as 'time' | 'delay';
    }
  });

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const toggleTimeDisplayMode = () => {
    timeDisplayMode = timeDisplayMode === "delay" ? "time" : "delay";
    localStorage.setItem("timeDisplayMode", timeDisplayMode);
  };
</script>

<div class="max-w-xl mx-auto w-full space-y-2">
  <div class="flex flex-row justify-between">
    <h1 class="text-2xl font-bold">Next Bus Departures</h1>
    {#if refreshedAt}
      {formatTime(refreshedAt)}
    {/if}
  </div>

  <div class="flex flex-col gap-2">
    {#each nextDepartures as departure}
      {@const now = new Date()}
      {@const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)}
      {@const isTomorrow = tomorrow.getDate() === departure.date.getDate() && tomorrow.getMonth() === departure.date.getMonth() && tomorrow.getFullYear() === departure.date.getFullYear()}
      {@const inNbMinutes = (departure.date.getTime() - now.getTime()) / 1000 / 60}
      {@const shouldLeaveNow = departure.date.getTime() - now.getTime() < timeDelay}
      <button onclick={toggleTimeDisplayMode} class="flex justify-between text-start items-center p-1 rounded bg-neutral-100">
        <div class="flex flex-row gap-2 items-center">
          <LineNumber line={departure.line} />
          <div class="flex flex-col">
            <!-- Stop name -->
            <span class="font-medium text-lg leading-5">{departure?.stop?.label}</span>
            <!-- Direction -->
            <div class="flex flex-row items-center text-neutral-600">
              <ChevronRight class="size-4 text-neutral-500" />
              <span class="text-xs font-light">{departure.line.direction}</span>
            </div>
          </div>
        </div>
        <time class="text-base tex-neutral-700 font-mono {shouldLeaveNow && 'text-red-500'}" datetime={departure.date.toISOString()}>
          {isTomorrow ? 'Tmw ' : ''}
          {#if timeDisplayMode === 'delay'}
            <span in:scale>
              {inNbMinutes.toFixed(0) + ' min'}
            </span>
          {:else}
            <span in:scale>
              {formatTime(departure.date)}
            </span>
          {/if}
        </time>
      </button>
    {/each}
  </div>
</div>
