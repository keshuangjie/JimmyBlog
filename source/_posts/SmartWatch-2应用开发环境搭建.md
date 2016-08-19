---
title: SmartWatch 2应用开发环境搭建
date: 2014-11-12 19:56:22
categories: Watch
tags: [SmartWatch 2, 可穿戴]
---
# 开发环境搭建

## Android开发环境

smartWatch 2系统是基于Android基础定制的，SmartWatch 2应用开发需要Android应用开发的相关环境：Java、Android sdk、eclipse/android-studio。

## SmartWatch开发环境

开发SmartWatch 2应用另外需要sony提供的Sony-Add-on-SDK。

Sony-Add-on-SDK提供Javadoc、code example、smartWatch模拟器、Smart Extension API和debug应用。Sony-Add-on-SDK有两种安装方式：

**在线安装**

1. Eclipse中启动Android SDK Manager
1. 打开Tools > Manage Add-on Sites …
1. 点击User Defined Sites页签，New，输入 http://dl-developer.sonymobile.com/sdk_manager/Sony-Add-on-SDK.xml点击OK，然后点击close
1. 点开Android4.4.2(API 19) Packages，选中Sony Add-on SDK，然后点击Install packages。

参考：https://developer.sony.com/develop/wearables/smartwatch-2-apis/get-started

**手动安装**

1. 从sony官网上下载Sony Add-on SDK，下载地址：http://developer.sonymobile.com/downloads/sdks/sony-add-on-sdk-manual-installation-kit
1. 拷贝Sony-Add-on-SDK中的addon-sony_add-on_sdk_3_0-sony-19文件夹到ADT Bundle文件夹下面的Android SDK里add-ons文件夹里

Sony Add-on SDK目录结构如下：
![](/images/watch-add-on-sdk.jpg)

* apks文件夹下是手机上的SmartWatch模拟器应用
* docs是api文档文件
* images/libs是sony手机模拟器相关镜像
* samples是官方提供的实例源码，包括SmartExtensionAPI和SmartExtensionUtils两个库工程，SmartWatch其它应用必须得引用SmartExtensionAPI和SmartExtensionUtils

# 配置开发环境

以add-ons\addon-sony_add-on_sdk_3_0-sony-19\samples\SmartExtensions下的HelloLayouts项目为例：

1. 启动Eclipse , 然后File > Import ，再导入页面选择 Android -> Existing Android Code Into Workspace，点击下一步
1. Browse… 选择add-ons\addon-sony_add-on_sdk_3_0-sony-19\samples\SmartExtensions
1. 选中 HelloLayouts,  SmartExtensionAPI, SmartExtensionUtils, 然后点击完成
1. 在HelloLayouts项目中右键 -> Properties -> Android，右边Project Build Target 选择Sony Add-on SDK
1. 在Android右边Library ，Add Library 依次选择SmartExtensionAPI, SmartExtensionUtils，然后点击Apply -> OK
1. 分别clean HelloLayouts,  SmartExtensionAPI, SmartExtensionUtils，项目应该就没有错误了

# 运行

Android环境和SmartWatch环境配置完成了，现在还不能运行HelloLayouts，因为还没有配置运行环境。手机端需要安装三个app:

**SmartWatch 2 SW2**，介绍和下载地址如下：
[Google play下载](https://play.google.com/store/apps/details?id=com.sonymobile.smartconnect.smartwatch2)       
[应用汇下载](http://www.appchina.com/app/com.sonymobile.smartconnect.smartwatch2/)

**Smart Connect**，介绍和下载地址如下：
[Google play下载](https://play.google.com/store/apps/details?id=com.sonyericsson.extras.liveware)     
[酷安下载](https://play.google.com/store/apps/details?id=com.sonyericsson.extras.liveware)

**Emulator on Phone** 手机上的模拟器
位于/android-sdk/add-ons/addon-sony_add-on_sdk_3_0-sony-19/apks/accessory_emulator.apk

安装完上面三个应用后，进行运行

1. eclipse上运行配置好的HelloLayout，因为没有启动的Activity不能看到界面；
1. 打开手机上的配件模拟器（accessory_emulator.apk），选择模拟配置SmartWatch 2；
1. 点击控件API，将在屏幕中间显示手表模拟器；
1. 点击“点按可选择扩展程序”，选择HelloLayouts，模拟器中将显示对应界面。