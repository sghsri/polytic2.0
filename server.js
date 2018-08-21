const express = require('express');
const request = require('request');
var cheerio = require('cheerio');
const app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var fs = require('fs');

var api_key = "";

fs.readFile("api.txt", 'utf8', function (err, data) {
    if (err) throw err;
    api_key = data;
});
app.get("/api/reps", (req, res) => {
    var url = `https://www.googleapis.com/civicinfo/v2/representatives?address=17531 Bending%20Post%20Drive%2077095&levels=country&key=${api_key}`;
    request(url, (err, response, body) => {
        if (err) {
            res.send("ERROR");
        } else {
            scrapeReps();
            let reps = JSON.parse(body);
            if (reps.cod == "404") {
                res.send(reps.message);
            } else {
                res.send(reps);
            }
        }
    });
});
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        );
        next();
    })
    .use(express.static(__dirname))
    .use(bodyParser.json());

function scrapeReps() {
    let url = "https://www.govtrack.us/congress/members/TX/7#q=17531%20Bending%20Post%20Drive&marker_lng=-95.683125&marker_lat=29.918758";
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            let $ = cheerio.load(html);
            $('.btn-success').each(function (i, element) {
                var repurl = $(this).prop('href');
                request("https://www.govtrack.us" + repurl, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        let $ = cheerio.load(html);
                        $('#scorecards>a').each(function (i, element) {
                            console.log($(this).text());
                        });
                    }
                });
            });
        }
    });
}
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});