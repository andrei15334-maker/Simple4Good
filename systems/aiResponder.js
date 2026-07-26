const { Events, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'AI Responder',
    init(client) {
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot || !message.guild) return;

            // Verificam daca e pe canalul corect
            if (message.channel.name !== '🤖・intrebari-ai') return;

            // Daca nu avem cheie API in .env
            if (!process.env.GEMINI_API_KEY) {
                return message.reply('Sistemul AI este oprit. Te rog roagă fondatorul să seteze `GEMINI_API_KEY` în sistem.');
            }

            try {
                // Arata ca botul scrie
                await message.channel.sendTyping();

                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const promptContext = `
Ești Asistentul Virtual Oficial al comunității de FiveM / Discord Roleplay numită "Simple4Good" (S4G).
Ești prietenos, respecți utilizatorii și le răspunzi scurt, clar și la obiect în limba română.
Scopul tău este să-i ajuți cu întrebări legate de roleplay, reguli generale, sau comenzi pe server.
Nu inventa linkuri dacă nu le cunoști.
Întrebarea utilizatorului este: "${message.content}"
`;

                const result = await model.generateContent(promptContext);
                const response = result.response.text();

                const embed = new EmbedBuilder()
                    .setColor('#00cec9')
                    .setAuthor({ name: 'S4G - Inteligență Artificială', iconURL: client.user.displayAvatarURL() })
                    .setDescription(response)
                    .setFooter({ text: `Întrebare de la ${message.author.username}` })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            } catch (error) {
                console.error("Eroare la AI:", error);
                await message.reply('A apărut o eroare la procesarea mesajului tău: `' + error.message + '`');
            }
        });
    }
};
