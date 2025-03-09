<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

    const dataStr = JSON.stringify(data, null, 2);
</script>

<pre class="whitespace-pre-wrap font-mono">{dataStr}</pre>
