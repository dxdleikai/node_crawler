const superagent = require('superagent');
//nodejs里一个非常方便的客服端请求代理模块
const cheerio = require('cheerio');
//Node.js版的jQuery

const fs = require('fs');
//fs操作IO
const url = require('url');
//url'

const async = require('async');

fs.exists('data', (exists) => {
    if (!exists) {
        fs.mkdir('data', (err) => {
            console.log(err);
        });
    }
});

let result_json = [];
let per_page = 40;
let all_blogs = 0;
let pages = 5;

let start = 5;
let end = start + pages;

//虎扑未登录状态只能查看前10页；
for (let i = start; i <= end; i++) {
    let hupuUrl2 = 'https://bbs.hupu.com/selfie-' + i;
    superagent.get(hupuUrl2)
        .end((err, res) => {
            if (err) {
                return console.error(err);
            } else {
                let $ = cheerio.load(res.text);
                let blog_length = $('.titlelink>a:first-child').length;
                $('.titlelink>a:first-child').each((index, element) => {
                    let $element = $(element);
                    let href = url.resolve(hupuUrl2, $element.attr('href'));
                    superagent.get(href)
                        .end((err, res) => {
                            if (err) {
                                console.error(err);
                            } 
                            all_blogs++;
                            let $ = cheerio.load(res.text);
                            let add = href;
                            let title = $('.bbs-hd-h1>h1').attr('data-title');
                            let tximg = $('.headpic:first-child>img').attr('src');
                            let txname = $('.j_u:first-child').attr('uname');
                            let imgs = $('.quote-content').find('img');

                            let picArr = [];
                            imgs.each((i, e) => {
                                let src = $(e).attr('src');
                                if (!src.endsWith('placeholder.png')) {
                                    picArr.push($(e).attr('src'));
                                }
                            });
                            
                            result_json.push({
                                address: add,
                                title: title,
                                ID: txname,
                                touxiang: tximg,
                                pics: picArr,
                            });
                           
                            if (all_blogs === pages*per_page) {
                                fs.writeFile('result.json', JSON.stringify(result_json), err => {
                                    if (err) {
                                        throw new Error('write result.json failed');
                                    }
                                })
                            }
                            
                            if (!title) {
                                title = all_blogs;
                            }

                            let lujin = `data/${title}/`;

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
                                    console.log(`make new directory 【${title}】 success`);
                                } else {
                                    console.log(`directory【${title}】 is already eixt`);
                                }
                            });
                        });
                });
            }
        })
}

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
            console.log(`download【${filename}】 fail`);
        } else {
            console.log(`download 【${filename}】 success`);
        }
    });
}

function downloadPic(url, filename) {
    requestXhr(url, filename);
}