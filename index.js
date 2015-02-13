var Q = require('q');
var cheerio = require('cheerio');
var request = require('request');


function getTriggers($) {
    
    var triggers = [];
    
    $(".trigger-list_item_name").each(function(i, el){
        triggers.push($(this).text().trim());
    });
    
    return triggers;
}

function getActions($) {
    
    var actions = [];
    
    $(".action-list_item_name").each(function(i, el){
        actions.push($(this).text().trim());
    });
    
    return actions;
}

function loadChannel(path) {

    var def = Q.defer();

    request('https://ifttt.com/channels'+path, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            
            $ = cheerio.load(html);

            def.resolve({
                channel: path.replace('/',''),
                triggers: getTriggers($),
                actions: getActions($)
            });
            
        } else {
            def.reject(error);
        }
    });

    return def.promise;
}
    

function getChannelPaths(data) {

    $ = cheerio.load(data);
    
    var paths = [];
    
    $(".channel").each(function (i, el) {
        var path = $(this).find('a').attr('href');
        paths.push(path);
    });
    
    return paths;
}

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


function outputCSV(data) {
    
    console.log('"channel","type","title"');
    
    for (var i=0, l=data.length; i<l; i++) {
        
        var channel = data[i];
        
        for (var j=0, m=channel.triggers.length; j<m; j++) {
            console.log('"'+channel.channel+'","trigger","'+channel.triggers[j]+'"');
        }
        
        for (var j=0, m=channel.actions.length; j<m; j++) {
            console.log('"'+channel.channel+'","action","'+channel.actions[j]+'"');
        }
    }
}

loadChannelsList().then(function(d) {

    var paths = getChannelPaths(d);
    
    var promises = [];
    
    for (var i=0, l=paths.length; i<l; i++) {
        promises.push(loadChannel(paths[i]));
    }
                      
    Q.all(promises).then(function(results){
            
        console.log(results);
//        outputCSV(results);

    });

});


