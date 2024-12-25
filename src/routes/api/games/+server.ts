import { env } from '$env/dynamic/private';
import { createClient } from '@vercel/kv';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { GameState, GameSummary } from '$lib/types';

const GAME_PREFIX = 'game:';

const kv = createClient({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN
});

export const GET: RequestHandler = async () => {
    const keys = await kv.keys(`${GAME_PREFIX}*`);
    const games = await Promise.all(
        keys.map(key => kv.get<GameState>(key))
    ) as (GameState | null)[];

    const summaries: GameSummary[] = games
        .filter(Boolean)
        .map(game => ({
            gameCode: game!.gameCode,
            players: game!.players,
            timestamp: game!.timestamp ?? Date.now(),
            finished: game!.finished,
            currentRound: game!.gameHistory.length,
            totalRounds: game!.gameConfig.roundSequence.length
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

    return json(summaries);
}; 