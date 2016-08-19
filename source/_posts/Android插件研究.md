---
title: Android插件研究
date: 2014-01-15 15:40:00
categories: Android
tags: [Android, 插件]
---
# 使用插件原因

1、运营方面
公司发布的单独app越来越多，这对推广和集成都非常不利。

2、版本升级方面
即使增加一个很小模块，可能只有几十kb的代码量，都需要重新发布一个版本，用户升级也需要下载一个完整的apk，往往是十几M的体积啊。

# 插件实现方案

1、利用DexClassLoder、反射等技术加载未安装apk class和资源文件

**优点**：插件不需要安装，可以解决升级app过大问题，模块化易扩展
**缺点**：插件引擎开发的工作量大，未知风险，安全性有待调研，加载Activity、Service需要使用java反射技术

使用此技术实现的框架：
[apkplug(插件框架)](http://www.apkplug.com/)  不开源

2、利用android:shareUserId使多个app运行在同一个进程，解决app之间不能通信问题

**优点**：实现起来简单
**缺点**：插件需要安装

使用此技术实现的框架：
(1) http://code.google.com/p/android-application-plug-ins-frame-work/
(2) [XCombine](https://github.com/wyouflf/xCombine) 

3、每一个插件对应一个Service，使用AIDL跨进程通信，实现app之间资源互调

缺点：插件需要安装，耦合性高，开发麻烦，不推荐使用此种技术

实例：[plugins-with-user-interface](http://mylifewithandroid.blogspot.com/2011/01/plugins-with-user-interface.html)

4、phoneGap

成功案例：支付宝app

PS：综合各方面的考虑，后面将采用第一种技术进一步讨论

待续