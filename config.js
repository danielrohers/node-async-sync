/*jslint node: true */

'use strict';

var fs = require('fs');
var async = require('async');

var _folder = 'images';

exports.folder = _folder;

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

exports.prepareFolder = function (cb) {
    fs.exists(_folder, function (exists) {
        exists ? _removeFolder(cb) : _createFolder(cb)
    });
};