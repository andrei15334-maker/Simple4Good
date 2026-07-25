module.exports = {
    name: 'AutoResponder',
    
    async handleMessage(message) {
        if (message.author.bot) return;

        const text = message.content.toLowerCase();

        // 1. IP
        if (text.includes('care e ip') || text.includes('ip-ul') || text === 'ip') {
            await message.reply('🖥️ IP-ul serverului nostru de FiveM este: `connect play.simple4good.ro` (sau introdu IP-ul numeric)!');
        }
        
        // 2. Regulament
        else if (text.includes('unde e regulamentul') || text.includes('regulament general')) {
            await message.reply('📜 Regulamentul general îl poți găsi aici: <#123> (în categoria IMPORTANTE). Citește-l cu atenție!');
        }

        // 3. Discord link
        else if (text.includes('link discord') || text.includes('invitatie discord')) {
            await message.reply('🔗 Link-ul permanent pentru prietenii tăi: https://discord.gg/simple4good');
        }

        // 4. Tickete
        else if (text.includes('am o problema') || text.includes('ajutor admin') || text.includes('cum fac ticket')) {
            await message.reply('🎫 Dacă ai o problemă, te rugăm să deschizi un ticket în categoria **SUPPORT** pe canalul dedicat!');
        }
    }
};
