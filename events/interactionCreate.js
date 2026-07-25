const verifySystem = require('../systems/verify');
const ticketSystem = require('../systems/tickets');
const modalsSystem = require('../systems/modals');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        await verifySystem.handleInteraction(interaction);
        await ticketSystem.handleInteraction(interaction);
        await modalsSystem.handleInteraction(interaction);
    }
};
