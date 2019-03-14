// 加载http模块
var http = require('http');
// Cheerio 是一个Node.js的库， 它可以从html的片断中构建DOM结构，然后提供像jquery一样的css选择器查询
var cheerio = require('cheerio');

// 定义爬虫的目标地址
// var url = 'http://www.imooc.com/learn/348';
var url = 'http://192.168.1.71:2047';

http.get(url, function(res) {
    var html = '';
    // 获取页面数据
    res.on('data', function(data) {
        html += data;
    });
    // 数据获取结束
    res.on('end', function() {
        // 通过过滤章节信息获取实际需求的课程信息
        var courseData = filterChapters(html);
        // 打印课程信息
        printCourseInfo(courseData);
    });
}).on('error', function() {
    console.log('获取数据出错！');
});

/* 过滤章节信息 */
function filterChapters(html) {
    console.log(html);
    // 沿用JQuery风格
    var $ = cheerio.load(html);
    // 通过类名获取章节信息
    var chapters = $('.chapter');
    // 课程数据，该数据是一个数组
    var courseData = [];

    /* 章节信息遍历 */
    chapters.each(function(item) {
        // 获取单独的每一章
        var chapter = $(this);
        // 获取strong标签里面的文本，trim()去除空格，split()分隔成数组，最终只获取章节标题
        var chapterTitle = chapter.find('strong').text().trim().split('\n')[0];
        // 获取video标签下的子标签li的内容
        var videos = chapter.find('.video').children('li');
        // 定义章节数据
        var chapterData = {
            chapterTitle : chapterTitle,
            videos : []
        };

        /* 视频信息遍历 */
        videos.each(function(item) {
            // 通过标签的类名来获取单独的视频信息
            var video = $(this).find('.J-media-item');
            // 视频标题
            var videoTitle = video.text().trim().split('\n')[0].trim();
            // 视频时长
            var videoTime = video.text().trim().split('\n')[1].trim();
            // 视频编号
            var id = String(video.attr('href')).split('video/')[1];
            // 填充章节信息中视频数组
            chapterData.videos.push({
                title : videoTitle,
                time : videoTime,
                id : id
            });
        });
        // 填充课程信息中的章节信息
        courseData.push(chapterData);
    });
    // 返回课程信息
    return courseData;
}

/* 打印课程信息 */
function printCourseInfo(courseData) {
    // 遍历课程信息
    courseData.forEach(function(item) {
        // 获取章节标题
        var chapterTitle = item.chapterTitle;
        // 打印章节标题并换行
        console.log(chapterTitle + '\n');
        // 遍历每个章节中的视频信息并打印
        item.videos.forEach(function(video) {
            console.log('   [' + video.id + '] ' + video.title + ' ' + video.time + '\n');
        });
    });
}