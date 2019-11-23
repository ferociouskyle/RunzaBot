const Discord = require('discord.js');
const request = require('request');
const mysql = require('mysql');
const sched = require('node-schedule');
const fs = require('fs');

const client = new Discord.Client();
client.commands = new Discord.Collection();

client.config = require("./config.js");

let tuesFlag = false;
let postLBEmbed = 'N';
let runzaCals = 530;
let friesCals = 300;
let drinkCals = 200;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

let con = mysql.createConnection({
    host: 'localhost',
    database:'runza_lb',
    user:'root',
    password:'admin',
    insecureAuth:'true'
});

con.connect(function(err) {
    if(err) throw err;
    console.log("Connected");
});
//Daily resets
sched.scheduleJob({hour: 23, minute: 59 }, function(){
    con.query(`UPDATE runza_lb.runza_points SET trusted = NULL, added_today = NULL;`, function(err, results, fields){
        if(err) throw err;
        console.log("We cleared the trusted and today check column.");
        client.users.get("510520397331169309").send(`Today check, and trusted columns cleared.`);
    });
});

sched.scheduleJob({hour: 10, minute: 16}, function(){
    request('https://api.darksky.net/forecast/636efc7c5b7e681b1e3c676b3cc1eb5b/41.2563,-95.9404', {json: true}, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        let tempString = JSON.stringify(body);
        let tempObj = JSON.parse(tempString);
        let currTemp = tempObj.currently.temperature;
        let currIcon = tempObj.currently.icon;
        if(currTemp < 0){
            currTemp = 0;
        }
        let price = ((currTemp / 100) + 4);
        let priceDisp = price.toFixed(2);
        price.toFixed();
        console.log(price);
        let priceStr = price.toString();

        let tempEmbed = new Discord.RichEmbed()
            .setColor(3447003)
            .setTitle("Runza Temp Check")
            .setAuthor(client.user.username)
            .setDescription("*The price listed, is a calculation based off of one location. Your location may be different. I am checking Omaha only! I am also not rounding, nor do I know if Runza rounds up or down.*")
            .setThumbnail("https://darksky.net/images/weather-icons/" + currIcon + ".png")
            .addField('Playing the Runza Game', 'This is supposed to be a fun little game for everyone to enjoy. I will be keeping track of the Runzas purchased, on Temperature Tuesday, and will be providing a leaderboard for you guys to battle it out with!')
            .addField('**Current Temperature:**', currTemp)
            .addField('**Price of Runza Meal:**', '$' + priceDisp)
            .setTimestamp()
            .setFooter("Made with love by FerociousKyle#8011");
        client.channels.get("645233842814451713").send(tempEmbed);

        const leaderEmbed = new Discord.RichEmbed()
            .setColor()
            .setTitle('Runza TT Leader Board')
            .setAuthor(client.user.username)
            .setDescription('This is the official leader board for the Temp Tuesday Runza Game! Make sure you check out, and compete for the prize!')
            .setThumbnail('https://www.runza.com/_resources/e1h:osdb1x-3mb/image/75842250w212h107s4bc3/_fn/Runza_Logo_Green-Yellow-White.png')
            .addField('Leaders: ', 'This message will show who is leading, and then the next three!')
            .setTimestamp()
            .setFooter("Made with love by FerociousKyle#8011");
        client.channels.get("645233842814451713").send(leaderEmbed);
    });
    console.log("Temp Tuesday Check Ran");
});


