<script lang="ts">
	import { enhance } from "$app/forms";
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<h2>Sign in</h2>
<a href="/login/google">Sign in with Google</a>

<h2>Sign out</h2>
<form method="post" use:enhance>
    <button>Sign out</button>
</form>
