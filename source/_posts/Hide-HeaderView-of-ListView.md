---
title: Hide HeaderView of ListView
date: 2013-09-25 14:01:34
categories: Android
tags: [ListView]
---
实现ListView动态添加HeaderView，当HeaderView里面的内容为空时不显示。

**初始方案**
通常想到的做法是在加载数据完之后，判断HeaderView的内容是否为空，如果不为空 ，调用addHeaderView(View view)。但是这样会导致异常：

    IllegalStateException("Cannot add header view to list -- setAdapter has already been called.");
    
然后我查看addHeaderView源码：

    if (mAdapter != null && ! (mAdapter instanceof HeaderViewListAdapter)) {
                throw new IllegalStateException(
                        "Cannot add header view to list -- setAdapter has already been called.");
    }
    
如果ListView设置的adapter 不是HeaderViewListAdapter类的实例就会抛出异常，那么什么时候adapter才会是HeaderViewListAdapter的实例呢，再看下setAdapter方法源码：

    if (mHeaderViewInfos.size() > 0|| mFooterViewInfos.size() > 0) {
        mAdapter = new HeaderViewListAdapter(mHeaderViewInfos, mFooterViewInfos, adapter);
    } else {
        mAdapter = adapter;
    }
    
原来，在ListView setAdapter之前，如果添加了HeaderView或者FooterView，自定义的adapter就会被转换成HeaderViewListAdapter，如果没有HeaderView或者FooterView，adapter还是BaseAdapter实例。

弄懂了原因之后，就可以换一种方案来实现文章开头的需求。在setAdapter之前可以先调用addHeaderView(View view)，然后调用setAdapter，这个时候adapter就被转换成了HeaderViewListAdapter实例。当加载数据完成之后，如果HeaderView内容为空，就调用removeHeaderView(View view)移除HeaderView，当HeaderView内容不再为空的时候，再调用addHeaderView（View view)，就不会报IllegalStateException异常了。

**正确方案**
在setAdapter之前调用addHeaderView(View view)，当HeaderView内容为空时，设置HeaderView不可见setVisibility(View.GONE)，当HeaderView需要显示的时候设置为可见。

当设置HederView不可见时，内容确实隐藏了，但是HeaderView显示相同高度的空白，隐藏HeaderView的效果并未达到。

无法理解，通过google找到了解决方案，在HeaderView里面一层再包一层布局，设置里面的布局不可见，就达到了该要的效果。例如下面布局是HeaderView:

    <?xml version="1.0" encoding="utf-8"?>
    <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
        android:id="@+id/layout1"
        android:layout_width="fill_parent"
        android:layout_height="fill_parent" >
     
        <LinearLayout
            android:id="@+id/layout2"
            android:layout_width="fill_parent"
            android:layout_height="fill_parent" >
     
        </LinearLayout>
    </LinearLayout>
    
设置layout1不可见会出现同高度的空白部分，设置layout2不可见有效。

具体参考http://pivotallabs.com/android-tidbits-6-22-2011-hiding-header-views/?tag=android