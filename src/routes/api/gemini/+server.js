import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';

// Securely load your key from environment
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST({ request }) {
	const { prompt } = await request.json();

	const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

	const result = await model.generateContent(prompt);
	const response = await result.response;
	const text = response.text();

	return new Response(JSON.stringify({ result: text }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
