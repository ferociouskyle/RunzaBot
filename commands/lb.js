module.exports = {
    name: 'lb',
    description: 'The leader board command for the TT game!',
    execute(msg, args) {
        let con = mysql.createConnection({
            host: 'localhost',
            database:'runza_lb',
            user:'root',
            password:'admin',
            insecureAuth:'true'
        });

        con.query(`SELECT * FROM runza_lb.runza_points ORDER BY runza_pts DESC;`, function(err, results, fields){
            if(err){
                const leaderErr = new Discord.RichEmbed()
                    .setTitle("Error Connecting To DB")
                    .setAuthor(client.user.username)
                    .setDescription("It appears we are having some issues connecting to the DB, please try again later!");
            }
            const leaderEmbed = new Discord.RichEmbed()
                .setColor()
                .setTitle('Runza TT Leader Board')
                .setAuthor(client.user.username)
                .setDescription('This official leader board for the Runza\'s Temp Tuesday! Make sure you check out, and compete for the prize!')
                .setThumbnail('https://www.runza.com/_resources/e1h:osdb1x-3mb/image/75842250w212h107s4bc3/_fn/Runza_Logo_Green-Yellow-White.png')
                .addField('**This message is for you to look at how many Runza\'s are being purchased.**', 'Please make sure you use the `!ap` command!')
                .addField('**LEADER:**', results[0].disc_id, true)
                .addField('**POINTS:**', results[0].runza_pts)
                .addField('Next Three:', '' + results[1].disc_id + ', ' + results[2].disc_id + ', ' + results[3].disc_id + '')
                .setTimestamp()
                .setFooter("Made with love by FerociousKyle#8011");
            client.channels.get("645233842814451713").send(leaderEmbed);
        });
    },

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


};
