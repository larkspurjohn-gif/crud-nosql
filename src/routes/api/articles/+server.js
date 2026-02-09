import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/server/db';
import User from '$lib/server/models/Article';

export async function GET() {
	await connectToDatabase();
	const users = await User.find().sort({ createdAt: -1 }).lean();
	return json(users);
}

export async function POST({ request }) {
	await connectToDatabase();
	const { articleName, articleCategory, articleDate } = await request.json();
	const user = await User.create({ articleName, articleCategory, articleDate });
	return json(user, { status: 201 });
}
