<script>
import Meter from "./meter/Meter.svelte";

	
</script>

<div id="root">
	<main>
		<div class="meter-container">
			<Meter/>
		</div>
	</main>
	<div class="empty"></div>
</div>

<style>
	.meter-container {
		height: 80%;
	}
	#root {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
	}
	main {
		--border-color: rgba(255, 255, 255, 0.1);
		width: 375px;
		height: 545px;
		box-sizing: content-box;
		border: 1px solid var(--border-color);
		box-shadow: 0 0 5px var(--border-color);
		background: #1C1C1C;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		position: fixed;
	}
</style>