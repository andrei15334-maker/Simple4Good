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

                // Injectam ora si data curenta ca sa le stie
                const currentDate = new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' });

                const promptContext = `Ești Asistentul Virtual Inteligent al comunității de FiveM Roleplay "Simple4Good" (S4G).
Ora și data curentă în România: ${currentDate}. (Dacă ești întrebat cât e ceasul, dă-i ora asta).

Reguli de comportament pentru tine:
1. Răspunzi DOAR în limba română, prietenos și natural.
2. Fii scurt, logic și la obiect.
3. Ești capabil să răspunzi la ORICE fel de întrebare, fie ea din viața reală, glume, cultură generală sau calcule matematice. 
4. Dacă ești întrebat specific despre server, folosește baza de date de mai jos.
5. EXTREM DE IMPORTANT: Dacă un jucător te înjură, te jignește sau face mișto de tine, AI PERMISIUNEA să fii extrem de sarcastic, arogant și să-l iei la mișto grav (roast). Pune-l la punct cu replici usturătoare (dar fără să folosești cuvinte care iau ban pe Discord). Arată-le cine e șeful!

=== BAZA DE DATE - S4G ===
* Facțiuni disponibile pe server: Poliția S4G, Medicii S4G, Mecanicii S4G, Mafii & Sindicat.
* Aplicații: Dacă cineva vrea să intre într-o facțiune, spune-i să verifice canalele dedicate (ex: #📝・aplicatii-politie, #📝・aplicatii-medici, #📝・aplicatii-mecanici).
* Tickete: Orice problemă gravă, reclamație sau donație se face deschizând un ticket în categoria SUPPORT (#📩・creaza-ticket).
* Regulament RP: RP = Roleplay, IC = In Character, OOC = Out Of Character.
* DM (Deathmatch) & RDM/VDM: Strict interzis fără motiv RP.
* Corupția: Strict interzisă la Poliție și SMURD.
* Jafuri/Ilegale: Minim 2 persoane la jaf. Minim 75 ore jucate.
* Deranjare admini: Strict interzis. 
=====================================`;

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
