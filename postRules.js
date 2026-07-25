require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const cap1 = `
**1.1 Roleplay (RP)**
Reprezintă simularea vieții reale în joc, adică totalitatea acțiunilor pe care un om le-ar face în viața reală.

**1.2 In-Character (IC)**
Reprezintă acel moment când simulezi viața reală prin intermediul caracterului tău în joc, de la acțiuni și decizii, până la conversații și sentimente.

**1.3 Deathmatch (DM)**
Reprezintă când 2 sau mai mulți jucători au început să se împuște/bată ca și cum ar fi într-un joc fără un scop Roleplay.

**1.4 Suferințe OOC**
Folosirea unui limbaj vulgar pe chat In-Game/Discord/Live-uri/PM-uri este strict interzisă.

**1.5 Despre evenimente**
Orice adunare unde se strânge o masă de oameni (petrecere, protest, car meeting, competiție, etc) este considerată un eveniment, iar deranjarea lui sau influențarea lui negativă este interzisă.

**1.6 Altele (Comenzi & Limite)**
Este interzis abuzul de /carry, /th, cătușe. De asemenea, limita de a încătușa cu cătușe este de 2 și nu există o limită dacă legați persoanele cu sfoară de la magazin.
`;

const cap2 = `
**2.1 Fail Roleplay**
Reprezintă momentul în care nu reușești să te adaptezi la ce ai face în viața reală în anumite situații Roleplay.
Exemplu: Să conduci o mașină de poliție sau ambulanță ca civil / Intri cu un vehicul într-o instituție.

**2.2 No-Fear (NF)**
Reprezintă momentul în care nu simulezi frica atunci când ești într-o situație roleplay.

**2.3 Out Of Character (OOC)**
Reprezintă momentul când îți ieși din caracter (pielea personajului) și toate acțiunile sunt făcute pe chat global/OOC.

**2.4 Power Gaming (PG)**
Reprezintă folosirea unor puteri supranaturale sau neacordarea de șanse egale ambelor părți într-un Roleplay.

**2.5 Meta Gaming (MG)**
Reprezintă folosirea de informații Out Of Character pentru a afla informații In Character.

**2.6 Condus Non-Roleplay & Reguli Elicoptere**
Limita in oras este de 200 km/h. Condusul pe contrasens fara motiv RP este interzis.

**2.7 Random Deathmatch (RDM)**
Atacarea unui jucător fără motiv RP.

**2.8 Vehicle Deathmatch (VDM)**
Lovirea repetată cu vehiculul fără motiv RP.

**2.9 Ninja Jack (NJ)**
Furtul unei mașini fără roleplay.

**2.10 Revenge Kill (RK) / 2.11 Player Kill (PK) / 2.12 Character Kill (CK)**
Respectați regulile de moarte și pierdere a memoriei.

*(Regulile complete de CK, Scam, Troll și Provoking se aplică la fel)*
`;

const cap3 = `
**3.1 Deranjare Ticket**
Nu interveniți peste admini și nu faceți mișto de ei la tickete. Mințitul la ticket este strict interzis.

**3.2 Fake Cop / Fake Medic**
Este interzis să vă dați drept polițist/medic fără să faceți parte din facțiunea respectivă.

**3.3 AFK în Roleplay**
Este interzis să rămâneți AFK în timpul unei acțiuni RP.

**3.4 Suferințe**
Strict interzise atât In-Character cât și Out of Character.

**3.5 Corupția**
Corupția este strict interzisă pentru departamentele de Poliție și SMURD.
Sancțiune: demitere și 30 de zile transfer.

**3.8 Reguli Chat & Voice Chat**
Scrierea pe chat-ul global sau vorbirea în joc este permisă doar în limba română. Reclama la alte comunități este interzisă (Ban 14 zile).

**3.9 Reguli Transfer**
Sub 14 zile în facțiune: 7 zile transfer. Între 14 și 30 zile: 3 zile transfer. Peste 30 zile: fără transfer.
`;

const cap4 = `
**4.1 Activități Ilegale & Răpiri**
- La jafuri trebuie minim 2 persoane (CIVIL/GANG/MAFIE).
- Pentru a desfășura activități ilegale este necesar să aveți minim 75 de ore jucate.
- Este interzis să folosiți vehicule complet blindate la orice activitate ilegală.

**4.2 Alte Reguli Administrative**
- Farming-ul de ore (programe third-party) este interzis.
- Mai multe persoane pe un singur cont este interzis.
- Folosirea de programe (moduri ilegale/avantaje) este interzisă.
- Dovezile sunt valide 48h.

• **Comunitatea Simple4Good își rezervă dreptul de a-și alege jucătorii.**
`;

client.once('ready', async () => {
    console.log("Incepem postarea regulamentului...");
    const guild = client.guilds.cache.first();
    const rulesChannel = guild.channels.cache.find(c => c.name === '📜・regulament-general');
    
    if (rulesChannel) {
        // Sterge mesajele vechi
        const msgs = await rulesChannel.messages.fetch({ limit: 50 });
        for (const [id, msg] of msgs) {
            await msg.delete().catch(()=>{});
        }

        const embed1 = new EmbedBuilder().setColor('#f39c12').setTitle('Capitolul 1: Definiții Roleplay').setDescription(cap1);
        const embed2 = new EmbedBuilder().setColor('#e74c3c').setTitle('Capitolul 2: Regulament și Sancțiuni (Partea 1)').setDescription(cap2);
        const embed3 = new EmbedBuilder().setColor('#9b59b6').setTitle('Capitolul 3: Regulament și Sancțiuni (Partea 2)').setDescription(cap3);
        const embed4 = new EmbedBuilder().setColor('#3498db').setTitle('Capitolul 4: Activități Ilegale & Diverse').setDescription(cap4);

        const verifyEmbed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('✅ Verificare Regulament')
            .setDescription('Dacă ai citit tot regulamentul de mai sus, apasă pe butonul de mai jos pentru a primi rolul de **Membru S4G** și a debloca restul serverului!');
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_verify')
                .setLabel('✅ Am citit și Accept')
                .setStyle(ButtonStyle.Success)
        );

        await rulesChannel.send({ embeds: [embed1, embed2, embed3] });
        await rulesChannel.send({ embeds: [embed4] });
        await rulesChannel.send({ embeds: [verifyEmbed], components: [row] });
        console.log("Regulament postat cu succes!");
    } else {
        console.log("Canalul de regulament nu a fost gasit!");
    }
    
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
