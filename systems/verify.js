const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'Verificare',
    
    // Functie pentru trimiterea mesajului cu buton in canal
    async init(client) {
        // Cauta canalul de verificare
        const guild = client.guilds.cache.first();
        if (!guild) return;
        
        // 1. Butonul propriu-zis in #regulament-general (trebuie pus primul ca sa avem ID-ul)
        const rulesChannel = guild.channels.cache.find(c => c.name === '📜・regulament-general');
        if (rulesChannel) {
            const rulesMsgs = await rulesChannel.messages.fetch({ limit: 10 });
            const hasRulesBtn = rulesMsgs.find(m => m.author.id === client.user.id && m.components.length > 0);
            
            if (!hasRulesBtn) {
                const embedR = new EmbedBuilder()
                    .setColor('#2ecc71')
                    .setTitle('✅ Verificare Regulament')
                    .setDescription('Dacă ai citit tot regulamentul de mai sus, apasă pe butonul de mai jos pentru a primi rolul de **Membru S4G** și a debloca restul serverului!');
                
                const rowR = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_verify')
                        .setLabel('✅ Am citit și Accept')
                        .setStyle(ButtonStyle.Success)
                );
                
                await rulesChannel.send({ embeds: [embedR], components: [rowR] });
            }
        }

        // 2. Mesajul informativ in #verificare
        const verifyChannel = guild.channels.cache.find(c => c.name === '✅・verificare');
        if (verifyChannel) {
            const msgs = await verifyChannel.messages.fetch({ limit: 10 });
            for (const [id, msg] of msgs) {
                if (msg.author.id === client.user.id) {
                    await msg.delete().catch(()=>{});
                }
            }
            
            const embedV = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('👋 Bun venit pe Simple4Good!')
                .setDescription(`Pentru a primi acces la server, te rugăm să citești regulamentul.\n\nApasă pe butonul de mai jos pentru a fi redirecționat direct către regulament. Derulează până jos de tot și apasă pe butonul verde de Accept!`)
                .setFooter({ text: 'S4G Security' });

            const rowV = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('📖 Citește Regulamentul')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${guild.id}/${rulesChannel ? rulesChannel.id : ''}`)
            );

            await verifyChannel.send({ embeds: [embedV], components: [rowV] });
        }
    },

    // Asteapta click-ul pe buton
    async handleInteraction(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId === 'btn_verify') {
            const memberRole = interaction.guild.roles.cache.find(r => r.name === '👤 Membru S4G');
            if (!memberRole) {
                return interaction.reply({ content: 'Eroare: Rolul Membru S4G nu a fost gasit!', ephemeral: true });
            }

            if (interaction.member.roles.cache.has(memberRole.id)) {
                return interaction.reply({ content: 'Ești deja verificat!', ephemeral: true });
            }

            try {
                await interaction.member.roles.add(memberRole);
                await interaction.reply({ content: '🎉 Felicitări! Ai primit acces la server!', ephemeral: true });
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: 'A apărut o eroare la acordarea rolului.', ephemeral: true });
            }
        }
    }
};
