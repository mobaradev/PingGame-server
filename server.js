// Backend for PING PONG GAME PING CTF 2022 by mobaradev
// https://knping.pl/
// http://mobaradev.com/

// version 1.1

const crypto = require('crypto');
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));
const fs = require('fs');
const UnifiedRandom = require("./UnifiedRandom");

const version = "1.1";
const port = 3033
const correctFlag = "sdgh4wmh_gg_wp_2022"; // this is a flag used in PING 2022 CTF
const nOfLives = 12; // number of lives that player gets. Has to be the same in client-side in order to pass the score verification
const pointsToGetFlag = 2023;

app.get('/', (req, res) => {
    res.send(`Ping Game server version ${version}.`)
})

let results = [];
let logs = "";

loadResultsFromFile();

setInterval(() => {
    saveResultsToFile();
    saveLogs();
}, 1000 * 60 * 0.1);

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function loadResultsFromFile() {
    if (!fs.existsSync('./results.json')) {
        fs.writeFileSync('./results.json', '[]');
    }

    const data = fs.readFileSync('./results.json', {encoding:'utf8', flag:'r'});
    if (isJsonString(data)) {
        addToLogs("Results from file loaded correctly");
        results = JSON.parse(data);
        addToLogs(results)
        results = results.sort((a, b) => parseInt(a.points) > parseInt(b.points) ? -1 : 1);
        addToLogs(results)
    } else {
        addToLogs("Could not load results from file correctly");
        results = {};
    }
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_angeles" });
    addToLogs(date);
}

function saveResultsToFile() {
    fs.writeFile("results.json", JSON.stringify(results), function (err) {
        if (err) {
            addToLogs(err);
        } else {
            addToLogs('Results saved correctly');
        }
    });
}

function saveLogs() {
    fs.appendFile("logs.json", logs, function (err) {
        if (err) {
            addToLogs(err);
        } else {
            addToLogs('Logs saved correctly');
        }
    });
}

function addToLogs(value) {
    console.log(value);
    logs += JSON.stringify(value) + "\n";
}

function addToResults(nick, points, jerseyNumber) {
    if (results.length < 100) {
        results.push({nick: nick, points: points, jerseyNumber: jerseyNumber});
        results = results.sort((a, b) => parseInt(a.points) > parseInt(b.points) ? -1 : 1);
    } else {
        if (results[results.length - 1].points > points) return;

        results[results.length - 1] = {nick: nick, points: points, jerseyNumber: jerseyNumber};
        results = results.sort((a, b) => parseInt(a.points) > parseInt(b.points) ? -1 : 1);
    }
}

app.get("/get_ranking", (req, res) => {
    res.send(JSON.stringify({success: true, ranking: results}));
});

