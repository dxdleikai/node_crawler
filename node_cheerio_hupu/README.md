# node_crawler
在node环境下使用crawler工具爬取对应的资源，本例是批量爬取对应图片。爬虫框架crawler:[https://www.npmjs.com/package/crawler](https://www.npmjs.com/package/crawler).


cheerio
cheerio是jquery核心功能的一个快速灵活而又简洁的实现，主要是为了用在服务器端需要对DOM进行操作的地方
API[https://www.npmjs.com/package/cheerio](https://www.npmjs.com/package/cheerio).


## 环境

node

### 安装
```
cnpm install
```

### 运行
```
node index.js
```

###
确保改目录下有文件夹data供下载的图片保存，运行后可在data查看下载的图片,该图片在mac下不能预览，在编辑器或者浏览器下可以预览，具体原因尚不清楚。
