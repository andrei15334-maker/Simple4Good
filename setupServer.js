const { ChannelType, PermissionsBitField } = require('discord.js');

const delay = ms => new Promise(res => setTimeout(res, ms));

const rolesConfig = [
    { name: '👑 Fondator', color: '#ff0000' },
    { name: '👑 Co-Fondator', color: '#cc0000' },
    { name: '💻 Developer', color: '#e67e22' },
    { name: '🛠️ Junior Developer', color: '#d35400' },
    { name: '🌟 Community Manager', color: '#f1c40f' },
    { name: '🛡️ General Admin', color: '#3498db' },
    { name: '👁️ Supervizor', color: '#2980b9' },
    { name: '📋 Manager Staff', color: '#9b59b6' },
    { name: '👮 Head of Admin', color: '#8e44ad' },
    { name: '🛡️ Administrator', color: '#2ecc71' },
    { name: '🔨 Moderator', color: '#27ae60' },
    { name: '🔫 Manager Mafii/Gang', color: '#c0392b' },
    { name: '🤝 Helper', color: '#1abc9c' },
    { name: '🎓 Helper In Teste', color: '#16a085' },
    { name: '🔰 Staff Member', color: '#34495e' },
    { name: '📝 Teste Staff', color: '#7f8c8d' },
    { name: '💎 V.I.P Supreme', color: '#e74c3c' },
    { name: '🏆 V.I.P Gold', color: '#f1c40f' },
    { name: '🥈 V.I.P Silver', color: '#bdc3c7' },
    { name: '🥉 V.I.P Bronze', color: '#cd7f32' },
    { name: '⚜️ Lider Sindicat', color: '#000000' },
    { name: '⚜️ Co-Lider Sindicat', color: '#2c3e50' },
    { name: '⚜️ Sindicat S4G', color: '#34495e' },
    { name: '🚓 Lider Politie', color: '#0984e3' },
    { name: '🚓 Co-Lider Politie', color: '#74b9ff' },
    { name: '👮 Politist S4G', color: '#81ecec' },
    { name: '🚑 Lider Medici', color: '#d63031' },
    { name: '🚑 Co-Lider Medici', color: '#ff7675' },
    { name: '👨‍⚕️ Medic S4G', color: '#fab1a0' },
    { name: '🔧 Lider Mecanici', color: '#e17055' },
    { name: '🔧 Co-Lider Mecanici', color: '#ffeaa7' },
    { name: '👨‍🔧 Mecanic S4G', color: '#fdcb6e' },
    { name: '🌟 Membru Special', color: '#a29bfe' },
    { name: '👤 Membru S4G', color: '#dfe6e9' },
    { name: '🌸 Domnisoara', color: '#fd79a8' },
    { name: '⚠️ 1/3 Staff Warn', color: '#55efc4' },
    { name: '⚠️ 2/3 Staff Warn', color: '#00b894' },
    { name: '❌ 3/3 Staff Warn', color: '#000000' },
    { name: '⚠️ 1/2 Staff AV', color: '#ffeaa7' },
    { name: '❌ 2/2 Staff AV', color: '#fdcb6e' },
    { name: '⚠️ 1/3 Mafia Warn', color: '#ff7675' },
    { name: '⚠️ 2/3 Mafia Warn', color: '#d63031' },
    { name: '❌ 3/3 Mafia Warn', color: '#000000' },
    { name: '⚠️ 1/3 Gang Warn', color: '#fab1a0' },
    { name: '⚠️ 2/3 Gang Warn', color: '#e17055' },
    { name: '❌ 3/3 Gang Warn', color: '#000000' },
    { name: '⚠️ 1/2 Mafia AV', color: '#55efc4' },
    { name: '❌ 2/2 Mafia AV', color: '#00b894' },
    { name: '⚠️ 1/2 Gang AV', color: '#81ecec' },
    { name: '❌ 2/2 Gang AV', color: '#00cec9' }
];

