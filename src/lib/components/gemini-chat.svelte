<script context="module" lang="ts">
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let gender = '';
	let age = '';
	let selectedGenres = [];
	let recentBooks = ['', '', ''];
	let bookAuthors = ['', '', ''];
	let searchingBooks = [false, false, false];
	let loading = false;
	let showTooltip = false;
	let tooltipPosition = { x: 0, y: 0 };
	let book = '';
	let description = '';
	let author = '';
	let genre = '';
	let rating = '';
	let ageRange = '';
	let reason = '';
	let isbn = '';

	let searchTimeout;

	async function searchBookAuthor(bookTitle, index) {
		if (!bookTitle.trim()) {
			bookAuthors[index] = '';
			searchingBooks[index] = false;
			return;
		}

		searchingBooks[index] = true;
		
		try {
			const res = await fetch('/api/gemini', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: `You are a comprehensive international book search assistant. Search for books in ALL languages including English, Persian/Farsi, Turkish, Arabic, Spanish, French, German, Japanese, Korean, Chinese, Russian, and any other language worldwide.

Given a book title in any language or script, respond ONLY with the author's full name. If the book exists in multiple languages or has been translated, provide the original author's name.

Examples:
- "Harry Potter" → "J.K. Rowling"
- "صد سال تنهایی" → "Gabriel García Márquez" 
- "Kara Kitap" → "Orhan Pamuk"
- "الأسود يليق بك" → "Ahlamaِ Mosteghanemi"

Book title: "${bookTitle}"

Author (respond with just the name, no extra text):`
				})
			});

			const data = await res.json();
			const authorName = data.result.trim();
			
			if (authorName && authorName !== 'Unknown') {
				bookAuthors[index] = authorName;
			} else {
				bookAuthors[index] = '';
			}
		} catch (error) {
			bookAuthors[index] = '';
		}
		
		searchingBooks[index] = false;
	}

	function debounceSearch(bookTitle, index) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			searchBookAuthor(bookTitle, index);
		}, 800);
	}

	function handleBookInput(event, index) {
		const value = event.target.value;
		recentBooks[index] = value;
		debounceSearch(value, index);
	}

	function handleMouseMove(event) {
		tooltipPosition.x = event.clientX;
		tooltipPosition.y = event.clientY;
	}

	function showDisabledTooltip(event) {
		if (loading || !gender || !age || selectedGenres.length === 0 || !recentBooks[0].trim()) {
			showTooltip = true;
			handleMouseMove(event);
		}
	}

	function hideTooltip() {
		showTooltip = false;
	}

	async function askModel() {
		loading = true;
		book = description = author = genre = rating = ageRange = reason = isbn = '';

		const res = await fetch('/api/gemini', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				prompt: `
You are Findibo, a comprehensive international book recommendation assistant with knowledge of literature from ALL countries and languages. You can recommend books in English, Persian/Farsi, Turkish, Arabic, Spanish, French, German, Japanese, Korean, Chinese, Russian, and any other language worldwide.

Based on the user's profile, recommend exactly one book that would be perfect for them from ANY language or country. Consider books from:
- Western literature (English, French, German, Spanish, etc.)
- Middle Eastern literature (Persian, Arabic, Turkish, Hebrew, etc.) 
- Asian literature (Japanese, Korean, Chinese, Hindi, etc.)
- Eastern European literature (Russian, Polish, Czech, etc.)
- African literature
- Latin American literature
- And any other world literature

Use this format:
• Book: [title in original language and English translation if applicable]
• Description: [one-sentence summary of the book]
• Author: [author name]
• Country/Language: [country of origin and original language]
• Genre: [genre]
• Rating: [X.X]/5
• Age Range: [number+]
• Reason: [detailed explanation why this book matches their preferences and is similar to their recent favorites]
• ISBN: [ISBN of the book if available]

User Profile:
- Gender: ${gender}
- Age: ${age}
- Favorite Genres: ${selectedGenres.join(', ')}
- Recent Books They Loved: ${recentBooks.map((book, i) => 
	book.trim() !== '' ? `${book}${bookAuthors[i] ? ' by ' + bookAuthors[i] : ''}` : ''
).filter(book => book !== '').join('; ')}

Please suggest a book from ANY language/country that closely matches their favorite genres and is similar in style/theme to their recently enjoyed books. Don't limit yourself to English books - explore world literature!
Assistant:
`
			})
		});

		const data = await res.json();
		const result = data.result;

		result.split('\n').forEach((line) => {
			if (line.startsWith('• Book:')) book = line.replace('• Book: ', '').trim();
			else if (line.startsWith('• Description:'))
				description = line.replace('• Description: ', '').trim();
			else if (line.startsWith('• Author:')) author = line.replace('• Author: ', '').trim();
			else if (line.startsWith('• Country/Language:')) 
				genre = line.replace('• Country/Language: ', '').trim(); // Using genre variable to store country/language
			else if (line.startsWith('• Genre:')) 
				genre = genre ? genre + ' | ' + line.replace('• Genre: ', '').trim() : line.replace('• Genre: ', '').trim();
			else if (line.startsWith('• Rating:')) rating = line.replace('• Rating: ', '').trim();
			else if (line.startsWith('• Age Range:')) ageRange = line.replace('• Age Range: ', '').trim();
			else if (line.startsWith('• Reason:')) reason = line.replace('• Reason: ', '').trim();
			else if (line.startsWith('• ISBN:')) isbn = line.replace('• ISBN: ', '').trim();
		});

		loading = false;
	}
