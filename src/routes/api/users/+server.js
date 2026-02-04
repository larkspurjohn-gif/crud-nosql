import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/server/db';
import User from '$lib/server/models/User';

export async function GET() {
	await connectToDatabase();
	const users = await User.find().sort({ createdAt: -1 }).lean();
	return json(users);
}

export async function POST({ request }) {
	await connectToDatabase();
	const { firstName, lastName, age } = await request.json();
	const user = await User.create({ firstName, lastName, age });
	return json(user, { status: 201 });
}
