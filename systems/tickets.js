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
        if (interaction.isStringSelectMenu() && (interaction.customId === 'select_ticket_reason' || interaction.customId === 'ticket_select')) {
            try {
                await interaction.deferReply({ ephemeral: true });

                const motiv = interaction.values[0];
                
                let ticketCat = interaction.guild.channels.cache.find(c => (c.name.includes('TICKETE') || c.name.includes('tickete')) && c.type === ChannelType.GuildCategory);
                if (!ticketCat) {
                    ticketCat = await interaction.guild.channels.create({ name: '📩 ┃ TICKETE', type: ChannelType.GuildCategory }).catch(() => null);
                }

                if (!ticketCat) {
                    return interaction.editReply({ content: '❌ Eroare la crearea categoriei de tickete!' });
                }

                let topicName = "Support";
                let modelText = "";

                if (motiv === 'ticket_reclamatie_staff' || motiv === 't_rec_staff') {
                    topicName = "Reclamație Staff";
                    modelText = "```text\nNume Prenume:\nID FiveM:\nNume FiveM:\nMembrul Staff Reclamat:\nMotivul Reclamatiei:\nDovada:\n```";
                } else if (motiv === 'ticket_reclamatie_player' || motiv === 't_rec_player') {
                    topicName = "Reclamație Jucător";
                    modelText = "```text\nNume Prenume:\nID FiveM:\nNume FiveM:\nPlayerul Reclamat:\nMotivul Reclamatiei:\nDovada:\n```";
                } else if (motiv === 'ticket_donatii' || motiv === 't_donatie') {
                    topicName = "Donații";
                    modelText = "```text\nNume Prenume:\nVarsta:\nID FiveM:\nNume FiveM:\nCe doresti sa achizitionezi?:\n```";
                } else if (motiv === 'ticket_buguri' || motiv === 't_bug') {
                    topicName = "Raportare Bug";
                    modelText = "```text\nNume Prenume:\nId FiveM:\nNume FiveM:\nProblema/Bug-ul:\nDe cand este problema si ce faceai inainte de a o descoperii?:\n```";
                }

                const channelName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
                
                // Fetch staff role for tag
                const staffRole = interaction.guild.roles.cache.find(r => 
                    r.name.toLowerCase().includes('staff member') || 
                    r.name.toLowerCase().includes('staff') || 
                    r.name.toLowerCase().includes('helper') ||
                    r.name.toLowerCase().includes('administrator')
                );
                const staffMention = staffRole ? `<@&${staffRole.id}>` : '@Membru Staff';

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
                    .setDescription(`Salut <@${interaction.user.id}>!\nÎți mulțumim pentru că ai deschis un tichet!\nUn ${staffMention} îți va răspunde cât de curând la tichet.\n\n⚠️ **TE RUGĂM SĂ TRIMITI DETALIILE COMPLETÂND MODELUL DE MAI JOS:**\n\n${modelText}\n*Copiază modelul de mai sus și trimite-l completat în acest canal!*`)
                    .setFooter({ text: 'Support S4G' })
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_close_ticket').setLabel('🔒 Închide Ticket').setStyle(ButtonStyle.Danger)
                );

                await newTicket.send({ content: `<@${interaction.user.id}> | ${staffMention}`, embeds: [embed], components: [row] });
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
    },

    // Handle ticket channel message validation
    async handleMessage(message) {
        if (message.author.bot || !message.channel || !message.channel.name) return;
        if (!message.channel.name.startsWith('ticket-')) return;

        // Skip validation if the sender is staff
        const isStaff = message.member && message.member.roles.cache.some(r => 
            r.name.toLowerCase().includes('staff') || 
            r.name.toLowerCase().includes('admin') || 
            r.name.toLowerCase().includes('helper') ||
            r.name.toLowerCase().includes('fondator') ||
            r.name.toLowerCase().includes('developer')
        );
        if (isStaff) return;

        // Fetch first bot embed in channel to see what required model fields exist
        const msgs = await message.channel.messages.fetch({ limit: 10 }).catch(() => null);
        if (!msgs) return;
        
        const botMsg = [...msgs.values()].find(m => m.author.id === message.client.user.id && m.embeds.length > 0);
        if (!botMsg) return;

        const embedDesc = botMsg.embeds[0].description || '';
        const contentLower = message.content.toLowerCase();

        // Check required fields based on category in embed description
        let missing = [];
        if (embedDesc.includes('Reclamație Staff')) {
            if (!contentLower.includes('id fivem') && !contentLower.includes('id:')) missing.push('ID FiveM');
            if (!contentLower.includes('reclamat') && !contentLower.includes('staff')) missing.push('Membrul Staff Reclamat');
            if (!contentLower.includes('motiv')) missing.push('Motivul Reclamatiei');
        } else if (embedDesc.includes('Reclamație Jucător')) {
            if (!contentLower.includes('id fivem') && !contentLower.includes('id:')) missing.push('ID FiveM');
            if (!contentLower.includes('reclamat') && !contentLower.includes('player')) missing.push('Playerul Reclamat');
            if (!contentLower.includes('motiv')) missing.push('Motivul Reclamatiei');
        } else if (embedDesc.includes('Donații')) {
            if (!contentLower.includes('id fivem') && !contentLower.includes('id:')) missing.push('ID FiveM');
            if (!contentLower.includes('achizition') && !contentLower.includes('doresti')) missing.push('Ce dorești să achiziționezi');
        } else if (embedDesc.includes('Raportare Bug')) {
            if (!contentLower.includes('id fivem') && !contentLower.includes('id:')) missing.push('ID FiveM');
            if (!contentLower.includes('bug') && !contentLower.includes('problema')) missing.push('Problema/Bug-ul');
        }

        if (missing.length > 0) {
            await message.reply({ 
                content: `⚠️ <@${message.author.id}>, modelul nu a fost completat corect!\n\n❌ Îți lipsesc următoarele informații cerute în model: **${missing.join(', ')}**.\n\nTe rugăm să copiezi modelul exact din mesajul de mai sus și să îl trimiți completat cu toate datele cerute!` 
            }).catch(() => {});
        }
    }
};
