<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import type { GameState } from '$lib/types';
    import * as gameService from '$lib/services/gameService';
    import GameStats from '$lib/components/GameStats.svelte';
    
    let gameCode = $page.params.gameCode;
    let gameState: GameState;
    let isLoading = true;
    
    onMount(async () => {
        const loadedGameState = await gameService.getGameState(gameCode);
        if (!loadedGameState) {
            goto('/');
            return;
        }
        gameState = loadedGameState;
        isLoading = false;
    });

    // Sort players by score
    $: sortedPlayers = gameState?.players.slice().sort((a, b) => b.score - a.score) ?? [];
</script>

<div class="container">
    <h1>🏆 Game Results</h1>

    {#if isLoading}
        <p>Loading...</p>
    {:else if gameState}
        <div class="results">
            {#each sortedPlayers as player, i}
                <div class="player-result" class:winner={i === 0}>
                    <span class="rank">#{i + 1}</span>
                    <span class="name">{player.name}</span>
                    <span class="score">{player.score} points</span>
                </div>
            {/each}
        </div>

        <GameStats {gameState} />

        <button on:click={() => goto('/')}>New Game</button>
    {:else}
        <p>Unable to load game results</p>
        <button on:click={() => goto('/')}>Return Home</button>
    {/if}
</div>

<style>
    .container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        text-align: center;
        font-family: 'Figtree', sans-serif;
    }

    .results {
        margin: 2rem 0;
    }

    .player-result {
        display: grid;
        grid-template-columns: 50px 1fr 100px;
        gap: 1rem;
        padding: 1rem;
        margin: 0.5rem 0;
        background-color: #f5f5f5;
        border-radius: 4px;
    }

    .winner {
        background-color: #ffd700;
        font-weight: bold;
    }

    button {
        padding: 1rem 2rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Figtree', sans-serif;
    }

    button:hover {
        background-color: #45a049;
    }
</style>
