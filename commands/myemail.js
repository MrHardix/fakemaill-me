const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('myemail')
        .setDescription('Shows your current temporary email address.'),
    async execute(interaction, userEmails) {
        const userEmail = userEmails.get(interaction.user.id);
        if (userEmail) {
            await interaction.reply({ content: `Your current email address is: \`${userEmail}\``, ephemeral: true });
        } else {
            await interaction.reply({ content: "You don't have an email address yet. Use `/generate` to create one.", ephemeral: true });
        }
    },
};