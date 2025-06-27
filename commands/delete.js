const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes your current temporary email.'),
    async execute(interaction, userEmails) {
        if (userEmails.has(interaction.user.id)) {
            userEmails.delete(interaction.user.id);
            await interaction.reply({ content: '✅ Your temporary email has been deleted from my records.', ephemeral: true });
        } else {
            await interaction.reply({ content: "You don't have an email address to delete.", ephemeral: true });
        }
    },
};