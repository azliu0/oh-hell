<script lang="ts">
    import { goto } from '$app/navigation';
    import { generateGameCode } from '$lib/utils';
    import { GameType } from '$lib/types';
    import { createGame } from '$lib/services/gameService';
    
    let numPlayers = 2;
    let playerNames: string[] = Array(numPlayers).fill('');
    let error = '';
    
    // New game configuration state
    let gameType = GameType.ASCENDING;
    let minRound = 1;
    let maxRound = 13;
    let customSequence = '';
    
    function updatePlayerCount(newCount: number) {
        numPlayers = newCount;
        playerNames = Array(numPlayers).fill('');
    }

    function validateConfig(sequence: number[]): string | null {
        if (maxRound * numPlayers > 52) {
            return 'Maximum round x number of players cannot exceed 52 cards';
        }

        if (sequence.length === 0) {
            return 'Please enter a valid round sequence';
        }

        return null;
    }

    function generateRoundSequence(): number[] {
        switch (gameType) {
            case GameType.ASCENDING:
                return Array.from({ length: maxRound - minRound + 1 }, 
                    (_, i) => i + minRound);
            
            case GameType.ASCENDING_DESCENDING: {
                const ascending = Array.from(
                    { length: maxRound - minRound + 1 }, 
                    (_, i) => i + minRound
                );
                const descending = [...ascending].reverse().slice(1);
                return [...ascending, ...descending];
            }
            
            case GameType.CUSTOM:
                return customSequence
                    .split(',')
                    .map(n => parseInt(n.trim()))
                    .filter(n => !isNaN(n));
            
            default:
                return [];
        }
    }

    async function startGame() {
        // Existing name validation
        if (playerNames.some(name => !name.trim())) {
            error = 'All players must have names';
            return;
        }
        
        if (new Set(playerNames).size !== playerNames.length) {
            error = 'All player names must be unique';
            return;
        }

        // New config validation
        const sequence = generateRoundSequence();
        const configError = validateConfig(sequence);
        if (configError) {
            error = configError;
            return;
        }

        // Generate game code and navigate
        const gameCode = generateGameCode();
        await createGame(gameCode, playerNames.map(name => ({ name, score: 0 })), {
            gameType: gameType,
            minRound: minRound,
            maxRound: maxRound,
            roundSequence: sequence
        });
        goto(`/${gameCode}/game`);
    }
</script>

<div class="container">
    <h1>🃏 Oh Hell</h1>
    
    <div class="setup-form">
        <section class="game-config">
            <h2>Config</h2>
            <!-- Game Type Selection -->
            <label>
                Game Type:
                <select bind:value={gameType}>
                    <option value={GameType.ASCENDING}>Ascending</option>
                    <option value={GameType.ASCENDING_DESCENDING}>Ascending-Descending</option>
                    <option value={GameType.CUSTOM}>Custom Sequence</option>
                </select>
            </label>

            {#if gameType !== GameType.CUSTOM}
                <div class="round-config">
                    <label>
                        Minimum Round:
                        <input 
                            type="number" 
                            bind:value={minRound} 
                            min="1" 
                            max={maxRound}
                        />
                    </label>
                    
                    <label>
                        Maximum Round:
                        <input 
                            type="number" 
                            bind:value={maxRound} 
                            min={minRound} 
                            max="20"
                        />
                    </label>
                </div>
            {:else}
                <label>
                    Custom Round Sequence:
                    <input 
                        type="text" 
                        bind:value={customSequence}
                        placeholder="Enter rounds separated by commas (e.g., 1,2,3,2,1)"
                    />
                </label>
            {/if}
        </section>

        <section class="player-config">
            <h2>Players</h2>
            <label>
                Number of Players:
                <select 
                    bind:value={numPlayers}
                    on:change={() => updatePlayerCount(numPlayers)}
                >
                    {#each Array(6) as _, i}
                        <option value={i + 2}>{i + 2}</option>
                    {/each}
                </select>
            </label>
            
            <div class="player-names">
                {#each playerNames as _, i}
                    <label>
                        Player {i + 1}:
                        <input 
                            type="text"
                            bind:value={playerNames[i]}
                            placeholder="Enter name"
                        />
                    </label>
                {/each}
            </div>
        </section>

        {#if error}
            <p class="error">{error}</p>
        {/if}

        <button on:click={startGame}>Start Game</button>
    </div>
</div>

<style>
    .container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        text-align: center;
        font-family: 'Figtree', sans-serif;
    }

    h1 {
        font-size: 3rem;
        margin-bottom: 2rem;
    }

    .setup-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .player-names {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        text-align: left;
    }

    input, select {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        font-family: 'Figtree', sans-serif;
    }

    button {
        padding: 1rem 2rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1.1rem;
        cursor: pointer;
        transition: background-color 0.2s;
        font-family: 'Figtree', sans-serif;
    }

    button:hover {
        background-color: #45a049;
    }

    .error {
        color: red;
        margin: 0;
    }

    .round-config {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    section h2 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #2c3e50;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e9ecef;
    }

    .game-config, .player-config {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .setup-form {
        gap: 2rem;
    }
</style>
