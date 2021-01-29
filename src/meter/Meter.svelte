<script>
    import { LinearScale } from "./graphTools.js";

    export let xmin = 0;
    export let xmax = 30;
    export let zoomMin = 0.15;
    export let zoomMax = 1;
    const window = {
        mid: (xmin + xmax) / 2,
        half: (xmax - xmin) / 2,
        zoom: 1,
    }
    let width, height;
    const stepSizes = { minor: 1, major: 5 };
    const tickSizes = { minor: 5, major: 15 };
    const tinySteps = { minor: 0.1, major: 0.5 };
    const tinyScales = {
        minor: new LinearScale()
            .setDomain([zoomMax, zoomMin])
            .setRange([0, 7]),
        major: new LinearScale()
            .setDomain([zoomMax, zoomMin])
            .setRange([0, 10]),
        thickness: new LinearScale()
            .setDomain([zoomMax, zoomMin])
            .setRange([0, 0.5]),
    };
    const labels = { minor: x => x, major: x => x };
    const yPos = 60;
    let axisLine, axisMajorTicks, axisMinorTicks, axisTinyTicks;
    let topMark, bottomMark, indicatorLine;
    let majorTexts = [], minorTexts = [];
    const scales = {
        x: new LinearScale(),
        minorFont: new LinearScale()
            .setDomain([zoomMax, zoomMin])
            .setRange([0.5, 1]),
        minorTick: new LinearScale()
            .setDomain([zoomMax, zoomMin])
            .setRange([tickSizes.minor, tickSizes.major]),
        minorThickness: new LinearScale()
            .setDomain([zoomMax, zoomMin])
            .setRange([0.5, 1]),
    };
    $: if (width && height) {
        const xlims = {
            xmin: window.mid - window.half * window.zoom,
            xmax: window.mid + window.half * window.zoom,
        }
        scales.x
            .setDomain([xlims.xmin, xlims.xmax])
            .setRange([20, width - 20]);
        topMark = `${width / 2 - 10} 5 ${width / 2 + 10}`
                    + ` 5 ${width / 2} 15`;
        bottomMark = `${width / 2 - 10} ${yPos + 20} ${width / 2 + 10}` 
                       + ` ${yPos + 20} ${width / 2} ${yPos + 10}`;
        indicatorLine = `M ${width / 2} 5 L ${width / 2} ${yPos + 20}`;
        axisLine = `M ${scales.x.map(xmin)} ${yPos} L ${scales.x.map(xmax)} ${yPos}`;
        minorTexts = [];
        majorTexts = [];
        axisMinorTicks = "";
        axisMajorTicks = "";
        axisTinyTicks = "";
        for (let x = xmin; x <= xmax; x += tinySteps.minor) {
            // Fix floating point error
            x = Number(x.toFixed(1));
            const isMajor = x % stepSizes.major === 0;
            const isMinor = x % stepSizes.minor === 0;
            const isTinyMajor = x % tinySteps.major === 0;
            //const tickSize = isMajor ? tickSizes.major
            //    : scales.minorTick.map(window.zoom);
            //const label = isMajor ? labels.major : labels.minor;
            if (isMajor) {
                const tickSize = tickSizes.major;
                axisMajorTicks += `M ${scales.x.map(x)} ${yPos} `
                                + `L ${scales.x.map(x)} ${yPos - tickSize}`;
                majorTexts.push({ 
                    x: scales.x.map(x), 
                    y: yPos - tickSize - 5,
                    label: x,
                });
            } else if (isMinor) {
                const tickSize = scales.minorTick.map(window.zoom);
                axisMinorTicks += `M ${scales.x.map(x)} ${yPos} `
                                + `L ${scales.x.map(x)} ${yPos - tickSize}`;
                minorTexts.push({ 
                    x: scales.x.map(x), 
                    y: yPos - tickSize - 5,
                    label: x,
                });
            } else if (isTinyMajor) {
                const tickSize = tinyScales.major.map(window.zoom);
                axisTinyTicks += `M ${scales.x.map(x)} ${yPos} `
                                + `L ${scales.x.map(x)} ${yPos - tickSize}`;
            } else {
                const tickSize = tinyScales.minor.map(window.zoom);
                axisTinyTicks += `M ${scales.x.map(x)} ${yPos} `
                                + `L ${scales.x.map(x)} ${yPos - tickSize}`;
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
        window.mid = clamp(window.mid - 2 * dx, xmin, xmax);
        lastTouch = { ...newTouch };
        window.zoom = clamp(window.zoom * Math.pow(2, 0.03 * dy), zoomMin, zoomMax);
    }
    function handleTouchend(e) {
        e.preventDefault();
        window.mid = Math.round(window.mid * 10) / 10;
    }
    function clamp(val, min, max) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }
</script>

<div class="flex-container">
    <div class="value">{window.mid.toFixed(1)}</div>
    <div class="meter" bind:clientWidth={width} bind:clientHeight={height}
        on:touchstart={handleTouchstart}
        on:touchmove={handleTouchmove}
        on:touchend={handleTouchend}>
        <svg>
            <path class="indicator" d={indicatorLine}></path>
            <polygon points={topMark}></polygon>
            <polygon points={bottomMark}></polygon>
            <g class="axes">
                <path class="tiny-ticks" 
                    style={`stroke-width:${tinyScales.thickness.map(window.zoom)}`} 
                    d={axisTinyTicks}></path>
                <path class="minor-ticks"
                    style={`stroke-width:${scales.minorThickness.map(window.zoom)}`} 
                    d={axisMinorTicks}></path>
                <path d={axisMajorTicks}></path>
                <path d={axisLine}></path>
            </g>
            <g class="labels">
                {#each majorTexts as T}
                    <text class="major" x={T.x} y={T.y}>{T.label}</text>
                {/each}
                {#each minorTexts as T}
                    <text class="minor"
                        style={`font-size:${scales.minorFont.map(window.zoom)}em`} 
                        x={T.x} y={T.y}>{T.label}</text>
                {/each}
            </g>
        </svg>
        <div class="zoom-picto">
            <div class="zoom-direction">
                &#8593;
                <div class="zoom-plus">&plus;</div>
            </div>
            <div class="zoom-symbol">
                &#9906;
            </div>
            <div class="zoom-direction">
                <div class="zoom-minus">&minus;</div>
                &#8595;
            </div>
        </div>
    </div>
</div>

<style>
    .zoom-direction {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .zoom-plus, .zoom-minus {
        font-size: 0.5em;
        margin: -0.5em;
    }
    .zoom-picto {
        position: absolute;
        color: gray;
        font-size: 2.5em;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
    }
    .zoom-symbol {
        -webkit-transform: rotate(45deg); 
           -moz-transform: rotate(45deg); 
             -o-transform: rotate(45deg);
                transform: rotate(45deg);
    }
    .value {
        font-size: 4em;
        color: whitesmoke;
        padding: 20px;
    }
    .flex-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
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