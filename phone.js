const Discord = require('discord.js');
const Voice = require('twilio');
const config = require('./config.json');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const dclient = new Discord.Client();
const vclient = new Voice(config.sid, config.authtoken);
dclient.login(config.token);

dclient.on('ready', () => {
    console.log(`Discord bot is ready! USERNAME: ${dclient.user.tag}`);
});

dclient.on('message', msg => {
    if (msg.content.startsWith('ping')) {
        if (msg.author.bot) return;
        msg.channel.send('ping!');
    } else if (msg.channel.id == config.brockchannel) {
        vclient.messages.create({ body: `${msg.author.tag} BOT: ${msg.author.bot}\n\n${msg.content}`, from: config.sendernumber, to: config.brocknumber });
    }
});

app.post('/sms', (req, res) => {
    dclient.channels.get(config.brockchannel).send(req.body.Body);
});

app.listen(4768, () => {
    console.log('Now recieving text messages on port 4768!');
});