const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'StaffLogs',
    
    init(client) {
        const getLogChannel = (guild) => guild.channels.cache.find(c => c.name === '📝・logs-staff');

        // 1. Stergere Mesaje
        client.on(Events.MessageDelete, async (message) => {
            if (!message.guild || message.author?.bot) return;
            const logChan = getLogChannel(message.guild);
            if (!logChan) return;

            let executor = "Autorul însuși (sau un Bot)";
            try {
                const fetchedLogs = await message.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MessageDelete });
                const log = fetchedLogs.entries.first();
                if (log && target?.id === message.author.id && (Date.now() - log.createdTimestamp < 5000)) {
                    executor = `<@${log.executor.id}>`;
                }
            } catch (e) {}

            const embed = new EmbedBuilder().setColor('#e74c3c').setTitle('🗑️ Mesaj Șters')
                .addFields({ name: 'Autor', value: `<@${message.author.id}>`, inline: true }, { name: 'Șters de', value: executor, inline: true }, { name: 'Canal', value: `<#${message.channel.id}>`, inline: true }, { name: 'Conținut', value: message.content || '*Fără text*' })
                .setTimestamp();
            await logChan.send({ embeds: [embed] });
        });

        // 2. Modificare Mesaje
        client.on(Events.MessageUpdate, async (oldMsg, newMsg) => {
            if (!oldMsg.guild || oldMsg.author?.bot || oldMsg.content === newMsg.content) return;
            const logChan = getLogChannel(oldMsg.guild);
            if (!logChan) return;

            const embed = new EmbedBuilder().setColor('#f39c12').setTitle('✏️ Mesaj Editat')
                .addFields({ name: 'Autor', value: `<@${oldMsg.author.id}>`, inline: true }, { name: 'Canal', value: `<#${oldMsg.channel.id}>`, inline: true }, { name: 'Vechiul Mesaj', value: oldMsg.content || '*nimic*' }, { name: 'Noul Mesaj', value: newMsg.content || '*nimic*' })
                .setTimestamp();
            await logChan.send({ embeds: [embed] });
        });

        // 3. Modificare Camere
        client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
            if (!oldChannel.guild) return;
            const logChan = getLogChannel(oldChannel.guild);
            if (!logChan) return;
            let changes = [];
            if (oldChannel.name !== newChannel.name) changes.push(`Nume: ${oldChannel.name} -> ${newChannel.name}`);
            if (oldChannel.permissionOverwrites.cache.size !== newChannel.permissionOverwrites.cache.size) changes.push("Permisiuni modificate");
            if (changes.length === 0) return;

            let executor = "Necunoscut";
            try {
                const logs = await oldChannel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelUpdate });
                const log = logs.entries.first();
                if (log && (Date.now() - log.createdTimestamp < 5000)) executor = `<@${log.executor.id}>`;
            } catch (e) {}

            const embed = new EmbedBuilder().setColor('#3498db').setTitle('🛠️ Canal Modificat')
                .addFields({ name: 'Canal', value: `<#${newChannel.id}>`, inline: true }, { name: 'Modificat de', value: executor, inline: true }, { name: 'Modificări', value: changes.join('\n') }).setTimestamp();
            await logChan.send({ embeds: [embed] });
        });

        // 4. Creare Camere
        client.on(Events.ChannelCreate, async (channel) => {
            if (!channel.guild) return;
            const logChan = getLogChannel(channel.guild);
            if (!logChan) return;

            let executor = "Necunoscut";
            try {
                const logs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelCreate });
                const log = logs.entries.first();
                if (log && (Date.now() - log.createdTimestamp < 5000)) executor = `<@${log.executor.id}>`;
            } catch (e) {}

            const embed = new EmbedBuilder().setColor('#2ecc71').setTitle('📁 Canal Creat').addFields({ name: 'Nume', value: `<#${channel.id}>`, inline: true }, { name: 'Creat de', value: executor, inline: true }).setTimestamp();
            await logChan.send({ embeds: [embed] });
        });

        // 5. Stergere Camere
        client.on(Events.ChannelDelete, async (channel) => {
            if (!channel.guild) return;
            const logChan = getLogChannel(channel.guild);
            if (!logChan) return;

            let executor = "Necunoscut";
            try {
                const logs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
                const log = logs.entries.first();
                if (log && (Date.now() - log.createdTimestamp < 5000)) executor = `<@${log.executor.id}>`;
            } catch (e) {}

            const embed = new EmbedBuilder().setColor('#c0392b').setTitle('🗑️ Canal Șters').addFields({ name: 'Nume Vechi', value: channel.name, inline: true }, { name: 'Șters de', value: executor, inline: true }).setTimestamp();
            await logChan.send({ embeds: [embed] });
        });

        // 6. Bans
        client.on(Events.GuildBanAdd, async (ban) => {
            const logChan = getLogChannel(ban.guild);
            if (!logChan) return;
            let executor = "Necunoscut", motiv = "Fără motiv";
            try {
                const logs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
                const log = logs.entries.first();
                if (log && log.target.id === ban.user.id) { executor = `<@${log.executor.id}>`; motiv = log.reason || "Fără motiv"; }
            } catch (e) {}
            
            const embed = new EmbedBuilder().setColor('#992d22').setTitle('🔨 Jucător Banat').addFields({ name: 'Jucător', value: `${ban.user.tag} (<@${ban.user.id}>)`, inline: true }, { name: 'Banat de', value: executor, inline: true }, { name: 'Motiv', value: motiv }).setTimestamp();
            await logChan.send({ embeds: [embed] });
        });

        client.on(Events.GuildBanRemove, async (ban) => {
            const logChan = getLogChannel(ban.guild);
            if (!logChan) return;
            let executor = "Necunoscut";
            try {
                const logs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanRemove });
                const log = logs.entries.first();
                if (log && log.target.id === ban.user.id) executor = `<@${log.executor.id}>`;
            } catch (e) {}
            
            const embed = new EmbedBuilder().setColor('#2ecc71').setTitle('🔓 Jucător Debanat').addFields({ name: 'Jucător', value: `${ban.user.tag} (<@${ban.user.id}>)`, inline: true }, { name: 'Debanat de', value: executor, inline: true }).setTimestamp();
            await logChan.send({ embeds: [embed] });
        });

        // 7. Kicks (Din GuildMemberRemove)
        client.on(Events.GuildMemberRemove, async (member) => {
            const logChan = getLogChannel(member.guild);
            if (!logChan) return;
            try {
                const logs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick });
                const log = logs.entries.first();
                if (log && log.target.id === member.id && (Date.now() - log.createdTimestamp < 5000)) {
                    const embed = new EmbedBuilder().setColor('#e67e22').setTitle('👢 Jucător Dat Afară (Kick)').addFields({ name: 'Jucător', value: `${member.user.tag}`, inline: true }, { name: 'De către', value: `<@${log.executor.id}>`, inline: true }, { name: 'Motiv', value: log.reason || "Fără motiv" }).setTimestamp();
                    await logChan.send({ embeds: [embed] });
                }
            } catch (e) {}
        });

        // 8. Mute / Timeout / Schimbare Roluri / Nickname
        client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
            const logChan = getLogChannel(newMember.guild);
            if (!logChan) return;

            // Timeout (Mute)
            if (!oldMember.isCommunicationDisabled() && newMember.isCommunicationDisabled()) {
                let executor = "Necunoscut";
                try {
                    const logs = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberUpdate });
                    const log = logs.entries.first();
                    if (log && log.target.id === newMember.id) executor = `<@${log.executor.id}>`;
                } catch (e) {}
                const expiration = new Date(newMember.communicationDisabledUntilTimestamp).toLocaleString();
                const embed = new EmbedBuilder().setColor('#e74c3c').setTitle('🔇 Jucător Mut (Timeout)').addFields({ name: 'Jucător', value: `<@${newMember.id}>`, inline: true }, { name: 'De către', value: executor, inline: true }, { name: 'Expiră la', value: expiration }).setTimestamp();
                await logChan.send({ embeds: [embed] });
            }
            
            // Unmute (Remove Timeout)
            if (oldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
                let executor = "Necunoscut";
                try {
                    const logs = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberUpdate });
                    const log = logs.entries.first();
                    if (log && log.target.id === newMember.id) executor = `<@${log.executor.id}>`;
                } catch (e) {}
                const embed = new EmbedBuilder().setColor('#2ecc71').setTitle('🔊 Jucător Unmute (Timeout Scos)').addFields({ name: 'Jucător', value: `<@${newMember.id}>`, inline: true }, { name: 'De către', value: executor, inline: true }).setTimestamp();
                await logChan.send({ embeds: [embed] });
            }

            // Roluri adaugate
            if (oldMember.roles.cache.size < newMember.roles.cache.size) {
                const addedRole = newMember.roles.cache.find(r => !oldMember.roles.cache.has(r.id));
                if (addedRole) {
                    let executor = "Necunoscut";
                    try {
                        const logs = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate });
                        const log = logs.entries.first();
                        if (log && log.target.id === newMember.id) executor = `<@${log.executor.id}>`;
                    } catch(e) {}
                    const embed = new EmbedBuilder().setColor('#3498db').setTitle('➕ Rol Acordat').addFields({ name: 'Jucător', value: `<@${newMember.id}>`, inline: true }, { name: 'Rol', value: `<@&${addedRole.id}>`, inline: true }, { name: 'De către', value: executor, inline: true }).setTimestamp();
                    await logChan.send({ embeds: [embed] });
                }
            }

            // Roluri scoase
            if (oldMember.roles.cache.size > newMember.roles.cache.size) {
                const removedRole = oldMember.roles.cache.find(r => !newMember.roles.cache.has(r.id));
                if (removedRole) {
                    let executor = "Necunoscut";
                    try {
                        const logs = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate });
                        const log = logs.entries.first();
                        if (log && log.target.id === newMember.id) executor = `<@${log.executor.id}>`;
                    } catch(e) {}
                    const embed = new EmbedBuilder().setColor('#e74c3c').setTitle('➖ Rol Scos').addFields({ name: 'Jucător', value: `<@${newMember.id}>`, inline: true }, { name: 'Rol', value: `<@&${removedRole.id}>`, inline: true }, { name: 'De către', value: executor, inline: true }).setTimestamp();
                    await logChan.send({ embeds: [embed] });
                }
            }

            // Nickname
            if (oldMember.nickname !== newMember.nickname) {
                let executor = "Autorul";
                try {
                    const logs = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberUpdate });
                    const log = logs.entries.first();
                    if (log && log.target.id === newMember.id && log.executor.id !== newMember.id) executor = `<@${log.executor.id}>`;
                } catch(e) {}
                const embed = new EmbedBuilder().setColor('#9b59b6').setTitle('🏷️ Nickname Schimbat').addFields({ name: 'Jucător', value: `<@${newMember.id}>`, inline: true }, { name: 'De către', value: executor, inline: true }, { name: 'Vechi', value: oldMember.nickname || oldMember.user.username, inline: true }, { name: 'Nou', value: newMember.nickname || newMember.user.username, inline: true }).setTimestamp();
                await logChan.send({ embeds: [embed] });
            }
        });

        // 9. Voice State Update
        client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
            const logChan = getLogChannel(oldState.guild);
            if (!logChan) return;
            const member = newState.member;
            if (!oldState.channelId && newState.channelId) {
                await logChan.send({ embeds: [new EmbedBuilder().setColor('#2ecc71').setDescription(`🎤 <@${member.id}> a intrat pe canalul <#${newState.channelId}>`).setTimestamp()] });
            } else if (oldState.channelId && !newState.channelId) {
                await logChan.send({ embeds: [new EmbedBuilder().setColor('#e74c3c').setDescription(`🎤 <@${member.id}> a ieșit de pe canalul <#${oldState.channelId}>`).setTimestamp()] });
            } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                await logChan.send({ embeds: [new EmbedBuilder().setColor('#3498db').setDescription(`🎤 <@${member.id}> s-a mutat din <#${oldState.channelId}> în <#${newState.channelId}>`).setTimestamp()] });
            }
        });
    }
};
