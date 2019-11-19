const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const mysql = require('mysql');
const sched = require('node-schedule');
const fs = require('fs');


let tuesFlag = false;
let postLBEmbed = 'N';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

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

let tuesCheck = sched.scheduleJob({hour: 9, minute: 39, dayOfWeek: 2}, function(){
    request('https://api.darksky.net/forecast/636efc7c5b7e681b1e3c676b3cc1eb5b/41.2563,-95.9404', {json: true}, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        let tempString = JSON.stringify(body);
        let tempObj = JSON.parse(tempString);
        let currTemp = tempObj.currently.temperature;
        let currIcon = tempObj.currently.icon;
        let price = ((currTemp / 100) + 4);
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
            .addField('**Price of Runza Meal:**', '$' + priceStr)
            .setTimestamp()
            .setFooter("Made with love by FerociousKyle#8011");
    });
    client.channels.get("645233842814451713").send(tempEmbed);
    console.log("Temp Tuesday Check Ran");
    console.log("Setting postLBEmbed = true");
    postLBEmbed = 'Y';
});

if(postLBEmbed === 'Y'){
    const leaderEmbed = new Discord.RichEmbed()
        .setColor()
        .setTitle('Runza TT Leader Board')
        .setAuthor(client.user.username)
        .setDescription('This is the official leader board for the Temp Tuesday Runza Game! Make sure you check out, and compete for the prize!')
        .setThumbnail('https://www.runza.com/_resources/e1h:osdb1x-3mb/image/75842250w212h107s4bc3/_fn/Runza_Logo_Green-Yellow-White.png')
        .addField('This message is for you to pick how many Runzas you puchased that day!')
        .setTimestamp()
        .setFooter("Made with love by FerociousKyle#8011");
    client.channels.get("631173980069560373").send(leaderEmbed).then(leaderEmbed => {
        leaderEmbed.react('1⃣');
    });
}

if (tuesFlag === true){
    console.log("Tick");
}
client.on('message', async msg => {
    let prefix = '!';
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;
    const args = msg.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();

    if(command === 'ap'){
        let userName = msg.member.user.tag;
        let mod = client.users.get("510520397331169309");
        if(!args.length){
            return msg.reply(`you must provide how many Runzas you purchased!`);
        }
        if(isNaN(args)){
            return msg.reply(`you must put the number of Runza\'s in, not an alpha character.`);
        }
        if(args >= 10){
            client.users.get("510520397331169309").send(`${msg.member.user.tag} has a request of equal or greater than 10 (They added: ` + args + `), please validate!`);
            con.query(`SELECT troll_count FROM runza_lb.troll_count WHERE disc_id = '` + userName + `' ;`, function(err, result, fields){
                if(err) throw err;
                console.log(result);
            });

            con.query(`INSERT INTO runza_lb.troll_count (disc_id, troll_count) VALUES ('` + userName + `', 1) ON DUPLICATE KEY UPDATE troll_count = troll_count + 1;`, function (err, result, fields) {
                if(err) throw err;
                console.log(result);
            });
            return msg.reply(`we will validate your purchase shortly! Please be patient! DM was sent to ` + mod + `!` );
        }
        
        con.query(`INSERT INTO runza_lb.runza_points (runza_player_id, disc_id, runza_pts) VALUES (NULL, '` + userName + `', ` + args + `) ON DUPLICATE KEY UPDATE runza_pts = runza_pts + ` + args + `;`, function (err, result, fields) {
            if(err) throw err;
            console.log(result);
        });

        con.query(`SELECT runza_pts FROM runza_lb.runza_points WHERE disc_id = '` + userName + `';`, function(err, results, fields){
            if(err) throw err;

        });
        let totalPoints = 3;
        await msg.reply(`we have added ` + args + ` to your total Runza Points. You now have ` + totalPoints + `!`);

    }
    if (command === 'help')
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

    if(command === 'lb') {
        const leaderEmbed = new Discord.RichEmbed()
            .setColor()
            .setTitle('Runza TT Leader Board')
            .setAuthor(client.user.username)
            .setDescription('This is the official leader board for the Temp Tuesday Runza Game! Make sure you check out, and compete for the prize!')
            .setThumbnail('https://www.runza.com/_resources/e1h:osdb1x-3mb/image/75842250w212h107s4bc3/_fn/Runza_Logo_Green-Yellow-White.png')
            .addField('**This message is for you to look at how many Runza\'s are being purchased.**', 'Please make sure you use the `!ap` command!')
            .addField('**LEADER:**', 'need to hit db', true)
            .addField('**POINTS:**', 'need to hit db')
            .setTimestamp()
            .setFooter("Made with love by FerociousKyle#8011");
        client.channels.get("645233842814451713").send(leaderEmbed);
    }

});

client.login('NjMxMTczNTgxNzk5NDI0MDAz.XdQKjA.GJfzVyjmUVVWdjMh6DfHF_GJFn8');