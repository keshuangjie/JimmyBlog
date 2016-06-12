---
title: Android Install busybox
date: 2013-01-18 17:08:44
categories: Android
tags: [adb,busybox]
---
没有root的手机无法导出/data、/system等系统目录下的文件。

虽然使用cat命令先将其copy到/mnt/sdcard中，然后再用adb pull命令导出到pc可以实现。但是cat命令只能copy单个文件，如果想导出文件夹需要进行多次操作。

linux中的cp命令可以显示对文件夹的递归复制，可惜android系统不自带cp命令，不过我们可以像[安装sqlite3命令](/2012/12/05/Android-Install-Sqlite3/)一样安装cp命令。

BusyBox 是一个集成了一百多个最常用linux命令和工具的软件。BusyBox 包含了一些简单的工具，例如ls、cat和 echo等等，还包含了一些更大、更复杂的工具，例如 grep、find、mout 以及 telnet。

**安装busybox步骤：**

1、下载BusyBox的binary，打开这个地址 http://www.busybox.net/downloads/binaries ，选择最新版本，我下载了busybox-armv6l。

2、需要有一个命令行的环境，在电脑上使用adb或在手机上使用terminal emulator。

3、使用adb push busybox-armv6 /mnt/sdcard/busybox-armv6l导入sdcard中

4、输入以下命令，使/system目录可读写

> adb shell
> su
> mount -o remount,rw -t yaffs2 /dev/block/mtdblock3 /system 或者  mount -o remount,rw /emmc@android(分区的物理地址)

5、复制 busybox 文件到 /system/xbin，并为其分配“可执行”的权限

> cat /mnt/sdcard/busybox > /system/xbin
> chmod 755 busybox

6、这时就可以使用 busybox 的命令了，例如使用cp命令busy cp。每次前面都加上个busybox太麻烦了，所以我们还要继续完成安装。

7、安装busybox，在/system/xbin输入：

> busybox --install .

如果想安装到其他路径，将.改成绝对路径

busybox就此安装完成，现在就可以用cp等命令了。安装失败的同学再看下以上步骤，是否有遗漏。

**小技巧：**

1. busybox 里有 ash 和 hush 还有 sh 这几种 shell，在命令行输入 ash 或 hush，可以像在 bash 里那样，通过按上下键选择刚才输入的命令。

2. android系统本身就有ls命令，busybox里也有ls，输入ls时调用的是android的ls，那么想用busybox的ls就要每次都在前面加个busybox吗？不用，使用alias命令可以搞定。

> alias ls='busybox ls'

同样的，cp、mv等二者都有的命令都可以这样搞定。也可以通过修改 /init.rc 来解决。