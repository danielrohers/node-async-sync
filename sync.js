/*jslint node: true */

'use strict';

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var moment = require('moment');
var config = require('./config');

var _download = function (cb) {
    var start = moment();
    var uri = 'https://nodejs.org/images/';

    request({
        uri: uri,
        method: 'GET'
        }, function (err, response, body) {

            if (err)
                return cb(err);

            if (response.statusCode === 200) {
                var $ = cheerio.load(body);
                var result = $('a[href$=png]');

                async.eachSeries(result, function (img, cbEach) {
                    var name = img.attribs.href;
                    var imgFolder = config.folder + '/' + name;
                    var uriImg = uri + name;

                    request
                        .get(uriImg)
                        .on('response', function(response) {
                            console.log(name);
                            cbEach();
                        })
                        .pipe(fs.createWriteStream(imgFolder));
                }, function () {
                    console.log('Total async: %s seconds', moment().diff(start, 'seconds'));
                    cb(null, '');
                });
            }
    });
};

async.series([
    config.prepareFolder,
    _download
])

