<script lang="ts">
  import type { Line } from "$lib/types";

  interface Props {
    line: Line;
  }

  const { line }: Props = $props();
</script>

<div class="py-0.5 px-2 rounded text-white font-bold text-base" style:background-color={line.color}>{line.label}</div>
