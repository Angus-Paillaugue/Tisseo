<script lang="ts">
  import type { Line } from "$lib/types";

  interface Props {
    line: Line;
  }

  const { line }: Props = $props();
</script>

<div class="py-0.5 px-2 rounded-sm font-bold text-base" style="color: {line.fgXmlColor}; background-color: {line.bgXmlColor};">{line.shortName}</div>
