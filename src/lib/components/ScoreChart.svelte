<script lang="ts">
    import { onMount } from 'svelte';
    import { 
        Chart,
        CategoryScale,
        LinearScale,
        LineElement,
        PointElement,
        Title,
        Legend,
        LineController,
        Tooltip
    } from 'chart.js';

    // Register the required components
    Chart.register(
        CategoryScale,
        LinearScale,
        LineElement,
        PointElement,
        Title,
        Legend,
        LineController,
        Tooltip
    );

    export let data: {
        round: number;
        name: string;
        score: number;
    }[];

    let canvas: HTMLCanvasElement;
    let chart: Chart;

    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40'
    ];

    $: if (canvas && data) {
        updateChart();
    }

    function updateChart() {
        if (chart) {
            chart.destroy();
        }

        const players = [...new Set(data.map(d => d.name))];
        const rounds = [...new Set(data.map(d => d.round))];

        // Define default font settings
        const defaultFont = {
            family: "'Figtree', sans-serif",
            size: 14
        };

        const datasets = players.map((player, index) => ({
            label: player,
            data: rounds.map(round => {
                const entry = data.find(d => d.name === player && d.round === round);
                return entry ? entry.score : 0;
            }),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length],
            tension: 0.1
        }));

        chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: rounds,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Score Progression',
                        font: { 
                            ...defaultFont,
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: defaultFont
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                return `Round ${context[0].label}`;
                            },
                            label: (context) => {
                                const playerName = context.dataset.label;
                                const score = context.parsed.y;
                                return `${playerName}: ${score} points`;
                            },
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            ...defaultFont,
                            weight: 'bold'
                        },
                        bodyFont: defaultFont,
                        footerFont: defaultFont,
                        footerColor: '#fff',
                        displayColors: true,
                        multiKeyBackground: '#fff'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Round',
                            font: defaultFont
                        },
                        ticks: {
                            font: defaultFont
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Score',
                            font: defaultFont
                        },
                        ticks: {
                            font: defaultFont
                        }
                    }
                }
            }
        });
    }

    onMount(() => {
        if (data) {
            updateChart();
        }
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    });
</script>

<div class="chart-container">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .chart-container {
        height: 400px;
        width: 100%;
    }
</style> 