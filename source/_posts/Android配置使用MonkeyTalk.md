---
title: Android配置使用MonkeyTalk
date: 2013-10-25 18:09:35
categories: Test
tags: [AutoTest,MonkeyTalk]
---
# 环境准备

## 下载MonkeyTalk

下载对应平台的[MonkeyTalk](https://www.gorillalogic.com/monkeytalk)（需要先注册、登陆才能下载），主要用到两个目录agents（包含一些需要放到android工程的lib文件)、MonkeyTalkIDE。monkeyTalk目录结构：

![](/images/monkeytalk-structure.png)

## 安装eclipse插件

eclipse安装插件[AJDT](http://www.eclipse.org/ajdt/)，需要注意与eclipse的版本对应，否则会出现安装不上的问题。可以选择eclipse在线安装或者将zip包下载下来本地安装。安装完成后在eclipse项目名称上右键->Configure，如果显示的菜单中有Convert to AspectJ，则说明安装成功。

# 将Android项目转换成AspectJ Project

## 转换工程

右键android项目->configure->convert to AspectJ Project：

![](/images/monkeytalk-convert.png)

对应的android项目下会多一个文件夹AspectJ Runtime Library。

## 添加lib库

在android项目下新建libs文件夹，将monkeytalk->agents->andriod->monkeytalk-agent-1.0.58.jar copy到libs文件夹下。
选中monkeytalk-agent-1.0.58.jar右键->AspectJ Tools->add toAspectpath。

## 输出库

对应android项目上右键--Build Path->Configure Build Path...->order and export，选中AspectJ Runtime Library，点击OK：

![](/images/monkeytalk-order-and-export.png)

## 修改AndroidManifest.xml

在AndroidManifetst.xml里添加以下以下权限：

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.GET_TASKS" />
ps: 权限INTERENT用于IDE与App通过Http通信用。权限GET_TASKS是允许程序获取当前或最近运行的应用。

# monkeyTalkIDE 连接andriod设备

## 新建工作空间

打开mokeyTalkIDE，界面跟eclipse很像，第一次需要新建一个默认的工作空间，然后进入workBench界面。

## 新建 MonkeyTalk Project

File->new->MonkeyTalk Projec 建一个monkeyTalk工程TestDemo，TestDemo上右键->new->Script 新建一个script文件test.mt。项目结构如下：

![](/images/monkeytalk-test.png)

## 连接设备

![](/images/monkeytalk-connect.png)

第一个选项是连接android模拟器，第三个选项是连接android真机。连接真机需要输入手机的ip，用adb shell netcfg命令查看手机ip：

![](/images/monkeytalk-ip.png)

输入ip后，如果连接成功， console会打印：

    19:13:23.044: Connection set to device at [ip]

# 录制和回放

* 新建一个script文件test.mt。
* 点击MonkeyTalk 工具栏的record按钮，然后操作android app，点击stop按钮，可以录制一段script。
* 录制完成后，刚才的过程会显示在test.mt里。点击Play，会在设备上回放script的过程。