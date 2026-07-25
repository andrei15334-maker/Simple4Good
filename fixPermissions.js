const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log("Incepem repararea permisiunilor...");
    const guild = client.guilds.cache.first();
    if (!guild) return console.log("Niciun server gasit");

    const categories = ['🚓 ┃ POLITIA S4G', '🚑 ┃ MEDIC S4G', '🔧 ┃ MECANIC S4G'];
    const everyoneRole = guild.roles.everyone;

    for (const catName of categories) {
        const category = guild.channels.cache.find(c => c.name === catName && c.type === 4); // 4 = GuildCategory
        if (category) {
            console.log(`Verificam categoria: ${category.name}`);
            const children = category.children.cache;
            
            for (const [id, channel] of children) {
                try {
                    // Adaugam deny view channel pentru everyone ca sa nu mai vada tot serverul
                    await channel.permissionOverwrites.edit(everyoneRole.id, {
                        ViewChannel: false
                    });

                    // Daca e politie, adaugam polRole cu viewchannel
                    if (catName === '🚓 ┃ POLITIA S4G') {
                        const polRole = guild.roles.cache.find(r => r.name === '👮 Politist S4G');
                        if (polRole) await channel.permissionOverwrites.edit(polRole.id, { ViewChannel: true });
                    }
                    if (catName === '🚑 ┃ MEDIC S4G') {
                        const medRole = guild.roles.cache.find(r => r.name === '👨‍⚕️ Medic S4G');
                        if (medRole) await channel.permissionOverwrites.edit(medRole.id, { ViewChannel: true });
                    }
                    if (catName === '🔧 ┃ MECANIC S4G') {
                        const mecRole = guild.roles.cache.find(r => r.name === '👨‍🔧 Mecanic S4G');
                        if (mecRole) await channel.permissionOverwrites.edit(mecRole.id, { ViewChannel: true });
                    }

                    console.log(`Reparat permisiuni pentru canalul: ${channel.name}`);
                } catch(e) {
                    console.log(`Eroare la canalul ${channel.name}`, e);
                }
            }
        }
    }
    console.log("Gata! Permisiunile au fost reparate.");
    process.exit();
});

client.login(process.env.TOKEN);
