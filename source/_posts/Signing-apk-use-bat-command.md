---
title: Signing apk use bat command
date: 2012-12-12 19:33:47
categories: Android
tags: [adb, bat]
---
# Apk签名命令

创建key，需要用到keytool.exe (位于jdk1.6.0_24\jre\bin目录下)，使用产生的key对apk签名用到的是jarsigner.exe (位于jdk1.6.0_24\bin目录下)，把上面两个目录添加到环境变量path中。

**产生密钥库**

    keytool -genkey -v -keystore g:\my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

参数说明：

*   -genkey 产生密钥
*   -keystore g:\demo.keystore 产生密钥库的存放路径
*   -alias demo.keystore 别名 demo.keystore 要和密钥库名字相同
*   -keyalg RSA 使用RSA算法对签名加密
*   -keysize 2048  The size of each generated key (bits) 默认为1024
*   -validity 10000有效期限10000天

**签名**

    jarsigner -verbose -keystore g:\my-release-key.keystore my_application.apk alias_name
    
参数说明：

*   -verbose 输出签名的详细信息
*   -keystore  g:\demo.keystore 密钥库位置
*   要签名的文件demo.apk
*   别名 alias_name

**Align the final APK package**

The zipalign tool is provided with the Android SDK, inside the tools/ directory.

    zipalign -v 4 g:\keyStore\sign_rss.apk g:\keyStore\align_sign_rss.apk

参数说明：

*   The -v flag turns on verbose output (optional)
*   4 is the byte-alignment (don't use anything other than 4)
*   g:\keyStore\sign_rss.apk  为签名过得apk
*   g:\keyStore\align_sign_rss.apk 为align过后的apk

**验证签名是否成功**

     jarsigner -verify -verbose -certs my_application.apk

# 使用bat简化签名流程

用命令行为apk文件sign、zipalign需要两步，并且参数多、命令不好记。最好是一个简单的命令就能实现sign和zipalign功能，觉得批处理命令应该能实现。经过查找资料现学，最后用一句就能实现：

    // sign：bat文件的命名
    // unsigned.apk：未签名的apk文件路径
    // signed.apk：签名后的apk文件路径
    sign unsigned.apk signed.apk
    
sign.bat文件中的storepass、alias、keystore 的路径根据自己的需求更改，sign.bat代码如下：

    @echo off
    ::two parameter: unsigned apk file , the apk file after sign and zipalign(注释)
    if "%1"=="" echo the unsigned apk dir is null
    if "%1"=="" goto end
    if "%2"=="" echo the signed apk dir is null
    if "%2"=="" goto end
    if exist log.txt del log.txt
    ::siging apk file
    jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1 -keystore android.keystore -storepass storepass %1 alias>log.txt
    ::end if error take place
    if errorlevel 1 goto end
    ::zipalign the signed app
    zipalign -v 4 %1 %2 >>log.txt
    if errorlevel 1 goto end
    ::verify whether the apk file signed
    jarsigner -verify %2 >>log.txt
    :end

批处理命令学习参考：http://www.jb51.net/article/7131.htm