---
title: 计算Android项目代码行数
date: 2012-10-14 16:53:57
categories: Java
tags: 
---
只能计算android项目中的java和XML文件，代码实现如下：

    public class CodeCount {

       private static int count = 0;

    	/**
    	 * 遍历文件
    	 * @param path
    	 */
    	private static void listFile(String path){
    		File file = new File(path);
    		if(!file.exists()){
    			System.err.println(file.getAbsolutePath() + "路径不存在");
    		}
    		if(file.isDirectory()){
    			File[] files = file.listFiles();
    			for(File f:files){
    				listFile(f.getAbsolutePath());
    			}
    		}else{
    			countLine(file);
    		}
    	}

    	private static void countLine(File file){
    		if(file.exists()){
    			if(file.getName().endsWith(".java")){
    				countLine4Java(file);
    			}else if(file.getName().endsWith(".xml")){
    				countLine4Xml(file);
    			}
    		}
    	}

    	/**
    	 * 计算项目中java文件代码数量
    	 * @param file
    	 */
    	private static void countLine4Java(File file){
    		if(!file.exists() || !file.getName().endsWith(".java")){
    			return;
    		}
    		BufferedReader in = null;
    		String str = null;
    		try {
    			in = new BufferedReader(new FileReader(file));
    			while((str=in.readLine()) != null){
    				//去掉tab空隔
    				str = str.replaceAll("\t", "");
    				//去除行首空格
    				str = removeSpace(str);
    				//排除空行
    				if(str.equals("")){
    					continue;
    				}
    				//排除单行注释
    				if(str.startsWith("//")){
    					continue;
    				}
    				//排除多行注释
    				if(str.startsWith("/*") || str.startsWith("*")){
    					continue;
    				}
    				count++;
    			}
    		} catch (FileNotFoundException e) {
    			e.printStackTrace();
    		} catch (IOException e) {
    			e.printStackTrace();
    		}finally{
    			try {
    				if(in != null){
    					in.close();
    				}
    			} catch (IOException e) {
    				e.printStackTrace();
    			}
    		}
    	}
    
    	/**
    	 * 计算项目xml文件代码数量
    	 * @param file
    	 */
    	private static void countLine4Xml(File file){
    		if(!file.exists() || !file.getName().endsWith(".xml")){
    			return;
    		}
    		boolean flag = true;
    		BufferedReader in = null;
    		String str = null;
    		try {
    			in = new BufferedReader(new FileReader(file));
    			while((str=in.readLine()) != null){
    				//去掉tab空隔
    				str = str.replaceAll("\t", "");
    				//去除空格
    				str = removeSpace(str);
    				//排除空行
    				if(str.equals("")){
    					continue;
    				}
    				//排除注释
    				if(str.startsWith("<!--")){
    					flag = false;
    				}
    				if(flag){
    					count++;
    				}
    				if(str.startsWith("-->") || str.endsWith("-->")){
    					flag = true;
    				}
    			}
    		} catch (FileNotFoundException e) {
    			e.printStackTrace();
    		} catch (IOException e) {
    			e.printStackTrace();
    		}finally{
    			try {
    				if(in != null){
    					in.close();
    				}
    			} catch (IOException e) {
    				e.printStackTrace();
    			}
    		}
    	}
    
    	//移除字符串的开始空格
    	public static String removeSpace(String s){
    		String str = s;
    		if(str.equals("") || str == null){
    			return "";
    		}
    		if(!str.startsWith(" ")){
    			return str;
    		}
    		str = str.replaceFirst(" ", "");
    		return removeSpace(str);
    	}
    
    	public static void main(String[] args) {
    		long startTime = System.currentTimeMillis();
    		listFile("D:\\workSpace");
    		long endTime = System.currentTimeMillis();
    		System.out.println("代码总行数：" + count);
    		System.out.println("程序运行时间：" + (endTime-startTime));
    	}

    }