module.exports = async function setupServer(guild) {
    console.log("Incepem stergerea canalelor...");
    for (const channel of guild.channels.cache.values()) {
        try { await channel.delete(); await delay(100); } catch(e) {}
    }

    console.log("Incepem stergerea rolurilor vechi...");
    for (const role of guild.roles.cache.values()) {
        if (role.name !== '@everyone' && !role.managed && role.editable) {
            try { await role.delete(); await delay(100); } catch(e) {}
        }
    }

    console.log("Incepem crearea rolurilor noi (inclusiv EMOJIS si CULORI)...");
    const createdRoles = {};
    const rolesToReorder = [];
    
    // Le cream in ordinea din array, dar dupa le ordonam explicit!
    for (const rc of rolesConfig) {
        try {
            const r = await guild.roles.create({ 
                name: rc.name, 
                color: rc.color,
                hoist: true 
            });
            createdRoles[rc.name] = r;
            rolesToReorder.push(r);
            await delay(150);
        } catch(e) { console.error("Eroare creare rol", rc.name); }
    }

    // Setam pozitiile explicit ca sa nu se mai incurce Discord-ul
    console.log("Fixare ierarhie roluri...");
    const positionsData = [];
    const basePosition = 1; // 1 e cel mai de jos (deasupra lui everyone)
    // rolesConfig are Fondator pe [0] si ultimul e pe [length-1]
    // Cel de jos trebuie sa aiba pozitia 1, cel de sus trebuie sa aiba pozitia Max.
    for (let i = 0; i < rolesToReorder.length; i++) {
        // Fondator (index 0) primeste pozitia (rolesToReorder.length - 0)
        positionsData.push({
            role: rolesToReorder[i].id,
            position: basePosition + (rolesToReorder.length - 1 - i)
        });
    }
    
    try {
        await guild.roles.setPositions(positionsData);
    } catch(e) { console.error("Eroare setare pozitii:", e); }

    const everyoneRole = guild.roles.everyone;
    const getRole = (str) => createdRoles[str] || { id: '0' }; // fallback safety

    const staffRole = getRole('🔰 Staff Member');
    const memberRole = getRole('👤 Membru S4G');
    const adminRole = getRole('🛡️ Administrator');
    
    const liderPol = getRole('🚓 Lider Politie');
    const polRole = getRole('👮 Politist S4G');
    const liderMed = getRole('🚑 Lider Medici');
    const medRole = getRole('👨‍⚕️ Medic S4G');
    const liderMec = getRole('🔧 Lider Mecanici');
    const mecRole = getRole('👨‍🔧 Mecanic S4G');
    
    const managerMafii = getRole('🔫 Manager Mafii/Gang');
    const sindicatRole = getRole('⚜️ Sindicat S4G');
    const liderSind = getRole('⚜️ Lider Sindicat');
    const coLiderSind = getRole('⚜️ Co-Lider Sindicat');

    const createChan = async (name, type, parentId, overwrites = []) => {
        try {
            await guild.channels.create({ name, type, parent: parentId, permissionOverwrites: overwrites });
            await delay(100);
        } catch(e) { console.log("Failed channel", name); }
    };

    console.log("Creare Categoria BUN VENIT (Verificare)...");
    const catWelcome = await guild.channels.create({
        name: '👋 ┃ BUN VENIT', type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: everyoneRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }
        ]
    });
    // Acest canal va avea butonul permanent de verificare (postat ulterior de o comanda a botului)
    await createChan('✅・verificare', ChannelType.GuildText, catWelcome.id);

    console.log("Creare Categoria STAFF...");
    const catStaff = await guild.channels.create({
        name: '🛡️ ┃ STAFF', type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: staffRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect] }
        ]
    });
    await createChan('📢・anunturi-staff', ChannelType.GuildText, catStaff.id);
    await createChan('💬・chat-staff', ChannelType.GuildText, catStaff.id);
    await createChan('🔨・sanctiuni-staff', ChannelType.GuildText, catStaff.id);
    await createChan('📝・cerere-invoire', ChannelType.GuildText, catStaff.id);
    await createChan('📝・cerere-demisie', ChannelType.GuildText, catStaff.id);
    await createChan('📝・logs-staff', ChannelType.GuildText, catStaff.id, [
        { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: staffRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }
    ]);
    await createChan('🔊・Voce Staff 1', ChannelType.GuildVoice, catStaff.id);
    await createChan('🔊・Voce Staff 2', ChannelType.GuildVoice, catStaff.id);
    await createChan('🔊・Voce Staff 3', ChannelType.GuildVoice, catStaff.id);
    await createChan('🎙️・Sedinta Staff', ChannelType.GuildVoice, catStaff.id);

    console.log("Creare Categoria GENERAL...");
    const catGeneral = await guild.channels.create({
        name: '🌐 ┃ GENERAL', type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect] }
        ]
    });
    await createChan('💬・chat-general', ChannelType.GuildText, catGeneral.id);
    await createChan('📢・anunturi', ChannelType.GuildText, catGeneral.id);
    await createChan('📸・poze', ChannelType.GuildText, catGeneral.id);
    await createChan('🔴・anunturi-live', ChannelType.GuildText, catGeneral.id);
    await createChan('🔊・Voice 1', ChannelType.GuildVoice, catGeneral.id);
    await createChan('🔊・Voice 2', ChannelType.GuildVoice, catGeneral.id);
    await createChan('🔊・Voice 3', ChannelType.GuildVoice, catGeneral.id);

    console.log("Creare Categoria IMPORTANTE...");
    const catImportante = await guild.channels.create({
        name: '📌 ┃ IMPORTANTE', type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }
        ]
    });
    const regulamentChannel = await guild.channels.create({
        name: '📜・regulament-general',
        type: ChannelType.GuildText,
        parent: catImportante.id,
        permissionOverwrites: [
            { id: everyoneRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }
        ]
    });
    
    // POSTAM REGULAMENTUL DIRECT
    const { EmbedBuilder } = require('discord.js');
    const embedRules = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('📜 Regulament General - Simple4Good')
        .setDescription('Bine ai venit pe Simple4Good! Pentru a păstra un mediu plăcut și corect, te rugăm să respecți cu strictețe următoarele reguli:')
        .addFields(
            { name: '🎭 1.1 Roleplay (RP)', value: 'Reprezintă simularea vieții reale în joc, adică totalitatea acțiunilor pe care un om le-ar face în viața reală.' },
            { name: '👤 1.2 In-Character (IC)', value: 'Reprezintă acel moment când simulezi viața reală prin intermediul caracterului tău în joc, de la acțiuni și decizii, până la conversații și sentimente.' },
            { name: '⚔️ 1.3 Deathmatch (DM)', value: 'Reprezintă când 2 sau mai mulți jucători au început să se împuște/bată ca și cum ar fi într-un joc fără un scop Roleplay.' },
            { name: '🤬 1.4 Suferințe OOC', value: 'Folosirea unui limbaj vulgar pe chat In-Game/Discord/Live-uri/PM-uri este strict interzisă.' },
            { name: '🎉 1.5 Despre evenimente', value: 'Orice adunare unde se strânge o masă de oameni (petrecere, protest, car meeting, competiție, etc) este considerată un eveniment, iar deranjarea lui sau influențarea lui negativă este interzisă.' },
            { name: '⚙️ 1.6 Altele (Comenzi & Limite)', value: 'Este interzis abuzul de /carry, /th, cătușe. De asemenea, limita la jafuri/bănci trebuie respectată conform regulilor IC curente.' }
        )
        .setFooter({ text: 'Sistem Oficial S4G' })
        .setTimestamp();

    await regulamentChannel.send({
        content: '||@everyone||',
        embeds: [embedRules]
    });
    await delay(100);

    await createChan('🔨・sanctiuni', ChannelType.GuildText, catImportante.id);
    await createChan('📢・anunturi-importante', ChannelType.GuildText, catImportante.id);
    await createChan('👀・sneak-peak', ChannelType.GuildText, catImportante.id);
    await createChan('🚀・server-update', ChannelType.GuildText, catImportante.id);

    console.log("Creare Categoria POLITIA...");
    const catPolitie = await guild.channels.create({
        name: '🚓 ┃ POLITIA S4G', type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: polRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
    });
    const viewOnlyMember = { id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] };
    const writeMember = { id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] };

    await createChan('📰・comunicat-de-presa', ChannelType.GuildText, catPolitie.id, [{ id: polRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: liderPol.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);
    await createChan('📜・regulament-politie', ChannelType.GuildText, catPolitie.id, [{ id: polRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: adminRole.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);
    await createChan('⚖️・cod-penal', ChannelType.GuildText, catPolitie.id, [{ id: polRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: adminRole.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);
    await createChan('📝・aplicatii-politie', ChannelType.GuildText, catPolitie.id, [writeMember]);
    await createChan('👮・reclamatii-politie', ChannelType.GuildText, catPolitie.id, [writeMember]);
    await createChan('📢・anunturi-politie', ChannelType.GuildText, catPolitie.id, [{ id: polRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: liderPol.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);

    console.log("Creare Categoria MEDICI...");
    const catMedici = await guild.channels.create({
        name: '🚑 ┃ MEDIC S4G', type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: medRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
    });
    await createChan('📰・comunicat-de-presa', ChannelType.GuildText, catMedici.id, [{ id: medRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: liderMed.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);
    await createChan('📜・regulament-medici', ChannelType.GuildText, catMedici.id, [{ id: medRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: adminRole.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);
    await createChan('📝・aplicatii-medici', ChannelType.GuildText, catMedici.id, [writeMember]);
    await createChan('👨‍⚕️・reclamatii-medici', ChannelType.GuildText, catMedici.id, [writeMember]);
    await createChan('📢・anunturi-medici', ChannelType.GuildText, catMedici.id, [{ id: medRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: liderMed.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);

    console.log("Creare Categoria MECANICI...");
    const catMecanici = await guild.channels.create({
        name: '🔧 ┃ MECANIC S4G', type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: mecRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
    });
    await createChan('📰・comunicat-de-presa', ChannelType.GuildText, catMecanici.id, [{ id: mecRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: liderMec.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);
    await createChan('📜・regulament-mecanici', ChannelType.GuildText, catMecanici.id, [{ id: mecRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: adminRole.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);
    await createChan('📝・aplicatii-mecanici', ChannelType.GuildText, catMecanici.id, [writeMember]);
    await createChan('👨‍🔧・reclamatii-mecanici', ChannelType.GuildText, catMecanici.id, [writeMember]);
    await createChan('📢・anunturi-mecanici', ChannelType.GuildText, catMecanici.id, [{ id: mecRole.id, deny: [PermissionsBitField.Flags.SendMessages] }, { id: liderMec.id, allow: [PermissionsBitField.Flags.SendMessages] }, viewOnlyMember]);

    console.log("Creare Categoria MAFII/GANG...");
    const catMafii = await guild.channels.create({
        name: '🔫 ┃ MAFII / GANG', type: ChannelType.GuildCategory,
        permissionOverwrites: [{ id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] }]
    });
    await createChan('📢・anunturi-mafii-gang', ChannelType.GuildText, catMafii.id, [{ id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: managerMafii.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]);
    await createChan('📢・anunturi-sindicat', ChannelType.GuildText, catMafii.id, [{ id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: sindicatRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }, { id: managerMafii.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, { id: liderSind.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, { id: coLiderSind.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]);
    await createChan('👑・chat-lider', ChannelType.GuildText, catMafii.id, [{ id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: managerMafii.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, { id: liderSind.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]);
    await createChan('🔫・chat-mafii', ChannelType.GuildText, catMafii.id, [{ id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: managerMafii.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, { id: sindicatRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]);
    await createChan('🔨・sanctiuni', ChannelType.GuildText, catMafii.id, [{ id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: managerMafii.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]);

    console.log("Creare Categoria SUPPORT...");
    const catSupport = await guild.channels.create({
        name: '🎫 ┃ SUPPORT', type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }
        ]
    });
    await createChan('📩・creaza-ticket', ChannelType.GuildText, catSupport.id);
    await createChan('⏳・Asteptare Support', ChannelType.GuildVoice, catSupport.id, [{ id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect], deny: [PermissionsBitField.Flags.Speak] }]);
    for(let i=1; i<=5; i++) {
        await guild.channels.create({
            name: `🎧・Support ${i}`, type: ChannelType.GuildVoice, parent: catSupport.id, userLimit: 2,
            permissionOverwrites: [
                { id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: staffRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.MoveMembers] }
            ]
        });
        await delay(100);
    }
};
