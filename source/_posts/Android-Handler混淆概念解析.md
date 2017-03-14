---
title: Android Handler混淆概念解析
date: 2016-09-26 09:57:08
categories: Android
tags: [Android,Handler]
---
在Android开发过程中，使用Handler实现子线程更新ui的操作非常多。本文将以问题的形式一步步来解锁正确使用Handler的姿势。

**Handler消息机制的实现原理是怎样的？**

Handler消息机制在Android系统起着非常重要的作用，非UI线程与UI线程通信都是通过Handler来完成，先来看下Handler消息机制的实现原理：
![](/images/handler-theory.png)
实现并不复杂，总共涉及4个类：
* Message：消息体，用于装载需要发送的消息对象。
* Looper：是每个线程中的MessageQueue的管家，负责接收和分发Message或Runnable的工作。调用Looper.loop()方法，就是一个死循环，不断地从MessageQueue中取消息：如果有消息，就取出，并调用Handler的handlerMessage()方法；如果没有消息阻塞。
* MessageQueue：用于存放Message或Runnable对象的消息队列。它由对应的Looper对象创建，并由Looper对象管理。每个线程中都只会有一个MessageQueue对象。
* Handler：它直接继承自Object。作用是发送Message加入到消息队列中等待执行，并处理消息的回调。发送消息一般使用Handler的sendMessage()方法，而发出去的消息最执行会调用Handler的handlerMessage()方法中。

**handler.obtain()和new Message()的区别？**

handler.obtain实际调用的是Message.obtain(handler),实现过程是在Message.obtain():

    public static Message obtain() {
        synchronized (sPoolSync) {
            if (sPool != null) {
                Message m = sPool;
                sPool = m.next;
                m.next = null;
                m.flags = 0; // clear in-use flag
                sPoolSize--;
                return m;
            }
        }
        return new Message();
    }
看sPool命名可以知道是一个缓存池，但是它并不是一个集合，而是一个static Message变量，那么它是怎么实现缓存的呢？来看下Message回收的方法recycleUnchecked：
    
    void recycleUnchecked() {
        // Mark the message as in use while it remains in the recycled object pool.
        // Clear out all other details.
        flags = FLAG_IN_USE;
        what = 0;
        arg1 = 0;
        arg2 = 0;
        obj = null;
        replyTo = null;
        sendingUid = -1;
        when = 0;
        target = null;
        callback = null;
        data = null;

        synchronized (sPoolSync) {
            if (sPoolSize < MAX_POOL_SIZE) {
                next = sPool;
                sPool = this;
                sPoolSize++;
            }
        }
    }
Message消息执行完后都会调用recycleUnchecked进行回收，可以到Message对象并没有销毁，而是将属性都恢复初始值，将当前Message的next属性指向sPool，静态Message属性sPool指向当前Message。看到这里就很明显了，Message本身就实现了链表式的集合，MAX_POOL_SIZE是链表的长度。
**总结：**Message中有一个缓存池，会存储执行完成的Message对象。Handler.obtain()方法会先去从缓存中取，如果缓存中没有才去new，缓存中最多保存50个Message对象。

**Handler中sendMessage()和dispatchMessage()的区别？**

Handler中有多个类似sendMessage的方法，分别用于发送空消息、定时消息、延迟消息、优先消息，最终都会调用Handler中MessageQueue的enqueueMessage()，enqueueMessage中的逻辑是根据消息的最终执行时间来将消息插入到消息队列中等待执行。来看下dispatchMessage方法：
    
    /**
     * Handle system messages here.
     */
    public void dispatchMessage(Message msg) {
        if (msg.callback != null) {
            handleCallback(msg);
        } else {
            if (mCallback != null) {
                if (mCallback.handleMessage(msg)) {
                    return;
                }
            }
            handleMessage(msg);
        }
    }
可以看到Message消息直接回调执行了，并没有加入到消息队列。在开发过程中，好多同学根据这两个方法的命名误认为都是发送消息都会加入消息队列中执行，而并没有真正的理解这两个方法的实现。
**总结：**
* sendMessage()方法是将Message加入消息队列等待执行，回调总是在handler所在线程处理。
* dispatchMessage()方法是直接调用回调执行，是在当前线程。

**Handler消息的回调是不是总在handlerMessage()中处理？**

Looper中loop方法通过死循环的方式不断的从消息队列里面拿取消息进行回调处理，调用的是msg.target.dispatchMessage(msg)，msg的target属性是Handler对象，所以最终处理是在Handler的dispatchMessage中，上面有代码可以看到回调的顺序：
1. 当Message的回调方法不为空时，则回调方法msg.callback.run()，其中callBack数据类型为Runnable,否则进入步骤2；
2. 当Handler的mCallback成员变量不为空时，则回调方法mCallback.handleMessage(msg),并且mCallback.handleMessage返回false才会进入步骤3；
3. 调用Handler自身的回调方法handleMessage()，该方法默认为空，Handler子类通过覆写该方法来完成具体的逻辑。


