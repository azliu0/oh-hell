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
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Round</th>
                        {#each gameState.players as player}
                            <th colspan="2">{player.name}</th>
                        {/each}
                    </tr>
                    <tr>
                        <th></th>
                        {#each gameState.players as _}
                            <th>Bid</th>
                            <th>Tricks</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each gameState.roundStats as stat}
                        <tr>
                            <td>{stat.roundNumber}</td>
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

    .table-container {
        overflow-x: auto;
        margin: 1rem 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background-color: white;
    }

    th, td {
        padding: 0.5rem;
        text-align: center;
        border: 1px solid #dee2e6;
    }

    th {
        background-color: #f8f9fa;
    }

    @media (max-width: 768px) {
        .table-container {
            font-size: 0.8rem;
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

    td, th {
        padding: 0.5rem;
        text-align: center;
        border: 1px solid #dee2e6;
    }
</style> 