const { Client, Intents, MessageActionRow, MessageSelectMenu} = require("discord.js");
const { token } = require("./config.json");
const request = require('request');

let faq;
request('https://help.yessness.com/assets/json/faq.json', (e, r, b) =>
{
    faq = JSON.parse(b);
    faq.forEach(e =>
    {
        e.label = e.question;
        e.value = e.question;
    });
});

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

function getQuestions(including, parse = false)
{
    const response = [];
    faq.forEach(e => { if (e.question.toLowerCase().includes(including.toLowerCase())) response.push(e); });
    if (parse)
    {
        let parsed = "";
        if (response.length > 0)
        {
            response.forEach(e => parsed += `\u2022 ${e.question}\n`);
            parsed += "**To get the answer to one of these questions, please use the selection menu under or visit [our website](https://help.yessness.com/faq/). You can also use __/faq get__.**";
        }
        else parsed = "No frequently asked questions matched your search.";
        return parsed;
    }
    return response;
}

function selectMenuWithItems(items)
{
    return items.length === 0 ? [] : [
        new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId("selectQuestion")
                    .setPlaceholder("Select an answer")
                    .addOptions(items)
            )
    ];
}

client.once("ready", () =>
{
    client.user.setActivity("help messages", { type: "LISTENING" });
    console.log("Ready!");
});

client.on("interactionCreate", interaction =>
{
    if (interaction.isCommand())
    {
        switch (interaction.commandName)
        {
            case "faq":
                switch (interaction.options.getSubcommand())
                {
                    case "search":
                        interaction.reply({
                            embeds: [
                                {
                                    color: 0x57fAf8,
                                    author: {
                                        name: "FAQ Search",
                                        icon_url: "https://cdn.discordapp.com/avatars/893457764871966729/0624aae7b4adf4cb6cb0cc2aeac23c48.webp"
                                    },
                                    fields: [
                                        {
                                            name: "Questions matching your search:",
                                            value: getQuestions(interaction.options.getString("query"), true)
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: "TempleOS Help Desk Bot"
                                    }
                                }
                            ],
                            components: selectMenuWithItems(getQuestions(interaction.options.getString("query")))
                        });
                        break;
                    case "get":
                        interaction.reply({
                            embeds: [
                                {
                                    color: 0x57fAf8,
                                    author: {
                                        name: "FAQ Answer",
                                        icon_url: "https://cdn.discordapp.com/avatars/893457764871966729/0624aae7b4adf4cb6cb0cc2aeac23c48.webp"
                                    },
                                    fields: [
                                        {
                                            name: faq[interaction.options.getString("choice")].question,
                                            value: faq[interaction.options.getString("choice")].answer
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: "TempleOS Help Desk Bot"
                                    }
                                }
                            ]
                        });
                        break;
                }
                break;
        }
    }
});

client.login(token).then(() => console.log("Successfully logged in"));