app.post('/send_score', (req, res) => {
    addToLogs(req.get('user-agent'));
    if (!req.get('user-agent').includes("UnityPlayer/2022.1.19f1")) {
        addToLogs("===========")
        addToLogs("Request with wrong user-agent, rejected")
        return res.send({success: false, flagGranted: false, flag: ""});
    }
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_angeles" });
    addToLogs("===========")
    addToLogs(date);

    if (!req.body) return res.send({success: false, flagGranted: false, flag: ""});

    if (!req.body["points"] || !req.body["nick"] || !req.body["jerseyNumber"] || !req.body["list"] || !req.body["list2"] || !req.body["ss"]) return res.send({success: false, flagGranted: false, flag: ""});

    if (typeof(req.body["points"]) !== "string" || typeof(req.body["nick"]) !== "string" || typeof(req.body["list"]) !== "string" || typeof(req.body["list2"]) !== "string" || typeof(req.body["ss"]) !== "string") {
        return res.send({success: false, flagGranted: false, flag: ""});
    }

    for (let i = 0; i < req.body["list"].length; i++) {
        if (isNaN(parseInt(req.body["list"][i]))) return res.send({success: false, flagGranted: false, flag: ""});
    }

    if (req.body["list2"].length !== nOfLives) return res.send({success: false, flagGranted: false, flag: ""});
    for (let i = 0; i < nOfLives; i++) {
        if (isNaN(parseInt(req.body["list2"][i]))) return res.send({success: false, flagGranted: false, flag: ""});
    }

    let ss = req.body["ss"];
    if (ss.length !== 64 * 3) return res.send({success: false, flagGranted: false, flag: ""});

    let s = "";
    let rSeed1 = "";
    let rSeed2 = "";

    for (let i = 0; i < 64 * 3; i = i + 3) {
        s += ss[i];
        rSeed1 += ss[i + 1];
        rSeed2 += ss[i + 2];
    }

    let points = req.body["points"];
    let nick = req.body["nick"].replace(/[^a-zA-Z0-9 -_]/g,'');
    nick = nick.slice(0, 18);

    addToLogs("Nick = " + nick);

    let jerseyNumber = req.body["jerseyNumber"];

    if (isNaN(parseInt(jerseyNumber)) || parseInt(jerseyNumber) < 0 || parseInt(jerseyNumber) > 99) {
        return res.send({success: false, flagGranted: false, flag: ""});
    }

    addToLogs("Jersey number = " + jerseyNumber);

    let list = req.body["list"].replace(/[^a-zA-Z0-9 -_]/g,'');
    let list2 = req.body["list2"].replace(/[^a-zA-Z0-9 -_]/g,'');
    addToLogs("Declared points: " + points);

    let r1 = new UnifiedRandom(rSeed1);
    let r2 = new UnifiedRandom(rSeed2);

    let correctPoints = 0;
    let secretValue = 0;
    for (let i = 0; i < list.length; i++) {
        secretValue += 18; // ball's dimensions size.x + size.y + size.z
        if (list[i] == 1) {
            secretValue += 34;
            correctPoints += 1;
        }
        if (list[i] == 2) {
            secretValue += -11;
            correctPoints += 2;
        }
        if (list[i] == 3) {
            secretValue += 2;
            correctPoints += 3;
        }
        if (list[i] == 4) {
            secretValue += 5;
            correctPoints += 4;
        }
        if (list[i] == 5) {
            secretValue += 6;
            correctPoints += 5;
        }

        let pList = [];

        for (let j = 0; j < 5; j++) {
            pList.push(r1.getNumber(1, 301));
        }

        secretValue += pList[list[i] - 1]
    }
    addToLogs("Correct points: " + correctPoints);

    if (correctPoints != points) {
        return res.send({success: false, flagGranted: false, flag: ""});
    }

    let secretValue2 = -10;
    for (let i = 0; i < list2.length; i++) {
        secretValue2 += parseInt(list2[i]);

        if (list2[i] == 1) secretValue2 += 9;
        if (list2[i] == 2) secretValue2 += 3;
        if (list2[i] == 3) secretValue2 += -2;
        if (list2[i] == 4) secretValue2 += 7;
        if (list2[i] == 5) secretValue2 += 0;

        let pList2 = [];

        for (let j = 0; j < 5; j++) {
            pList2.push(r2.getNumber(1, (nOfLives - i) * 101 + list2[i] * 3));
        }

        secretValue2 += pList2[list2[i] - 1]
    }

    const rn = new UnifiedRandom("abcsfgDcfzdeooz"); // abcsfgDcfzdeooz - secret 'tag' used on the client-side
    secretValue = secretValue * rn.getNumber(0, 500);
    secretValue = secretValue + (19 * nOfLives) + rn.getNumber(2, 250);
    secretValue = secretValue - rn.getNumber(0, secretValue + secretValue2);

    let valueToHash = `${points}-${secretValue}`;
    const correctHash = crypto.createHash('sha256').update(valueToHash).digest('hex');

    if (correctHash.toUpperCase() === s.toUpperCase()) {
        addToLogs("Accepted for nick = " + nick);
        addToResults(nick, points, jerseyNumber);
        if (points < pointsToGetFlag) {
            return res.send({success: true, flagGranted: false, flag: ""});
        } else {
            addToLogs("Flag granted");
            res.send({success: true, flagGranted: true, flag: `ping{${correctFlag}}`});
        }
    } else {
        res.send({success: false, flagGranted: false, flag: ""});
    }
})

app.listen(port, () => {
    addToLogs(`Ping game server (version: ${version}) listening on port ${port}`)
})
