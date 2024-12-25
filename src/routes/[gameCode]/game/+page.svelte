<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import type { GameState, RoundStatistics } from '$lib/types';
    import ScoreChart from '$lib/components/ScoreChart.svelte';
    import * as gameService from '$lib/services/gameService';
    import GameStats from '$lib/components/GameStats.svelte';
    
    let gameCode = $page.params.gameCode;
    let gameState: GameState | null = null;
    let currentBids: number[] = [];
    let currentTricks: number[] = [];
    let biddingComplete = false;
    let error = '';
    let showStats = false;
    let isLoading = true;
    let currentRoundIndex = 0;

    // Transform data for the chart
    $: chartData = gameState?.roundStats.flatMap(stat => 
        stat.playerStats.map(playerStat => ({
            round: stat.roundNumber,
            name: playerStat.name,
            score: playerStat.score
        }))
    ) ?? [];

    onMount(async () => {
        try {
            const loadedGameState = await gameService.getGameState(gameCode);
            if (!loadedGameState) {
                goto('/');
                return;
            }
            if (loadedGameState.finished) {
                goto(`/${gameCode}/results`);
                return;
            }
            gameState = loadedGameState;
            currentRoundIndex = gameState.gameHistory.length;
            initializeRound();
        } finally {
            isLoading = false;
        }
    });

    function initializeRound() {
        if (!gameState) return;
        currentBids = Array(gameState.players.length).fill(0);
        currentTricks = Array(gameState.players.length).fill(0);
        biddingComplete = false;
        error = '';
        
        gameState.currentRound = {
            number: getCurrentRoundNumber(),
            dealer: getCurrentDealer(),
            bids: currentBids,
            tricks: currentTricks
        };
    }

    function getCurrentRoundNumber(): number {
        if (!gameState) return 0;
        return gameState.gameConfig.roundSequence[currentRoundIndex];
    }

    function getCurrentDealer(): number {
        if (!gameState) return 0;
        return currentRoundIndex % gameState.players.length;
    }

    function calculateScore(bid: number, tricks: number): number {
        return bid === tricks ? (tricks * tricks + tricks + 10) : tricks;
    }

    function validateBids(): boolean {
        if (currentBids.some(bid => !Number.isInteger(bid))) {
            error = 'All bids must be whole numbers';
            return false;
        }
        
        const sum = currentBids.reduce((a, b) => a + b, 0);
        if (sum === getCurrentRoundNumber()) {
            error = `Total bids cannot equal ${getCurrentRoundNumber()}`;
            return false;
        }
        return true;
    }

    function validateTricks(): boolean {
        if (currentTricks.some(tricks => !Number.isInteger(tricks))) {
            error = 'All trick counts must be whole numbers';
            return false;
        }
        
        const totalTricks = currentTricks.reduce((a, b) => a + b, 0);
        if (totalTricks !== getCurrentRoundNumber()) {
            error = `Total tricks must equal ${getCurrentRoundNumber()}`;
            return false;
        }
        return true;
    }

    function completeBidding() {
        if (!gameState) return;
        if (validateBids()) {
            biddingComplete = true;
            error = '';
        }
    }

    async function completeRound() {
        if (!validateTricks()) return;
        if (!gameState) return;

        gameState.players = gameState.players.map(player => ({ ...player, score: 0 }));
        
        if (currentRoundIndex < gameState.gameHistory.length) {
            gameState.gameHistory = gameState.gameHistory.slice(0, currentRoundIndex);
            gameState.roundStats = gameState.roundStats.slice(0, currentRoundIndex);
        }

        for (let i = 0; i < currentRoundIndex; i++) {
            const roundStat = gameState.roundStats[i];
            roundStat.playerStats.forEach((playerStat, playerIndex) => {
                gameState!.players[playerIndex].score += calculateScore(playerStat.bid, playerStat.tricks);
            });
        }

        currentTricks.forEach((tricks, index) => {
            gameState!.players[index].score += calculateScore(currentBids[index], tricks);
        });

        const roundStat: RoundStatistics = {
            roundNumber: getCurrentRoundNumber(),
            playerStats: gameState!.players.map((player, index) => ({
                name: player.name,
                bid: currentBids[index],
                tricks: currentTricks[index],
                score: player.score
            }))
        };
        gameState!.roundStats = [...gameState!.roundStats, roundStat];

        gameState.gameHistory = [...gameState.gameHistory, {
            number: getCurrentRoundNumber(),
            dealer: getCurrentDealer(),
            bids: [...currentBids],
            tricks: [...currentTricks]
        }];

        if (currentRoundIndex === gameState.gameConfig.roundSequence.length - 1) {
            gameState.finished = true;
            await gameService.setGameState(gameCode, gameState);
            goto(`/${gameCode}/results`);
            return;
        }

        await gameService.setGameState(gameCode, gameState);
        currentRoundIndex++;
        initializeRound();
    }

    async function goToRound(targetRoundIndex: number) {
        if (!gameState) return;
        if (targetRoundIndex < 0 || targetRoundIndex > gameState.gameHistory.length) {
            return;
        }

        currentRoundIndex = targetRoundIndex;
        const targetRound = gameState.gameHistory[targetRoundIndex];

        gameState.players = gameState.players.map(player => ({ ...player, score: 0 }));

        const relevantStats = gameState.roundStats.slice(0, targetRoundIndex);
        relevantStats.forEach(stat => {
            stat.playerStats.forEach((playerStat, playerIndex) => {
                gameState!.players[playerIndex].score += calculateScore(playerStat.bid, playerStat.tricks);
            });
        });

        gameState.gameHistory = gameState.gameHistory.slice(0, targetRoundIndex + 1);
        gameState.roundStats = gameState.roundStats.slice(0, targetRoundIndex + 1);
        
        currentBids = [...targetRound.bids];
        currentTricks = [...targetRound.tricks];
        biddingComplete = true;

        gameState.currentRound = {
            number: getCurrentRoundNumber(),
            dealer: getCurrentDealer(),
            bids: currentBids,
            tricks: currentTricks
        };

        await gameService.setGameState(gameCode, gameState);
    }

    function getRoundStatus(roundIndex: number) {
        if (!gameState) return 'future';
        if (roundIndex < currentRoundIndex) return 'completed';
        if (roundIndex === currentRoundIndex) return 'current';
        return 'future';
    }
