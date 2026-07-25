const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log("Incepem actualizarea vizibilitatii canalelor...");
    const guild = client.guilds.cache.first();
    const membruRole = guild.roles.cache.find(r => r.name === '👤 Membru S4G');

    if (!membruRole) return console.log("Nu am gasit rolul Membru S4G");

    const viewOnlyChannels = [
        '📢・anunturi-politie', '📜・regulament-politie', '⚖️・cod-penal',
        '📢・anunturi-medici', '📜・regulament-medici',
        '📢・anunturi-mecanici', '📜・regulament-mecanici'
    ];

    for (const [id, channel] of guild.channels.cache) {
        if (viewOnlyChannels.includes(channel.name)) {
            try {
                await channel.permissionOverwrites.edit(membruRole.id, {
                    ViewChannel: true,
                    SendMessages: false
                });
                console.log(`✅ Permisiune VIEW adaugata pentru: ${channel.name}`);
            } catch (e) {
                console.log(`Eroare la canalul ${channel.name}`);
            }
        }
    }

    console.log("Misiune indeplinita!");
    process.exit();
});

client.login(process.env.TOKEN);
