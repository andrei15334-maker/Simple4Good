const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'StatsChannels',
    
    async init(client) {
        // Rulam o data la inceput, apoi la fiecare 10 minute
        this.updateStats(client);
        setInterval(() => this.updateStats(client), 10 * 60 * 1000);
    },

    async updateStats(client) {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        try {
            // Cautam categoria de statisici sau o cream daca nu exista
            let statsCat = guild.channels.cache.find(c => c.name === '📊 ┃ STATISTICI SERVER' && c.type === ChannelType.GuildCategory);
            
            if (!statsCat) {
                statsCat = await guild.channels.create({
                    name: '📊 ┃ STATISTICI SERVER',
                    type: ChannelType.GuildCategory,
                    position: 0, // o punem sus de tot
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.Connect] }, // nimeni nu se poate conecta pe ele
                        { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel] }
                    ]
                });
            }

            // Calculam statisticile
            const totalMembers = guild.memberCount;
            // Membrii pe voce: numaram cati membri au channelId nenul in voiceStates
            const voiceMembers = guild.voiceStates.cache.filter(vs => vs.channelId).size;

            // Actualizam / Cream canalul Membri
            const memberChanName = `👥 Membri: ${totalMembers}`;
            const memberChan = guild.channels.cache.find(c => c.name.startsWith('👥 Membri:') && c.parentId === statsCat.id);
            if (memberChan) {
                if (memberChan.name !== memberChanName) await memberChan.setName(memberChanName);
            } else {
                await guild.channels.create({ name: memberChanName, type: ChannelType.GuildVoice, parent: statsCat.id });
            }

            // Actualizam / Cream canalul Voice
            const voiceChanName = `🎤 Pe Voce: ${voiceMembers}`;
            const voiceChan = guild.channels.cache.find(c => c.name.startsWith('🎤 Pe Voce:') && c.parentId === statsCat.id);
            if (voiceChan) {
                if (voiceChan.name !== voiceChanName) await voiceChan.setName(voiceChanName);
            } else {
                await guild.channels.create({ name: voiceChanName, type: ChannelType.GuildVoice, parent: statsCat.id });
            }

        } catch (err) {
            console.error('Eroare la actualizarea canalelor de statistici:', err);
        }
    }
};
