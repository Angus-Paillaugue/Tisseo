<script lang="ts">
	import { Button, Input, Modal } from "$lib/components";
  import type { Stop } from "$lib/types";

  let searchResults = $state<Stop[]>([]);
  // let open = $state(true);
  let error = $state("");

  async function search(query: string) {
    const endpoint = "/api/searchPlace?query=" + query;
    const res = await fetch(endpoint);
    const data = await res.json();
    searchResults = data.map((stop: any) => ({
      id: stop.id,
      name: stop.label,
    }));
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const query = formData.get("query") as string;
    if(query.length < 3) {
      error = "Query must be at least 3 characters long";
      return;
    }
    error = "";
    search(query);
  }
</script>

<!-- <Modal bind:open>
  <Modal.Heading>Add a stop</Modal.Heading>

</Modal> -->
<form onsubmit={handleSubmit} class="max-w-lg mx-auto w-full p-2 flex flex-col gap-2">
  <Input
    label="Search for a stop"
    id="query"
    name="query"
    placeholder="Search for a stop" />

  {#if searchResults}
    <div class="flex flex-col gap-1">
      {#each searchResults as result}
        <button class="flex flex-row items-center p-2 rounded bg-card">
          {result.name}
        </button>
      {/each}
    </div>
  {/if}
  {#if error}
    <p>{error}</p>
  {/if}
  <Button type="submit">Search</Button>
</form>
