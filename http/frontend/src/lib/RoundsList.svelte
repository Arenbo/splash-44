<script>
  export let rounds = [];
</script>

{#each rounds as round}
<div class="mb-2">
  <h6>ROUND {round.roundNum}</h6>
  <p>Secret number: {round.roundSecret}</p>
  <p>Player 1: Guessed: {round.player1Num}, Credit: {round.player1Rank}</p>
  <p>Player 2: Guessed: {round.player2Num}, Credit: {round.player2Rank}</p>
  <p>Player 3: Guessed: {round.player3Num}, Credit: {round.player3Rank}</p>
  <p>Player 4: Guessed: {round.player4Num}, Credit: {round.player4Rank}</p>
  <p>You: Guessed: {round.playerYNum}, Credit: {round.playerYRank}</p>
</div>
{/each}
