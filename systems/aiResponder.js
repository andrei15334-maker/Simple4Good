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

                const promptContext = `Ești Asistentul Virtual Inteligent al comunității de FiveM Roleplay numită "Simple4Good" (S4G).
Reguli de răspuns:
1. Răspunzi DOAR în limba română, cu un ton prietenos, respectuos și natural.
2. Oferi răspunsuri scurte, clare și la obiect (maxim 3-4 propoziții). Nu scrie romane.
3. Ești pe un server de Discord. Dacă jucătorul te salută, salută-l și tu și întreabă-l cu ce îl poți ajuta legat de server.
4. Dacă ești întrebat despre regulament, amintește-i că găsește totul în canalul "regulament-general".
5. Nu inventa comenzi sau link-uri false.
Fii creativ, dar menține-te în rolul tău de asistent S4G!`;

                // Extragem ultimele 15 mesaje din canal pentru a crea memorie (context)
                const fetchedMessages = await message.channel.messages.fetch({ limit: 12 });
                const conversationHistory = [];
                
                // Parcurgem mesajele invers (de la cel mai vechi la cel mai nou)
                fetchedMessages.reverse().forEach(msg => {
                    if (msg.author.id === client.user.id) {
                        // Mesajele botului (AI-ului)
                        if (msg.embeds.length > 0 && msg.embeds[0].description) {
                            conversationHistory.push({ role: 'assistant', content: msg.embeds[0].description });
                        }
                    } else if (!msg.author.bot && msg.content) {
                        // Mesajele utilizatorilor
                        conversationHistory.push({ role: 'user', content: msg.content });
                    }
                });

                // Daca din vreo eroare mesajul curent nu a fost prins in fetch, il adaugam fortat
                if (!conversationHistory.some(m => m.content === message.content && m.role === 'user')) {
                    conversationHistory.push({ role: 'user', content: message.content });
                }

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
                            ...conversationHistory
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
