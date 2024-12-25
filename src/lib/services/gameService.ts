import type { GameState, Player, GameConfig } from '$lib/types';

export async function getGameState(gameCode: string): Promise<GameState | null> {
    const response = await fetch(`/api/game/${gameCode}`);
    if (!response.ok) return null;
    return response.json();
}

export async function setGameState(gameCode: string, gameState: GameState): Promise<void> {
    const response = await fetch(`/api/game/${gameCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', gameState })
    });
    
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update game state');
    }
}

export async function createGame(
    gameCode: string, 
    players: Player[], 
    gameConfig: GameConfig
): Promise<void> {
    const response = await fetch(`/api/game/${gameCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'create',
            players,
            gameConfig
        })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create game');
    }
}
