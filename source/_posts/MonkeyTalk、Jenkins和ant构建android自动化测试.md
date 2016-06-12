---
title: MonkeyTalk、Jenkins和Ant构建Android自动化测试
date: 2014-01-11 17:23:09
categories: Test
tags: [AutoTest,MonkeyTalk,Ant,Jenkins]
---
最终效果一键实现Andriod app自动化测试：更新版本库最新代码、打包签名、安装、启动、运行测试脚本、发送测试报告

# 涉及工具


## MonkeyTalk
移动平台自动化测试工具，支持android、ios、phone web平台测试脚本的录制、编辑、回放，测试目标可以是真机或者模拟器，更多请参考[MonkeyTalk官网](https://www.cloudmonkeymobile.com/monkeytalk)、[Android配置使用MonkeyTalk](http://whutec.sinaapp.com/2013/10/android平台下配置使用monkeytalk/)。

## Ant
实现将Android工程转化成AspectJProject。

MonkeyTalk实现控制真机或者模拟器进行自动化测试，安装的android工程必须要添加monkeytalk-agent-1.0.58.jar(位于monkeytalk->agents->andriod)和将android工程转换成AspectJProject。

ant复制monkeytalk-agent-1.0.58.jar到android工程libs目录下：

    <!-- copy monkeytalk-agent lib to project libs -->
    <target name="copy-monkeytalk-agent" >
        <copy todir="${basedir}/libs" >
            <fileset file="${mt.agent.dir}" />
        </copy>
    </target>

ant将android工程转换成AspectJProject，需要下载[AspectJ](http://eclipse.org/aspectj/)。将AspectJ->libs->aspectjrt.jar复制到android工程libs目录下：

    <!-- copy aspectjrt lib to project libs -->
    <target name="copy-aspectjrt" >
        <copy todir="${basedir}/libs" >
            <fileset file="${aspectjrt.dir}" />
        </copy>
    </target>

重写-post-compile任务，将android工程编译成AspectJ工程：

    <target name="-post-compile" >
    	<property
    		name="classes.woven.dir"
    		value="${out.classes.absolute.dir}/../classes-woven" />
    
    	<!-- setup aspectj ant tasks -->
    	<taskdef resource="org/aspectj/tools/ant/taskdefs/aspectjTaskdefs.properties" >
    		<classpath>
    			<pathelement location="${aspectj.dir}/lib/aspectjtools.jar" />
    		</classpath>
    	</taskdef>
    
    	<condition
    		property="android.jar"
    		value="${project.target.android.jar}" >
    
    		<isset property="project.target.android.jar" />
    	</condition>
    
    	<fail
    		message="android.jar is missing. This must point to the target SDK&apos;s android.jar."
    		unless="android.jar" />
    
    	<iajc
    		destDir="${classes.woven.dir}"
    		showWeaveInfo="true" >
    
    		<!-- 将monkeytalk-agent-1.0.58.jar加入aspectpath -->
    		<aspectpath>
    			<pathelement location="${basedir}/libs/monkeytalk-agent-1.0.58.jar" />
    		</aspectpath>
    
    		<inpath>
    			<pathelement location="${out.classes.absolute.dir}" />
    		</inpath>
    
    		<classpath>
    			<pathelement location="${out.classes.absolute.dir}" />
    
    			<pathelement location="${android.jar}" />
    
    			<fileset dir="${basedir}/libs" >
    				<include name="**/*.jar" />
    			</fileset>
    
    			<pathelement location="${basedir}/libs/android-support-v4.jar" />
    			<!-- 第三方lib工程 -->
    			<pathelement location="../androidKu-union_pay/bin/classes.jar" />
    		</classpath>
    	</iajc>
    
    	<!-- remove the old classes dir, and replace with new "woven" classes -->
    	<delete dir="${out.classes.absolute.dir}" />
    
    	<mkdir dir="${out.classes.absolute.dir}" />
    
    	<copy todir="${out.classes.absolute.dir}" >
    		<fileset dir="${classes.woven.dir}" />
    	</copy>
    </target>

使用ant运行写好的测试脚本，首先将monkeyTalk->ant->monkeytalk-ant-1.0.58.jar复制到ant安装目录的lib中。运行测试脚本时要app对应的界面处于运行可见状态。ant脚本：

    <!-- mt-script.dir：MonkeyTalk测试工程路径-->
    <!--reports.dir：运行完成后生产的包括路径-->
    <target name="mtRun" depends="clean-reports">
         <monkeytalk:run agent="AndroidEmulator"
          adb="${sdk.dir}/platform-tools/adb.exe"
          script="${mt-script.dir}"
          reportdir="${reports.dir}"
          thinktime="2000"
          timeout="5000"
          verbose="true" />
    </target>

同时配置多个设备请参考[MonkeyTalk ant-runner
](https://www.cloudmonkeymobile.com/monkeytalk-documentation/monkeytalk-user-guide/ant-runner)。

使用ant发送邮件，要用到mail对应的task库，如果ant->lib目录下不存在请先下载

    <!-- 发送邮件，添加reports.zip作为附件 -->
	<mail mailhost="${mail.host}" mailport="${mail.port}" user="${mail.user}" password="${mail.password}" subject="Android自动化脚本测试报告">
		<from address="${mail.from}"/>
		<to address="${mail.to}"/>
		<message>测试报告见附件</message>
		<attachments>
			<file name="${reports.zip.dir}"/>
		</attachments>
	</mail>
	</target>

==注意==：ant中涉及到的文件请根据自己的路径进行配置

## Jenkins
一个开源软件项目，旨在提供一个开放易用的软件平台，使持续集成变成可能(来自[百度百科](http://baike.baidu.com/view/6190216.htm?tp=0_11))。更多请访问[Jenkins官网](http://jenkins-ci.org/)
Jenkins的安装成功后，在浏览器中输入http://localhost:8080启动Jenkins界面，点击系统管理->系统设置 设置JDK/ANT的路径：

![](/images/jenkins-setting.png)

# 实现

有了上面的准备工作，就可以在Jenkins中新建项目进行自动化测试了。

## 新建Jenkins项目

![](/images/jenkins-new-project.png)

## 源码管理
配置android项目svn，提取项目最新代码。如果涉及到多个工程，需要配置多个：

![](/images/jenkins-svn.png)

## 构建
以下顺序不能改，任务运行时按顺序进行：

* ant进行打包
* 使用批处理命令进行安装、启动应用。如果想同时在多个设备安装、运行，请参考               [adb命令同时操作多台设备](http://whutec.sinaapp.com/2013/11/adb命令同时操作多台设置/)
* 使用ant运行测试脚本、发送测试报告。

![](/images/jenkins-build.png)

## 运行
配置完成点击保存，回到Jenkins首页。进入AutoTest项目，点击左边的立即构建。
如果运行完成、控制台没有报错，那么恭喜你，android自动化测试构建成功，赶紧去邮箱查看测试报告吧。
报告以html展示，可以看到成功的测试用例、错误的测试用及其原因:

![](/images/jenkins-report.png)

# 结束语 
如果配置失败，或者遇到问题，欢迎留言讨论。