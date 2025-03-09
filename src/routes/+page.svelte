<script lang="ts">
	import { enhance } from "$app/forms";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<h1>Hi, {data.user.username}!</h1>

<h2>Sign out</h2>
<form method="post" use:enhance>
    <button class="cursor-pointer">Sign out</button>
</form>
