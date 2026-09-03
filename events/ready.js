const verifySystem = require('../systems/verify');
const staffLogs = require('../systems/staffLogs');
const ticketSystem = require('../systems/tickets');
const statsChannels = require('../systems/statsChannels');
const modalsSystem = require('../systems/modals');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`[BOT] Conectat ca ${client.user.tag}`);
        client.user.setActivity('FiveM S4G', { type: 0 }); // 0 = Playing

        // Paraseste serverul specificat daca botul se afla pe el
        try {
            const targetGuildId = '1521363170982232186';
            const targetGuild = client.guilds.cache.get(targetGuildId);
            if (targetGuild) {
                await targetGuild.leave();
                console.log(`[SUCCES] Botul a părăsit serverul: ${targetGuild.name} (${targetGuildId})`);
            } else {
                console.log(`[INFO] Botul nu se află pe serverul cu ID-ul ${targetGuildId}`);
            }
        } catch (err) {
            console.error('[EROARE] Nu am putut părăsi serverul:', err);
        }

        // Initializam toate sistemele (modular)
        verifySystem.init(client);
        staffLogs.init(client);
        ticketSystem.init(client);
        statsChannels.init(client);
        modalsSystem.init(client);
        require('../systems/aiResponder').init(client);
    }
};
