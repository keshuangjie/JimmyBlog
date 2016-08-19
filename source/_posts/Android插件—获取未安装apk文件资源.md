---
title: Android插件—获取未安装apk文件资源
date: 2014-01-15 18:22:37
categories: Android
tags: [Android, 插件]
---
本文实现Android app获取未安装apk文件里的资源（layout、string、dimen等）。

**分析**

安装后的android app获取资源是通过Resource类，查看Resource官方文档，第一句是：

> Class for accessing an application's resources. This sits on top of the asset manager of the application (accessible through getAssets()).

很清楚的说明了Resource是通过AssetManager来访问app资源的，在看下Resource的getString(int id)方法:

    public String getString(int id) throws NotFoundException {
    	 CharSequence res = getText(id);
    	 if (res != null) {
    		 return res.toString();
    	 }
    	 throw new NotFoundException("String resource ID #0x" +
    Integer.toHexString(id));
     }


再看里面getTest(id)方法：

    public CharSequence getText(int id) throws NotFoundException {
    	CharSequence res = mAssets.getResourceText(id);
    	if (res != null) {
    		return res;
    	}
    	throw new NotFoundException("String resource ID #0x" + Integer.toHexString(id));
    }
从代码中可以看出最终获取资源的方法是mAssets.getResourceTest(id)方法，而mAssets是AssetMananger对象，mAssets对象是在Resource构造函数中传进去的：

    public Resources(AssetManager assets, DisplayMetrics metrics,
    		Configuration config) {
    	this(assets, metrics, config, (CompatibilityInfo) null);
    }
    
    public Resources(AssetManager assets, DisplayMetrics metrics,
    		Configuration config, CompatibilityInfo compInfo) {
    	mAssets = assets;
    	mMetrics.setToDefaults();
    	mCompatibilityInfo = compInfo;
    	updateConfiguration(config, metrics);
    	assets.ensureStringBlocks();
    }
那么AssetManager对象是什么时候new出来并传给resource对象的呢？

查看AssetManager官方文档，描述中只是说用于访问app中为优化的资源，例如raw、asset目录下的文件，原文如下：

> Provides access to an application's raw asset files; see Resources for the way most applications will want to retrieve their resource data.
> This class presents a lower-level API that allows you to open and read raw files that have been bundled with the application as a simple stream of bytes.

并且AssetManager类并没有公开的构造函数，也没有产生对象的方法。查看AssetManager源代码，AssetManager是有构造函数的只是没有对外开放，另外还有一些其它私有方法。其中有一个重要的本地方法addAssetPath(String path):

    /** Add an additional set of assets to the asset manager.
    * This can be either a directory or ZIP file.
    * Not for use by applications. Returns the cookie of the added asset,
    * or 0 on failure.
    */
    public native final int addAssetPath(String path);
    
注释的大致意思是：将一个包含有一系列资源的zip文件或者目录add到AssetManager中。

其实每个安装的android app启动时都会创建一个全局的Resource和AssetManager对象，创建AssetManager对象的时候会调用addAssetPath方法将apk对应的路径传进去。AssetManager详细的创建过程请参考老罗的 [Android应用程序资源管理器（Asset Manager）的创建过程分析](http://blog.csdn.net/luoshengyang/article/details/8791064)

因此，如果要实现resource.getString(id)读取未安装apk文件资源，需要利用反射创建一个AssetManager对象并调用addAssetPath(unInstallApkPaht)，然后用Resource的构造函数传入assetManager新建一个Resource对象，就可以通过新建的resource对象获取未安装apk文件的资源了。

[实现代码](http://pan.baidu.com/s/1c0IeO7m)