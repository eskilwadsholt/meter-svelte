<script>
    import { LinearScale } from "./graphTools.js";

    export let xmin = 0;
    export let xmax = 30;
    export let zoomMin = 0.25;
    const window = {
        mid: (xmin + xmax) / 2,
        half: (xmax - xmin) / 2,
        zoom: 1,
    }
    let width, height;
    let stepSizes = { minor: 1, major: 5 };
    let labels = { minor: x => x, major: x => x };
    let tickSizes = { minor: 5, major: 15 };
    $: yPos = 75;
    let axisLine, axisMajorTicks, axisMinorTicks, topMark, bottomMark, indicatorLine;
    let majorTexts = [], minorTexts = [];
    const scales = { x: new LinearScale() };
    $: if (width && height) {
        const w = {
            xmin: window.mid - window.half * window.zoom,
            xmax: window.mid + window.half * window.zoom,
        }
        scales.x
            .domain([w.xmin, w.xmax])
            .range([20, width - 20]);
        topMark = `${width / 2 - 10} 10 ${width / 2 + 10}`
                    + ` 10 ${width / 2} 20`;
        bottomMark = `${width / 2 - 10} ${yPos + 25} ${width / 2 + 10}` 
                       + ` ${yPos + 25} ${width / 2} ${yPos + 15}`;
        indicatorLine = `M ${width / 2} 10 L ${width / 2} ${yPos + 25}`;
        console.log(topMark);
        axisLine = `M ${scales.x.map(xmin)} ${yPos} L ${scales.x.map(xmax)} ${yPos}`;
        minorTexts = [];
        majorTexts = [];
        axisMinorTicks = "";
        axisMajorTicks = "";
        for (let x = xmin; x <= xmax; x += stepSizes.minor) {
            const isMajor = (x - xmin) % stepSizes.major === 0;
            const tickSize = isMajor ? tickSizes.major
                : tickSizes.minor / Math.sqrt(window.zoom);
            const label = isMajor ? labels.major : labels.minor;
            if (isMajor) {
                axisMajorTicks += `M ${scales.x.map(x)} ${yPos} `
                                + `L ${scales.x.map(x)} ${yPos - tickSize}`;
                majorTexts.push({ 
                    x: scales.x.map(x), 
                    y: yPos - tickSize - 5,
                    label: label(x),
                });
            } else {
                axisMinorTicks += `M ${scales.x.map(x)} ${yPos} `
                                + `L ${scales.x.map(x)} ${yPos - tickSize}`;
                minorTexts.push({ 
                    x: scales.x.map(x), 
                    y: yPos - tickSize - 5,
                    label: label(x),
                });
            }
        }
    }
    let lastTouch = {};
    function handleTouchstart(e) {
        e.preventDefault();
        lastTouch.x = e.touches[0].clientX;
        lastTouch.y = e.touches[0].clientY;
    }
    function handleTouchmove(e) {
        e.preventDefault();
        const newTouch = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
        const dx = scales.x.invert(newTouch.x) - scales.x.invert(lastTouch.x);
        const dy = newTouch.y - lastTouch.y;
        window.mid = clamp(window.mid - dx, xmin, xmax);
        lastTouch = { ...newTouch };
        window.zoom = clamp(window.zoom * Math.pow(2, 0.05 * dy), zoomMin, 1);
    }
    function clamp(val, min, max) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }
</script>

<div class="meter" bind:clientWidth={width} bind:clientHeight={height}
    on:touchstart={handleTouchstart}
    on:touchmove={handleTouchmove}>
    <div class="info">
        This is a meter
    </div>
    <svg>
        <rect {width} height={yPos + 35} fill="#333"></rect>
        <path class="indicator" d={indicatorLine}></path>
        <polygon points={topMark}></polygon>
        <polygon points={bottomMark}></polygon>
        <g class="axes">
            <path d={axisLine}></path>
            <path class="minor-ticks" d={axisMinorTicks}></path>
            <path d={axisMajorTicks}></path>
        </g>
        <g class="labels">
            {#each majorTexts as T}
                <text class="major" x={T.x} y={T.y}>{T.label}</text>
            {/each}
            {#each minorTexts as T}
                <text class="minor" style={`font-size: ${0.5 / Math.sqrt(window.zoom)}em`} 
                    x={T.x} y={T.y}>{T.label}</text>
            {/each}
        </g>
    </svg>
</div>

<style>
    .info {
        position: absolute;
        top: 10px;
        left: 10px;
        color: #888;
    }
    .meter {
        position: relative;
        width: 100%;
        height: 100%;
    }
    svg {
        width: 100%;
        height: 100%;
        background: #0C0C0C;
    }
    path {
        stroke: white;
        stroke-width: 1px;
    }
    path.minor-ticks {
        stroke-width: 0.5px;
    }
    path.indicator {
        stroke: rgba(252, 0, 0, 0.7);
    }
    text.major {
        fill: red;
        text-anchor: middle;
        font-size: 1em;
    }
    text.minor {
        fill: gray;
        text-anchor: middle;
    }
    polygon {
        fill: gray;
    }
</style>