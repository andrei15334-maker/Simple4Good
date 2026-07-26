const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'AI Responder Groq',
    init(client) {
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot || !message.guild) return;

            // Verificam daca e pe canalul corect
            if (message.channel.name !== '🤖・intrebari-ai') return;

            // Daca nu avem cheie API in .env
            if (!process.env.GROQ_API_KEY) {
                return message.reply('Sistemul AI este oprit. Te rog roagă fondatorul să seteze `GROQ_API_KEY` în sistem.');
            }

            try {
                // Arata ca botul scrie
                await message.channel.sendTyping();

                const promptContext = `Ești Asistentul Virtual Oficial al comunității de FiveM / Discord Roleplay numită "Simple4Good" (S4G).
Ești prietenos, respecți utilizatorii și le răspunzi scurt, clar și la obiect în limba română.
Scopul tău este să-i ajuți cu întrebări legate de roleplay, reguli generale, sau comenzi pe server.
Nu inventa linkuri dacă nu le cunoști. Întrebarea este:`;

                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.1-8b-instant',
                        messages: [
                            { role: 'system', content: promptContext },
                            { role: 'user', content: message.content }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000
                    })
                });

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error.message);
                }

                const botReply = data.choices[0].message.content;

                const embed = new EmbedBuilder()
                    .setColor('#00cec9')
                    .setAuthor({ name: 'S4G - Inteligență Artificială (Groq)', iconURL: client.user.displayAvatarURL() })
                    .setDescription(botReply)
                    .setFooter({ text: `Întrebare de la ${message.author.username}` })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            } catch (error) {
                console.error("Eroare la AI (Groq):", error);
                await message.reply('A apărut o eroare la procesarea mesajului tău: `' + error.message + '`');
            }
        });
    }
};
