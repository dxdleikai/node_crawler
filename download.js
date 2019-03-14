let fs = require('fs');
let Crawler = require('crawler');

let c = new Crawler({
    encoding: null, //If you are downloading files like image, pdf, word etc, you have to save the raw response body which means Crawler shouldn't convert it to string. To make it happen, you need to set encoding to null
    maxConnections: 10,
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            console.log($('title').text());
        }
        done();
    }
});

function requestXhr(url, fileName) {
    c.queue([{
        uri: url,
        jQuery: false, // set false to suppress warning message.
        callback: (error, res, done) => {
            if (error) {
                console.log(error);
            } else {
                res.setEncoding("binary");
                console.log('Grabbed', res.body.length, 'bytes');
                saveAs(res.body, fileName);
            }
            done();
        }
    }]);
}

function saveAs(data, filename) {
    fs.writeFile(filename, data, 'binary', err => {
        if (err) {
            console.log('download fail');
        } else {
            console.log('download success');
        }
    });
}

// let dir = './images/';
// let baseUrl = 'http://www.dianxiaomi.com/static/img/smile/';
// for (let i = 0; i < 100; i++) {
//     let url = `${baseUrl}${i}fixed.png`;
//     console.log(url);
//     let fileName = `${dir}${i}fixed.png`;
//     requestXhr(url, fileName);
// }

requestXhr('http://www.dianxiaomi.com/static/img/smile/0fixed.png', '0fixed.png');