import { env } from '$env/dynamic/private';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET = async (event) => {
	if (env.MOCK_DB !== 'true') {
		error(418, { message: "I'm a teapot" });
	}

	const db = event.locals.db;

	return json(db.mockDb);
};

export const POST: RequestHandler = async ({ request, locals: { db } }) => {
	const data = await request.json();

	db.replaceDb(data);

	return new Response(null, { status: 200 });
};
