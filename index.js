const { Client, GatewayIntentBits } = require('discord.js');
const eventHandler = require('./systems/eventHandler');
require('dotenv').config();

// ==========================================
// KEEPALIVE SERVER PENTRU RENDER (WEB SERVICE)
// ==========================================
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Botul S4G este ONLINE! 🚀'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server web pornit pe portul ${port}`));
// ==========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Apeleaza handler-ul centralizat de evenimente
require('./systems/eventHandler')(client);

client.login(process.env.DISCORD_TOKEN);
