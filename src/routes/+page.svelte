<script lang="ts">
	import type{ Departures, Departure, Line, Stop, LineConfig } from "$lib/types";
	import { onMount } from "svelte";
	import LineNumber from "./lineNumber.svelte";
	import { ChevronRight } from "lucide-svelte";
	import { scale } from "svelte/transition";
	import { flip } from "svelte/animate";
  import { SvelteDate } from 'svelte/reactivity';
	import { Button } from "$lib/components";
	import { cn } from "$lib/utils";
	import trackedStops from '@config/lines.json';
	// import ManageStops from "./manageStops.svelte";

  const POLLING_INTERVAL = 60 * 1000; // 60 seconds

  let nextDepartures = $state<Departures>();
  let updatedAt = $state<Date>(new Date());
  let timeDisplayMode = $state<'delay' | 'time'>("delay");
  let now = new SvelteDate();
  let isLoading = $state(false);
  let manageStopsOpen = $state(false);

  const getWalkTime = (lineId: Line["id"], stopId: Stop['id']) => {
    const line = trackedStops?.find((line) => line.lineId === lineId && line.stopId === stopId);
    return line?.walkTime ?? 0;
  };

  async function fetchData() {
    isLoading = true
    const res = await fetch("/api/nextDepartures");
    updatedAt = new Date();
    if (!res.ok) {
      isLoading = false;
      throw new Error("Network response was not ok");
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
    checkTracking();
  }

  onMount(() => {
    // Fetch departures
    fetchData().then(() => {
      checkTracking();
    });

    // Set time display mode
    if (timeDisplayMode in localStorage) {
      timeDisplayMode = localStorage.getItem("timeDisplayMode") as 'time' | 'delay';
    }

    const interval = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(interval);
  });

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const toggleTimeDisplayMode = () => {
    timeDisplayMode = timeDisplayMode === "delay" ? "time" : "delay";
    localStorage.setItem("timeDisplayMode", timeDisplayMode);
  };

  const getDateFromId = (id: string) => {
    return new Date(Number(id.split("-").pop() as string));
  };

  function checkTracking() {
    const busesToTrack = localStorage.getItem("trackedBuses");
    if (!busesToTrack) return;
    if(!nextDepartures || !nextDepartures.departures || nextDepartures.departures.length === 0) return;
    const buses = busesToTrack.split(",");
    buses.forEach((bus) => {
      const date = getDateFromId(bus);
      if(!nextDepartures) return;
      if(nextDepartures.departures.find((departure) => departure.dateTime.getTime() === date.getTime())) {
        nextDepartures.departures = nextDepartures.departures.map((departure) => {
          if (departure.dateTime.getTime() === date.getTime()) {
            return { ...departure, tracked: true };
          }
          return departure;
        });
      } else {
        localStorage.setItem("trackedBuses", buses.filter((b) => b !== bus).join(","));
        nextDepartures.departures = nextDepartures.departures.map((departure) => {
          if (departure.dateTime.getTime() === date.getTime()) {
            return { ...departure, tracked: false };
          }
          return departure;
        });
      }
    });
  }

  const setTracking = (id: Departure['id'], state: boolean) => {
    if(!nextDepartures) return;
    nextDepartures.departures = nextDepartures.departures.map((departure) => {
      if (departure.id === id) {
        return { ...departure, tracked: state };
      }
      return departure;
    });

    localStorage.setItem("trackedBuses", nextDepartures.departures.filter((departure) => departure.tracked).map((departure) => departure.id).join(","));
  }

  const toggleTracking = (e: MouseEvent) => {
    const id = (e.target as HTMLElement).dataset.id;
    if(!id) return;
    const busesToTrack = localStorage.getItem("trackedBuses");
    if (!busesToTrack) {
      localStorage.setItem("trackedBuses", id);
    } else {
      const buses = busesToTrack.split(",");
      setTracking(id, !buses.includes(id));
    }

    checkTracking()
  };

  // Update `now` time every second
  $effect(() => {
		const interval = setInterval(() => {
			now.setTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if(seconds < 5) return 'just now';
    return seconds + 's ago';
  }
</script>

<!-- <ManageStops bind:open={manageStopsOpen} /> -->

<div class="max-w-xl mx-auto w-full">
  <div class="flex flex-roe items-center">
    <Button onclick={() => (manageStopsOpen = true)}>Manage stops</Button>
  </div>
  <div class="flex flex-row justify-between p-1">
    <p>Last update: {formatDuration(now.getTime() - updatedAt.getTime())}</p>
    <Button variant="primary" onclick={fetchData}>Refresh</Button>
  </div>

  <div class="flex flex-col gap-2 overflow-y-auto max-h-[calc(3.5rem*6)] p-1 no-scrollbar">
    {#if isLoading}
      {#each Array(6) as _}
        <div class="h-12 shrink-0 w-full rounded-sm animate-pulse bg-card"></div>
      {/each}
    {:else if nextDepartures}
      {#each nextDepartures.departures as departure (departure.id)}
        {@const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)}
        {@const isTomorrow = tomorrow.getDate() === departure.dateTime.getDate() && tomorrow.getMonth() === departure.dateTime.getMonth() && tomorrow.getFullYear() === departure.dateTime.getFullYear()}
        {@const departureInNbMinutes = (departure.dateTime.getTime() - now.getTime()) / 1000 / 60}
        {@const shouldLeaveNow = departureInNbMinutes < (departure?.walkTime ?? 0)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div onclick={toggleTracking} data-id={departure.id} class={cn("flex transition-all overflow-hidden relative justify-between text-start items-center px-1.5 rounded-sm h-12 shrink-0 bg-card", departure.tracked && 'ring-2 ring-red-600/50')} animate:flip={{ duration: 300 }}>
          {#if departure.tracked && shouldLeaveNow}
            <span class="absolute inset-0 pointer-events-none animate-[ping_1.5s_linear_infinite] bg-red-600/50"></span>

          {/if}
          <div class="flex flex-row gap-2 items-center">
            <LineNumber line={departure.line} />
            <div class="flex flex-col">
              <span class="font-medium text-lg leading-5">{departure?.stop?.name}</span>
              <div class="flex flex-row items-center text-muted">
                <ChevronRight class="size-4 text-muted" />
                <span class="text-xs font-light">{departure.destination}</span>
              </div>
            </div>
          </div>
          <button onclick={toggleTimeDisplayMode}>
            <time class="text-base text-muted font-mono" datetime={departure.dateTime.toISOString()}>
              {isTomorrow ? 'Tmw ' : ''}
              {#if timeDisplayMode === 'delay'}
                <span in:scale>
                  {departureInNbMinutes.toFixed(0) + ' min'}
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
</div>
