module.exports = {
    name: 'AutoFilterPoze',
    
    async handleMessage(message) {
        // Ignora botii
        if (message.author.bot) return;

        // Cauta numele canalului
        if (message.channel.name === '📸・poze') {
            // Verifica daca mesajul are atasamente (poze/video)
            const hasAttachment = message.attachments.size > 0;
            // Verifica daca mesajul contine link-uri (ex: tenor gif sau imgur)
            const hasLink = message.content.includes('http://') || message.content.includes('https://');

            if (!hasAttachment && !hasLink) {
                try {
                    await message.delete();
                    const reply = await message.channel.send(`<@${message.author.id}>, ⚠️ Acest canal este strict pentru poze sau videoclipuri!`);
                    
                    // Sterge avertismentul dupa 5 secunde ca sa tinem chatul curat
                    setTimeout(() => {
                        reply.delete().catch(() => {});
                    }, 5000);
                } catch (err) {
                    console.error('Nu am putut sterge mesajul in filtru poze', err);
                }
            }
        }
    }
};
