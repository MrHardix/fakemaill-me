const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const API_URL = "https://www.1secmail.com/api/v1/";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generates a new temporary email address.'),
    async execute(interaction, userEmails) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const response = await axios.get(`${API_URL}?action=genRandomMailbox&count=1`);
            const newEmail = response.data[0];

            if (newEmail) {
                userEmails.set(interaction.user.id, newEmail);

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Email Generated!')
                    .setDescription(`Your new temporary email address is:\n\n**\`${newEmail}\`**`)
                    .setFooter({ text: 'Use /inbox to check for new mail.' });

                await interaction.editReply({ embeds: [embed] });
            } else {
                throw new Error("API did not return an email.");
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Could not generate an email. The API might be down. Please try again later.' });
        }
    },
};