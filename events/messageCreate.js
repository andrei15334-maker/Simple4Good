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

        // Clear Command
        if (message.content.startsWith('!clear')) {
            if (!message.member.permissions.has('ManageMessages')) {
                return message.reply('Nu ai permisiunea de a șterge mesaje!');
            }
            
            const args = message.content.split(' ');
            
            // Daca vrea sa stearga ABSOLUT TOT de pe canal (se trece peste limita de 14 zile clonand canalul)
            if (args[1] && args[1].toLowerCase() === 'all') {
                try {
                    const pos = message.channel.position;
                    const newChannel = await message.channel.clone();
                    await newChannel.setPosition(pos);
                    await message.channel.delete();
                    const reply = await newChannel.send('🧹 Canalul a fost curățat complet (s-au șters absolut toate mesajele)!');
                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                    return;
                } catch(e) {
                    console.error(e);
                    return message.reply('Eroare: Nu am putut șterge canalul complet. Botul trebuie să aibă permisiuni de "Manage Channels".');
                }
            }

            const amount = parseInt(args[1]);

            if (isNaN(amount) || amount < 1 || amount > 100) {
                return message.reply('Folosește `!clear 50` (pentru a șterge ultimele 50 de mesaje) sau scrie **`!clear all`** pentru a șterge ABSOLUT TOATE mesajele de pe canal!');
            }

            try {
                // stergem si mesajul care a initiat comanda
                await message.channel.bulkDelete(amount + 1, true);
                const reply = await message.channel.send(`✅ Am șters ultimele ${amount} mesaje.`);
                setTimeout(() => reply.delete().catch(() => {}), 3000);
            } catch (error) {
                console.error(error);
                return message.reply('Eroare: Nu pot șterge mesajele (posibil să fie mai vechi de 14 zile). Daca vrei sa cureti tot, scrie `!clear all`.');
            }
        }
    }
};
