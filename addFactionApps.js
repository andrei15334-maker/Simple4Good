const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log("Incepem actualizarea canalelor pentru Membru S4G...");
    const guild = client.guilds.cache.first();
    if (!guild) return console.log("Niciun server gasit");

    const membruRole = guild.roles.cache.find(r => r.name === '👤 Membru S4G');
    if (!membruRole) return console.log("Nu am gasit rolul Membru S4G!");

    const categories = {
        '🚓 ┃ POLITIA S4G': { appName: '📝・aplicatii-politie', recName: '👮・reclamatii-politie' },
        '🚑 ┃ MEDIC S4G': { appName: '📝・aplicatii-medici', recName: '👨‍⚕️・reclamatii-medici' },
        '🔧 ┃ MECANIC S4G': { appName: '📝・aplicatii-mecanici', recName: '👨‍🔧・reclamatii-mecanici' }
    };

    for (const [catName, data] of Object.entries(categories)) {
        const category = guild.channels.cache.find(c => c.name === catName && c.type === 4);
        if (category) {
            console.log(`Lucram la categoria: ${catName}`);
            
            // 1. Creare Canal de Aplicatii
            let appChan = category.children.cache.find(c => c.name === data.appName);
            if (!appChan) {
                appChan = await guild.channels.create({
                    name: data.appName,
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: membruRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });
                console.log(`  -> Creat ${data.appName}`);
            } else {
                await appChan.permissionOverwrites.edit(membruRole.id, { ViewChannel: true, SendMessages: true });
                console.log(`  -> Actualizat ${data.appName}`);
            }

            // 2. Modificare Reclamatii (Sa poata scrie si vedea)
            const recChan = category.children.cache.find(c => c.name === data.recName);
            if (recChan) {
                await recChan.permissionOverwrites.edit(membruRole.id, { ViewChannel: true, SendMessages: true });
                console.log(`  -> Actualizat ${data.recName} pentru view/send`);
            }

            // 3. Modificare Comunicat de presa (Sa poata DOAR sa vada)
            const comChan = category.children.cache.find(c => c.name === '📰・comunicat-de-presa');
            if (comChan) {
                await comChan.permissionOverwrites.edit(membruRole.id, { ViewChannel: true, SendMessages: false });
                console.log(`  -> Actualizat comunicat-de-presa pentru view-only in ${catName}`);
            }
        }
    }
    
    console.log("Misiune indeplinita!");
    process.exit();
});

client.login(process.env.TOKEN);
