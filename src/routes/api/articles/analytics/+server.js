import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/server/db';
import Article from '$lib/server/models/Article';

export async function GET() {
  await connectToDatabase();
  const data = await Article.getDailyEngagement();
  return json(data);
}
