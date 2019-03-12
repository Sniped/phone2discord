const Discord = require('discord.js');
const Voice = require('twilio');
const config = require('./config.json');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const dbclient = new Discord.Client();
const dkclient = new Discord.Client();
const dtclient = new Discord.Client();
const vclient = new Voice(config.sid, config.authtoken);
dbclient.login(config.btoken);
dkclient.login(config.ktoken);
dtclient.login(config.ttoken);

dbclient.on('ready', () => {
    console.log(`Brock bot is ready! USERNAME: ${dbclient.user.tag}`);
});

dkclient.on('ready', () => {
    console.log(`Kenneth bot is ready! USERNAME: ${dkclient.user.tag}`);
});

dtclient.on('ready', () => {
    console.log(`Test bot is ready! USERNAME: ${dtclient.user.tag}`);
});

dbclient.on('message', msg => {
    if (msg.content.startsWith('ping')) {
        if (msg.author.bot) return;
        msg.channel.send('ping!');
    } else if (msg.channel.id == config.channel) {
        vclient.messages.create({ body: `${msg.author.tag} ${getBotStatus(msg.author)}\n\n${msg.content}`, from: config.bsendernumber, to: config.brocknumber });
    }
});

dkclient.on('message', msg => {
    if (msg.content.startsWith('ping')) {
        if (msg.author.bot) return;
        msg.channel.send('ping!');
    } else if (msg.channel.id == config.channel) {
        vclient.messages.create({ body: `${msg.author.tag} ${getBotStatus(msg.author)}\n\n${msg.content}`, from: config.ksendernumber, to: config.kennethnumber });
    }
});

dtclient.on('message', msg => {
    if (msg.content.startsWith('ping')) {
        if (msg.author.bot) return;
        msg.channel.send('ping!');
    } else if (msg.channel.id == config.channel) {
        vclient.messages.create({ body: `${msg.author.tag} ${getBotStatus(msg.author)}\n\n${msg.content}`, from: config.tsendernumber, to: config.testnumber });
    } else if (!msg.guild) {
        vclient.messages.create({ body: `${msg.author.tag} ${getBotStatus(msg.author)} [DM]\n\n${msg.content}`, from: config.tsendernumber, to: config.testnumber });
    }
});

function getBotStatus(user) {
    let bot;
    if (user.bot == true) bot = '[BOT]'
    if (user.bot == false) bot = ''
    return bot;
}

app.get('/', (req, res) => {
    res.send('who tf r u lol');
});

app.post('/sms/brock', (req, res) => {
    dbclient.channels.get(config.channel).send(req.body.Body);
});

app.post('/sms/kenneth', (req, res) => {
    dkclient.channels.get(config.channel).send(req.body.Body);
});

app.post('/sms/test', (req, res) => {
    const content = req.body.Body.split(' ');
    const twiml = new MessagingResponse();

    if (content.startsWith('!msg')) {
        if (!content[1]) return twiml.message('You must include someone you\'d like to message.');
        const user = dtclient.users.find(user => user.tag === content[1]);
        if (!user) return twiml.message('The user you\'re trying to send a message to is invalid.');
        const message = content.slice(2).join(' ');
        if (!message) return twiml.message('You must include a message to send this user.');
        try {
            user.send(message);
        } catch (err) {
            twiml.message('This user couldn\'t be messaged. They might have blocked you, or they might have disabled direct messages!');
        }
    } else dtclient.channels.get(config.channel).send(req.body.Body);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

app.listen(4768, () => {
    console.log('Now recieving text messages on port 4768!');
});