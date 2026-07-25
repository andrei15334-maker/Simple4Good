const verifySystem = require('../systems/verify');
const staffLogs = require('../systems/staffLogs');
const ticketSystem = require('../systems/tickets');
const statsChannels = require('../systems/statsChannels');
const modalsSystem = require('../systems/modals');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`[BOT] Conectat ca ${client.user.tag}`);
        client.user.setActivity('FiveM S4G', { type: 0 }); // 0 = Playing

        // Initializam toate sistemele (modular)
        verifySystem.init(client);
        staffLogs.init(client);
        ticketSystem.init(client);
        statsChannels.init(client);
        modalsSystem.init(client);
        require('../systems/aiResponder').init(client);
    }
};
