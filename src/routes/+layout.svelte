<script>
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>LoLdle</title>
  <meta name="description" content="Guess the League of Legends champion" />
</svelte:head>

{@render children()}
