var http = require('http');
var express = require('express');
var Util = require('./Util.js');

var app = express();

app.use('/data', function(req, res){
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });

    var pattern = req.query.pattern;
    var result;
    if (pattern) {
        result = getItems(pattern);
    } else {
        result = [];
    }

    res.end(JSON.stringify(result));
});

app.use(express.static('./'));

http.createServer(app).listen(5000);
console.log('Server running at port 5000');



function getItems(pattern) {
    var patterns = Util.splitWords(pattern.toLowerCase());

    var name, email, matchName, matchEmail;
    var result = [];
    for (var i in data) {
        matchName = true;
        matchEmail = true;
        name = data[i].name.toLowerCase();

        if (data[i].email) {
            email = data[i].email.toLowerCase();
        } else {
            email = '';
        }

        for (var j in patterns) {
            if (!Util.searchSubstring(name, patterns[j])) {
                matchName = false;
            }
            if (!Util.searchSubstring(email, patterns[j])) {
                matchEmail = false;
            }
        }
        if (matchName || matchEmail) {
            result.push(data[i]);
        }
    }
    return result;
}

var data = [
    {
        id: 12,
        name: 'Шелли Марш',
        photo: 'img/shelly.jpg',
        email: 'badgirl@msn.com'
    },
    {
        id: 13,
        name: 'Ренди Марш',
        photo: 'img/randy.png'
    },
    {
        id: 14,
        name: 'Шерон Марш',
        photo: 'img/sharon.jpg'
    },
    {
        id: 1,
        name: 'Эрик Картман',
        photo: 'img/cartman.jpeg',
        email: 'fatboy@gmail.com'
    },
    {
        id: 2,
        name: 'Лиэн Картман',
        photo: 'img/lien_cartman.jpeg',
        email: 'fatboymom@gmail.com'
    },
    {
        id: 3,
        name: 'Баттерс Стотч',
        photo: 'img/ButtersStotch.png',
        email: 'shyguy@yahoo.com'
    },
    {
        id: 4,
        name: 'Крейг Такер',
        photo: 'img/Craig.png',
        email: 'strangeman@yahoo.com'
    }
];

