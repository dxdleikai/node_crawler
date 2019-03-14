const superagent = require('superagent');
//nodejs里一个非常方便的客服端请求代理模块
const cheerio = require('cheerio');
//Node.js版的jQuery
const async = require('async');

const fs = require('fs');
//fs操作IO
const url = require('url');
//url'
const https = require('https');

const request = require('request');
const hupuUrl = 'https://bbs.hupu.com/selfie-1';


let hupuUrl2;

fs.exists('data', (exists) => {
    if (!exists) {
        fs.mkdir('data', (err) => {
            console.log(err);
        });
    }
});

let json = [];
for (let i = 1; i <= 1; i++) {
    let hupuUrl2 = 'https://bbs.hupu.com/selfie-' + i;
    superagent.get(hupuUrl2)
        .end((err, res) => {
            if (err) {
                return console.error(err);
            } else {
                let $ = cheerio.load(res.text);
                $('.titlelink>a:first-child').each((index, element) => {
                
                    let $element = $(element);
                    let href = url.resolve(hupuUrl2, $element.attr('href'));
                    superagent.get(href)
                        .end((err, res) => {
                            if (err) {
                                console.error(err);
                            } 
                            let $ = cheerio.load(res.text);
                            let add = href;
                            let title = $('.bbs-hd-h1>h1').attr('data-title');
                            let tximg = $('.headpic:first-child>img').attr('src');
                            let txname = $('.j_u:first-child').attr('uname');
                            let imgs = $('.quote-content').find('img');

                            let picArr = [];
                            imgs.each((i, e) => {
                                console.log(`=======${i}=====`, $(e).attr('src'));
                                let src = $(e).attr('src');
                                if (!src.endsWith('placeholder.png')) {
                                    picArr.push($(e).attr('src'));
                                }
                            });
                            
                            let stad = {
                                address: add,
                                title: title,
                                ID: txname,
                                touxiang: tximg,
                                pics: picArr,
                            };
                            
                            fs.appendFile('result1.json', JSON.stringify(stad), 'utf-8', (err) => {
                                if (err) {
                                    throw new Error('appendFile failed...');
                                }
                            });
                           
                            let lujin = `data/${title}/`;

                            ((picArr, lujin) => {
                                fs.exists(lujin, (exists) => {
                                    if (!exists) {
                                        fs.mkdir(lujin, (err) => {
                                            if (err) {
                                                throw err;
                                            }
                                            async.mapSeries(picArr, (item, callback) => {
                                                setTimeout(() => {
                                                    downloadPic(item, `${lujin}/${Date.now()}.jpg`);
                                                    callback(null, item);
                                                }, 400);
                                            }, (err, results) => {});
                                        });
                                        console.log('make new directory success');
                                    } else {
                                        console.log('this directory is already eixt');
                                    }
                                });
                            })(picArr, lujin);
                        });
                });
            }
        })
}

// let fs = require('fs');
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

function downloadPic(url, filename) {
    requestXhr(url, filename);
}


function writeLog(log) {
    let dir = `log`;
    fs.exists(dir, (exists) => {
        if (!exists) {
            fs.mkdir(dir, (err) => {
                if (err) {
                    throw err;
                }
                
            });
        }
        fs.writeFile(`${dir}/${Date.now()}.log`, log, (err) => {
            if (err) {
                console.log('write log failed');
            } else {
                console.log('write log success');
            }
        });
    });
}