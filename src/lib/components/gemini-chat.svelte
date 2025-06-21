<script>
	let mood = '';
	let lastBook = '';
	let language = '';
	let responseText = '';
	let loading = false;
	let book = '';
	let description = '';
	let author = '';
	let genre = '';
	let rating = '';
	let ageRange = '';
	let reason = ''; // Add a new variable to store the explanation

	async function askModel() {
		loading = true;
		responseText = '';
		book = description = author = genre = rating = ageRange = reason = ''; // Reset reason

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
• Genre: [genre]
• Rating: [X.X]/5
• Age Range: [number+]
• Reason: [short explanation why this book is suggested]

User's Mood: ${mood}
Last Book Enjoyed: ${lastBook}
Preferred Language: ${language}
Assistant:
`
			})
		});

		const data = await res.json();
		const result = data.result;

		// Parse the response into structured fields
		const lines = result.split('\n');
		lines.forEach((line) => {
			if (line.startsWith('• Book:')) book = line.replace('• Book: ', '').trim();
			else if (line.startsWith('• Description:'))
				description = line.replace('• Description: ', '').trim();
			else if (line.startsWith('• Author:')) author = line.replace('• Author: ', '').trim();
			else if (line.startsWith('• Genre:')) genre = line.replace('• Genre: ', '').trim();
			else if (line.startsWith('• Rating:')) rating = line.replace('• Rating: ', '').trim();
			else if (line.startsWith('• Age Range:')) ageRange = line.replace('• Age Range: ', '').trim();
			else if (line.startsWith('• Reason:')) reason = line.replace('• Reason: ', '').trim(); // Parse reason
		});

		loading = false;
	}
</script>

<div class="relative flex w-full flex-col p-10">
	<h2 class="mb-2 text-lg font-bold text-white">Findibo</h2>

	<textarea bind:value={mood} placeholder="What is your mood?" class="mb-2 w-65 rounded border p-2"
	></textarea>

	<textarea
		bind:value={lastBook}
		placeholder="What is the name of the last book you've read and enjoyed?"
		class="mb-2 w-65 rounded border p-2"
	></textarea>

	<textarea
		bind:value={language}
		placeholder="Which language should the book be in?"
		class="mb-2 w-65 rounded border p-2"
	></textarea>

	<button
		on:click={askModel}
		class="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
		disabled={loading}
	>
		{loading ? 'Answering...' : 'Send'}
	</button>

	{#if book || description || author || genre || rating || ageRange || reason}
		<div
			class="absolute top-20 -right-[1050px] h-4/5 w-96 overflow-y-scroll rounded bg-gray-100 p-3"
		>
			<strong>Response:</strong>
			<ul class="mt-2 space-y-2">
				{#if book}<li><strong>Book:</strong> {book}</li>{/if}
				{#if description}<li><strong>Description:</strong> {description}</li>{/if}
				{#if author}<li><strong>Author:</strong> {author}</li>{/if}
				{#if genre}<li><strong>Genre:</strong> {genre}</li>{/if}
				{#if rating}<li><strong>Rating:</strong> {rating}</li>{/if}
				{#if ageRange}<li><strong>Age Range:</strong> {ageRange}</li>{/if}
				{#if reason}<li><strong>Reason:</strong> {reason}</li>{/if}
			</ul>
		</div>
	{/if}
</div>
