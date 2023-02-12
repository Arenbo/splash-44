<script>
	import { onMount } from 'svelte';
  import CmpntRoundsList from './lib/RoundsList.svelte';
	import store from './lib/store.js';
  import * as PIXI from 'pixi.js';

  let pixiApp;
  let notificationInputHidden = true;
  let notificationSecTillNewRoundHidden = true;
  let submitBtnDisabled = false;
  let secTillNewRound = '10';

  let rounds = [];
  let roundNum = 0;
  let rounds2Show = [];
  let need2Animate = false;

	let messages = [];
  let message = '';

  let credits = {
    p1: 100,
    p2: 100,
    p3: 100,
    p4: 100,
    pY: 100
  };

  // needed to set coords of objects
  let pixObj = {
    p1pos: 50,
    p2pos: 50,
    p3pos: 50,
    p4pos: 50,
    pYpos: 50,
    pSposNew: 50,
    pSposOld: 50
  };

	onMount(() => {
    let pixiContent = document.getElementById("pixi-content");
    let displayWidth = pixiContent.clientWidth;
    let displayHeight = pixiContent.clientHeight;
    pixiApp = new PIXI.Application({ width: displayWidth, height: displayHeight });
    pixiContent.appendChild(pixiApp.view);

    console.log('displayWidth', displayWidth);

    //will be used to calculate positions and width of the objects
    let pixiMinCoord = 50;
    let pixiMaxDist = displayWidth - pixiMinCoord * 2;

    const p0Text = new PIXI.Text('0', {
     fontFamily: 'Arial',
     fontSize: 20,
     fill: 0xff1010,
     align: 'center',
    });
    p0Text.x = 50;
    p0Text.y = 20;
    pixiApp.stage.addChild(p0Text);
    const p9Text = new PIXI.Text('9.9', {
     fontFamily: 'Arial',
     fontSize: 20,
     fill: 0xff1010,
     align: 'center',
    });
    p9Text.x = displayWidth - 30;
    p9Text.y = 20;
    pixiApp.stage.addChild(p9Text);

    const pSRectBg = new PIXI.Graphics()
    .beginFill(0xffffff)
    .drawRect(0, 70, displayWidth, 5);
    pixiApp.stage.addChild(pSRectBg);
    const pSRect = new PIXI.Graphics()
    .beginFill(0xffffff)
    .drawRect(pixiMinCoord, 45, 5, 20);
    pixiApp.stage.addChild(pSRect);

    const p1Rect = new PIXI.Graphics()
    .beginFill(0xff00ff)
    .drawRect(pixiMinCoord, 75, 5, 20);
    pixiApp.stage.addChild(p1Rect);

    const p2Rect = new PIXI.Graphics()
    .beginFill(0x0000ff)
    .drawRect(pixiMinCoord, 75, 5, 20);
    pixiApp.stage.addChild(p2Rect);

    const p3Rect = new PIXI.Graphics()
    .beginFill(0xffff00)
    .drawRect(pixiMinCoord, 75, 5, 20);
    pixiApp.stage.addChild(p3Rect);

    const p4Rect = new PIXI.Graphics()
    .beginFill(0xff0000)
    .drawRect(pixiMinCoord, 75, 5, 20);
    pixiApp.stage.addChild(p4Rect);

    const pYRect = new PIXI.Graphics()
    .beginFill(0x00ff00)
    .drawRect(pixiMinCoord, 75, 5, 20);
    pixiApp.stage.addChild(pYRect);

    let elapsed = 0.0;
    let elapsedDirection = 1;
    pixiApp.ticker.add((delta) => {
      if (need2Animate) {
        // submitBtnDisabled = true;
        let pSpos;
        // elapsed += delta * 0.5;
        elapsed += delta * 1.0;
        if (elapsedDirection==1) {
          pSpos = pixObj.pSposOld + elapsed;
          if (pSpos>pixObj.pSposNew) {
            need2Animate = false;
          }
        } else {
          pSpos = pixObj.pSposOld - elapsed;
          if (pSpos<pixObj.pSposNew) {
            need2Animate = false;
          }
        }

        // console.log('pixi run', pixObj.pSposOld, pixObj.pSposNew, pSpos);

        pSRect.x = pSpos;
        p1Rect.x = pixObj.p1pos;
        p2Rect.x = pixObj.p2pos;
        p3Rect.x = pixObj.p3pos;
        p4Rect.x = pixObj.p4pos;
        pYRect.x = pixObj.pYpos;
      }
      else {
        // submitBtnDisabled = false;
      }
    });


    store.subscribe(currentMessage => {
        // console.log('1 -> ', messages);
        console.log('2 -> ', currentMessage);

				messages = [...messages, currentMessage];

        rounds = [];

        for (let index = 0; index < messages.length; index++) {
          const element = messages[index];
          if (element.status=='ok') {
            need2Animate = true;
            roundNum = element.result.roundNum;
            rounds.push({
              roundNum: element.result.roundNum,
              roundSecret: element.result.roundSecret,
              player1Rank: element.result.p1.rank,
              player1Num: element.result.p1.num,
              player2Rank: element.result.p2.rank,
              player2Num: element.result.p2.num,
              player3Rank: element.result.p3.rank,
              player3Num: element.result.p3.num,
              player4Rank: element.result.p4.rank,
              player4Num: element.result.p4.num,
              playerYRank: element.result.pY.rank,
              playerYNum: element.result.pY.num
            });

            credits.p1 = element.result.p1.rank;
            credits.p2 = element.result.p2.rank;
            credits.p3 = element.result.p3.rank;
            credits.p4 = element.result.p4.rank;
            credits.pY = element.result.pY.rank;

            // old position
            pixObj.pSposOld = parseFloat(pixObj.pSposNew);
            pixObj.pSposNew = pixiMinCoord + pixiMaxDist * element.result.roundSecret / 10;
            pixObj.p1pos = pixiMinCoord + pixiMaxDist * element.result.p1.num / 10;
            pixObj.p2pos = pixiMinCoord + pixiMaxDist * element.result.p2.num / 10;
            pixObj.p3pos = pixiMinCoord + pixiMaxDist * element.result.p3.num / 10;
            pixObj.p4pos = pixiMinCoord + pixiMaxDist * element.result.p4.num / 10;
            pixObj.pYpos = pixiMinCoord + pixiMaxDist * element.result.pY.num / 10;

            elapsed = 0.0;
            elapsedDirection = 1;
            if (pixObj.pSposNew<pixObj.pSposOld) {
              elapsedDirection = -1;
            }
            // console.log('pixi set', elapsedDirection, pixObj.pSposNew, pixObj.pSposOld);
            // console.log('pixiMaxDist', pixiMinCoord, pixiMaxDist);
            // console.log('pixiMaxDist', element.result.pY.num, element.result.pY.num / 10, pixiMaxDist * element.result.pY.num / 10);
            // console.log('pixiMaxDist', pixiMaxDist, pixObj.pYpos);
            // console.log('pixiMaxDist', pixiMaxDist, pixObj);

            rounds2Show = [...rounds].reverse();
          }
          else {
            // we can add additional logic here if needed
          }
        }
		})
	});

  const handleSendMessage = () => {
    notificationInputHidden = true;
    const messageNum = parseInt(message);
    if (isNaN(messageNum)) {
      notificationInputHidden = false;
    }
    else {
      if (messageNum<10) {
        store.sendMessage(message);
        startTimer();
        message = '';
      }
      else {
        notificationInputHidden = false;
      }    
    }
  }
  function handleNotificationInputClose() {
    notificationInputHidden = true;
  }

  function startTimer() {
    let sec2Wait = 10;
    let secFromStart = 0;
    let secIntrvl = 500;

    submitBtnDisabled = true;
    notificationSecTillNewRoundHidden = false;

    let intrvl = setInterval(function() {
      secTillNewRound = parseInt(10 - secFromStart).toString();
      secFromStart += secIntrvl / 1000;
      if (secFromStart>sec2Wait) {
        submitBtnDisabled = false;
        notificationSecTillNewRoundHidden = true;
        clearInterval(intrvl);
      }
    }, secIntrvl);
  }
