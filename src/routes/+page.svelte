<script lang="ts">
	import { type Departure } from "$lib/types";
	import { onMount } from "svelte";
	import LineNumber from "./lineNumber.svelte";
	import { ChevronRight } from "lucide-svelte";
	import { scale } from "svelte/transition";
	import { flip } from "svelte/animate";

  const POLLING_INTERVAL = 30 * 1000; // 30 seconds

  let nextDepartures = $state<Departure[]>([]);
  let refreshedAt = $state<Date | null>(null);
  let timeDisplayMode = $state<'time' | 'delay'>("delay");

  async function fetchData() {
    console.log("Polling for next departures");
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

  $inspect(nextDepartures)

  onMount(() => {
    fetchData();
    if (timeDisplayMode in localStorage) {
      timeDisplayMode = localStorage.getItem("timeDisplayMode") as 'time' | 'delay';
    }

    const interval = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(interval);
  });

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const toggleTimeDisplayMode = () => {
    timeDisplayMode = timeDisplayMode === "delay" ? "time" : "delay";
    localStorage.setItem("timeDisplayMode", timeDisplayMode);
  };

  const getDateFromId = (id: string) => {
    return new Date(Number(id.split("-").pop() as string));
  };

  $effect(() => {
    const busesToTrack = localStorage.getItem("trackedBuses");
    if (!busesToTrack) return;
    if(!nextDepartures || nextDepartures.length === 0) return;
    const buses = busesToTrack.split(",");
    buses.forEach((bus) => {
      const date = getDateFromId(bus);
      if(nextDepartures.find((departure) => departure.date.getTime() === date.getTime())) {
        nextDepartures = nextDepartures.map((departure) => {
          if (departure.date.getTime() === date.getTime()) {
            return { ...departure, tracked: true };
          }
          return departure;
        });
      } else {
        console.log("Departure not found, removing it from tracked buses");
        localStorage.setItem("trackedBuses", buses.filter((b) => b !== bus).join(","));
      }
    });
  })

  const toggleTracking = (e: MouseEvent) => {
    const id = (e.target as HTMLElement).dataset.id;
    if(!id) return;
    const date = getDateFromId(id);
    console.log("Toggling tracking for departure", date);
    const busesToTrack = localStorage.getItem("trackedBuses");
    if (!busesToTrack) {
      localStorage.setItem("trackedBuses", id);
    } else {
      const buses = busesToTrack.split(",");
      if (buses.includes(id)) {
        localStorage.setItem("trackedBuses", buses.filter((bus) => bus !== id).join(","));
      } else {
        localStorage.setItem("trackedBuses", buses.concat(id).join(","));
      }
    }
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
    {#each nextDepartures as departure (departure.id)}
      {@const now = new Date()}
      {@const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)}
      {@const isTomorrow = tomorrow.getDate() === departure.date.getDate() && tomorrow.getMonth() === departure.date.getMonth() && tomorrow.getFullYear() === departure.date.getFullYear()}
      {@const departureInNbMinutes = (departure.date.getTime() - now.getTime()) / 1000 / 60}
      {@const shouldLeaveNow = departureInNbMinutes < (departure?.walkTime ?? 0)}  <!-- If the bus is leaving in less than the walk time, display it in a different color -->
      <button onclick={toggleTimeDisplayMode} class="flex justify-between text-start items-center p-1 rounded {departure?.tracked ? 'bg-red-100' : 'bg-neutral-100'}" animate:flip={{ duration: 300 }} ondblclick={toggleTracking} data-id={departure.id}>
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
        <time class="text-base tex-neutral-700 font-mono {shouldLeaveNow && 'text-amber-600'}" datetime={departure.date.toISOString()}>
          {isTomorrow ? 'Tmw ' : ''}
          {#if timeDisplayMode === 'delay'}
            <span in:scale>
              {departureInNbMinutes.toFixed(0) + ' min'}
            </span>
          {:else}
            <span in:scale>
              {formatTime(departure.date)}
            </span>
          {/if}
        </time>
      </button>
    {:else}
      <p class="text-center text-neutral-500">No departures found</p>
    {/each}
  </div>
</div>
