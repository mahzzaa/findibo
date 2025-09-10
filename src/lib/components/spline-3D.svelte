<script>
	import { onMount } from 'svelte';

	let isLoading = true;

	onMount(() => {
		const script = document.createElement('script');
		script.type = 'module';
		script.src = 'https://unpkg.com/@splinetool/viewer@1.10.12/build/spline-viewer.js';
		script.onload = () => {
			console.log('Spline Viewer script loaded successfully');
			isLoading = false;
		};
		script.onerror = (error) => {
			console.error('Error loading Spline Viewer script:', error);
		};
		document.head.appendChild(script);
	});
</script>

{#if isLoading}
	<div class="flex h-screen w-full items-center justify-center text-xl text-gray-500">
		Loading...
	</div>
{/if}

<spline-viewer
	url="https://prod.spline.design/fm1c2d3WDUAWwbd8/scene.splinecode"
	class="h-screen w-full fixed top-0 left-0 z-0 pointer-events-auto"
	style="display: {isLoading ? 'none' : 'block'}; pointer-events: auto;"
></spline-viewer>

<style>
	@import 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap';

	:root {
		--font-family: 'Inter', sans-serif;
	}

	html,
	body {
		margin: 0;
		padding: 0;
		font-family: var(--font-family);
	}

	spline-viewer {
		display: block;
	}
</style>
