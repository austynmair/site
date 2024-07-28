<script>
  // https://stordahl.dev/writing/drawn-border-animation-conic-gradient-svelte
  export let initialColor;
  export let endColor;
  export let borderRadius;
  export let startingDeg;

  let gradientState = `${initialColor}, ${initialColor}`;
  let tick = 0;
  let interval = undefined;

  const createGradient = (deg) =>
    `from ${startingDeg}deg, ${endColor} ${deg}deg, ${initialColor} ${deg}deg`;

  const animation = (dir) => {
    clearInterval(interval);
    interval = setInterval(() => {
      tick <= 360
        ? (gradientState = createGradient(tick))
        : (gradientState = `${endColor}, ${endColor}`);
      if (dir === "fwd") tick = tick + 3;
      if (dir === "rev") tick = tick - 3;
    }, 0.001);
  };

  $: if (tick >= 361) tick = 360;
  $: if (tick < 0) tick = 0;
</script>

<div
  on:mouseenter={() => animation("fwd")}
  on:mouseleave={() => animation("rev")}
  style:border-radius={borderRadius}
  style="max-width: max-content;"
  style:background-color={initialColor}
  style:background={`conic-gradient(${gradientState})`}
>
  <div
    style="
        border-radius: calc({borderRadius} - 2px); 
        border: 2px solid transparent;"
  >
    <slot />
  </div>
</div>
