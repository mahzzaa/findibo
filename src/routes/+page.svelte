<script>
	import GeminiChat from '$lib/components/gemini-chat.svelte';
	import BookResults from '$lib/components/book-results.svelte';
	import Spline_3D from '$lib/components/spline-3D.svelte';

	let book = '';
	let description = '';
	let author = '';
	let genre = '';
	let rating = '';
	let ageRange = '';
	let reason = '';
	let isbn = '';
</script>

<Spline_3D />

<!-- Header Section - Top Center -->
<div class="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
	<div class="text-center">
		<h1 class="mb-2 text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
			✨ FINDIBO ✨
		</h1>
		<p class="text-sm text-gray-300 opacity-90">AI-Powered Global Book Discovery</p>
		<div class="w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-3 opacity-60"></div>
	</div>
</div>

<!-- Form Section - Left Side -->
<div class="absolute top-0 left-0 z-10 w-1/2 h-screen pointer-events-none">
	<GeminiChat bind:book bind:description bind:author bind:genre bind:rating bind:ageRange bind:reason bind:isbn />
</div>

<!-- Results Section - Right Side -->
<div class="absolute top-0 right-0 z-10 w-1/2 h-screen pointer-events-none">
	<BookResults {book} {description} {author} {genre} {rating} {ageRange} {reason} {isbn} />
</div>