看Android应用的启动过程，我们知道App的启动入口是ActivityThread的main方法：

    public static void main(String[] args) { 
          .... 
        // 创建Looper和MessageQueue对象，用于处理主线程的消息     Looper.prepareMainLooper(); 
    
        // 创建ActivityThread对象 
        ActivityThread thread = new ActivityThread(); 
    
        // 建立Binder通道 (创建新线程) 
        thread.attach(false); 
        //  消息循环运行 
        Looper.loop(); 
        throw new RuntimeException("Main thread loop unexpectedly exited");
    }
main方法中调用Looper.prepareMainLooper()创建了主线程的looper，方法最后调用了Looper.loop()。从上面分析我们知道loop方法中实现了死循环，那么问题来了。

**主线程为什么不会因为死循环卡死？**

事实上，在进入死循环之前便创建了新Binder线程，在代码ActivityThread.main()中。thread.attach(false)会创建一个Binder线程（具体是指ApplicationThread，Binder的服务端，用于接收系统服务AMS发送来的事件），该Binder线程通过Handler将Message发送给主线程。

Activity的生命周期都是依靠主线程的Looper.loop，当收到不同Message时则采用相应措施。ActivityThread中有个内部类H继承于Handler，在H.handleMessage(msg)方法中，根据接收到不同的msg，执行相应的生命周期。比如收到msg=H.LAUNCH_ACTIVITY，则调用ActivityThread.handleLaunchActivity()方法，最终会通过反射机制，创建Activity实例，然后再执行Activity.onCreate()等方法；
再比如收到msg=H.PAUSE_ACTIVITY，则调用ActivityThread.handlePauseActivity()方法，最终会执行Activity.onPause()等方法。

主线程的消息又是哪来的呢，是App进程中的其他线程通过Handler发送给主线程，具体请看如下图：
![](/images/handler-binder.jpg)

* system_server进程是系统进程，java framework框架的核心载体，里面运行了大量的系统服务，比如这里提供ApplicationThreadProxy（简称ATP），ActivityManagerService（简称AMS），这个两个服务都运行在system_server进程的不同线程中，由于ATP和AMS都是基于IBinder接口，都是binder线程，binder线程的创建与销毁都是由binder驱动来决定的。
* App进程则是我们常说的应用程序，主线程主要负责Activity/Service等组件的生命周期以及UI相关操作都运行在这个线程； 另外，每个App进程中至少会有两个binder线程 ApplicationThread(简称AT)和ActivityManagerProxy（简称AMP），除了图中画的线程，其中还有很多线程，比如signal catcher线程等，这里就不一一列举。
* Binder用于不同进程之间通信，由一个进程的Binder客户端向另一个进程的服务端发送事务，比如图中线程2向线程4发送事务；而handler用于同一个进程中不同线程的通信，比如图中线程4向主线程发送消息。

结合图说说Activity生命周期，比如暂停Activity，流程如下：
1. 线程1的AMS中调用线程2的ATP；（由于同一个进程的线程间资源共享，可以相互直接调用，但需要注意多线程并发问题）
2. 线程2通过binder传输到App进程的线程4；
3. 线程4通过handler消息机制，将暂停Activity的消息发送给主线程；
4. 主线程在looper.loop()中循环遍历消息，当收到暂停Activity的消息时，便将消息分发给ActivityThread.H.handleMessage()方法，再经过方法的调用，最后便会调用到Activity.onPause()，当onPause()处理完后，继续循环loop下去。

**为什么要用死循环阻塞主线程？**

一个进程和线程在CPU看来无非是一段可执行的代码，代码执行完毕，线程的生命也就结束，但是对于一个App来说，我们肯定不能让它执行完一段程序然后自己就退出。为了能保证App的生命周期，Android采用了简单的做法就是通过死循环让代码一直执行下去。
可能有人又会问，主线程的死循环一直运行是不是特别消耗CPU资源呢？ 其实不会，这里就涉及到Linux pipe/epoll机制，大家有兴趣看下面参考文章自行详细了解。

参考：
[Activity启动过程](http://blog.csdn.net/luoshengyang/article/details/6685853)
[主线程为什么不会因为loop卡死](https://www.zhihu.com/question/34652589/answer/90344494)
[handler消息机制-native层](http://gityuan.com/2015/12/27/handler-message-native/)
[select、poll、epoll之间的区别总结](http://www.cnblogs.com/Anker/p/3265058.html)

