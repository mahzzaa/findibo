<script lang="ts">
	export let book = '';
	export let description = '';
	export let author = '';
	export let genre = '';
	export let rating = '';
	export let ageRange = '';
	export let reason = '';
	export let isbn = '';
</script>

<div class="h-screen w-full p-6 pt-24 overflow-y-auto flex flex-col pointer-events-none">
	<div class="max-w-sm ml-auto pointer-events-auto">
	{#if book || description || author || genre || rating || ageRange || reason}
		<div class="w-full neumorphic rounded-2xl p-6">
			<div class="mb-4 pb-3 border-b border-cyan-500/20">
				<h3 class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center">
					<span class="mr-2">🎯</span>
					YOUR PERFECT MATCH
				</h3>
			</div>
			<div class="space-y-4">
				{#if book}
					<div class="neumorphic-inset p-4 rounded-xl">
						<div class="text-xs text-cyan-300 mb-1 tracking-wider">BOOK TITLE</div>
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
					<div class="neumorphic-inset p-4 rounded-xl">
						<div class="text-xs text-gray-400 mb-2 tracking-wider">DESCRIPTION</div>
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
					<div class="neumorphic-inset p-4 rounded-xl">
						<div class="text-xs text-purple-300 mb-2 tracking-wider">AI RECOMMENDATION REASON</div>
						<p class="text-gray-200 text-sm leading-relaxed">{reason}</p>
					</div>
				{/if}
				{#if isbn}
					<div class="text-xs text-gray-500 border-t border-gray-600/20 pt-3 text-center">
						<span class="text-gray-400">ISBN:</span> 
						<span class="text-cyan-400 font-mono">{isbn}</span>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center h-full">
			<div class="neumorphic-inset rounded-2xl p-8 text-center">
				<div class="text-6xl mb-4 opacity-80">📚</div>
				<p class="text-lg font-medium text-gray-300 mb-2">Your book recommendation will appear here</p>
				<p class="text-sm text-gray-400">Complete the form and discover your perfect match!</p>
			</div>
		</div>
	{/if}
	</div>
</div>