<script>
    import { getContext } from 'svelte';
    
    const { xScale, yRange } = getContext('LayerCake');

    export let gridlines = false;
    export let baseline = false;
    export let tickCount = 5;

    $: ticks = $xScale.ticks(tickCount);

    $: range = $yRange;
</script>

{#if gridlines}
    {#each ticks as tick}
        <line
            class="gridline"
            x1={$xScale(tick)}
            x2={$xScale(tick)}
            y1={range[0]}
            y2={range[1]}
        />
    {/each}
{/if}

{#if baseline}
    <line
        class="baseline"
        x1={$xScale.range()[0]}
        x2={$xScale.range()[1]}
        y1={range[1]}
        y2={range[1]}
    />
{/if}

{#each ticks as tick}
    <g transform="translate({$xScale(tick)},{range[1]})">
        <text y='16' text-anchor='middle'>
            {tick}
        </text>
    </g>
{/each}

<style>
    .gridline {
        stroke: #ddd;
        stroke-dasharray: 2;
    }
    .baseline {
        stroke: #888;
    }
    text {
        font-size: 12px;
        fill: #666;
    }
</style> 