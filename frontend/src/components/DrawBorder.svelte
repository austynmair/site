<script>
	// Props
	export let borderRadius = '0px'
	export let initialColor = 'white'
	export let endColor = 'purple'
	export let startingDeg = 90
	
	// State
	let tick = 0;	
	let gradientState = `${initialColor}, ${initialColor}`
	let interval
	
	// Logic
	const createGradient = (deg) => `from ${startingDeg}deg, ${endColor} ${deg}deg, ${initialColor} ${deg}deg`;
	
	const animation = (dir) => {
			clearInterval(interval)
			interval = setInterval(() => {
				tick <= 360 ? 
					gradientState = createGradient(tick) :
			  	gradientState = `${endColor}, ${endColor}`;
					if(dir === 'fwd') tick = tick + 3
					if(dir === 'rev') tick = tick - 3
			}, 0.001)
	}
	
	$: if(tick >= 361) tick = 360
	$: if(tick < 0) tick = 0
</script>

<div on:mouseenter={() => animation('fwd')}
		 on:mouseleave={() => animation('rev')}
		 style:background-color={initialColor}
		 style:background={`conic-gradient(${gradientState})`}
		 style:border-radius={borderRadius}
		 style="max-width: max-content;"
>
	<div style="border-radius: calc({borderRadius} - 2px); border: 2px solid transparent;">
		<slot/>		
	</div>
</div>