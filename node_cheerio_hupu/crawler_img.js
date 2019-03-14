
const superagent = require('superagent');
const cheerio = require('cheerio');
const async = require('async');
const fs = require('fs');
const url = require('url');
const request =require('request');
const hupuUrl = 'https://bbs.hupu.com/selfie-1';
 
let ssr = [];
let allUrl = [];
let curCount = 0;
 
for (let i = 1; i <= 4; i++) {
    hupuUrl2 = 'https://bbs.hupu.com/selfie-' + i;
//for循环把五页的页面循环出来
    superagent.get(hupuUrl2)
//通过superagent去请求每一页
        .end(function (err, res) {
            if (err) {
                return console.error(err);
            }
//cheerio  nodejs版的JQ 
            let $ = cheerio.load(res.text);
//获取首页所有的链接
            $('.titlelink>a:first-child').each(function (idx, element) {
                let $element = $(element);
                let href = url.resolve(hupuUrl2, $element.attr('href'));
                allUrl.push(href);
                curCount++;
//获取到此url，异步进行以下操作，此操作为进入到这个帖子中爬取数据
                superagent.get(href)
                    .end(function (err, res) {
                        if(err){
                            return console.error(err);
                        }
                        let $ = cheerio.load(res.text);
                        let add = href;
                        let title = $('.bbs-hd-h1>h1').attr('data-title');//帖子标题
                        let tximg = $('.headpic:first-child>img').attr('src');//用户头像
                        let txname = $('.j_u:first-child').attr('uname');//用户ID

                        // console.log($('.quote-content').find('img'));
                        // return;
                        let contentimg1 = $('.quote-content>p:nth-child(1)>img').attr('src');//爆照图1
                        let contentimg2 = $('.quote-content>p:nth-child(2)>img').attr('src');//爆照图2
                        let contentimg3 = $('.quote-content>p:nth-child(3)>img').attr('src');//爆照图3
                        ssr.push({
                            'tx': tximg,
                            'name': txname,
                            'pic': contentimg1,contentimg2,contentimg3
                        });
//把数据存储到一个对象里
                        let stad = {
                            "address": add,
                            "title":title,
                            "ID" : txname,
                            "touxiang" : tximg,
                            "pic1" : contentimg1,
                            "pic2" : contentimg2,
                            "pic3" : contentimg3
                        };
                        let picArr = [contentimg1,contentimg2,contentimg3];
                        //console.log(stad);
//通过fs模块把数据写入本地json
                        fs.appendFile('data/result1.json', JSON.stringify(stad) ,'utf-8', function (err) {
                            if(err) throw new Error("appendFile failed...");
                            //console.log("数据写入success...");
                        });
//定义一个以title为文件夹名的路径，作为以后下载图片时使用



                        async.mapSeries(picArr,function(item, callback){
                            setTimeout(function(){
                        //downloadPic方法下载图片
                                downloadPic(item, `data/${Date.now()}.jpg`);
                                callback(null, item);
                            },400);
                        }, function(err, results){});


//                         let lujin = 'data';
// //判断文件夹是否存在
//                         fs.exists(lujin,function (exists) {
//                             if(!exists){
//                                 fs.mkdir(lujin, function(err) {
//                                     if (err) {
//                                         throw err;
//                                     }
//                                     async.mapSeries(picArr,function(item, callback){
//                                         setTimeout(function(){
// //downloadPic方法下载图片
//                                             downloadPic(item, `${lujin}${Date.now()}.jpg`);
//                                             callback(null, item);
//                                         },400);
//                                     }, function(err, results){});
//                                 });
//                                 console.log('ye')
//                             }else {
//                                 console.log('er')
//                             }
//                         })
                    })
            });
        });
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
            console.log('download fail');
        } else {
            console.log('download success');
        }
    });
}

function downloadPic(url, filename) {
    requestXhr(url, filename);
}