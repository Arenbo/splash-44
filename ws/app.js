const WebSocketServer = require('ws');

const { MongoClient } = require('mongodb');
const dbUrl = 'mongodb://localhost:27017';
const dbClient = new MongoClient(dbUrl);
const dbName = 'splash44';
let db;
let dbCollection;

 
// import WebSocket, { WebSocketServer } from 'ws';
// const server = createServer({
//   cert: readFileSync('/path/to/cert.pem'),
//   key: readFileSync('/path/to/key.pem')
// });
// const wss = new WebSocketServer({ server });
// server.listen(9010);

let ranks;
let gameNum = 0;
let roundNum = 0;
function startGame() {
  gameNum++;
  roundNum = 0;
  ranks = {
    p1: 100,
    p2: 100,
    p3: 100,
    p4: 100,
    pY: 100
  };
}
async function startRound(pYNum) {
  if (roundNum==0 || roundNum==5) {
    startGame();
  }
  else {
    let prevRoundResult;
    try {
      const filter = {
        'gameNum': gameNum
      };
      const sort = {
        'roundNum': -1
      };
      let prevRoundResults = await dbCollection.find(filter, { sort }).toArray();
      prevRoundResult = prevRoundResults[0];

      console.log('doRound prevRoundResult =>', prevRoundResult);
    } catch (error) {
      console.log('DB error', error);
    }

    ranks = {
      p1: prevRoundResult.p1.rank,
      p2: prevRoundResult.p2.rank,
      p3: prevRoundResult.p3.rank,
      p4: prevRoundResult.p4.rank,
      pY: prevRoundResult.pY.rank
    };
  }
  roundNum++;

  let roundSecret = parseInt(Math.random() * 1000) / 100;
  let p1Num = parseInt(Math.random() * 1000) / 100;
  let p2Num = parseInt(Math.random() * 1000) / 100;
  let p3Num = parseInt(Math.random() * 1000) / 100;
  let p4Num = parseInt(Math.random() * 1000) / 100;

  let p1Mult = 0;
  let p2Mult = 0;
  let p3Mult = 0;
  let p4Mult = 0;
  let pYMult = 0;
  if (p1Num<roundSecret) p1Mult = p1Num * 10;
  if (p2Num<roundSecret) p2Mult = p2Num * 10;
  if (p3Num<roundSecret) p3Mult = p3Num * 10;
  if (p4Num<roundSecret) p4Mult = p4Num * 10;
  if (pYNum<roundSecret) pYMult = pYNum * 10;


  let p1RankNew = parseFloat(ranks.p1 - 10 + p1Mult).toFixed(2);
  let p2RankNew = parseFloat(ranks.p2 - 10 + p2Mult).toFixed(2);
  let p3RankNew = parseFloat(ranks.p3 - 10 + p3Mult).toFixed(2);
  let p4RankNew = parseFloat(ranks.p4 - 10 + p4Mult).toFixed(2);
  let pYRankNew = parseFloat(ranks.pY - 10 + pYMult).toFixed(2);

  // save to db

  ranks.p1 = p1RankNew;
  ranks.p2 = p2RankNew;
  ranks.p3 = p3RankNew;
  ranks.p4 = p4RankNew;
  ranks.pY = pYRankNew;

  let roundResults = {
    roundNum: roundNum,
    roundSecret: roundSecret,
    p1: { num: p1Num, rank: p1RankNew },
    p2: { num: p2Num, rank: p2RankNew },
    p3: { num: p3Num, rank: p3RankNew },
    p4: { num: p4Num, rank: p4RankNew },
    pY: { num: pYNum, rank: pYRankNew }
  };

  try {
    await dbCollection.insertOne({ 
      gameNum: gameNum,
      roundNum: roundNum,
      roundSecret: roundResults.roundSecret,
      p1: roundResults.p1,
      p2: roundResults.p2,
      p3: roundResults.p3,
      p4: roundResults.p4,
      pY: roundResults.pY
      });
  } catch (error) {
    console.log('DB error', error);
  }

  return roundResults;
}

async function main() {
  await dbClient.connect();
  console.log('DB connected successfully to server');
  db = dbClient.db(dbName);
  dbCollection = db.collection('rounds');
  const wss = new WebSocketServer.Server({ port: 9010 });

  // just for testing, to check data
  const findResult = await dbCollection.find({}).toArray();
  console.log('Found documents =>', findResult);


  wss.on("connection", ws => {
    console.log("new client connected");

    startGame();
  
    ws.send(JSON.stringify({ status: "start", message: "Welcome, you are connected!" }));
  
    ws.on("message", data => {
      let dataStrRes = '';
      const dataStr = data.toString();
      let textNum = parseFloat(dataStr).toFixed(2);
  
      console.log('data', dataStr, data, textNum);
      if (!isNaN(textNum)) {
        if (textNum>100) {
          textNum = 100;
        }
        console.log('starting a round');
        const promise = startRound(textNum);
        promise.then((roundRes) => {
          console.log('round complete', roundRes);

          dataStrRes = JSON.stringify({ status: "ok", action: "inprogress", message: "you sent " + textNum, result: roundRes });
          ws.send(dataStrRes);
        });
      }
      else {
        dataStrRes = JSON.stringify({ status: "error", message: "not a number" });
        ws.send(dataStrRes);
      }
    });
  
    ws.on("close", () => {
      console.log("the client is disconnected");
    });
    ws.onerror = function () {
      console.log("Some Error occurred")
    }
  });
  console.log("The WebSocket server is running on port 9010");

  return 'DB done.';
}

main();