---
title: Svn Command
date: 2016-06-01 15:16:10
categories: svn
tags: svn
---
# Checkout

    svn checkout url

# Commit 

    svn commit -m "message"

# Update

    svn update

<!-- more -->

# Add
添加目录下的所有文件，包括忽视的文件

    svn add .

添加目录下的未受控制的文件

    svn add * —force

# Info
查看svn远程信息 

    svn info

查看svn远程URL

    svn info | grep 'URL'  
    svn info | grep -i 'url' (-i 忽略大小写)

# Delete
删除文件、目录

    svn del filename

# Ignore
样例目录结构:  

    python  
      \source  
        \cache  
          \other

执行st命令

    $ svn st
    M source
    ? cache

未受版本控制的可以直接加入忽视，已受版本控制的先删除并提交svn server，再添加忽视。
忽略cache，**以下命令只能添加一个，再使用此命令会覆盖之前，之前添加忽视的将被移除**。

    svn propset svn:ignore cache .

where svn:ignore is the name of the property you're setting, cache is the value of the property, and . is the directory you're setting this property on. It should be the parent directory of the cachedirectory that needs the property.

查看哪些属性被设置了

    $ svn proplist
    Properties on '.':
      svn:ignore

查看svn:ignore的属性值

    $ svn propget svn:ignore
    cache

删除设置的属性值 

    svn propdel svn:ignore