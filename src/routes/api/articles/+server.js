import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/server/db';
import Article from '$lib/server/models/Article';

export async function GET() {
	await connectToDatabase();
  	const articles = await Article.find().lean();
	return json(articles);
}

export async function POST({ request }) {
	await connectToDatabase();
	const { articleName, articleCategory, articleDate } = await request.json();
	const article = await Article.create({ articleName, articleCategory, articleDate });
	return json(article, { status: 201 });
}
