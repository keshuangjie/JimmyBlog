---
title: 解决ScrollView、ListView、GridView内嵌问题
date: 2013-08-12 17:19:02
categories: Android
tags: [ListView, ScrollView, GridView]
---
开发过程中经常遇到ScrollView中内嵌ListView、GridView的复杂布局，但是android api中的这种滑动控件不支持相互嵌套，一旦在ScrollView中加入ListView，ListView将无法正常显示。通过自定义MyListView继承ListView，重新onMeasure(int widthMeasureSpec, int heightMeasureSpec)方法可解决，代码如下：

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
         int expandSpec = MeasureSpec.makeMeasureSpec(Integer.MAX_VALUE >> 2,
    			MeasureSpec.AT_MOST);
    
         super.onMeasure(widthMeasureSpec, expandSpec);
    }
    
makeMeasureSpec方法官方解释：
> Creates a measure specification based on the supplied size and mode.

其中的第一个参数只要足够大能够容纳item的内容就行，第二个参数MeasureSpec.AT_MOST是MeasureSpec类的常量，MeasureSpec总共有三个这样的常量，解释如下：
> UNSPECIFIED：
> The parent has not imposed any constraint on the child. It can be whatever size it wants.
> EXACTLY：
> The parent has determined an exact size for the child. The child is going to be given those bounds regardless of how big it wants to be.
> AT_MOST：
> The child can be as large as it wants up to the specified size.

AT_MOST的意思大概是子布局按照给定的规则大小（例如Integer.MAX_VALUE >> 2）来布局，不受父布局的约束。如果ScrollView内嵌这样自定义的ListView，ListView将不受ScrollView的约束，能够按item的布局正确显示。
例如如下布局：

    <?xml version ="1.0" encoding ="utf-8"?>
    <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
        android:layout_width="fill_parent"
        android:layout_height="fill_parent"
        android:background="#FFFFFF"
        android:orientation="vertical" >
    
        <ScrollView
            android:id="@+id/scroll"
            android:layout_width="fill_parent"
            android:layout_height="fill_parent"
            android:fadingEdgeLength="0dp"
            android:scrollbars="none" >
    
            <LinearLayout
                android:layout_width="fill_parent"
                android:layout_height="fill_parent"
                android:orientation="vertical" >
    
                <ImageView
                    android:id="@+id/image"
                    android:layout_width="fill_parent"
                    android:layout_height="120dp"
                    android:scaleType="centerCrop"
                    android:src="#000000" />
    
                <com.example.whutec.MyListView
                    android:id="@+id/list"
                    android:layout_width="fill_parent"
                    android:layout_height="fill_parent"
                    android:fadingEdgeLength="0dp"
                    android:scrollbars="none" />
            </LinearLayout>
        </ScrollView>
    </LinearLayout>
    
java代码没啥特别的，正常的给ListView设置适配器填充数据就Ok，这样自定义GridView可以很简单的实现添加HeaderView，跟GridView一起滑动。效果图如下：
![](/images/listview-nest.gif)

[完整代码](http://pan.baidu.com/share/link?shareid=1968629667&uk=269251077)