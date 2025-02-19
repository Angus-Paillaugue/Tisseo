<script lang="ts">
	import { Modal } from "$lib/components";
	import Button from "$lib/components/Button/Button.svelte";
	import { getConfig } from "$lib/config";
	import type { Line, Stop } from "$lib/types";
	import { X } from "lucide-svelte";
	import { onMount } from "svelte";

  interface MyProps {
    open: boolean;
  }

  let { open = $bindable(false) }: MyProps = $props();
  let stops = $state<{ stop: Stop; line: Line }[]>([]);
  const config = $state<ReturnType<typeof getConfig>>(getConfig());

  async function getStopsInfos() {
    const res = await fetch("/api/getStopsInfos", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ stops: config.trackedStops }),
    });
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data: { stop: Stop; line: Line }[] = await res.json();
    stops = data;
  }

  async function untrackStop(stopId: Stop['id'], lineId: Line['id']) {
    console.log(stopId, lineId);
  }

  onMount(() => {
    getStopsInfos();
  });
</script>

<Modal bind:open>
  <Modal.Heading>Manage stops</Modal.Heading>

  <p>Your stops :</p>
  <div class="flex flex-row flex-wrap gap-1">
    {#each stops as stop}
      <div class="inline-flex justify-between items-center gap-1 px-2 py-1 font-medium bg-background rounded">
        <div>{stop.stop.name} ({stop.line.shortName})</div>
        <button onclick={() => untrackStop(stop.stop.id, stop.line.id)}>
          <X class="size-4" />
        </button>
      </div>
    {/each}
  </div>
</Modal>
