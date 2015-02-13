var Q = require('q');
var cheerio = require('cheerio');
var request = require('request');


function parseChannels(data) {

    $ = cheerio.load(data);
    
    $(".channel_title").each(function (i, el) {
        console.log($(this).text());
    });

}

loadChannelsList().then(parseChannels);


function loadChannelsList() {

    var def = Q.defer();

    request('https://ifttt.com/channels', function (error, response, html) {
        if (!error && response.statusCode == 200) {
            def.resolve(html);
        } else {
            def.reject(error);
        }
    });
    return def.promise;

}