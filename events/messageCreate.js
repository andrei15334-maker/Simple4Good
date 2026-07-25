const setupServer = require('../setupServer');
const antiSpam = require('../systems/antiSpam');
const autoFilterSystem = require('../systems/autoFilter');
const autoResponder = require('../systems/autoResponder');
const autoFormatter = require('../systems/autoFormatter');
const verifySystem = require('../systems/verify');
const ticketSystem = require('../systems/tickets');
const modalsSystem = require('../systems/modals');
const { ChannelType } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        // Filtre
        await antiSpam.handleMessage(message);
        await autoFilterSystem.handleMessage(message);
        await autoResponder.handleMessage(message);
        await autoFormatter.handleMessage(message);

        // Setup Command
        if (message.content === '!setup_s4g_server') {
            if (!message.member.permissions.has('Administrator')) return;

            await message.reply('🔧 Incepem configurarea intregului server! S-ar putea sa dureze 1-2 minute...');
            try {
                await setupServer(message.guild);
                
                // Re-initializeaza dupa setup
                await verifySystem.init(client);
                await ticketSystem.init(client);
                await modalsSystem.init(client);
                
                const generalCat = message.guild.channels.cache.find(c => c.name === '🌐 ┃ GENERAL' && c.type === ChannelType.GuildCategory);
                const chatGen = message.guild.channels.cache.find(c => c.name === '💬・chat-general');
                if (chatGen) {
                    await chatGen.send('🎉 **Setup Finalizat cu Succes!** Serverul Discord a fost recreat complet cu toate setarile S4G.');
                }
            } catch (error) {
                console.error(error);
                await message.reply('A aparut o eroare la configurarea serverului. Verifica permisiunile (Botul trebuie sa fie pus primul sus de tot!).');
            }
        }
    }
};
