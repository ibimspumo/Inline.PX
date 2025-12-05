<script lang="ts">
	import EditorLayout from '$lib/components/templates/EditorLayout.svelte';
	import WelcomeScreen from '$lib/components/organisms/WelcomeScreen.svelte';
	import { projectStore } from '$lib/stores/projectStore.svelte';
</script>

{#if projectStore.isProjectLoaded}
	<EditorLayout />
{:else}
	<WelcomeScreen />
{/if}
