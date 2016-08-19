---
title: 实现ImageView中间绘制文本
date: 2014-01-05 17:23:40
categories: Android
tags: [ImageView]
---
本文将实现在ImageView上绘制文本，并且文本要显示在ImageView的中间。
前半部分很easy，只需要继承ImageView，重写onDraw()利用画笔Paint画一个字符串就OK。后半部分需要考虑的android画布的坐标原点，文本自身的width、height。

**Android画布坐标原点**
Android画布是以屏幕的左上角为坐标原点，往右为横坐标X轴，往下为纵坐标Y轴。详细了解android画布坐标请参考：android Draw Rect坐标图示。

**获取文本自身的width、height，了解文本绘制的基点**
首先得熟悉文本的属性及测量相关api Paint.FontMetrics，主要有以下属性
![](/images/imageview-font1.png)
简单翻译如下：

1. 基准点是baseline，baseline是画笔初始坐标
1. Ascent是baseline之上至字符最高处的距离
1. Descent是baseline之下至字符最低处的距离
1. Leading是上一行字符的descent到下一行的ascent之间的距离
1. Top指的是指的是最高字符到baseline的值，即ascent的最大值
1. Bottom指的是最下字符到baseline的值，即descent的最大值

这解释很抽象，看下面这张图就一目了然了：
![](/images/imageview-font2.png)
5根线从上至下依次为：TOP、Ascent、BaseLine、Descent、Bottom
绘制的代码：

    public class DrawTextView extends View{
     
        public DrawTextView(Context context, AttributeSet attrs) {
            super(context, attrs);
        }
     
        @Override
        protected void onDraw(Canvas canvas) {
            Paint textPaint = new Paint( Paint.ANTI_ALIAS_FLAG);
            textPaint.setTextSize(100);
            textPaint.setColor( Color.WHITE);
     
            // FontMetrics对象
            FontMetrics fontMetrics = textPaint.getFontMetrics();
     
            String text = "中iAjPWqhf国";
     
            // 计算每一个坐标
            float baseX = 100;
            float baseY = 150;
            float topY = fontMetrics.top;
            float ascentY = fontMetrics.ascent;
            float descentY = fontMetrics.descent;
            float bottomY = fontMetrics.bottom;
            float baseLine = baseY;
     
            bottomY = baseLine + fontMetrics.bottom;
            descentY = baseLine + fontMetrics.descent;
            bottomY = baseLine + fontMetrics.bottom;
            ascentY = baseLine + fontMetrics.ascent;
            topY = baseLine + fontMetrics.top;
     
            Log.i("DrawTextView",
                    // ascent:单个字符基线以上的推荐间距，为负数
                    "ascent:" + fontMetrics.ascent//
                    // descent:单个字符基线以下的推荐间距，为正数
                    + " descent:" + fontMetrics.descent //
                    // 单个字符基线以上的最大间距，为负数
                    + " top:" + fontMetrics.top //
                    // 单个字符基线以下的最大间距，为正数
                    + " bottom:" + fontMetrics.bottom//
                    // 文本行与行之间的推荐间距
                    + " leading:" + fontMetrics.leading);
     
            // 绘制文本
            canvas.drawText( text, baseX, baseLine, textPaint);
     
            // BaseLine描画
            Paint baseLinePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            baseLinePaint.setColor( Color.RED);
            canvas.drawLine(0, baseLine, getWidth(), baseLine, baseLinePaint);
     
            // Base描画
            canvas.drawCircle( baseX, baseY, 10, baseLinePaint);
     
            // TopLine描画
            Paint topLinePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            topLinePaint.setColor( Color.LTGRAY);
            canvas.drawLine(0, topY, getWidth(), topY, topLinePaint);
     
            // AscentLine描画
            Paint ascentLinePaint = new Paint( Paint.ANTI_ALIAS_FLAG);
            ascentLinePaint.setColor( Color.GREEN);
            canvas.drawLine(0, ascentY, getWidth(), ascentY, ascentLinePaint);
     
            // DescentLine描画
            Paint descentLinePaint = new Paint( Paint.ANTI_ALIAS_FLAG);
            descentLinePaint.setColor( Color.YELLOW);
            canvas.drawLine(0, descentY, getWidth(), descentY, descentLinePaint);
     
            // BottomLine描画
            Paint bottomLinePaint = new Paint( Paint.ANTI_ALIAS_FLAG);
            bottomLinePaint.setColor( Color.MAGENTA);
            canvas.drawLine(0, bottomY, getWidth(),bottomY, bottomLinePaint);
        }
        
文本的绘制过程，横轴是从左到右，纵轴比较特殊是以baseline为基点。
![](/images/imageview-font3.jpg)
以上图为例，要想将黑色文本区域画在蓝色背景的中间，中间的黑线是蓝色背景的中轴线。
设蓝色背景左上角为坐标原点，蓝色背景的的宽高为bWidth、bHeight
文本的宽高为tWidth、tHeight

红色基线到黑色中轴线距离：baseToMid = tWidth/2 – FontMetircs.bottom

文本初始横坐标：tX = bWidth/2 – tWidth/2

文本初始纵坐标：tY = bHeight/2 +  baseToMid

**实现**
新建一个类继承ImageView，在onDraw(Canvas canvas)中绘制文本，详细代码：

    public class ImageViewWithCenterText extends ImageView {
     
        private static final String TAG = ImageViewWithCenterText.class.getName();
     
        /** 字体的颜色 */
        public static final int TEXT_COLOR = 0xffffffff;
        public static final int LINE_COLOR = 0xff000000;
        /** 字体大小 */
        public static final int FONT_SIZE = 40;
        private Paint paint;
        /** 文本基线与图片中点的Y轴距离 */
        private float txtBaseY;
        private String text = "中iAjPWqhf国";
     
        public ImageViewWithCenterText(Context context, AttributeSet attrs) {
            super(context, attrs);
            init(context, attrs);
        }
     
        private void init(Context context, AttributeSet attrs) {
            paint = new Paint();
            paint.setFilterBitmap(false);
            paint.setAntiAlias(true);
            paint.setTextSize(FONT_SIZE);
     
            Paint.FontMetrics fontMetrics = paint.getFontMetrics();
            // ascent:单个字符基线以上的推荐间距，为负数
            Log.i(TAG, "ascent:" + fontMetrics.ascent//
                    // descent:单个字符基线以下的推荐间距，为正数
                    + " descent:" + fontMetrics.descent //
                    // 单个字符基线以上的最大间距，为负数
                    + " top:" + fontMetrics.top //
                    // 单个字符基线以下的最大间距，为正数
                    + " bottom:" + fontMetrics.bottom//
                    // 文本行与行之间的推荐间距
                    + " leading:" + fontMetrics.leading);
            // 在此处直接计算出来，避免了在onDraw()处的重复计算
            txtBaseY = (fontMetrics.bottom - fontMetrics.ascent)/2 - fontMetrics.bottom;
        }
     
        public void onDraw(Canvas canvas) {
            paint.setColor(TEXT_COLOR);
            paint.setTextSize(FONT_SIZE);
            float tmpWidth = paint.measureText(text);
            canvas.drawText(text, (getWidth()-tmpWidth)/2, getHeight()/2+txtBaseY, paint);
            paint.setColor(LINE_COLOR);
            canvas.drawLine(0, getHeight()/2, getWidth(), getHeight()/2, paint);
        }
    }
    
[完整代码](http://pan.baidu.com/s/1pJIykYn)
