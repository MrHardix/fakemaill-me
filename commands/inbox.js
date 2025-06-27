const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const axios = require('axios');

const API_URL = "https://www.1secmail.com/api/v1/";

async function fetchInbox(email) {
    const [login, domain] = email.split('@');
    const response = await axios.get(`${API_URL}?action=getMessages&login=${login}&domain=${domain}`);
    return response.data;
}

async function createInboxEmbed(email) {
    const inbox = await fetchInbox(email);
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`📥 Inbox for ${email}`)
        .setTimestamp();

    if (inbox.length === 0) {
        embed.setDescription('Your inbox is empty.');
    } else {
        for (const mail of inbox.slice(0, 5)) { // Show max 5 emails
            embed.addFields({
                name: `✉️ From: ${mail.from} | Subject: ${mail.subject}`,
                value: `*ID: ${mail.id} | Date: ${mail.date}*`,
                inline: false,
            });
        }
    }
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inbox')
        .setDescription('Shows your current temporary email inbox.'),
    async execute(interaction, userEmails) {
        const userEmail = userEmails.get(interaction.user.id);
        if (!userEmail) {
            return interaction.reply({ content: "You don't have an email address yet. Use `/generate` to create one.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const embed = await createInboxEmbed(userEmail);
            const refreshButton = new ButtonBuilder()
                .setCustomId('refresh_inbox')
                .setLabel('Refresh')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔄');

            const row = new ActionRowBuilder().addComponents(refreshButton);

            const response = await interaction.editReply({
                embeds: [embed],
                components: [row],
            });

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 300_000, // 5 minutes
            });

            collector.on('collect', async i => {
                if (i.customId === 'refresh_inbox') {
                    await i.deferUpdate();
                    const updatedEmbed = await createInboxEmbed(userEmail);
                    await i.editReply({ embeds: [updatedEmbed], components: [row] });
                }
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder().addComponents(refreshButton.setDisabled(true));
                interaction.editReply({ components: [disabledRow] }).catch(() => {});
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Could not fetch your inbox. Please try again.' });
        }
    },
};