</script>

<main>
  <nav class="navbar is-primary">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        Splash 44 game
      </a>
    </div>
  </nav>
  <section class="section">
    <div class="columns">
      <div class="column">
        <div class="container" id="pixi-content">
        </div>

        <div class="container mt-4">
          <h1 class="is-size-4 has-text-centered">Rounds</h1>

{#if rounds2Show.length > 0}
          <div class="rounds">
            <CmpntRoundsList rounds={rounds2Show}/>
          </div>
{:else}
          <div class="rounds">
            Not yet started
          </div>
{/if}


        </div>
      </div>
      <div class="column">
        <div class="container mb-4">
          <div class="columns">
            <div class="column">
              <div class="card">
                <div class="card-content">
                  <div class="media">
                    <div class="media-left">
                      <figure class="image is-32x32">
                        <img src="/player1.png" alt="Player 1">
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-6">p1</p>
                    </div>
                  </div>
                  <div class="content has-text-centered">
                    <p>Credits:<br />{credits.p1}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-content">
                  <div class="media">
                    <div class="media-left">
                      <figure class="image is-32x32">
                        <img src="/player2.png" alt="Player 2">
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-6">p2</p>
                    </div>
                  </div>
                  <div class="content has-text-centered">
                    <p>Credits:<br />{credits.p2}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-content">
                  <div class="media">
                    <div class="media-left">
                      <figure class="image is-32x32">
                        <img src="/player3.png" alt="Player 3">
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-6">p3</p>
                    </div>
                  </div>
                  <div class="content has-text-centered">
                    <p>Credits:<br />{credits.p3}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="card">
                <div class="card-content">
                  <div class="media">
                    <div class="media-left">
                      <figure class="image is-32x32">
                        <img src="/player4.png" alt="Player 4">
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-6">p4</p>
                    </div>
                  </div>
                  <div class="content has-text-centered">
                    <p>Credits:<br />{credits.p4}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="container mb-4">
          <div class="notification is-primary is-light has-text-centered">
            You have {credits.pY} Credits
          </div>
        </div>

        <div class="container mb-6">
          <div class="notification is-link has-text-centered" class:is-hidden={notificationSecTillNewRoundHidden}>
            {secTillNewRound} seconds till new round
          </div>
          <form on:submit|preventDefault={handleSendMessage}>
            <div class="field is-grouped is-grouped-centered">
              <p class="control is-normal">
                <input class="input" type="text" placeholder="Place a number (0 to 9.99)" bind:value={message}>
              </p>
              <p class="control">
                <button class="button is-info" type="submit" disabled='{submitBtnDisabled}'>
                  Submit
                </button>
              </p>
            </div>
          </form>
          <div class="notification is-danger is-light" class:is-hidden={notificationInputHidden}>
            <button class="delete" on:click={handleNotificationInputClose}></button>
            Please submit a number (0 to 9.99)
          </div>
        </div>
      
      </div>
    </div>
  </section>
</main>

<style>
#pixi-content {
  height: 10em;
}
</style>