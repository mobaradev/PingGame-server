# Ping Game Server

A backend server for the **Ping Game** used as a cybersecurity challenge in PING CTF 2022.
Written in NodeJS with Express library.

Link to repo with game (made in Unity3D): https://github.com/mobaradev/PingGame

## How to use
```
npm install
node server.js
```

Make sure that port 3033 is not used by other program, or change the port

## Anticheat / score verification process

'/send_score' POST request takes 6 parameters:

| Name         | Data type | Description                             |
|--------------|-----------|-----------------------------------------|
| points       | number    | number of points declared by player     |
| nick         | string    | player's nick                           |
| jerseyNumber | number    | player's jersey number (symbolic value) |
| list         | string    | list of ids of balls hit                |
| list2        | string    | list of ids of balls missed             |
| ss           | string    | hash of secret code                     |

First, it check user-agent whether it contains string "UnityPlayer/2022.1.19f1" that is sent from the client.

Then, data type of each parameter is checked.

If any incorrect value is detected, the server will reject request.

In next steps, the correctness of points and ss string are verified.

The lists:
* list
* list2

provides all data necessary to determine the ss string.

Server makes exactly the same steps as client-side in order to prepare that secret string.

However, some variables and processes are more clearly visible because server-side is supposed to be implicit to potential cheaters.

For example, the seed for UnifiedRandom instance is clearly given here, while in client side it is indistinctly read from game object tag.

```
const rn = new UnifiedRandom("abcsfgDcfzdeooz"); // abcsfgDcfzdeooz - secret 'tag' used on the client-side
secretValue = secretValue * rn.getNumber(0, 500);
secretValue = secretValue + (19 * nOfLives) + rn.getNumber(2, 250);
secretValue = secretValue - rn.getNumber(0, secretValue + secretValue2);
```


Then points declared by player and secretValue calculated on server side are hashed using sha256 and correct hash for that amount of points is determined:
```
let valueToHash = `${points}-${secretValue}`;
const correctHash = crypto.createHash('sha256').update(valueToHash).digest('hex');
```

If the correctHash is the same, as the ss sent by player, the flag will be given in the response.
```
if (points < pointsToGetFlag) {
    return res.send({success: true, flagGranted: false, flag: ""});
} else {
    addToLogs("Flag granted");
    res.send({success: true, flagGranted: true, flag: `ping{${correctFlag}}`});
}
```

## Version
This is version 1.1 that uses UnifiedRandom class instead of previous "RandomNumbers" solution.
Small changes were implemented to make the server more flexible and configurable.

Note: this server version 1.1 is compatible with client version 1.1. Original PingGame version 1.0 will not work properly with this server version, make sure to use the same versions of client and server!

## Author

Michal Obara (@mobaradev)

[mobaradev@yahoo.com](mailto:mobaradev@yahoo.com)

http://www.mobaradev.com

## License

The MIT License

Copyright 2023 Michal Obara (mobaradev)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
