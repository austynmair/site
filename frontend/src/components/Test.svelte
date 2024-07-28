<script>
	import DrawBorder from './DrawBorder.svelte';
	let text = 'Submit';
</script>

<h1>Draw Border Animation</h1>
<p>Hover to see the animation!</p>

<div class="flex-col">
	
	<!-- Rounded with Purple & White Stroke -->
	<DrawBorder borderRadius="100px">
		<button>{text}</button>
	</DrawBorder>
	
	<!-- Square with Red & Blue Stroke -->
	<DrawBorder 
		initialColor="red" 
		endColor="blue" 
		startingDeg={180}
	>
		<button>{text}</button>
	</DrawBorder>
	
	<!-- Slightly Rounded with White & Green Stroke -->
	<DrawBorder 
		borderRadius="10px" 
		initialColor="green" 
		endColor="white" 
		startingDeg={280}
	>
		<button>{text}</button>
	</DrawBorder>

</div>
<hr/>
<section>
<h2>
	Update Demo State
	</h2>
	<div class="flex-col">
		<label for="labelText">Change Button Text</label>
		<input name="labelText" type="text" bind:value={text}/>
</div>
</section>

<style>
	/* Styles for Demo */
	button {
		border-radius: inherit;
		font: 400 16px 'Open Sans', sans-serif;
		color: #000000;
    padding: 6px 16px;
		background-color: #ffffff;
		box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
		margin: 0;
	}
	
	h1, h2, p {
		text-align: center;
	}
	
	.flex-col {
		display: flex; 
		flex-direction: column; 
		align-items: center; 
		gap: 1.2rem;
		margin-bottom: 20px
	}
</style>