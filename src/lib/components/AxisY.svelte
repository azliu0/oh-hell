<script>
    import { getContext } from 'svelte';
    
    const { yScale, xRange } = getContext('LayerCake');

    export let gridlines = true;
    export let tickCount = 5;

    $: ticks = $yScale.ticks(tickCount);
    $: range = $xRange;
</script>

{#if gridlines}
    {#each ticks as tick}
        <line
            class="gridline"
            x1={range[0]}
            x2={range[1]}
            y1={$yScale(tick)}
            y2={$yScale(tick)}
        />
    {/each}
{/if}

{#each ticks as tick}
    <g transform="translate({range[0]},{$yScale(tick)})">
        <text x='-9' dy='.32em' text-anchor='end'>
            {tick}
        </text>
    </g>
{/each}

<style>
    .gridline {
        stroke: #ddd;
        stroke-dasharray: 2;
    }
    text {
        font-size: 12px;
        fill: #666;
    }
</style> 