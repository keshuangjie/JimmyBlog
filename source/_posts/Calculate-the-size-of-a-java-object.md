---
title: Calculate the size of a java object
date: 2012-12-15 16:33:35
categories: Java
tags: 内存
---
Android系统对内存的控制很严格，每一个应用程序都设置了最大的可占有内存，一旦超过了内存最大值，将出现OutOfMemory错误。今天写程序的时候突然想计算某个对象的大小，思考了会竟毫无头绪，java api并没有制定计算对象的类或者方法，只好求助google。

在stackoverflow中有好多讨论hao to calculate the size of a java object的问答，大牛们各种奇思妙想，大多都太麻烦，又难以看懂。其中有个很简单的方法，将对象写到流中并计算字节流占有的空间，不过有一个局限是，此对象必须实现Serializable。实现代码如下：

    Serializable ser;
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ObjectOutputStream oos = new ObjectOutputStream(baos);
    oos.writeObject(ser);
    System.out.println(baos.size());
    
参考文章：http://stackoverflow.com/questions/52353/in-java-what-is-the-best-way-to-determine-the-size-of-an-object