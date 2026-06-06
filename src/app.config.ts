export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/cart/index',
    'pages/mine/index',
    'pages/search/index',
    'pages/product-list/index',
    'pages/product-detail/index',
    'pages/order-confirm/index',
    'pages/pay-result/index',
    'pages/order-list/index',
    'pages/order-detail/index',
    'pages/address-list/index',
    'pages/address-edit/index',
    'pages/coupon/index',
    'pages/after-sale/index',
    'pages/after-sale-list/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '在线商城',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF5A3C',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home.png'
      },
      {
        pagePath: 'pages/category/index',
        text: '分类',
        iconPath: 'assets/tabbar/category.png',
        selectedIconPath: 'assets/tabbar/category.png'
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车',
        iconPath: 'assets/tabbar/cart.png',
        selectedIconPath: 'assets/tabbar/cart.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.png',
        selectedIconPath: 'assets/tabbar/mine.png'
      }
    ]
  }
})