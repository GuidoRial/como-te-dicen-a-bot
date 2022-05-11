require("dotenv").config();
const { Telegraf } = require("telegraf");
const axios = require("axios");
const express = require("express");
const app = express();
const path = require("path");
const bot = new Telegraf(process.env.BOT_TOKEN);

const PORT = process.env.PORT || 3000;

const quotes = require("./frases.json");

app.get("/quotes", (req, res) => {
    const index = Math.floor(Math.random() * quotes.length - 1);
    res.json({ quote: quotes[index] });
});

bot.command("start", (ctx) => {
    sendStartMessage(ctx);
});

/*--------------------------------------------------------------- */

function sendStartMessage(ctx) {
    bot.botInfo["can_read_all_group_messages"] = true;
    bot.botInfo["supports_inline_queries"] = true;
    const startMessage =
        "Holi, Guido Rial es mi creador, hay dos formas de hacerme andar. Podes etiquetarme y te digo como te dicen, o etiquetame al lado de otra persona y te digo como le dicen a esa persona  ";

    bot.telegram.sendMessage(ctx.chat.id, startMessage, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Quiero una frase de prueba",
                        callback_data: "quote",
                    },
                ],
                [
                    {
                        text: "Mi portfolio",
                        url: "https://portfolio-guidorial.vercel.app/",
                    },
                ],
                [
                    {
                        text: "Créditos",
                        callback_data: "credits",
                    },
                ],
            ],
        },
    });
}

bot.command("help", (ctx) => {
    bot.telegram.sendMessage(ctx.chat.id, "Escribí /start");
});
//http://localhost:3000/quotes
//https://como-te-dicen-a-bot-server.herokuapp.com/quotes

async function fetchQuote() {
    const res = await axios.get(
        "https://como-te-dicen-a-bot-server.herokuapp.com/quotes"
    );
    return res.data.quote;
}

/**
 * Mostly to use with oneself
 */
bot.hears("Como me dicen?", async (ctx) => {
    const quote = await fetchQuote();
    ctx.reply(`Sabes como te dicen a vos? ${quote}`);
});

/**
 * For group chats
 */
bot.mention(async (ctx) => {
    const thisBot = "@ComoTeDicenABot";
    const anotherUser = ctx.message.text
        .replace("@ComoTeDicenABot", "")
        .replace(/\s+/g, "");
    const probabilityOfSetPhrase = Math.floor(Math.random() * 100);
    const quote = await fetchQuote();
    //console.log(ctx.chat.type);//supergroup
    // console.log(ctx.update.message.from.username); //returns my username
    if (
        anotherUser === thisBot ||
        anotherUser.toLowerCase() === thisBot.toLowerCase()
    ) {
        ctx.reply("No quieras hacer cagadas salame");
        return;
    }

    if (ctx.message.text.length > thisBot.length) {
        //Another person has ben tagged
        if (anotherUser === "@MengOtto" && probabilityOfSetPhrase < 80) {
            //If that person is Fran, answer this:
            ctx.reply(
                `Saben como le dicen a ${anotherUser}? Mono manco, porque pela la banana con el culo`
            );
        } else {
            //If it's literally anyone else in the world
            if (probabilityOfSetPhrase < 20) {
                //Small probability that the bot tries to defend your friend :)
                let nameOfUser;
                if (anotherUser.startsWith("@")) {
                    //If that person was tagged as @Person
                    nameOfUser = anotherUser.slice(1);
                } else {
                    //If that person was tagged as Person
                    nameOfUser = anotherUser;
                }
                ctx.reply(`${nameOfUser} le dicen, no sean malos :(`);
            } else {
                //Bot roasts you
                ctx.reply(`Saben como le dicen a ${anotherUser}? ${quote}`);
            }
        }
    } else {
        //Bot has been tagged alone
        const userInSuperGroup = ctx.update.message.from.username;
        if (userInSuperGroup) {
            //If it was done in a group chat
            if (probabilityOfSetPhrase < 20) {
                //Bot tries to resist the urge to roast you
                ctx.reply(
                    `Sabes como te dicen a vos @${userInSuperGroup}? ${userInSuperGroup}, no seas malo con vos mismo :(`
                );
            } else {

                ctx.reply(
                    `Sabes como te dicen a vos @${userInSuperGroup}? ${quote}`
                );
            }
        } else {
            //Bot roasts you in a private chat, apparently ctx.chat.username doesn't work in group chats for some reason?
            ctx.reply(
                `Sabes como te dicen a vos @${ctx.chat.username}? ${quote}`
            );
        }
    }
});

bot.action("credits", (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(
        "Creado por Guido Rial, actualmente buscando trabajo ahre aprovechaba el chabón"
    );
});

bot.action("quote", async (ctx) => {
    ctx.answerCbQuery();
    const quote = await fetchQuote();
    ctx.reply(`Sabes como te dicen a vos? ${quote}`);
});

/*--------------------------------------------------------------- */

const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`);
            bot.launch();
        });
    } catch (error) {
        console.log(error);
    }
};

start();
