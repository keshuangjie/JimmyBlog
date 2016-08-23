---
title: Spark入门-本地应用环境构建
date: 2016-08-19 14:51:19
categories: Spark
tags: [spark,sbt,scala]
---
本文将介绍Spark的单机运行环境搭建，以及如何在IDE用scala语言开发Spark app，不涉及hdfs系统和hadoop。
# 环境准备
我使用的是MAC OS X EI Capitan 版本10.11.1，配置的开发环境如下：

* jdk1.8
* scala-2.11.8
* spark-1.6.2-bin-hadoop2.6

## jdk安装
[oracle网站](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)下载指定版本并安装，安装完成配置环境变量：
编辑~/.bash_profile文件，在最后加上java环境变量：
   
    export JAVA_HOME=/Users/jimmy/Documents/develop/java_1.8
    export PATH=$JAVA_HOME/bin:$PATH
    export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
    
保存并跟新：

    $ source ~/.bash_profile

验证java是否安装成功:
    
    $ java -version
    
如果显示如下java版本信息则安装配置成功：

    java version "1.8.0_91"
    Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
    Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
    
## scala安装
[scala官网](http://www.scala-lang.org/download/)下载scala-2.11.8.tgz并解压到相应的目录。编辑~/.bash_profile文件，在最后加上scala环境变量:

    export SCALA_HOME=/Users/jimmy/Documents/develop/scala-2.11.8
    export PATH=$PATH:$SCALA_HOME/bin
    
保存并更新：

    $ source ~/.bash_profile
    
验证scala安装、配置成功：

    $ scala -version
    
如果显示以下则安装、配置成功：

    Scala code runner version 2.11.8 -- Copyright 2002-2016, LAMP/EPFL
## spark安装
[spark官网](http://spark.apache.org/downloads.html)下载spark-1.6.2-bin-hadoop2.6.tgz并解压到相应目录。
cd到spark根目录，vim conf/spark-env.sh，添加如下配置：

    export SCALA_HOME=/Users/jimmy/Documents/develop/scala-2.11.8
    export JAVA_HOME=/Users/jimmy/Documents/develop/java_1.8
    export SPARK_MASTER_IP=localhost
    export SPARK_WORKER_MEMORY=1024m

编辑~/.bash_profile文件，在最后加上spark环境变量：

    export SPARK_HOME=/Users/jimmy/Documents/develop/spark-1.6.2-bin-hadoop2.6
    export PATH=$PATH:$SPARK_HOME/bin
    
验证spark安装、配置成功：

    $ spark-shell
 
最终显示scala>说明安装成功：
 
    ...
    Welcome to
          ____              __
         / __/__  ___ _____/ /__
        _\ \/ _ \/ _ `/ __/  '_/
       /___/ .__/\_,_/_/ /_/\_\   version 1.6.2
          /_/
    
    Using Scala version 2.10.5 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_91)
    ...
    16/08/22 20:34:12 WARN ObjectStore: Failed to get database default, returning NoSuchObjectException
    SQL context available as sqlContext.
    
    scala> 
    
在scala>后面可以直接运行scala语句，也可以使用spark环境和相关API，sc是已初始化的SparkContext对象。

# Spark项目构建
### SBT
[Sbt](http://www.scala-sbt.org)是scala官网推荐的项目构建工具，类似与maven是java语言的主流构建工具，ant/gradle是Android主流的构建工具一样。
sbt安装很简单，直接下载解压，sbt的目录很简单，只包含两个文件:

    sbt
    sbt-launch.jar

配置环境变量就可以直接在命令行里运行sbt，sbt首次运行会下载一些依赖包（由于网络环境问题，可能需要配置代理）。依赖包下载完成之后，就会进入到了stb的交互式操作控制台。
### Scala-ide
[Scala-ide](http://scala-ide.org/download/sdk.html)是scala官网推荐的集成了scala开发插件的eclipse。由于目前eclipse中并没有集成sbt的工具插件，所以不能在eclipse中直接new scala工程，而是需要通过sbt生成工程目录结构然后导入eclipse中。
## 构建Eclipse工程
想要sbt生成eclipse工程需要先配置sbt-eclipse插件，可以使用全局和单个工程的配置方式。
**全局配置方式**
在sbt首次使用的时候会在~/用户目录下生成.sbt目录，.sbt目录下有一个0.13/plugins的空文件夹，在下面新建build.sbt文件，添加配置如下：

    addSbtPlugin("com.typesafe.sbteclipse" % "sbteclipse-plugin" % "2.4.0")

**单个工程配置**
单个工程配置是在每个工程的根目录*.sbt文件添加如上配置。
    
配置完sbt-eclipse配置，在工程目录下执行下面命令就可生成eclipse工程目录结构。

    $ sbt eclipse

将工程导入到eclipse，目录结构如下：
![](/images/spark_project_dir.png)

## Eclipse中配置运行
### scala程序运行
运行scala程序非常简单，在src/main/scala下新建scala object "HelloScala.scala"

    object HelloScala {
      
      def main(args: Array[String]) {
        println("Hello, scala")
      }
      
    }

右键--Run As--Scala Application，在控制台将打印"Hello, scala"。
### Spark程序运行
运行Spark程序需要依赖spark core库，手动添加如下（也可以通过sbt添加依赖库的方式自动添加，下面会介绍）：

1. 在工程目录下新建lib文件夹，copy $SPARK_HOME/lib/spark-assembly-1.6.2-hadoop2.6.0.jar到工程lib文件夹下
1. 在eclipse中将jar添加到工程Build Path。

新建scala objec HelloSpark.scala，羡慕程序中的"data/input"是文本文件，HelloSpark用于读取文件并计算包含"北京"字符串的行数：

    import org.apache.spark.SparkConf
    import org.apache.spark.SparkContext
    
    object HelloSpark {
      val logFile = "data/input"
      def main(args:Array[String]) {
        var cityName = ""
        if (args.length < 1) cityName = "北京" else cityName = args(0)
    
        val conf = new SparkConf().setAppName("Spark Exercise: Spark Version Word Count Program");
        val sc = new SparkContext(conf);
        val textFile = sc.textFile(logFile);
    
        val city = (x: String) => x == "北京";
        val beijingRdd  = textFile.filter(line => line.contains(cityName));
        println("contain beijing line count: " + beijingRdd.count);
      }
    }
由于没有配置master URL，直接运行HelloSpark会报错：

    Using Spark's default log4j profile: org/apache/spark/log4j-defaults.properties
    16/08/23 11:44:57 INFO SparkContext: Running Spark version 1.6.2
    16/08/23 11:44:57 WARN NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
    16/08/23 11:44:57 ERROR SparkContext: Error initializing SparkContext.
    org.apache.spark.SparkException: A master URL must be set in your configuration
    	at org.apache.spark.SparkContext.<init>(SparkContext.scala:401)
    	at HelloSpark$.main(HelloSpark.scala:11)
    	at HelloSpark.main(HelloSpark.scala)
    16/08/23 11:44:57 INFO SparkContext: Successfully stopped SparkContext
    Exception in thread "main" org.apache.spark.SparkException: A master URL must be set in your configuration
    	at org.apache.spark.SparkContext.<init>(SparkContext.scala:401)
	at HelloSpark$.main(HelloSpark.scala:11)
	at HelloSpark.main(HelloSpark.scala)
	
解决方案是在HelloSpark右键--Run As--Run Configurations...--Arguments--VM Arguments 框中配置：

    -Dspark.master=local
    
再点击运行可以在控制台上看到先初始化spark环境，然后进行计算打印计算结果：

    contain beijing line count: 2

## SBT编译打包
使用sbt对上述helloscala工程进行编译打包管理，在helloscala根目录下新建build.sbt文件，配置如下：

    name := "helloscala"  
    
    version := "1.0"  
    
    scalaVersion := "2.10.5"  
    
    EclipseKeys.createSrc := EclipseCreateSrc.Default + EclipseCreateSrc.Resource  
    
    libraryDependencies += "org.apache.spark" %% "spark-core" % "1.6.2"

注意：

*  每行配置需要空一行
*  每次当build.sbt中相关配置变化后，都需要执行sbt eclipse命令来更新使其生效   

libraryDependencies是添加项目依赖库，helloscala工程需要依赖spark环境。运行sbt相关命令时会先下载依赖库。
EclipseKeys.createSrc如果配置了，执行sbt eclipse命令时会生成Source Folder目录src/main/resources。

编译

    $ sbt compile

打包，打包完成会在targe/scala-2.10/下生成helloscala_2.10-1.0.jar。

    $ sbt package

## Spark-submit
sbt打包的jar可以使用spark-submit命令提交到集群（此文中是本地集群）中进行计算，命令如下：

    spark-submit  --class  HelloSpark target/scala-2.10/helloscala_2.10-1.0.jar 
    
如果用HelloSpark统计包含"上海"的行数，需要传入参数：

     spark-submit  --class  HelloSpark target/scala-2.10/helloscala_2.10-1.0.jar "上海"