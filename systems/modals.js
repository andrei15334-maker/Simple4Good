const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: 'ModalsSystem',

    // Comenzile Slash / Setup initial pentru mesaje de creare (Invoiri)
    async init(client) {
        // Pentru Invoiri si Demisii botul trimite butoane cand e pornit (daca nu exista)
        const guild = client.guilds.cache.first();
        if (!guild) return;

        // --- INVOIRI ---
        const invoireChan = guild.channels.cache.find(c => c.name.includes('cerere-invoire'));
        if (invoireChan) {
            const msgs = await invoireChan.messages.fetch({ limit: 5 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.components.length > 0);
            if (!botMsg) {
                const embed = new EmbedBuilder().setColor('#f39c12').setTitle('📝 Cereri Învoire Staff').setDescription('Apasă pe buton pentru a completa formularul de învoire.');
                const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_invoire').setLabel('Creează Învoire').setStyle(ButtonStyle.Primary));
                await invoireChan.send({ embeds: [embed], components: [row] });
            }
        }

        // --- DEMISII ---
        const demisieChan = guild.channels.cache.find(c => c.name.includes('cerere-demisie'));
        if (demisieChan) {
            const msgs = await demisieChan.messages.fetch({ limit: 5 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.components.length > 0);
            if (!botMsg) {
                const embed = new EmbedBuilder().setColor('#e74c3c').setTitle('📝 Cereri Demisie Staff').setDescription('Apasă pe buton pentru a completa formularul de demisie.');
                const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_demisie').setLabel('Creează Demisie').setStyle(ButtonStyle.Danger));
                await demisieChan.send({ embeds: [embed], components: [row] });
            }
        }

        // --- APLICATII POLITIE ---
        const polChan = guild.channels.cache.find(c => c.name.includes('aplicatii-politie'));
        if (polChan) {
            const msgs = await polChan.messages.fetch({ limit: 5 });
            if (!msgs.find(m => m.author.id === client.user.id && m.components.length > 0)) {
                const embedPol = new EmbedBuilder().setColor('#0984e3').setTitle('👮 Aplicații Poliția Română').setDescription('Apasă pe butonul de mai jos pentru a trimite aplicația ta.');
                const btnPol = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_aplicatie_politie').setLabel('Aplică la Poliție').setStyle(ButtonStyle.Primary));
                await polChan.send({ embeds: [embedPol], components: [btnPol] });
            }
        }

        // --- APLICATII MEDICI ---
        const medChan = guild.channels.cache.find(c => c.name.includes('aplicatii-medici'));
        if (medChan) {
            const msgs = await medChan.messages.fetch({ limit: 5 });
            if (!msgs.find(m => m.author.id === client.user.id && m.components.length > 0)) {
                const embedMed = new EmbedBuilder().setColor('#d63031').setTitle('🚑 Aplicații SMURD').setDescription('Apasă pe butonul de mai jos pentru a aplica.');
                const btnMed = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_aplicatie_medici').setLabel('Aplică la SMURD').setStyle(ButtonStyle.Danger));
                await medChan.send({ embeds: [embedMed], components: [btnMed] });
            }
        }

        // --- APLICATII MECANICI ---
        const mecChan = guild.channels.cache.find(c => c.name.includes('aplicatii-mecanici'));
        if (mecChan) {
            const msgs = await mecChan.messages.fetch({ limit: 5 });
            if (!msgs.find(m => m.author.id === client.user.id && m.components.length > 0)) {
                const embedMec = new EmbedBuilder().setColor('#e17055').setTitle('🔧 Aplicații Mecanici').setDescription('Apasă pe buton pentru a aplica.');
                const btnMec = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_aplicatie_mecanici').setLabel('Aplică la Mecanici').setStyle(ButtonStyle.Secondary));
                await mecChan.send({ embeds: [embedMec], components: [btnMec] });
            }
        }
    },

    async handleInteraction(interaction) {
        // --- BUTOANE CARE DESCHID MODALE ---
        if (interaction.isButton()) {
            if (interaction.customId === 'btn_invoire') {
                const modal = new ModalBuilder().setCustomId('modal_invoire').setTitle('Cerere Învoire');
                const p1 = new TextInputBuilder().setCustomId('zile').setLabel('Câte zile lipsești?').setStyle(TextInputStyle.Short);
                const p2 = new TextInputBuilder().setCustomId('motiv').setLabel('Motivul învoirii:').setStyle(TextInputStyle.Paragraph);
                modal.addComponents(new ActionRowBuilder().addComponents(p1), new ActionRowBuilder().addComponents(p2));
                await interaction.showModal(modal);
            }
            else if (interaction.customId === 'btn_demisie') {
                const modal = new ModalBuilder().setCustomId('modal_demisie').setTitle('Cerere Demisie');
                const p1 = new TextInputBuilder().setCustomId('motiv').setLabel('Motivul demisiei:').setStyle(TextInputStyle.Paragraph);
                modal.addComponents(new ActionRowBuilder().addComponents(p1));
                await interaction.showModal(modal);
            }
            // --- APLICATII FACTIUNI ---
            else if (interaction.customId.startsWith('btn_aplicatie_')) {
                const type = interaction.customId.split('_')[2]; // politie, medici, mecanici
                const modal = new ModalBuilder().setCustomId(`modal_aplicatie_${type}`).setTitle(`Aplicație ${type.toUpperCase()}`);
                const q1 = new TextInputBuilder().setCustomId('varsta').setLabel('Vârsta (IC și OOC)?').setStyle(TextInputStyle.Short);
                const q2 = new TextInputBuilder().setCustomId('ore').setLabel('Câte ore jucate ai?').setStyle(TextInputStyle.Short);
                const q3 = new TextInputBuilder().setCustomId('motiv').setLabel('De ce vrei în această facțiune?').setStyle(TextInputStyle.Paragraph);
                
                modal.addComponents(
                    new ActionRowBuilder().addComponents(q1),
                    new ActionRowBuilder().addComponents(q2),
                    new ActionRowBuilder().addComponents(q3)
                );
                await interaction.showModal(modal);
            }
            // --- BUTOANE DE ACCEPT/RESPINGE LA INVOIRI/DEMISII ---
            else if (interaction.customId.startsWith('accept_') || interaction.customId.startsWith('deny_')) {
                // Verificam permisiuni (ex: Manager)
                if (!interaction.member.permissions.has('Administrator')) {
                    return interaction.reply({ content: 'Doar Managerii pot aproba!', ephemeral: true });
                }

                const msgEmbed = interaction.message.embeds[0];
                const newEmbed = EmbedBuilder.from(msgEmbed);
                const isAccept = interaction.customId.startsWith('accept_');

                newEmbed.setColor(isAccept ? '#2ecc71' : '#e74c3c');
                newEmbed.addFields({ name: 'Status', value: isAccept ? `✅ Aprobat de ${interaction.user.tag}` : `❌ Respins de ${interaction.user.tag}` });

                // Stergem butoanele ca sa nu se mai poata vota
                await interaction.update({ embeds: [newEmbed], components: [] });
            }
        }

        // --- TRATAREA MODALELOR (SUBMIT) ---
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'modal_invoire') {
                const zile = interaction.fields.getTextInputValue('zile');
                const motiv = interaction.fields.getTextInputValue('motiv');

                const embed = new EmbedBuilder()
                    .setColor('#f1c40f')
                    .setTitle('📄 Învoire Nouă')
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .addFields(
                        { name: 'Membru', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Zile', value: zile, inline: true },
                        { name: 'Motiv', value: motiv }
                    )
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`accept_invoire`).setLabel('✅ Acceptă').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`deny_invoire`).setLabel('❌ Respinge').setStyle(ButtonStyle.Danger)
                );

                await interaction.reply({ content: 'Cererea ta a fost trimisă!', ephemeral: true });
                await interaction.channel.send({ embeds: [embed], components: [row] });
            }
            else if (interaction.customId === 'modal_demisie') {
                const motiv = interaction.fields.getTextInputValue('motiv');
                const embed = new EmbedBuilder()
                    .setColor('#e67e22')
                    .setTitle('🚪 Demisie Nouă')
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .addFields(
                        { name: 'Membru', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Motiv', value: motiv }
                    )
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`accept_demisie`).setLabel('✅ Acceptă').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`deny_demisie`).setLabel('❌ Respinge').setStyle(ButtonStyle.Danger)
                );

                await interaction.reply({ content: 'Cererea ta a fost trimisă!', ephemeral: true });
                await interaction.channel.send({ embeds: [embed], components: [row] });
            }
            // --- SUBMIT APLICATII FACTIUNI ---
            else if (interaction.customId.startsWith('modal_aplicatie_')) {
                const type = interaction.customId.split('_')[2];
                const varsta = interaction.fields.getTextInputValue('varsta');
                const ore = interaction.fields.getTextInputValue('ore');
                const motiv = interaction.fields.getTextInputValue('motiv');

                let color = '#2ecc71';
                if (type === 'politie') color = '#0984e3';
                if (type === 'medici') color = '#d63031';
                if (type === 'mecanici') color = '#e17055';

                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(`📝 Aplicație Nouă - ${type.toUpperCase()}`)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .addFields(
                        { name: 'Membru', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Vârsta', value: varsta, inline: true },
                        { name: 'Ore', value: ore, inline: true },
                        { name: 'Motiv', value: motiv }
                    )
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`accept_aplicatie_${type}`).setLabel('✅ Acceptă CV').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`deny_aplicatie_${type}`).setLabel('❌ Respinge CV').setStyle(ButtonStyle.Danger)
                );

                await interaction.reply({ content: 'Aplicația ta a fost depusă cu succes!', ephemeral: true });
                await interaction.channel.send({ embeds: [embed], components: [row] });
            }
        }
    }
};
