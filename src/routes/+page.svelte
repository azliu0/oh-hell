<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import * as gameService from '$lib/services/gameService';
    import type { GameSummary } from '$lib/types';
    
    let games: GameSummary[] = [];
    let isLoading = true;

    onMount(async () => {
        try {
            games = await gameService.listGames();
        } finally {
            isLoading = false;
        }
    });

    function formatDate(timestamp: number): string {
        return new Date(timestamp).toLocaleString();
    }
</script>

<div class="container">
    <div class="header">
        <h1>🎲 Oh Hell Spreadsheet</h1>
        <button class="new-game-button" on:click={() => goto('/new')}>New Game</button>
    </div>

    {#if isLoading}
        <div class="loading">Loading past games...</div>
    {:else if games.length === 0}
        <div class="empty-state">
            <p>No games found</p>
        </div>
    {:else}
        <div class="games-list">
            {#each games as game}
                <button 
                    class="game-card"
                    on:click={() => goto(`/${game.gameCode}/${game.finished ? 'results' : 'game'}`)}
                >
                    <div class="game-info">
                        <div class="game-header">
                            <span class="game-code">#{game.gameCode}</span>
                            <span class="game-status" class:finished={game.finished}>
                                {game.finished ? 'Completed' : 'In Progress'}
                            </span>
                        </div>
                        <div class="players">
                            {#each game.players as player}
                                <span class="player truncate-text">{player.name}</span>
                            {/each}
                        </div>
                    </div>
                    <div class="game-meta">
                        <span class="timestamp">{formatDate(game.timestamp)}</span>
                        <span class="rounds">{game.currentRound} / {game.totalRounds} rounds</span>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        font-family: 'Figtree', sans-serif;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    h1 {
        margin: 0;
        font-size: 2rem;
    }

    .new-game-button {
        padding: 0.75rem 1.5rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 1rem;
    }

    .new-game-button:hover {
        background-color: #45a049;
    }

    .games-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .game-card {
        background-color: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: inherit;
    }

    .game-card:hover {
        transform: translateX(5px);
        border-color: #4CAF50;
    }

    .game-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }

    .game-code {
        font-family: monospace;
        font-size: 0.9rem;
        color: #666;
    }

    .game-status {
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        background-color: #fff3cd;
        color: #856404;
    }

    .game-status.finished {
        background-color: #d4edda;
        color: #155724;
    }

    .players {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .player {
        font-size: 0.9rem;
        color: #495057;
        background-color: #f8f9fa;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        max-width: 150px;
    }

    .game-meta {
        text-align: right;
        font-size: 0.8rem;
        color: #6c757d;
    }

    .game-meta > * {
        display: block;
    }

    .loading, .empty-state {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    .truncate-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    @media (max-width: 600px) {
        .container {
            padding: 1rem;
        }

        .header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        .game-card {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
        }

        .game-meta {
            text-align: left;
            display: flex;
            justify-content: space-between;
        }
    }
</style>
