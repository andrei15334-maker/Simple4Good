const verifySystem = require('../systems/verify');
const ticketSystem = require('../systems/tickets');
const modalsSystem = require('../systems/modals');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            await verifySystem.handleInteraction(interaction);
            await ticketSystem.handleInteraction(interaction);
            await modalsSystem.handleInteraction(interaction);
        } catch (err) {
            console.error('[INTERACTION ERROR]', err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ A apărut o eroare la procesarea acțiunii.', ephemeral: true }).catch(() => {});
            }
        }
    }
};
