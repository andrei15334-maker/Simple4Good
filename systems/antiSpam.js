// antiSpam.js
const usersMap = new Map();
const SPAM_LIMIT = 5; // 5 mesaje
const TIME_LIMIT = 5000; // in 5 secunde
const TIMEOUT_DURATION = 5 * 60 * 1000; // Mute pentru 5 minute

module.exports = {
    name: 'AntiSpam',

    async handleMessage(message) {
        if (message.author.bot) return;
        // Nu aplicam anti-spam pe admini (poti schimba permisiunea dupa nevoie)
        if (message.member?.permissions.has('Administrator')) return;

        // 1. Anti Links
        const hasLink = message.content.includes('http://') || message.content.includes('https://') || message.content.includes('discord.gg/');
        // Daca pune link pe un canal care NU e de poze sau anunturi
        if (hasLink && !message.channel.name.includes('poze') && !message.channel.name.includes('anunturi')) {
            await message.delete().catch(()=>{});
            const r = await message.channel.send(`⚠️ <@${message.author.id}>, link-urile nu sunt permise pe acest canal!`);
            setTimeout(() => r.delete().catch(()=>{} ), 4000);
            return; // ne oprim aici
        }

        // 2. Anti Spam (Mesaje prea rapide)
        if (usersMap.has(message.author.id)) {
            const userData = usersMap.get(message.author.id);
            const timeDiff = Date.now() - userData.lastMessageTime;

            if (timeDiff < TIME_LIMIT) {
                userData.msgCount++;
                
                if (userData.msgCount >= SPAM_LIMIT) {
                    // Da-i timeout
                    try {
                        await message.member.timeout(TIMEOUT_DURATION, 'Spam auto-detectat de bot.');
                        const warnMsg = await message.channel.send(`⛔ <@${message.author.id}> a primit **Mute (Timeout) 5 minute** pentru SPAM!`);
                        
                        // Reseteaza counter-ul pentru ca tocmai a luat timeout
                        usersMap.set(message.author.id, { msgCount: 1, lastMessageTime: Date.now() });

                        // Poti trimite si log in logs-staff daca doresti
                        const logChannel = message.guild.channels.cache.find(c => c.name === '📝・logs-staff');
                        if (logChannel) {
                            logChannel.send(`🛡️ Sistem Anti-Spam: <@${message.author.id}> a primit timeout 5 minute pe canalul <#${message.channel.id}>.`);
                        }

                    } catch (e) {
                        console.error('Eroare la timeout anti-spam', e);
                    }
                }
            } else {
                // S-a resetat timpul
                userData.msgCount = 1;
            }
            userData.lastMessageTime = Date.now();
            usersMap.set(message.author.id, userData);
        } else {
            usersMap.set(message.author.id, {
                msgCount: 1,
                lastMessageTime: Date.now()
            });
        }
    }
};
