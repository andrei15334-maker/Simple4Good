const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'TicketSystem',
    
    async init(client) {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        const ticketChannel = guild.channels.cache.find(c => c.name.includes('creaza-ticket'));
        if (ticketChannel) {
            const msgs = await ticketChannel.messages.fetch({ limit: 10 });
            // Ștergem absolut toate mesajele botului din acest canal pentru a reposta corect meniul
            for (const [id, msg] of msgs) {
                if (msg.author.id === client.user.id) {
                    await msg.delete().catch(()=>{});
                }
            }
            
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('🎫 Sistem de Tickete')
                .setDescription('Selectează motivul pentru care dorești să deschizi un ticket din meniul de mai jos.')
                .setFooter({ text: 'S4G Support' });

            const menu = new StringSelectMenuBuilder()
                .setCustomId('select_ticket_reason')
                .setPlaceholder('Alege motivul ticketului...')
                .addOptions([
                    { label: 'Reclamație Staff', description: 'Reclamă un membru din echipa administrativă', value: 'ticket_reclamatie_staff', emoji: '🛡️' },
                    { label: 'Reclamație Player', description: 'Reclamă un jucător care a încălcat regulamentul', value: 'ticket_reclamatie_player', emoji: '🧑' },
                    { label: 'Donații', description: 'Informații sau achiziții pentru pachete premium', value: 'ticket_donatii', emoji: '💎' },
                    { label: 'Raportare Buguri', description: 'Raportează o problemă tehnică a serverului', value: 'ticket_buguri', emoji: '🐛' }
                ]);
                    
            const row = new ActionRowBuilder().addComponents(menu);

            await ticketChannel.send({ embeds: [embed], components: [row] });
        }
    },

    async handleInteraction(interaction) {
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_ticket_reason') {
            try {
                await interaction.deferReply({ ephemeral: true });

                const motiv = interaction.values[0];
                
                let ticketCat = interaction.guild.channels.cache.find(c => c.name === '📩 ┃ TICKETE' && c.type === ChannelType.GuildCategory);
                if (!ticketCat) {
                    ticketCat = await interaction.guild.channels.create({ name: '📩 ┃ TICKETE', type: ChannelType.GuildCategory }).catch(() => null);
                }

                if (!ticketCat) {
                    return interaction.editReply({ content: '❌ Eroare la crearea categoriei de tickete!' });
                }

                let topicName = "Support";
                if (motiv === 'ticket_reclamatie_staff') topicName = "Reclamatie Staff";
                if (motiv === 'ticket_reclamatie_player') topicName = "Reclamatie Player";
                if (motiv === 'ticket_donatii') topicName = "Donatii";
                if (motiv === 'ticket_buguri') topicName = "Bug";

                const channelName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
                const newTicket = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: ticketCat.id,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
                    ]
                });

                const embed = new EmbedBuilder()
                    .setColor('#e67e22')
                    .setTitle(`🎫 Ticket: ${topicName}`)
                    .setDescription(`Salut <@${interaction.user.id}>! Un membru din staff va prelua ticketul tău în scurt timp.\nTe rugăm să detaliezi problema.`)
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_close_ticket').setLabel('🔒 Închide Ticket').setStyle(ButtonStyle.Danger)
                );

                await newTicket.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
                await interaction.editReply({ content: `✅ Ticketul tău a fost creat: <#${newTicket.id}>` });
            } catch (err) {
                console.error('[TICKET CREATE ERROR]', err);
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: '❌ Eroare la crearea canalului de ticket!' }).catch(() => {});
                } else {
                    await interaction.reply({ content: '❌ Eroare la crearea canalului de ticket!', ephemeral: true }).catch(() => {});
                }
            }
        }
        
        else if (interaction.isButton()) {
            if (interaction.customId === 'btn_close_ticket') {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_confirm_close').setLabel('Confirmă Închiderea').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('btn_cancel_close').setLabel('Anulează').setStyle(ButtonStyle.Secondary)
                );
                await interaction.reply({ content: 'Ești sigur că vrei să închizi acest ticket?', components: [row] });
            }
            if (interaction.customId === 'btn_confirm_close') {
                await interaction.reply({ content: 'Se salvează arhiva ticketului, te rog așteaptă...', ephemeral: true });
                try {
                    // Preia mesajele (max 100 pentru istoric)
                    const fetched = await interaction.channel.messages.fetch({ limit: 100 });
                    const messages = Array.from(fetched.values()).reverse(); // ordine cronologica

                    let transcript = `TRANSCRIPT TICKET: ${interaction.channel.name}\nData inchiderii: ${new Date().toLocaleString('ro-RO')}\n\n`;
                    messages.forEach(m => {
                        const date = new Date(m.createdTimestamp).toLocaleString('ro-RO');
                        transcript += `[${date}] ${m.author.tag}: ${m.content || '*Fara text*'}\n`;
                        if (m.embeds.length > 0) transcript += `  [Conține Embed]\n`;
                        if (m.attachments.size > 0) transcript += `  [Atașamente: ${m.attachments.map(a => a.url).join(', ')}]\n`;
                    });

                    // Gasim sau cream canalul arhiva-tickete ascuns
                    let archiveChan = interaction.guild.channels.cache.find(c => c.name === '📁・arhiva-tickete');
                    if (!archiveChan) {
                        const adminRole = interaction.guild.roles.cache.find(r => r.name === '🛡️ Administrator');
                        archiveChan = await interaction.guild.channels.create({
                            name: '📁・arhiva-tickete',
                            type: ChannelType.GuildText,
                            permissionOverwrites: [
                                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, // ascuns pt everyone
                                ...(adminRole ? [{ id: adminRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }] : [])
                            ]
                        });
                    }

                    // Fisierul de text
                    const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), { name: `${interaction.channel.name}-transcript.txt` });

                    await archiveChan.send({ 
                        content: `🔒 **Arhivă Ticket**\nTicket: \`${interaction.channel.name}\`\nÎnchis de: <@${interaction.user.id}>`, 
                        files: [attachment] 
                    });

                    // La final stergem canalul de ticket
                    await interaction.channel.delete();
                } catch (e) {
                    console.error("Eroare transcript:", e);
                    await interaction.channel.delete().catch(()=>{});
                }
            }
            if (interaction.customId === 'btn_cancel_close') {
                await interaction.message.delete();
            }
        }
    }
};
