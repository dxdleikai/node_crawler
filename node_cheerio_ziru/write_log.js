
var http = require('http');
var cheerio = require('cheerio');
var url = require('url');
var zlib = require('zlib');
var fs = require('fs');
 
//www.imooc.com和www.zngirls.com网站都支持gzip格式
//所以导致认为接收的数据是错误的，在头中Accept-Encoding中设置的gzip
var learn_url = 'http://www.imooc.com/learn/348';
// var learn_url = 'http://jquery.com/download/';
// var learn_url = 'http://www.zngirls.com/girl/18071/album/';
 
var opt = {
    host: 'proxy3.bj.petrochina',
    port: 8080,
    path: learn_url,
    headers: {
        //头信息写入太多了好像接收到的数据不对
        //仅增加User-Agent头没有问题 +Host头
        //如果没有Host的头'http://www.imooc.com/learn/348'，网址返回301，可能是因为使用了代理的缘故
        //使用代理必须使用Host的头选项
        //Accept-Encoding影响了，估计是返回的是gzip压缩的html而导致的数据不正确
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        //就是这个问题，如果去掉gzip就没问题，保持gzip就会自动返回压缩格式的数据流，由客户端浏览器来进行解压缩
        'Accept-Encoding': 'gzip, deflate, sdch',
        //'Accept-Encoding': 'deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
        'Cache-Control': 'max-age=0',
        Host: url.parse(learn_url).host,
        //'Proxy-Connection': 'keep-alive',
        //'Upgrade-Insecure-Requests': '1',
        //Referer: 'www.zngirls.com',
        //'Cookie':'PHPSESSID=jmlqem3eh4me74m8ommfuekb74; imooc_uuid=2410bb30-858b-4212-96eb-20abca48cb80; imooc_isnew=1; imooc_isnew_ct=1474595643; IMCDNS=0; Hm_lvt_f0cfcccd7b1393990c78efdeebff3968=1474595648; Hm_lpvt_f0cfcccd7b1393990c78efdeebff3968=1474595770; cvde=57e48b3b517cd-3'
    },
}
/****************************
 打印得到的数据结构
 [{
chapterTitle:'',
videos:[{
title:'',
id:''
}]
}]
 ********************************/
function printCourseInfo(courseData) {
    console.log(courseData);
    courseData.forEach(function (item) {
        var chapterTitle = item.chapterTitle;
        console.log(chapterTitle + '\n');
        item.videos.forEach(function (video) {
            console.log(' [' + video.id + ']' + video.title + '\n');
        })
    });
}
 
 
/*************
 分析从网页里抓取到的数据
 **************/
function filterChapter(html) {
    var courseData = [];
 
    var $ = cheerio.load(html);
    var chapters = $('.chapter');
    chapters.each(function (item) {
        var chapter = $(this);
        var chapterTitle = chapter.find('strong').text(); //找到章节标题
        var videos = chapter.find('.video').children('li');
 
        var chapterData = {
            chapterTitle: chapterTitle,
            videos: []
        };
 
        videos.each(function (item) {
            var video = $(this).find('.studyvideo');
            var title = video.text();
            var id = 0;
            //var id = video.attr('href').split('/video')[1];
 
            chapterData.videos.push({
                title: title,
                id: id
            })
        })
 
        courseData.push(chapterData);
    });
 
    return courseData;
}
 
http.get(learn_url, function (res) {
    var html = '';
    console.log(`re.status_code=${res.statusCode}`);
    res.on('data',
        function (data) {
            html += data.toString('utf-8');
            //console.log(`html=${html}`);
            //console.log(html.length);
        });
 
    res.on('end',
        function () {
            if(res.headers['content-encoding'] === 'gzip'){
               //解压缩数据
                var file = fs.createWriteStream('test.html');
                var buffer = new Buffer(html, 'utf-8');
                var gunzipStream = zlib.createGzip();
                //buffer.pipe(gunzipStream).pipe(file);
                //file.pipe(gzipStream).pipe(res);
                //html = zlib.inflate(buffer);
           }
 
           let dir = 'log';
           fs.exists(dir, (exists) => {
                if (!exists) {
                    fs.mkdir(dir, (err) => {
                        if (err) {
                            throw err;
                        } 
                    })
                }
                fs.writeFile(`${dir}/${Date.now()}.log`, html, (err) => {
                    if (err) {
                        console.log('write log failed');
                    } else {
                        console.log('write log success');
                    }
                });
           });
          
            // console.log(`html=${html}`);
            //var courseData = filterChapter(html);
            //printCourseInfo(courseData);
        });
}).on('error', function () {
    console.log('获取课程数据出错');
});
