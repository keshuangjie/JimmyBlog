---
title: Android Install Sqlite3
date: 2012-12-05 16:43:22
categories: Android
tags: [adb,sqlite]
---
在adb模式下用sqlite3命令查看数据库sqlite3 dbName提示：
> /system/bin/sh: sqlite3: not found

原来android系统没有自带sqlite3命令，所以需要我们自己安装（其实只是将sqlite3文件导入相应目录）。

网上查了下，需要先将sqlite3文件导入到手机/system/xbin/目录下，然后将libncurses.so库文件导入/system/lib/目录。

貌似很简单，但却浪费了我两个小时，不过也在这过程中学到了不少新的知识。现在将经历的过程简单记载。

**步骤：**

1、下载sqlite3文件和libncurses.so库文件

2、将sqlite3和libncurses.so导入到android系统目录（**重点**）

我用的小米手机，虽然有root权限，但是感觉并没有完全拥有权限。

开始想到的最简单办法就是使用adb push将pc上sqlite文件copy到/system/xbin ，出现下面提示：

> failed to copy 'C:\Users\User\Desktop\download\sqlite\sqlite3' to '/system/xbin/sqlite3': Read-only file system

后来google有大牛说要遇到这种情况，要执行adb remount命令，又出现下面提示：

> remount failed: Operation not permitted

用adb push这条路是走不通了，只好找其他方法。结果看到有大牛说可以先利用adb push命令将sqlite3文件导入手机sdcard中，然后再用linux下命令cp复制系统文件夹，命令如下：

> cp /mnt/sdcard/sqlite3  /system/xbin/sqlite3

当时感觉像发现了新大陆，心想终于可以解决了，结果提示：
> /system/bin/sh: cp: not found

我就纳闷了网上好多人说可以用cp命令，怎么我的手机下怎么没有呢，看了下/system/xbin/，目录下确实没有cp文件。原来android命令行没有cp命令，但是有mv命令，于是执行

> mv /mnt/sdcard/sqlite3  /system/xbin/sqlite3

提示：

> failed on '/mnt/sdcard/sqlite3' - Cross-device link

也就是说mv命令不允许将存储卡中的文件复制到/system/或/data/分区中，因为两者被认为是在不同的设备上。只能再google......

后来发现了cat命令，查一下cat的用法：cat [选项]... [文件]... ，其作用是将[文件]或标准输入组合输出到标准输出。网上大牛：“平常工作时偶尔会用到cat命令去显示文本文件的内容，然后又想到了重定向符'>'，所以两者一结合，就自然则然地想到是否可以通过将cat的文件输出到指定位置来代替cp的功能？通过尝试发现确实可以。”

于是尝试：

> cat /mnt/sdcard/sqlite3 > /system/xbin/sqlite3

提示：

> /system/bin/sh: cannot create /system/xbin/sqlite3: Read-only file system

看到这个我觉感觉有希望了，cat确实有copy的功能。之前看到过这提示好解决，先将/system处于挂载状态，允许读写，命令如下：

> mount -o remount,rw -t yaffs2 /dev/block/mtdblock3 /system

在执行cat命令就OK了，然后将libncurses.so库文件按上面方法导入到/system/lib/，完整命令如下：

导入到sdcard：

> adb push C:\Users\User\Desktop\downloa\libncurses.so  /mnt/sdcard/libncurses.so

将/system处于挂载状态，使可读写：

> mount -o remount,rw -t yaffs2 /dev/block/mtdblock3 /system

复制到系统文件夹：

> cat /mnt/sdcard/libncurses.so > /system/lib/libncurses.so

3、给sqlite赋予权限

将sqlite3文件和libncurses.so库文件导入到相应目录后，adb模式下执行sqlite3命令提示：

> /system/bin/sh: sqlite3: cannot execute - Permission denied

没有权限，需要添加，命令如下：

> chmod 4755 sqlite3

验证sqlite3是否有权限：

> ll sqlite3 

提示：

> -rwxr-xr-x root root 36860 2012-08-15 21:45 sqlite3

再执行sqlite3命令，提示如下：

> shell@android:/ # sqlite3
> sqlite3
> SQLite version 3.7.4
> Enter ".help" for instructions
> Enter SQL statements terminated with a ";"
> sqlite>

OK，大功告成。感谢网上各位大牛的文章指导。

参考文章如下：

http://blog.csdn.net/ygc87/article/details/7452422
http://stackoverflow.com/questions/3645319/why-do-i-get-a-sqlite3-not-found-error-on-a-rooted-nexus-one-when-i-try-to-op
http://www.andwp.net/tag/sqlite3/
http://weiweiabc109.blog.163.com/blog/static/28357220123211481870/