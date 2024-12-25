import { env } from '$env/dynamic/private';
import { createClient } from '@vercel/kv';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { GameState } from '$lib/types';

const kv = createClient({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN
});

const GAME_PREFIX = 'game:';

export const GET: RequestHandler = async ({ params }) => {
    const { gameCode } = params;
    const gameState = await kv.get<GameState>(`${GAME_PREFIX}${gameCode}`);
    return json(gameState);
};

export const POST: RequestHandler = async ({ params, request }) => {
    const { gameCode } = params;
    const data = await request.json();
    
    if (data.action === 'create') {
        const { players, gameConfig } = data;
        
        if (gameConfig.roundSequence.length === 0) {
            return json({ error: 'empty round sequence' }, { status: 400 });
        }

        const emptyGameState: GameState = {
            gameCode,
            timestamp: Date.now(),
            players,
            currentRound: {
                number: gameConfig.roundSequence[0],
                dealer: 0,
                bids: [],
                tricks: []
            },
            gameHistory: [],
            roundStats: [],
            gameConfig,
            finished: false
        };

        await kv.set(`${GAME_PREFIX}${gameCode}`, emptyGameState);
        return json({ success: true });
    }
    
    if (data.action === 'update') {
        await kv.set(`${GAME_PREFIX}${gameCode}`, data.gameState);
        return json({ success: true });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
};
