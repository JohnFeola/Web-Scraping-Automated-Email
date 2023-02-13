//Web Scraping and Automated email project using NodeMailer and Cheerio
//done around September 2022
var cheerio = require('cheerio');
const { json } = require('express');
var request = require('request');
var cmdartists = [];
if(process.argv.length < 3){
  console.log("you didn't enter any artists in command line, email not sent");
  return;
}
for(let p = 2; p < process.argv.length; p++){
  cmdartists.push(process.argv[p]);
}
//CMDartists now contains artists, gather from CLI

request('https://www.popvortex.com/music/charts/top-rap-songs.php', function(error, response, html){
    if(!error && response.statusCode == 200){
        var $ = cheerio.load(html);
        var a = [];

        //below will be a bunch of array manipulation

        //get all song titles into a[]
        $('cite.title').each(function(i, element){
            var title = ($(this).text());
            a.push(title);
        });
        var b = [];
        //now trim to 50 
        for(let i = 0; i < 50; i++){
            b[i] = a[i];
        }
        //array B[] now contains the top 50 song titles

        var c = [];
        var d = [];
        //get all artists into c[]
        $('em.artist').each(function(i, element){
            var artist = ($(this).text());
            c.push(artist);
        });
        //trim to 50


        for(let k = 0; k < 50; k++){
            d[k] = c[k];
        }
        //now array D[] contains top 50 artists
        
        //now locate which song names we want to include in email, using nested for loop + if statement to get indeces...
        //of the songs which match a cmd artist, as well as push that cmd artists to an array with corresponding index values
        var z = [];
        arty = [];
        for(let i = 0; i < 50; i++){
          for(let j = 0; j < cmdartists.length; j++){
            if(cmdartists[j] == d[i]){
              z.push(i);
              arty.push(cmdartists[j]);
            }
          }
        }
        //NOW Z CONTAINS RELEVANT INDEXES OF ASSOCIATED SONGS OF ARTISTS FROM COMMAND LINE
        //AND ARTY[] CONTAINS CORRELATED ARTISTS OF THOSE SONGS @ INDEXES

        //now z[] contains relevant indeces of associated songs of artists from CLI
        //and arty[] contains correponding artist of those songs @ indexes
        temp = [];
        htmltemp = [];
        for(let i = 0; i < arty.length; i++){
          temp.push(arty[i] + " : " + b[z[i]] + ", ");
          htmltemp.push("<p><b>" + arty[i] + "</b>" + " : " + "<i>" + b[z[i]] + "</i></p>");
        }
        //now account for featured artists, using String.includes();
        for(let i = 0; i < 50; i++){
          for(let j = 0; j < cmdartists.length; j++){
            stringy = b[i].toString();
            ex2 = cmdartists[j].toString();
            //the above toString()'s may be unnecessary
            var booly = stringy.includes(ex2);
            if(booly){
              temp.push(d[i] + " : " + b[i] + ", ");
              htmltemp.push("<p><b>" + d[i] + "</b>" + " : " + "<i>" + b[i] + "</i></p>");
            }
          }
        }
        
        //now these two arrays, temp and html contain elements such as 'drake: songname', 'otherartist: song2' etc...


        //now convert to massive strings and format for html
        var text2;
        var html2;
        for(let i = 0; i < temp.length; i++){
          html2+=htmltemp[i];
          text2 +=temp[i];
        }

        var cmdstrings;
        for(let i = 0; i < cmdartists.length - 1; i++){
          cmdstrings += (cmdartists[i] + ", ");
        }
        cmdstrings += cmdartists[(cmdartists.length-1)];
        // cmdstrings = "Your artists are " + cmdstrings;
        cmdstrings = cmdstrings.substr(9);


        //Nodemailer stuff below

        text2 = text2.substr(9);
        cmdstrings = "Your artists are" + " " +  cmdstrings; 

        html2 = html2.substr(9);

                let jsonData = require('./credentials.json');
                var nodemailer = require("nodemailer");
                var sender = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: jsonData.sender_email,
                pass: jsonData.sender_password
              }
            });          
              var mail = {
              from: jsonData.from,
              to: jsonData.to,
              subject: cmdstrings,
              text: text2,
              html: "<p>" + html2 + "</p>"
            };
            
            sender.sendMail(mail, function(error, info) {
              if (error) {
                console.log(error);
              }else{
                console.log("Email sent successfully: "
                            + info.response);
              }
            });
            }else{
              console.log("you didn't enter any artists, OR there were no songs matching those artists within the top 25");
            }
        });