</script>

<div class="h-screen w-full max-w-md mx-auto p-6 pt-24 overflow-y-auto flex flex-col">

	<div class="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
	<div class="mb-4">
		<label class="block text-xs font-medium text-cyan-300 mb-1 tracking-wide">◦ GENDER IDENTITY</label>
		<select bind:value={gender} class="w-full bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 hover:border-cyan-400/50">
			<option value="" class="bg-gray-800 text-gray-300">▸ Select your gender</option>
			<option value="female" class="bg-gray-800 text-white">♀ Female</option>
			<option value="male" class="bg-gray-800 text-white">♂ Male</option>
			<option value="non-binary" class="bg-gray-800 text-white">⚬ Non-binary</option>
			<option value="prefer-not-to-say" class="bg-gray-800 text-white">◯ Prefer not to say</option>
		</select>
	</div>

	<div class="mb-4">
		<label class="block text-xs font-medium text-cyan-300 mb-1 tracking-wide">◦ AGE RANGE</label>
		<input
			bind:value={age}
			type="number"
			placeholder="▸ Enter your age"
			class="w-full bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 hover:border-cyan-400/50"
			min="1"
			max="120"
		/>
	</div>

	<div class="mb-4">
		<label class="block text-xs font-medium text-cyan-300 mb-1 tracking-wide">◦ FAVORITE GENRES</label>
		<div class="bg-gray-900/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 max-h-32 overflow-y-auto custom-scrollbar">
			<div class="grid grid-cols-1 gap-2">
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Fantasy" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🔮 Fantasy</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Romance" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">💕 Romance</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Mystery" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🕵️ Mystery</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Thriller" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">⚡ Thriller</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Science Fiction" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🚀 Sci-Fi</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Historical Fiction" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🏛️ Historical</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Contemporary Fiction" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">📖 Contemporary</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Literary Fiction" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">✍️ Literary</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Young Adult" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🌟 Young Adult</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Non-Fiction" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">📚 Non-Fiction</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Biography" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">👤 Biography</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Self-Help" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🧠 Self-Help</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Horror" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">👻 Horror</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Adventure" bind:group={selectedGenres} class="w-3 h-3 text-cyan-500 bg-gray-800 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-1" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🗺️ Adventure</span>
			</label>
			</div>
		</div>
	</div>

	<div class="mb-4">
		<label class="block text-xs font-medium text-cyan-300 mb-1 tracking-wide">◦ RECENT FAVORITES</label>
		<div class="space-y-3">
			<div>
				<label class="block text-xs text-gray-400 mb-1">● BOOK #1 (REQUIRED)</label>
				<div class="relative">
					<input
						on:input={(e) => handleBookInput(e, 0)}
						value={recentBooks[0]}
						type="text"
						placeholder="▸ Enter title (صد سال تنهایی, Kara Kitap, 1984...)"
						class="w-full bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 pr-20 text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 hover:border-cyan-400/50"
					/>
					<div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
						{#if searchingBooks[0]}
							<div class="flex items-center space-x-1">
								<div class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
								<span class="text-xs text-cyan-400">AI</span>
							</div>
						{:else if bookAuthors[0]}
							<span class="text-xs text-cyan-300 font-medium bg-cyan-500/20 px-1.5 py-0.5 rounded text-xs">
								{bookAuthors[0].split(' ')[0]}
							</span>
						{/if}
					</div>
				</div>
			</div>
			<div>
				<label class="block text-xs text-gray-400 mb-1">● BOOK #2 (OPTIONAL)</label>
				<div class="relative">
					<input
						on:input={(e) => handleBookInput(e, 1)}
						value={recentBooks[1]}
						type="text"
						placeholder="▸ Enter title in any language"
						class="w-full bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 pr-20 text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 hover:border-cyan-400/50"
					/>
					<div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
						{#if searchingBooks[1]}
							<div class="flex items-center space-x-1">
								<div class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
								<span class="text-xs text-cyan-400">AI</span>
							</div>
						{:else if bookAuthors[1]}
							<span class="text-xs text-cyan-300 font-medium bg-cyan-500/20 px-1.5 py-0.5 rounded text-xs">
								{bookAuthors[1].split(' ')[0]}
							</span>
						{/if}
					</div>
				</div>
			</div>
			<div>
				<label class="block text-xs text-gray-400 mb-1">● BOOK #3 (OPTIONAL)</label>
				<div class="relative">
					<input
						on:input={(e) => handleBookInput(e, 2)}
						value={recentBooks[2]}
						type="text"
						placeholder="▸ Enter title in any language"
						class="w-full bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 pr-20 text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 hover:border-cyan-400/50"
					/>
					<div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
						{#if searchingBooks[2]}
							<div class="flex items-center space-x-1">
								<div class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
								<span class="text-xs text-cyan-400">AI</span>
							</div>
						{:else if bookAuthors[2]}
							<span class="text-xs text-cyan-300 font-medium bg-cyan-500/20 px-1.5 py-0.5 rounded text-xs">
								{bookAuthors[2].split(' ')[0]}
							</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
	</div>

	<div class="flex-shrink-0 mt-4">
		<button
			on:click={askModel}
			on:mouseenter={showDisabledTooltip}
			on:mousemove={handleMouseMove}
			on:mouseleave={hideTooltip}
			class="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 rounded-xl px-6 py-3 text-white font-bold text-sm tracking-wide transition-all duration-500 transform hover:scale-[1.05] hover:-rotate-1 hover:shadow-2xl hover:shadow-cyan-500/40 disabled:scale-100 disabled:rotate-0 shadow-lg perspective-1000 discover-btn"
			disabled={loading || !gender || !age || selectedGenres.length === 0 || !recentBooks[0].trim()}
		>
			{#if loading}
				<div class="flex items-center justify-center space-x-2">
					<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
					<span>◦ ANALYZING ◦</span>
				</div>
			{:else}
				<span class="flex items-center justify-center space-x-2">
					<span>🚀</span>
					<span>DISCOVER MY BOOK</span>
					<span>🚀</span>
				</span>
			{/if}
		</button>
	</div>

	{#if book || description || author || genre || rating || ageRange || reason}
		<div class="flex-shrink-0 mt-4 w-full bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-4 shadow-2xl shadow-cyan-500/10">
			<div class="mb-4 pb-3 border-b border-cyan-500/30">
				<h3 class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center">
					<span class="mr-2">🎯</span>
					YOUR PERFECT MATCH
				</h3>
			</div>
			<div class="space-y-4">
				{#if book}
					<div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm p-4 rounded-xl border border-cyan-400/30">
						<div class="text-xs text-cyan-300 mb-1 tracking-wider">◦ BOOK TITLE</div>
						<div class="text-lg font-bold text-white">{book}</div>
					</div>
				{/if}
				{#if author}
					<div class="flex items-center space-x-3">
						<div class="text-sm text-gray-300">✦ AUTHOR:</div>
						<span class="text-cyan-300 font-medium">{author}</span>
					</div>
				{/if}
				{#if description}
					<div class="bg-gray-800/50 p-4 rounded-xl border border-gray-600/30">
						<div class="text-xs text-gray-400 mb-2 tracking-wider">◦ DESCRIPTION</div>
						<p class="text-gray-200 text-sm leading-relaxed">{description}</p>
					</div>
				{/if}
				{#if genre}
					<div class="flex items-center space-x-3">
						<div class="text-sm text-gray-300">✦ ORIGIN & GENRE:</div>
						<span class="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm border border-emerald-500/30">{genre}</span>
					</div>
				{/if}
				{#if rating}
					<div class="flex items-center space-x-3">
						<div class="text-sm text-gray-300">✦ RATING:</div>
						<span class="text-yellow-400 font-bold flex items-center">
							<span class="mr-1">⭐</span>
							{rating}
						</span>
					</div>
				{/if}
				{#if ageRange}
					<div class="flex items-center space-x-3">
						<div class="text-sm text-gray-300">✦ AGE RANGE:</div>
						<span class="text-purple-300">{ageRange}</span>
					</div>
				{/if}
				{#if reason}
					<div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-400/20">
						<div class="text-xs text-purple-300 mb-2 tracking-wider">◦ AI RECOMMENDATION REASON</div>
						<p class="text-gray-200 text-sm leading-relaxed">{reason}</p>
					</div>
				{/if}
				{#if isbn}
					<div class="text-xs text-gray-500 border-t border-gray-600/30 pt-3 text-center">
						<span class="text-gray-400">ISBN:</span> 
						<span class="text-cyan-400 font-mono">{isbn}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Tooltip for disabled button -->
	{#if showTooltip}
		<div 
			class="fixed z-50 pointer-events-none"
			style="left: {tooltipPosition.x + 15}px; top: {tooltipPosition.y - 10}px;"
		>
			<div class="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-2xl shadow-red-500/40 animate-pulse">
				<div class="flex items-center space-x-1">
					<span>⚠️</span>
					<span>Fill the form first!</span>
				</div>
				<!-- Tooltip arrow -->
				<div class="absolute -bottom-1 left-3 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 transform rotate-45"></div>
			</div>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(30, 41, 59, 0.5);
		border-radius: 3px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: linear-gradient(45deg, #06b6d4, #3b82f6);
		border-radius: 3px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(45deg, #0891b2, #2563eb);
	}

	/* Firefox scrollbar */
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: #06b6d4 rgba(30, 41, 59, 0.5);
	}

	/* Glow effect for focus states */
	input:focus, select:focus {
		box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
	}

	/* Custom button glow */
	button:not(:disabled):hover {
		box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
	}

	/* 3D Tilt Effect for Discover Button */
	.discover-btn {
		transform-style: preserve-3d;
		perspective: 1000px;
		transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
	}

	.discover-btn:hover {
		transform: scale(1.05) rotateX(-8deg) rotateY(5deg) rotateZ(-1deg);
		box-shadow: 
			0 20px 40px rgba(6, 182, 212, 0.3),
			0 0 60px rgba(6, 182, 212, 0.2),
			inset 0 2px 10px rgba(255, 255, 255, 0.1);
	}

	.discover-btn:active {
		transform: scale(0.98) rotateX(-2deg) rotateY(1deg);
		transition: all 0.1s ease-out;
	}

	.discover-btn:disabled {
		transform: none !important;
		box-shadow: none !important;
	}
</style>
