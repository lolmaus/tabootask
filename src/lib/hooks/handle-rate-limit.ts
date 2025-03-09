import type { Handle } from '@sveltejs/kit';
import { TokenBucket } from "./utils/bucket";

const bucket = new TokenBucket<string>(100, 1);

export const handleRateLimit: Handle = async ({ event, resolve }) => {
    // Note: Assumes X-Forwarded-For will always be defined.
    const clientIP = event.request.headers.get("X-Forwarded-For");
    
    if (clientIP === null) {
        return resolve(event);
    }

    const cost: number =
        (event.request.method === "GET" || event.request.method === "OPTIONS")
            ? 1
            : 3;

    if (!bucket.consume(clientIP, cost)) {
        return new Response("Too many requests", {
            status: 429
        });
    }
    return resolve(event);
};