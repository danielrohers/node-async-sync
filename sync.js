var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var moment = require('moment');

var _folder = 'images';

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
                    var imgFolder = _folder + '/' + name;
                    var uriImg = uri + name;

                    request
                        .get(uriImg)
                        .on('response', function(response) {
                            console.log(name);
                            cbEach();
                        })
                        .pipe(fs.createWriteStream(imgFolder));
                }, function () {
                    console.log('Total async: %s milliseconds', moment().diff(start, 'milliseconds'));
                    cb(null, '');
                });
            }
    });
};

var _createFolder = function (cb) {
    fs.mkdir(_folder, function (err) {
        if (err)
            return cb(err);
        console.log('Created folder');
        cb(null, '');
    });
};

var _removeFiles = function (cb) {
    fs.readdir(_folder, function (err, files) {
        async.each(files, function (file, cbEach) {
            var folderFile = _folder + '/' + file;
            fs.unlink(folderFile, function (err) {
                if (err)
                    return cbEach(err);
                return cbEach();
            })
        }, cb)
    })
}

var _removeFolder = function (cb) {
    _removeFiles(function (err) {
        if (err)
            return cb(err);

        fs.rmdir(_folder, function (err) {
            if (err)
                return cb(err);

            console.log('Removed folder');

            _createFolder(cb);
        })  
    })
}

var _prepareFolder = function (cb) {
    fs.exists(_folder, function (exists) {
        exists ? _removeFolder(cb) : _createFolder(cb)
    });
};

async.series([
    _prepareFolder,
    _download
])