if (tuesFlag === true){
    console.log("Tick");
}
client.on('message', async msg => {
    let prefix = '!';
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;
    const args = msg.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();

    if(command === 'ping'){
        client.commands.get('ping').execute(msg, args);
    } else if(command === 'lb'){
        client.commands.get('lb').execute(msg, args);
    }
    if(command === 'allow'){
        const taggedUser = msg.mentions.users.first();
        const taggedDiscID = taggedUser.tag;
        con.query(`UPDATE runza_lb.runza_points SET trusted = 'Y' WHERE disc_id = '` + taggedDiscID + `';`, function(err, results, fields){
            if(err) throw err;
            client.users.get("510520397331169309").send(taggedDiscID + ` was trusted by: ` + msg.author.tag);
            console.log(taggedDiscID + ` was trusted by: ` + msg.author.tag);
        });
    }

    if(command === 'ap'){
        let userName = msg.member.user.tag;
        let date = new Date();
        let dOTW = date.getDay();
        let banned = null;
        let trusted = 'N';
        // if(dOTW !== 2){
        //     return msg.reply(`why are you trying to add points when it's not Tuesday!? SHAME! https://giphy.com/gifs/mrw-mods-bethesda-vX9WcCiWwUF7G`);
        // }
        con.query(`SELECT * FROM runza_lb.banned_users WHERE disc_id = '` + userName + `';`, function(err, results, fields){
            if(err) throw err;
            console.log(results);
            if(results.length > 1){
                if(results){
                    banned == 'Y';
                } else {
                    banned == 'N';
                }
            }
        });
        con.query(`SELECT added_today FROM runza_lb.runza_points WHERE disc_id = '` + userName + `';`,function(err, results, fields){
            if(err) throw err;
            console.log(results);
        });
        // con.query(`SELECT trusted FROM runza_lb.runza_points WHERE disc_id = '` + userName + `';`,function(err, results, fields){
        //     if(err) throw err;
        //     if(results[0].trusted === 'Y'){
        //         trusted = 'Y';
        //     }
        //     console.log(results[0]);
        // });
        if(banned == 'Y'){
            return msg.reply(`I'm sorry you've been banned from the Runza Competition! DM FerociousKyle to talk about it if you want.`);
        }
        if(!args.length){
            return msg.reply(`you must provide how many Runzas you purchased!`);
        }
        if(isNaN(args)){
            return msg.reply(`you must put the number of Runza\'s in, not an alpha character.`);
        }
        // if(trusted === 'N' || trusted == null){
            if(args >= 10){
                client.users.get("510520397331169309").send(`${msg.member.user.tag} has a request of equal or greater than 10 (They added: ` + args + `), please validate!`);
                //client.users.get("284834802194972672").send(`${msg.member.user.tag} has a request of equal or greater than 10 (They added: ` + args + `), please validate!`);
                con.query(`SELECT troll_count FROM runza_lb.troll_count WHERE disc_id = '` + userName + `' ;`, function(err, result, fields){
                    if(err) throw err;
                    console.log(result);
                });

                con.query(`INSERT INTO runza_lb.troll_count (disc_id, troll_count) VALUES ('` + userName + `', 1) ON DUPLICATE KEY UPDATE troll_count = troll_count + 1;`, function (err, result, fields) {
                    if(err) throw err;
                    console.log(result);
                });
                return msg.reply(`we will validate your purchase shortly! Please be patient! DM was sent to game developers!` );
            //}
        }


        con.query(`INSERT INTO runza_lb.runza_points (runza_player_id, disc_id, runza_pts, trusted, added_today) VALUES (NULL, '` + userName + `', ` + args + `, NULL, 'Y') ON DUPLICATE KEY UPDATE runza_pts = runza_pts + ` + args + `, added_today = 'Y';`, function (err, result, fields) {
            if(err) throw err;
            con.query(`SELECT runza_pts FROM runza_lb.runza_points WHERE disc_id = '` + userName + `';`, function(err, results, fields){
                if(err) throw err;
                for (var i = 0; i < results.length; i++){
                    var row = results[i];
                }
                let runzaTotalCals = row.runza_pts * runzaCals;
                let drinkTotalCals = row.runza_pts * drinkCals;
                let fryTotalCals = row.runza_pts * friesCals;
                const personal = new Discord.RichEmbed()
                    .setColor(3447003)
                    .setTitle(`${msg.author.tag}'s Temp Tuesday Stats`)
                    .setDescription("*The calories are based off nutrition value given on the Runza website.*")
                    .addField("Runza's Bought: ", row.runza_pts)
                    .addField("Runza Calories Consumed: ", runzaTotalCals, true)
                    .addField("Drink Calories Consumed: ", drinkTotalCals, true)
                    .addField("Fry Calories Consumed: ", fryTotalCals, true);
                msg.channel.send(personal);
            });
        });
        await msg.reply(`we have added ` + args + ` to your total Runza Points. Check the embed!!`);
    }
    //Clear command
    //This command will be awarded to trusted individuals
    //To use this command, please type the username and discrim out, FULLY.
    //Only use this command after an individual has produced evidence that they purchased more than 10 runzas
    if (command === 'clear'){
        let authID = msg.author.id;
        console.log(args[0]);
        if (authID == 284834802194972672 || authID == 510520397331169309 || authID == 280064118935781376){
            con.query(`UPDATE runza_lb.troll_count SET troll_count = troll_count - 1 WHERE disc_id = '` + args + `';`, function(err, results, fields){
                if(err) throw err;
                console.log(`Removed ` + args + ` from troll table.`);
            });
            return msg.reply(`we are clearing ` + args + ` from the troll table.`);
        }
        return msg.reply('you do not have the rights to use this command!');
    }

    if (command === 'banish'){
        let taggedUser = msg.mentions.users.first() || msg.guild.members.get(args[0]);
        console.log(taggedUser);
        if(!taggedUser){
            return msg.reply("you need to tag a user to stop tracking them in the Runza game.");
        }
        let reason = args.slice(1).join(' ');
        if(!reason){
            reason = "'No reason provided.'";
        }
        con.query(`INSERT INTO runza_lb.banned_users (disc_id) VALUES ('` + taggedUser + `', ` + reason + `;`, function(err, results, fields){
            if(err) throw err;
            console.log(results);
        });
    }

    if (msg.content === 'weather') {
        request('https://api.darksky.net/forecast/7dfeec0525844cdaddf595fee5124a12/41.2563,-95.9404', {json: true}, (err, res, body) => {
            if (err) {
                return console.log(err);
            }
            let tempString = JSON.stringify(body);
            let tempObj = JSON.parse(tempString);
            let currTemp = tempObj.currently.temperature;
            let currIcon = tempObj.currently.icon;
            let price = ((currTemp / 100) + 4);
            let priceDisp = price.toFixed(2);

            console.log(priceDisp);

            const weather = new Discord.RichEmbed()
                .setColor(3447003)
                .setTitle("Runza Temp Check")
                .setAuthor(client.user.username)
                .setDescription("*The price listed, is a calculation based off of one location. Your location may be different. I am checking Omaha only! I am also not rounding, nor do I know if Runza rounds up or down.*")
                .setThumbnail("https://darksky.net/images/weather-icons/" + currIcon + ".png")
                .addField('Playing the Runza Game', 'This is supposed to be a fun little game for everyone to enjoy. I will be keeping track of the Runzas purchased, on Temperature Tuesday, and will be providing a leaderboard for you guys to battle it out with!')
                .addField('**Current Temperature:**', currTemp)
                .addField('**Price of Runza Meal:**', '$' + priceDisp)
                .setTimestamp()
                .setFooter("Made with love by FerociousKyle#8011");
            msg.channel.send(weather);
        });
    }

    // if(command === 'lb') {
    //     con.query(`SELECT * FROM runza_lb.runza_points ORDER BY runza_pts DESC;`, function(err, results, fields){
    //         if(err){
    //             const leaderErr = new Discord.RichEmbed()
    //                 .setTitle("Error Connecting To DB")
    //                 .setAuthor(client.user.username)
    //                 .setDescription("It appears we are having some issues connecting to the DB, please try again later!");
    //         }
    //         console.log(results.disc_id);
    //         for (var i = 0; i < results.length; i++){
    //             var row = results[i];
    //         }
    //
    //         const leaderEmbed = new Discord.RichEmbed()
    //             .setColor()
    //             .setTitle('Runza TT Leader Board')
    //             .setAuthor(client.user.username)
    //             .setDescription('This is the official leader board for the Temp Tuesday Runza Game! Make sure you check out, and compete for the prize!')
    //             .setThumbnail('https://www.runza.com/_resources/e1h:osdb1x-3mb/image/75842250w212h107s4bc3/_fn/Runza_Logo_Green-Yellow-White.png')
    //             .addField('**This message is for you to look at how many Runza\'s are being purchased.**', 'Please make sure you use the `!ap` command!')
    //             .addField('**LEADER:**', results[0].disc_id, true)
    //             .addField('**POINTS:**', results[0].runza_pts)
    //             .addField('Next Three:', '' + results[1].disc_id + ', ' + results[2].disc_id + ', ' + results[3].disc_id + '')
    //             .setTimestamp()
    //             .setFooter("Made with love by FerociousKyle#8011");
    //         client.channels.get("645233842814451713").send(leaderEmbed);
    //     });
    //
    //
    // }

});

client.login('');