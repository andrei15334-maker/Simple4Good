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

        // Filtre & Verificări
        await antiSpam.handleMessage(message);
        await autoFilterSystem.handleMessage(message);
        await autoResponder.handleMessage(message);
        await autoFormatter.handleMessage(message);
        await ticketSystem.handleMessage(message);

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

        // Fix Butoane Command (Spawneaza butoanele lipsa)
        if (message.content === '!fix_butoane') {
            if (!message.member.permissions.has('Administrator')) return;
            try {
                await modalsSystem.init(client);
                await verifySystem.init(client);
                await ticketSystem.init(client);
                await message.reply('✅ Am forțat botul să verifice și să pună toate butoanele lipsă (Verificare, Tickete, Aplicații) pe canale!');
            } catch (e) {
                console.error(e);
                await message.reply('Eroare la generarea butoanelor.');
            }
        }

        // Comanda directa de trimis butonul de verificare pe canalul curent
        if (message.content === '!buton_verificare') {
            if (!message.member.permissions.has('Administrator')) return;
            try {
                const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                const rulesChannel = message.guild.channels.cache.find(c => c.name.includes('regulament-general')) ||
                                     message.guild.channels.cache.find(c => c.name.includes('regulament'));

                const embedV = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('👋 Bun venit pe Simple4Good!')
                    .setDescription('Pentru a primi acces la server, te rugăm să citești regulamentul.\n\nApasă pe butonul de mai jos pentru a fi redirecționat direct către regulament. Derulează până jos de tot și apasă pe butonul verde de **Accept**!')
                    .setFooter({ text: 'S4G Security' });

                if (rulesChannel) {
                    const rulesBtn = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('📖 Citește Regulamentul')
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://discord.com/channels/${message.guild.id}/${rulesChannel.id}`)
                    );
                    await message.channel.send({ embeds: [embedV], components: [rulesBtn] });
                } else {
                    await message.channel.send({ embeds: [embedV] });
                }
                await message.delete().catch(() => {});
            } catch (err) {
                console.error(err);
                await message.reply('Eroare la trimiterea butonului pe acest canal.');
            }
        }

        // Comanda care creeaza automat un canal NOU de verificare cu butonul inclus
        if (message.content === '!create_verificare' || message.content === '!reset_verificare') {
            if (!message.member.permissions.has('Administrator')) return;
            try {
                const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
                const guild = message.guild;
                const everyoneRole = guild.roles.everyone;

                // Creeaza o categorie si un canal nou nout
                const category = await guild.channels.create({
                    name: '👋 ┃ BUN VENIT',
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        { id: everyoneRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }
                    ]
                });

                const verifyChan = await guild.channels.create({
                    name: '✅・verificare',
                    type: ChannelType.GuildText,
                    parent: category.id
                });

                const rulesChannel = guild.channels.cache.find(c => c.name.includes('regulament') || c.name.includes('rules'));

                const embedV = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('👋 Bun venit pe Simple4Good!')
                    .setDescription('Pentru a primi acces la server, te rugăm să citești regulamentul și să apeși pe butonul verde de verificare de mai jos.')
                    .setFooter({ text: 'S4G Security' });

                const components = [];
                const verifyBtn = new ButtonBuilder()
                    .setCustomId('btn_verify')
                    .setLabel('✅ Verifică-te ACUM')
                    .setStyle(ButtonStyle.Success);

                if (rulesChannel) {
                    const rulesBtn = new ButtonBuilder()
                        .setLabel('📖 Citește Regulamentul')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${guild.id}/${rulesChannel.id}`);
                    components.push(new ActionRowBuilder().addComponents(verifyBtn, rulesBtn));
                } else {
                    components.push(new ActionRowBuilder().addComponents(verifyBtn));
                }

                await verifyChan.send({ embeds: [embedV], components: components });
                await message.reply('🎉 Am creat un canal NOU NOUȚ de verificare cu butonul verde inclus!');
            } catch (err) {
                console.error(err);
                await message.reply('Eroare la crearea canalului nou de verificare: ' + err.message);
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
