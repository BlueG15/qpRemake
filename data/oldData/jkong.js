import axios from "axios";
import { getCard } from "./cards";
import { getCharacter } from "./util";

const getfromQPServer = (deckCode) =>
  new Promise((resolve, reject) => {
    axios
      .get(`https://quantum.kaiomeris.com/v1/deckrun/${deckCode}`)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        resolve(0);
      });
  });

//resolve the index, sendFile <index>.json in index file
const getDeckFromJKONG = (data) =>
  new Promise(async (resolve, reject) => {
    var deckCode = data.deckCode;
    // console.log(deckCode);
    if (!deckCode) {
      // console.log("no deckCode provided");
      resolve(0);
      return;
    }
    //hit jkong's server
    var res = await getfromQPServer(deckCode);
    if (res == 0) {
      // console.log("cannot fetch from jkong server ??");
      resolve(0);
      return;
    } else {
      if (res["deck"].length) {
        var activeCard = res["deck"][0].cardTag;
      } else {
        if (res["storage"].length) {
          var activeCard = res["storage"][0].cardTag;
        } else {
          var activeCard = "spDeckEdit";
        }
      }
      res["parentDeckCode"] = "";
      res["generation"] = 0;
      res["deckCode"] = deckCode;
      res["deckImg"] = activeCard;

      function convert(arr) {
        var k = [];
        arr.forEach((i) => {
          var temp = {
            displayText: i.displayText,
            cardTag: i.cardTag,
            upgradeLevel: i.upgradeLevel,
          };
          for (var l = 0; l < i.count; l++) {
            k.push(temp);
          }
        });
        return k;
      }

      res.deck = convert(res.deck);
      res.storage = convert(res.storage);
      resolve(res);

      return;
    }
    // console.log("unexpected code reached in load deck");
  });

//data section

//change these 3 to correct path

const deckData = require("./deck");

function reformat(data, reductive) {
  var deckMap = {};
  data.deck.forEach((i) => {
    var a = `${i.codeName}_${Number(i.upgrade)}`;
    if (!deckMap[a]) {
      deckMap[a] = {
        displayText: getCard(i.codeName)["name"]["displayName"],
        upgradeLevel: Number(i.upgrade),
        count: 1,
        cardTag: i.codeName,
      };
    } else {
      deckMap[a]["count"] = deckMap[a]["count"] + 1;
    }
  });
  var deck = Object.values(deckMap);

  var storageMap = {};
  data.storage.forEach((i) => {
    var a = `${i.codeName}_${Number(i.upgrade)}`;
    if (!storageMap[a]) {
      storageMap[a] = {
        displayText: getCard(i.codeName)["name"]["displayName"],
        upgradeLevel: Number(i.upgrade),
        count: 1,
        cardTag: i.codeName,
      };
    } else {
      storageMap[a]["count"] = storageMap[a]["count"] + 1;
    }
  });
  var storage = Object.values(storageMap);

  if (!data.character || !data.character.length) {
    var cardMap = {};
    var total = mergeArrays(data.deck, data.storage);
    total.forEach((i) => {
      var a = getCard(i.codeName)["belongTo"];
      cardMap[a] = cardMap[a] ? cardMap[a] + 1 : 1;
    });
    const notAllow = [
      "other",
      "enemy",
      "boss",
      "ability",
      "algo",
      "potion",
      "sp",
      "generic",
    ];
    var b = Object.keys(cardMap).filter((i) => !notAllow.includes(i));
    if (!b.length) {
      var cha = "dragoon";
      var deckTag = "dragoonDungeonInf";
      var deckName = "Infinite Curiosity";
    } else {
      var min = -Infinity;
      var cha = "dragoon";
      var deckTag = "dragoonDungeonInf";
      var deckName = "Infinite Curiosity";
      b.forEach((i) => {
        if (cardMap[i] > min) {
          min = cardMap[i];
          deckTag = i;
          deckName = deckData[i]["name"]["displayName"];
          cha = deckData[i]["character"];
        }
      });
    }
  } else {
    cha = data.character.toLowerCase();
    var map = {};
    getCharacter(data.character)["decks"].forEach((i) => {
      map[i.codeName] = 0;
    });
    var total = mergeArrays(data.deck, data.storage);
    total.forEach((i) => {
      var a = getCard(i.codeName)["belongTo"];
      if (Object.keys(map).includes(a)) {
        map[a] = map[a] + 1;
      }
    });
    var min = -Infinity;
    var deckTag = getCharacter(data.character)["decks"][0]["codeName"];
    var deckName = getCharacter(data.character)["decks"][0]["displayName"];
    Object.keys(map).forEach((i, index) => {
      if (map[i] > min) {
        min = map[i];
        deckTag = getCharacter(data.character)["decks"][index]["codeName"];
        deckName = getCharacter(data.character)["decks"][index]["displayName"];
      }
    });
  }

  var lootS = [];
  data.drop.forEach((i) => {
    lootS.push({
      setName: i,
      weight: 1,
    });
  });
  if (data["thumbID"] && data["thumbID"].length && getCard(data.thumbID)) {
    var activeCard = data["thumbId"];
  } else {
    if (data["deck"].length) {
      var activeCard = data["deck"][0].codeName;
    } else {
      if (data["storage"].length) {
        var activeCard = data["storage"][0].codeName;
      } else {
        var activeCard = "spDeckEdit";
      }
    }
  }
  if (!reductive) {
    var res = {
      parentDeckDbId: data.parent.length ?? "",
      parentDeckCode: "",
      generation: !data.parent.length ?? 0,
      deckCode: "",
      deckId: randomID(),
      deckImg: `https://blu--qpproject.repl.co/data/cards/${activeCard}`,
      deck: deck,
      deckName: deckName,
      characterTag: cha,
      storage: storage,
      deckTag: deckTag,
      timestamp: new Date().toISOString(),
      lootSets: lootS,
    };
  } else {
    var res = {
      parentDeckDbId: data.parent.length ?? "",
      deckId: randomID(),
      deck: deck,
      deckName: deckName,
      characterTag: cha,
      storage: storage,
      deckTag: deckTag,
      timestamp: new Date().toISOString(),
      lootSets: lootS,
    };
  }
  // console.log(res);

  return res;
}

