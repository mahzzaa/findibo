<script>
	let userInput = '';
	let responseText = '';
	let loading = false;

	async function askModel() {
		loading = true;
		responseText = '';

		const res = await fetch('/api/gemini', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				prompt: `
You are Findibo, an expert book assistant. When asked for a recommendation, respond with exactly one book. Use this format:
• Book: [title]
• Description: [one-sentence summary of the book]
• Author: [author name]
• Rating: [X.X]/5
• Age Range: [number+]

User: ${userInput}
Assistant:
`
			})
		});

		const data = await res.json();
		responseText = data.result;
		loading = false;
	}
</script>

<div class="relative flex w-full flex-col p-10">
	<h2 class="mb-2 text-lg font-bold text-white">Findibo</h2>

	<textarea
		bind:value={userInput}
		placeholder="Ask a question..."
		class="w-65 rounded border p-2"
		on:keydown={(e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				askModel();
			}
		}}
	></textarea>
	<button
		on:click={askModel}
		class="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
		disabled={loading}
	>
		{loading ? 'Answering...' : 'Send'}
	</button>
	{#if responseText}
		<div
			class="absolute top-20 -right-[1050px] h-4/5 w-96 overflow-y-scroll rounded bg-gray-100 p-3"
		>
			<strong>Response:</strong>
			<p>{responseText}</p>
		</div>
	{/if}
</div>
