---
title: Android app购物车功能实现
date: 2013-03-21 20:43:27
categories: Android
tags: [ContentObserver, 购物车]
---
UI效果图如下：
![](/images/shoppingcart.png)
实现购物车功能的要点：

1. 购物车UI的布局
1. 购物车里面商品数量是保存在本地数据库sqlite，要保证UI上的数据与数据库同步

先谈购物车UI的布局，购物车可以看成两部分购物车图标（ImageView）、购物车商品数量（TextView，红色椭圆圈可以当做TextView的背景）。这整个的布局可以封装成一个ShoppingCartView，ShoppingCarView继承FrameLayout。购物车的xml布局如下：

    <?xml version="1.0" encoding="utf-8"?>
    <ShoppingCartView
        xmlns:android="http://schemas.android.com/apk/res/android"
        android:id="@+id/shopping_cart_view"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content">
    
        <ImageView
        	android:id="@+id/imageview"
        	android:layout_width="wrap_content"
        	android:layout_height="wrap_content"
        	android:layout_gravity="center_vertical|center_horizontal"
        	android:background="@drawable/icon_cart"
        	android:duplicateParentState="true" >
        </ImageView>
    
        <LinearLayout
        	android:layout_width="fill_parent"
        	android:layout_height="fill_parent"
        	android:layout_gravity="center_vertical|center_horizontal"
        	android:gravity="center"
        	android:paddingBottom="@dimen/hSize22"
        	android:paddingLeft="@dimen/wSize18">
        
        	<TextView
        		android:id="@+id/textview_carNum"
        		android:layout_width="wrap_content"
        		android:layout_height="wrap_content"
        		android:paddingLeft="@dimen/wSize1"
        		android:paddingBottom="@dimen/hSize1"
        		android:background="@drawable/cart_num_bg"
        		android:duplicateParentState="true"
        		android:gravity="center"
        		android:singleLine="true"
        		android:textColor="#f9f6f3"
        		android:textSize="@dimen/tSize12"
        		android:textStyle="bold"/>	
        </LinearLayout>
    
    </ShoppingCartView>
    
这个UI难在将TextView布局在ImageView的右上方，实现原理是将LinearLayout的宽和高设为“fillParent”，由于rootView是FrameLayout，所以LinearLayout完全覆盖ImageView，再通过设置LinearLayout子布局与边框的距离，将子布局TextView设置在LineaLayout的右上，因此就达到了TextView在ImageView右上的效果。

再讲谈第二点，UI上显示的商品数量与sqlite数据库保持一致、实时更新。

这用到了ContentObserver——内容观察者，目的是观察(捕捉)特定Uri引起的数据库的变化，继而做一些相应的处理，它类似于 数据库技术中的触发器(Trigger)，当ContentObserver所观察的Uri发生变化时，便会触发它。

实现原理在ShoppingCartView第一次初始化的时候注册ContentObserver。实现ContentObserver重写onChange方法，一旦数据库中购物车商品数量发生变化，就会触发onChange方法，onChange方法中实现将数据库中购物车表ui中更新。当初始化ShoppingCartView的Activity销毁时，取消ContextOberver注册。

ShoppingCarView的完整封装代码：

    public class ShoppingCartView extends FrameLayout {

    	private TextView cartNumber;
    	private Context context;

    	public ShoppingCartView(Context context){
    		super(context);
    		this.context = context;
    	}

    	public ShoppingCartView(Context context, AttributeSet attrs) {
    		super(context, attrs);
    		this.context = context;
    	}

    	public void initCartNumber(){
    		cartNumber = (TextView) this.findViewById(R.id.textview_carNum);
    		context.getContentResolver().registerContentObserver(DataProvider.CONTENT_URI_BOOKCART,
    		true, cob);
    		setCarNum();
    	}

    	private ContentObserver cob = new ContentObserver(new Handler()) {
    		@Override
    		public boolean deliverSelfNotifications() {
    			return super.deliverSelfNotifications();
    		}
    
    		@Override
    		public void onChange(boolean selfChange) {
    			super.onChange(selfChange);
    			setCarNum();
    		}
    	};

    	private void setCarNum(){
    		int count = DBHelper.getCartBookNum();
    		cartNumber.setText(String.valueOf(count)+"+");
    		if(count>0){
    			cartNumber.setVisibility(View.VISIBLE);
    		}else{
    			cartNumber.setVisibility(View.GONE);
    		}
    	}

    	public void unRegisterContentObserver(){
    		context.getContentResolver().unregisterContentObserver(cob);
    	}
    }

ShoppingCarView类使用，在Activity中初始化：

    shoppingCartView = (ShoppingCartView) findViewById(R.id.shopping_cart_view);
    shoppingCartView.initCartNumber();
    
    shoppingCartView.setOnClickListener(new View.OnClickListener() {   
       @Override
    	public void onClick(View v) {
    	//进入购物车页面
    	}
    });
    
Activity销毁时，取消注册ContentObserver：

    if(shoppingCartView!=null){
         shoppingCartView.unRegisterContentObserver();
    }