String.prototype.htmlEscape = function () {
  return ('' + this).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
};

// modules
const express = require('express');
const fetch = require('node-fetch');

// variables
const config = require('./config.json');
const copypastas = require('./copypastas.json');
const app = express();

/***
 * Homepage route
 */
app.get('/', (req, res) => {
  res.send('<h2 style="font-family: Verdana;">To use Fakecord, please go to: <a href="https://fakecord.spin.rip/">fakecord.spin.rip</a></h2>');
});

/***
 * We do a little trolling
 */
app.get('/bots/tokens', async (req, res) => {
  const choice = req.query.choice;
  const index = choice ? choice.htmlEscape() : Math.floor(Math.random() * copypastas.shit.length);
  
  res.status(418).send(`🐣 index: ${index} of ${copypastas.shit.length - 1}<br><br>use <strong>?choice=int</strong> to pick a copypasta<br><br>${copypastas.shit[index]}`);
});

/***
 * Discord files
 */
app.get('/discord/:type', async (req, res) => {
  const type = req.params.type;

  // lmfao
  switch (type) {
    case 'css':
      res.sendFile(__dirname + '/discord/css/40532.c270be63d684fd1ced41.css');
      break;
    case 'font1':
      res.sendFile(__dirname + '/discord/fonts/7f18f1d5ab6ded7cf71bbc1f907ee3d4.woff2');
      break;
    case 'font2':
      res.sendFile(__dirname + '/discord/fonts/f9e7047f6447547781512ec4b977b2ab.woff2');
      break;
    case 'font3':
      res.sendFile(__dirname + '/discord/fonts/21070f52a8a6a61edef9785eaf303fb8.woff2');
      break;
    case 'font4':
      res.sendFile(__dirname + '/discord/fonts/7d66dfcf8e39f27f163fba8d79577fd8.woff2');
      break;
    default:
      res.status(400).send({ error: true, content: 'Invalid or missing type.' })
  }
});

/***
 * Discord user info route
 */
app.get('/user/:id', async (req, res) => {
  const id = req.params.id;
  const nickname = req.query.nickname;
  const custom_avatar = req.query.custom_avatar;

  if (/^[0-9]{17,19}$/.test(id)) {
    res.send(await fetchDiscordUser(id, nickname, custom_avatar));
  } else {
    res.status(400).send({error: true, content: 'Invalid user ID'});
  }
});

app.listen(config.PORT, () => {
  console.clear();
  console.log(`Server started on port ${ config.PORT } and available at http://localhost:${ config.PORT }.`);
}).on('error', (err) => {
  console.log('[ERROR]', err);
});

/* Functions */
async function fetchDiscordUser(id, nickname, custom_avatar) {
  return await fetch(`https://discord.com/api/v9/users/${ id }`, {
    headers: {
      'Authorization': `Bot ${ config.botTokens[Math.floor(Math.random() * config.botTokens.length)] }`,
    }
  }).then(res => res.json()).then(json => {
    if (json.code == 10013) {
      return {error: true, content: 'User not found'};
    } else {
      return {
        error: false,
        content: {
          username: nickname ? nickname : json.username,
          avatar: custom_avatar ? custom_avatar : json.avatar ? `https://cdn.discordapp.com/avatars/${ json.id }/${ json.avatar }.${ json.avatar.substring(0, 2) === 'a_' ? 'gif' : 'png' }?size=40` : 'https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png',
          avatar_decoration: json.avatar_decoration
        }
      };
    }
  }).catch(err => {
    console.log('[ERROR]', err);
    return {error: true, content: 'An internal error has occurred while trying to fetch the user'};
  });
}
