<script context="module" lang="ts">
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let gender = '';
	let age = '';
	let selectedGenres = [];
	let preferredLanguage = '';
	let recentBooks = ['', '', ''];
	let bookAuthors = ['', '', ''];
	let searchingBooks = [false, false, false];
	let loading = false;
	let showTooltip = false;
	let tooltipPosition = { x: 0, y: 0 };
	export let book = '';
	export let description = '';
	export let author = '';
	export let genre = '';
	export let rating = '';
	export let ageRange = '';
	export let reason = '';
	export let isbn = '';

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
		if (loading || !gender || !age || !preferredLanguage || selectedGenres.length === 0 || !recentBooks[0].trim()) {
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
- Preferred Language: ${preferredLanguage}
- Favorite Genres: ${selectedGenres.join(', ')}
- Recent Books They Loved: ${recentBooks.map((book, i) => 
	book.trim() !== '' ? `${book}${bookAuthors[i] ? ' by ' + bookAuthors[i] : ''}` : ''
).filter(book => book !== '').join('; ')}

IMPORTANT: Please suggest a book SPECIFICALLY in ${preferredLanguage} language. The recommendation must be in the user's preferred language (${preferredLanguage}). If the book is originally in another language but has been translated to ${preferredLanguage}, mention both the original language and that it's available in ${preferredLanguage}. Focus on books that are either originally written in ${preferredLanguage} or widely available in ${preferredLanguage} translation.

CRITICAL EXCLUSION: When recommending Persian/Farsi books, NEVER suggest books related to: جنگ (war), شهید (martyrdom), دفاع مقدس (sacred defense), اسلام (Islam), دین (religion), or مرجع تقلید (religious authority). Focus on literature, fiction, poetry, philosophy, and other non-religious, non-war themed books.
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

<div class="h-screen w-full p-6 pt-24 overflow-y-auto flex flex-col pointer-events-none">
	<div class="max-w-xs mr-auto pointer-events-auto flex flex-col h-full">

	<div class="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
	<div class="mb-4">
		<label class="block text-xs font-medium text-cyan-300 mb-1 tracking-wide">GENDER IDENTITY</label>
		<select bind:value={gender} class="w-full neumorphic-select rounded-xl p-3 text-white focus:outline-none">
			<option value="" class="bg-gray-800 text-gray-300">Select your gender</option>
			<option value="female" class="bg-gray-800 text-white">♀ Female</option>
			<option value="male" class="bg-gray-800 text-white">♂ Male</option>
			<option value="non-binary" class="bg-gray-800 text-white">⚬ Non-binary</option>
			<option value="prefer-not-to-say" class="bg-gray-800 text-white">◯ Prefer not to say</option>
		</select>
	</div>

	<div class="mb-4">
		<label class="block text-xs font-medium text-cyan-300 mb-1 tracking-wide">AGE RANGE</label>
		<input
			bind:value={age}
			type="number"
			placeholder="Enter your age"
			class="w-full neumorphic-input rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none"
			min="1"
			max="120"
		/>
	</div>

	<div class="mb-4">
		<label class="block text-xs font-medium text-cyan-300 mb-1 tracking-wide">PREFERRED LANGUAGE</label>
		<select bind:value={preferredLanguage} class="w-full neumorphic-select rounded-xl p-3 text-white focus:outline-none">
			<option value="" class="bg-gray-800 text-gray-300">Select book language</option>
			<option value="English" class="bg-gray-800 text-white">🇺🇸 English</option>
			<option value="Persian/Farsi" class="bg-gray-800 text-white">🇮🇷 Persian/Farsi</option>
			<option value="Turkish" class="bg-gray-800 text-white">🇹🇷 Turkish</option>
			<option value="Arabic" class="bg-gray-800 text-white">🇸🇦 Arabic</option>
			<option value="Spanish" class="bg-gray-800 text-white">🇪🇸 Spanish</option>
			<option value="French" class="bg-gray-800 text-white">🇫🇷 French</option>
			<option value="German" class="bg-gray-800 text-white">🇩🇪 German</option>
			<option value="Italian" class="bg-gray-800 text-white">🇮🇹 Italian</option>
			<option value="Portuguese" class="bg-gray-800 text-white">🇵🇹 Portuguese</option>
			<option value="Russian" class="bg-gray-800 text-white">🇷🇺 Russian</option>
			<option value="Chinese" class="bg-gray-800 text-white">🇨🇳 Chinese</option>
			<option value="Japanese" class="bg-gray-800 text-white">🇯🇵 Japanese</option>
			<option value="Korean" class="bg-gray-800 text-white">🇰🇷 Korean</option>
			<option value="Hindi" class="bg-gray-800 text-white">🇮🇳 Hindi</option>
			<option value="Dutch" class="bg-gray-800 text-white">🇳🇱 Dutch</option>
			<option value="Swedish" class="bg-gray-800 text-white">🇸🇪 Swedish</option>
			<option value="Norwegian" class="bg-gray-800 text-white">🇳🇴 Norwegian</option>
			<option value="Polish" class="bg-gray-800 text-white">🇵🇱 Polish</option>
			<option value="Czech" class="bg-gray-800 text-white">🇨🇿 Czech</option>
			<option value="Hebrew" class="bg-gray-800 text-white">🇮🇱 Hebrew</option>
		</select>
	</div>

	<div class="mb-4">
		<label class="block text-xs font-medium text-cyan-300 mb-1 tracking-wide">FAVORITE GENRES</label>
		<div class="neumorphic-inset rounded-xl p-3 max-h-32 overflow-y-auto custom-scrollbar">
			<div class="grid grid-cols-2 gap-2">
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Fantasy" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🔮 Fantasy</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Romance" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">💕 Romance</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Mystery" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🕵️ Mystery</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Thriller" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">⚡ Thriller</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Science Fiction" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🚀 Sci-Fi</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Historical Fiction" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🏛️ Historical</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Contemporary Fiction" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">📖 Contemporary</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Literary Fiction" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">✍️ Literary</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Young Adult" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🌟 Young Adult</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Non-Fiction" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">📚 Non-Fiction</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Biography" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">👤 Biography</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Self-Help" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🧠 Self-Help</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Horror" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">👻 Horror</span>
			</label>
			<label class="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer group">
				<input type="checkbox" value="Adventure" bind:group={selectedGenres} class="w-3 h-3 neumorphic-checkbox rounded focus:outline-none" />
				<span class="text-xs text-gray-200 group-hover:text-cyan-300 transition-colors">🗺️ Adventure</span>
			</label>
			</div>
		</div>
	</div>

	<div class="mb-4">
		<label class="block text-xs font-medium text-cyan-300 mb-1 tracking-wide">▎RECENT FAVORITES</label>
		<div class="space-y-3">
			<div>
				<label class="block text-xs text-gray-400 mb-1">BOOK #1 (REQUIRED)</label>
				<div class="relative">
					<input
						on:input={(e) => handleBookInput(e, 0)}
						value={recentBooks[0]}
						type="text"
						placeholder="Enter title (صد سال تنهایی, Kara Kitap, 1984...)"
						class="w-full neumorphic-input rounded-xl p-3 pr-20 text-white placeholder-gray-400 focus:outline-none"
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
				<label class="block text-xs text-gray-400 mb-1">BOOK #2 (OPTIONAL)</label>
				<div class="relative">
					<input
						on:input={(e) => handleBookInput(e, 1)}
						value={recentBooks[1]}
						type="text"
						placeholder="Enter title in any language"
						class="w-full neumorphic-input rounded-xl p-3 pr-20 text-white placeholder-gray-400 focus:outline-none"
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
				<label class="block text-xs text-gray-400 mb-1">BOOK #3 (OPTIONAL)</label>
				<div class="relative">
					<input
						on:input={(e) => handleBookInput(e, 2)}
						value={recentBooks[2]}
						type="text"
						placeholder="Enter title in any language"
						class="w-full neumorphic-input rounded-xl p-3 pr-20 text-white placeholder-gray-400 focus:outline-none"
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
			class="w-full neumorphic-button rounded-xl px-6 py-3 text-white font-bold text-sm tracking-wide discover-btn {loading || !gender || !age || !preferredLanguage || selectedGenres.length === 0 || !recentBooks[0].trim() ? 'opacity-50 cursor-not-allowed' : ''}"
			disabled={loading || !gender || !age || !preferredLanguage || selectedGenres.length === 0 || !recentBooks[0].trim()}
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

	/* Enhanced 3D Neomorphic Effect for Discover Button */
	.discover-btn {
		background: linear-gradient(145deg, var(--bg-secondary), var(--bg-primary));
		background-image: linear-gradient(145deg, #06b6d4, #8b5cf6);
		transform-style: preserve-3d;
		perspective: 1000px;
		transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
	}

	.discover-btn:not(:disabled):hover {
		background: linear-gradient(145deg, var(--bg-primary), var(--bg-secondary));
		background-image: linear-gradient(145deg, #0891b2, #7c3aed);
		transform: scale(1.05) rotateX(-8deg) rotateY(5deg) rotateZ(-1deg);
		box-shadow: 
			8px 8px 16px var(--shadow-dark),
			-8px -8px 16px var(--shadow-light),
			0 20px 40px rgba(6, 182, 212, 0.3),
			0 0 60px rgba(6, 182, 212, 0.2);
	}

	.discover-btn:not(:disabled):active {
		background: linear-gradient(145deg, var(--bg-tertiary), var(--bg-primary));
		background-image: linear-gradient(145deg, #0e7490, #6d28d9);
		transform: scale(0.98) rotateX(-2deg) rotateY(1deg);
		box-shadow: 
			inset 4px 4px 8px var(--shadow-dark),
			inset -4px -4px 8px var(--shadow-light);
		transition: all 0.1s ease-out;
	}

	.discover-btn:disabled {
		background: linear-gradient(145deg, #374151, #1f2937) !important;
		background-image: none !important;
		transform: none !important;
		box-shadow: 
			inset 2px 2px 4px rgba(0, 0, 0, 0.3),
			inset -2px -2px 4px rgba(55, 65, 81, 0.1) !important;
	}
</style>
