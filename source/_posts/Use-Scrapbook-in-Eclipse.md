---
title: Use Scrapbook in Eclipse
date: 2013-01-07 20:05:15
categories: Java
tags: Ecplise
---
eclipse有一个剪贴簿页面（scrapbook page），估计很少人有用过，我也是今天偶尔在网上看到的。

scrapbook允许执行Java表达式而无需创建一个新的Java类。这可以快速地测试一个现有的类或评估一个代码片段。

在eclipse中可以通过 File——New——Others——Java Run Debug——Scrapbook page打开，然后选一个父文件夹、File Name就可以新建一个Scrapbook page文件了，该文件的后缀名是.jpage。

在.jpage中我们输入new java.util.Date()，然后选择这个代码片段（下面执行不同的命令）

右键——Display就会自动生成表达式的结果：(java.util.Date) Mon Jan 07 19:28:07 CST 2013。

右键——Inspect出现以下结果：
![](/images/eclipse-inspect.png)

看着是不是很有debug感觉，有了scrapbook不需要debug就能看到详细的信息了。

右键——Execute 这个跟运行带有main方法的java文件一样，如果有输出信息会在控制台打出。如果是执行new java.util.Date()，控制台不会有打印信息，如果执行System.out.println(new java.util.Date())，控制台会输出：Mon Jan 07 19:41:19 CST 2013

另外scrapbook中很可以执行多行代码，每行也是;结束。

    String a = "a";
    String b = "b";
    String c = a + b;
    System.out.print(c);
    
比如选择上面四行代码，右键——Execute，在控制台中会输出：ab

由于是在java项目中执行，所有的类路径的库和项目引用可以在此处使用，可以很方便的验证一个函数的返回值。

另一个不错的功能是有代码协助，就像在一个常规Java编辑器页面。不过scrapbook中没有outline并且代码协助也是有限的，不过这并不影响，因为scrapbook仅是作为快速测试java表达式和代码块而存在的。