<script lang="ts">
    import type { GameState } from '$lib/types';
    import ScoreChart from './ScoreChart.svelte';
    
    export let gameState: GameState;

    $: chartData = gameState.roundStats.flatMap(stat => 
        stat.playerStats.map(playerStat => ({
            round: stat.roundNumber,
            name: playerStat.name,
            score: playerStat.score
        }))
    );
</script>

<div class="statistics">
    <div class="chart-section">
        <h3>Score Progression</h3>
        {#if gameState.roundStats.length > 0}
            <ScoreChart data={chartData} />
        {:else}
            <p class="no-data">No rounds completed</p>
        {/if}
    </div>

    <div class="rounds-table">
        <h3>Round History</h3>
        <div class="table-wrapper">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th class="sticky-col">Round</th>
                            {#each gameState.players as player}
                                <th colspan="2" class="truncate-text">{player.name}</th>
                            {/each}
                        </tr>
                        <tr>
                            <th class="sticky-col"></th>
                            {#each gameState.players as _}
                                <th>Bid</th>
                                <th>Tricks</th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each gameState.roundStats as stat}
                            <tr>
                                <td class="sticky-col">{stat.roundNumber}</td>
                                {#each stat.playerStats as playerStat}
                                    <td class:correct-bid={playerStat.bid === playerStat.tricks}
                                        class:incorrect-bid={playerStat.bid !== playerStat.tricks}>
                                        {playerStat.bid}
                                    </td>
                                    <td class:correct-bid={playerStat.bid === playerStat.tricks}
                                        class:incorrect-bid={playerStat.bid !== playerStat.tricks}>
                                        {playerStat.tricks}
                                    </td>
                                {/each}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<style>
    .statistics {
        margin: 2rem 0;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 8px;
    }

    .chart-section {
        margin-bottom: 2rem;
        padding: 1rem;
        background-color: white;
        border-radius: 8px;
    }

    .no-data {
        text-align: center;
        color: #666;
        padding: 2rem;
    }

    .table-wrapper {
        position: relative;
        margin: 1rem -1rem;
        padding: 0 1rem;
    }

    .table-container {
        overflow-x: auto;
        margin: 1rem 0;
        position: relative;
        border-radius: 4px;
        background-color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        background-color: white;
        min-width: 600px; /* Ensures minimum width for better mobile view */
    }

    th, td {
        padding: 0.75rem 1rem;
        text-align: center;
        border: none;
        border-bottom: 1px solid #dee2e6;
        white-space: nowrap;
    }

    th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #495057;
        border-bottom: 2px solid #dee2e6;
    }

    .sticky-col {
        position: sticky;
        left: 0;
        z-index: 3;
        border-right: 2px solid #dee2e6;
        background-color: #fff;
    }

    th.sticky-col {
        background-color: #f8f9fa;
        z-index: 4;
    }

    tr:hover td {
        background-color: #f8f9fa;
    }

    tr:hover td.sticky-col {
        background-color: #f2f2f2;
        z-index: 3;
    }

    @media (max-width: 768px) {
        .table-container {
            font-size: 0.9rem;
        }

        th, td {
            padding: 0.5rem 0.75rem;
        }
    }

    h3 {
        margin-bottom: 1rem;
        color: #2c3e50;
    }

    .correct-bid {
        background-color: rgba(75, 181, 67, 0.1);
    }

    .incorrect-bid {
        background-color: rgba(220, 53, 69, 0.1);
    }

    tr:hover td.correct-bid {
        background-color: rgba(75, 181, 67, 0.15);
    }

    tr:hover td.incorrect-bid {
        background-color: rgba(220, 53, 69, 0.15);
    }

    .truncate-text {
        max-width: 120px; /* Adjust this value as needed */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style> 