function mergeArrays(...arrays) {
  const mergedArray = [].concat(...arrays);
  //const uniqueArray = [...new Set(mergedArray)];
  return mergedArray;
}

function randomID(length = 32) {
  length = Number(length);
  if (isNaN(length) || length <= 0) {
    length = 12;
  }

  const characters = "ABCDEF1234567890";
  const charArr = [];

  for (let i = 0; i < length; i++) {
    charArr.push(
      characters[Math.round((characters.length - 1) * Math.random())]
    );
  }

  return charArr.join("");
}

const saveToQPServer = (res) =>
  new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      url: "https://quantum.kaiomeris.com/v1/deckrun/",
      headers: { "Content-Type": "application/json" },
      data: res,
    };

    axios
      .request(options)
      .then(function (response) {
        resolve({
          failed: false,
          deckCode: response.data,
          message: "[JKong Server] Successfully save",
          code: "jkong-200",
        });
      })
      .catch(function (error) {
        // console.log(JSON.stringify(error, null, 4));

        if (!error.status) {
          resolve({
            failed: true,
            message: "JKong server refused to connect",
            code: "jkong-cors",
          });
        }

        if (String(error.status) === "429") {
          resolve({
            failed: true,
            message: "[JKong Server] Too many request",
            code: "jkong-429",
          });
        } else {
          resolve({
            failed: true,
            message: "[JKong Server] Wrong data, can't save",
            code: "jkong-400",
          });
        }
      });
  });

function saveDeckToJKONG(data) {
  return new Promise(async (resolve, reject) => {
    // resolve({
    //   failed: false,
    //   deckCode: randomID(6),
    //   message: "[JKong Server] Successfully save",
    //   code: "jkong-200",
    // });
    // var res = reformat(data, false);
    var res2 = reformat(data, true);
    try {
      var code = await saveToQPServer(res2);
      if (code.failed) {
        resolve(code);
        return;
      }
      resolve(code);
    } catch (err) {
      // console.log(err);
      throw err;
    }
  });
}

export { getDeckFromJKONG, saveDeckToJKONG };
