---
title: Data Binding on Android
date: 2016-06-11 15:39:08
categories: Android
tags: data-binding 
---
Data Binbing框架是在2015年Google I/O大会上最早提出来的，一直在Android开发者中热议，但是很少有真正在项目中用到。本文简单介绍Data Binding框架的简单用法以及其特点。

# Build Environment
Android官网已经提供了支持Data Binding的support library，支持Android 2.1(API level 7+)以上版本。与常规Android工程配置相比，Data Binding支持需要配置如下编译环境：

1. Android Studio 1.3以上才支持Android数据绑定
2. 在Android SDK manager中下载最新的Android Support Library
3. 在app工程build.gradle中配置dataBinding支持开关
4. 在build.gradle添加dataBinding依赖库

build.gradle配置如下：

    android {
        ....
        // dataBindng开关
        dataBinding {
            enabled = true
        }
    }
    
    dependencies {
        ....
        // 添加dataBinding支持依赖库
        compile 'com.android.support:appcompat-v7:23.3.0'
    }

# Hello DataBinding
## DataBinding Layout
DataBinding layout文件与普通layout有所不同，它的布局根节点是layout，下面是数据节点data，跟data同一层级是正常的layout布局文件。main_activity.xml代码如下：

    <?xml version="1.0" encoding="utf-8"?>
    <layout xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:tools="http://schemas.android.com/tools">
        <data>
            <variable name="user" type="com.jimmy.demo.databinding.simple.model.User"/>
        </data>

        <RelativeLayout
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:paddingLeft="@dimen/activity_horizontal_margin"
                android:paddingRight="@dimen/activity_horizontal_margin"
                android:paddingTop="@dimen/activity_vertical_margin"
                android:paddingBottom="@dimen/activity_vertical_margin"
                tools:context="com.jimmy.demo.databinding.simple.MainActivity">
    
            <TextView
                    android:id="@+id/tv_name"
                    android:text="@{user.name}"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"/>
    
            <TextView
                    android:id="@+id/tv_age"
                    android:text="@{String.valueOf(user.age)}"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_toRightOf="@id/tv_name"
                    android:layout_marginLeft="10dp"/>
        </RelativeLayout>
    </layout>
    
data中申明了变量user，type属性指定了user对应的Java类com.jimmy.demo.databinding.simple.model.User。User是一个普通的Java实体类：

    public class User {
    
        public String name;
        public int age;
    
        public User(String name, int age) {
            this.name = name;
            this.age = age;
        }
    
    }
申明了user变量，在后面的布局中就可以用@{}语法表达式的方式使用user属性，如上面布局文件中TextView属性android:text="@{user.name}"，由于user.age是int类型，所以使用的时候需要转换成String类型，String是常用类在布局文件中不需要import就能直接使用。

这里就可以看到数据绑定的特点，布局文件中属性值绑定之后是可以动态变化的，而不需要通过在代码中找到对应View逐一修改。

## Binding Data
完成data-binding布局文件，会默认生成对应的class(例如上面的main_activity.xml会生成MainActivityBinding.class)也可以在布局文件data节点中添加class属性指定Binding class名字。
    
    <data class="com.jimmy.demo.MyBinding">
        ....
    </data>
    
在Activity或者Fragment中用DataBindingUtil设置布局，返回Binding class对象，这里是MainActivityBinding对象，然后绑定User实体数据。

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = DataBindingUtil.setContentView(this, R.layout.activity_main);
        user = new User("Amanada", 25);
        binding.setUser(user);
    }
    
至此，一个简单的Android数据绑定demo就完成了，运行demo可以看到两个TextView的值分别为Amanda和25。