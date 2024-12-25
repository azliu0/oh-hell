<script>
    import { getContext } from 'svelte';

    const { data, xGet, yGet, path } = getContext('LayerCake');

    export let stroke;
</script>

<path
    class='path-line'
    d={$path($data)}
    {stroke}
    fill='none'
    stroke-width='2'
/>

<style>
    .path-line {
        stroke-linejoin: round;
        stroke-linecap: round;
    }
</style> 