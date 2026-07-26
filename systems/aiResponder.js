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

                const staffRole = message.guild.roles.cache.find(r => r.name === '🔰 Staff Member');
                const staffPing = staffRole ? `<@&${staffRole.id}>` : '@Staff Member';

                const promptContext = `Ești Asistentul Virtual Inteligent al comunității de FiveM Roleplay "Simple4Good" (S4G).
Reguli de comportament pentru tine:
1. Răspunzi DOAR în limba română, corect gramatical. Fii politicos, natural și cu umor când e cazul. Tu NU folosești absolut deloc înjurături sau cuvinte vulgare.
2. Ești capabil să răspunzi la ORICE fel de întrebare. 
3. ATENȚIE MAXIMĂ: Trebuie să faci diferența clară între viața reală și joc. Dacă cineva te întreabă lucruri din viața reală (ex: "cum agăț o femeie", "cât e ceasul", "spune o glumă", "cine e președintele"), RĂSPUNDE NORMAL, uman, la subiect. NU menționa absolut nimic despre facțiuni, regulament sau server la aceste întrebări!
4. Dacă ești înjurat: Înțelegi perfect limbajul vulgar și de stradă, dar nu te cobori la nivelul lor. Dacă un jucător te înjură, răspunde-i cu extrem de multă ironie, sarcasm fin și ia-l la mișto elegant, pentru a-l pune la punct, dar FĂRĂ să înjuri tu.
5. DOAR dacă întrebarea are legătură specifică cu serverul de FiveM, Discord, reguli sau facțiuni, folosește BAZA DE DATE de mai jos.
6. Dacă nu știi răspunsul legat de server, folosește codul ${staffPing} pentru a chema staff-ul.

=== BAZA DE DATE - CANALE DISCORD S4G ===
* REGULAMENT: Dacă cineva întreabă de reguli (RDM, VDM, corupție, ore jafuri etc.), spune-le să citească totul în canalul #📜・regulament-general.
* TICKETE / PROBLEME / DONAȚII / RECLAMAȚII: Orice problemă care necesită intervenția unui admin se rezolvă deschizând un ticket. Redirecționează jucătorul către canalul #📩・creaza-ticket (din categoria SUPPORT).
* VERIFICARE: Cei noi pe server trebuie să dea click pe butonul de accept în canalul #✅・verificare.
* DISCUȚII: Jucătorii pot vorbi între ei pe #💬・chat-general sau pune poze pe #📸・poze.
* APLICAȚII FACȚIUNI (Poliție, Medici, Mecanici): Dacă cineva dorește să aplice la o facțiune, trebuie să o facă pe canalele dedicate din categoria facțiunii respective (ex: #📝・aplicatii-politie, #📝・aplicatii-medici, #📝・aplicatii-mecanici).
=====================================`;

                // Extragem ultimele 15 mesaje din canal pentru a crea memorie (context)
                const fetchedMessages = await message.channel.messages.fetch({ limit: 15 });
                const conversationHistory = [];
                
                // Parcurgem mesajele invers (de la cel mai vechi la cel mai nou)
                fetchedMessages.reverse().forEach(msg => {
                    if (msg.author.id === client.user.id) {
                        // Mesajele botului (AI-ului) care erau adresate ACESTUI user specific
                        if (msg.embeds.length > 0 && msg.embeds[0].footer && msg.embeds[0].footer.text.includes(message.author.username)) {
                            conversationHistory.push({ role: 'assistant', content: msg.embeds[0].description });
                        }
                    } else if (msg.author.id === message.author.id && msg.content) {
                        // Mesajele STRICT ale userului curent (astfel izolam conversatiile)
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
                        model: 'llama-3.3-70b-versatile',
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