</script>

{#if isLoading}
    <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
    </div>
{:else if !gameState}
    <div class="error-container">
        <p>Unable to load game. Please try again.</p>
        <button on:click={() => goto('/')}>Return Home</button>
    </div>
{:else}
    <div class="container">
        <div class="round-navigation">
            <h2>Round {getCurrentRoundNumber()}</h2>
            <div class="round-controls">
                <button 
                    class="nav-button" 
                    disabled={gameState.gameHistory.length === 0}
                    on:click={() => goToRound(gameState!.gameHistory.length - 1)}
                >
                    Previous Round
                </button>
                <button 
                    class="nav-button"
                    on:click={() => goto('/')}
                >
                    Home
                </button>
            </div>
        </div>

        <div class="round-sequence">
            {#each gameState.gameConfig.roundSequence as cards, index}
                <div 
                    class="round-indicator"
                    class:completed={getRoundStatus(index) === 'completed'}
                    class:current={getRoundStatus(index) === 'current'}
                >
                    {cards}
                </div>
            {/each}
        </div>

        <div class="game-info">
            <p class="dealer">Dealer: <span class="truncate-text">{gameState.players[getCurrentDealer()].name}</span></p>
            <button class="icon-button" on:click={() => showStats = !showStats}>
                {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
        </div>

        <div class="scoreboard">
            <h3>Rankings</h3>
            <div class="scores">
                {#each [...gameState.players].sort((a, b) => b.score - a.score) as player, i}
                    <div class="score-item" class:leader={i === 0}>
                        <div class="rank">#{i + 1}</div>
                        <div class="player-info">
                            <span class="name truncate-text">{player.name}</span>
                            <span class="score">{player.score} pts</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        {#if showStats && gameState}
            <GameStats {gameState} />
        {/if}

        <div class="round-inputs">
            <div class="input-column">
                <h3>Bids</h3>
                <div class="inputs-list">
                    {#each gameState.players as player, i}
                        <div class="input-row">
                            <span class="player-name truncate-text">{player.name}</span>
                            <div class="number-selector">
                                {#each Array(getCurrentRoundNumber() + 1) as _, num}
                                    <button 
                                        class="number-button"
                                        class:selected={currentBids[i] === num}
                                        disabled={biddingComplete}
                                        on:click={() => currentBids[i] = num}
                                    >
                                        {num}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
                {#if biddingComplete}
                    <button 
                        class="unlock-button"
                        on:click={() => biddingComplete = false}
                    >
                        Unlock Bids
                    </button>
                {:else}
                    <button 
                        on:click={completeBidding}
                    >
                        Lock Bids
                    </button>
                {/if}
            </div>

            <div class="input-column">
                <h3>Tricks Won</h3>
                <div class="inputs-list">
                    {#each gameState.players as player, i}
                        <div class="input-row">
                            <span class="player-name truncate-text">{player.name}</span>
                            <div class="number-selector">
                                {#each Array(getCurrentRoundNumber() + 1) as _, num}
                                    <button 
                                        class="number-button"
                                        class:selected={currentTricks[i] === num}
                                        disabled={!biddingComplete}
                                        on:click={() => currentTricks[i] = num}
                                    >
                                        {num}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
                <button 
                    on:click={completeRound}
                    disabled={!biddingComplete}
                >
                    Complete Round
                </button>
            </div>
        </div>

        {#if error}
            <p class="error">{error}</p>
        {/if}
    </div>
{/if}

<style>
    .container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        font-family: 'Figtree', sans-serif;
    }

    .dealer {
        font-size: 1.2rem;
        font-weight: bold;
        color: #666;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .scoreboard {
        background-color: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }

    .scores {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .score-item {
        display: flex;
        align-items: center;
        padding: 0.8rem;
        background-color: white;
        border-radius: 4px;
        transition: transform 0.2s;
    }

    .score-item:hover {
        transform: translateX(5px);
    }

    .leader {
        background-color: #ffd70020;
        border: 1px solid #ffd700;
    }

    .rank {
        font-size: 1.2rem;
        font-weight: bold;
        color: #666;
        width: 40px;
        text-align: center;
    }

    .player-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
        min-width: 0;
    }

    .name {
        font-weight: 500;
        margin-right: 1rem;
    }

    .score {
        font-weight: bold;
        color: #4CAF50;
    }

    button {
        padding: 1rem 2rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
        font-family: inherit;
        font-size: 1rem;
    }

    button:hover {
        background-color: #45a049;
    }

    .error {
        color: red;
        margin: 1rem 0;
    }

    .round-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .round-controls {
        display: flex;
        gap: 1rem;
    }

    .nav-button {
        padding: 0.5rem 1rem;
        background-color: #6c757d;
        font-size: 0.9rem;
        font-family: inherit;
    }

    .nav-button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    .nav-button:not(:disabled):hover {
        background-color: #5a6268;
    }

    .round-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-top: 2rem;
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
    }

    @media (max-width: 600px) {
        .round-inputs {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 1rem;
        }

        .container {
            padding: 1rem;
            margin: 1rem auto;
        }

        .input-row {
            gap: 0.5rem;
        }
    }

    .input-column {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .inputs-list {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }

    .input-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.8rem;
    }

    .player-name {
        font-weight: 500;
        color: #495057;
        font-size: 1.1rem;
        min-width: 0;
    }

    button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }

    .unlock-button {
        background-color: #dc3545;  /* Bootstrap's danger red */
    }

    .unlock-button:hover {
        background-color: #c82333;
    }

    .game-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .icon-button {
        background-color: #6c757d;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        margin: 0;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
        font-size: 0.9rem;
        font-family: inherit;
    }

    .icon-button:hover {
        background-color: #5a6268;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        gap: 1rem;
        font-family: 'Figtree', sans-serif;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4CAF50;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .error-container {
        text-align: center;
        padding: 2rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .round-sequence {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
        padding: 0.75rem;
        background-color: #ffffff;
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .round-indicator {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        font-weight: 500;
        color: #8f959b;
        font-size: 0.9rem;
    }

    .round-indicator.completed {
        background-color: #e7f3ff;
        color: #0d6efd;
        border-color: #cce5ff;
    }

    .round-indicator.current {
        background-color: #ffffff;
        color: #0d6efd;
        border: 2px solid #0d6efd;
        box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1);
    }

    .number-selector {
        display: flex;
        gap: 0.3rem;
        flex-wrap: wrap;
        width: 100%;
    }

    .number-button {
        width: 2.5rem;
        height: 2.5rem;
        padding: 0;
        margin: 0;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        color: #495057;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }

    .number-button.selected {
        background-color: #4CAF50;
        color: white;
        border-color: #4CAF50;
    }

    .number-button:disabled {
        background-color: #fff;
        border-color: #e9ecef;
        color: #adb5bd;
        opacity: 1;
        cursor: not-allowed;
    }

    .number-button.selected:disabled {
        background-color: #4CAF50;
        color: white;
        opacity: 0.5;
        border-color: #4CAF50;
    }

    .number-button:hover:not(:disabled) {
        background-color: #e9ecef;
        border-color: #ced4da;
    }

    @media (max-width: 600px) {
        .number-button {
            width: 3rem;
            height: 3rem;
            font-size: 1.1rem;
        }

        .input-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.8rem;
        }

        .number-selector {
            width: 100%;
            justify-content: flex-start;
        }
    }

    .truncate-text {
        max-width: 400px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
    }

    @media (max-width: 600px) {
        .truncate-text {
            max-width: 200px;
        }
    }
</style> 
