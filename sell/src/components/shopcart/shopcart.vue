<template>
  <div>
    <div class="shopcart">
      <div class="content" @click="toggleList">
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{'highlight':totalCount > 0}">
              <i class="icon-shopping_cart" :class="{'highlight':totalCount > 0}"></i>
            </div>
            <div class="num" v-show="totalCount > 0">{{totalCount}}</div>
          </div>
          <div class="price" :class="{'highlight':totalCount > 0}">￥{{totalPrice}}</div>
          <div class="desc">另需配送费￥{{deliveryPrice}}</div>
        </div>
        <div class="content-right" @click.stop.prevent="pay">
          <div class="pay" :class="payClass">{{payDesc}}</div>
        </div>
      </div>
      <div class="ball-container">
        <div v-for="(ball,index) in balls" :key="index">
          <transition name="drop" @before-enter="beforeDrop" @enter="dropping" @after-enter="afterDrop">
            <div class="ball" v-show="ball.show">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>
      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <div class="list-content" ref="listContent">
            <ul>
              <li class="food" v-for="food in selectFoods" :key="food.$index">
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span>￥{{food.price*food.count}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol @add="addFood" :food="food"></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div class="list-mask" @click="hideList" v-show="listShow"></div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
import cartcontrol from '@/components/cartcontorl/cartcontorl.vue';
import BScroll from 'better-scroll';

export default {
  components: {
    cartcontrol
  },
  props: {
    selectFoods: {
      type: Array,
      default() {
        return [
          {price: 10, count: 1}
        ];
      }
    },
    deliveryPrice: {
        type: Number,
        default: 0
    },
    minPrice: {
        type: Number,
        default: 0
    }
  },
  // 计算属性
  computed: {
    // 计算总价
    totalPrice() {
      let total = 0;
      this.selectFoods.forEach((food) => {
        total += food.price * food.count;
      });
      return total;
    },
    // 计算总数
    totalCount() {
      let count = 0;
      this.selectFoods.forEach((food) => {
        count += food.count;
      });
      return count;
    },
    // 还差多少起送
    payDesc() {
      if (this.totalPrice === 0) {
        return `￥${this.minPrice}起送`;
      } else if (this.totalPrice < this.minPrice) {
        let diff = this.minPrice - this.totalPrice;
        return `还差￥${diff}起送`;
      } else {
        return '去结算';
      }
    },
    // payDesc的属性变换
    payClass() {
      if (this.totalPrice < this.minPrice || this.totalPrice === 0) {
        return 'not-enough';
      } else {
        return 'enough';
      }
    },
    // 监控某种变化
    // 这样是只读的，要更改，就报错了，想更改，就要用get和set方法
    // 列表展示逻辑 还是有bug
    /* eslint-disable */
    // Unexpected side effect in "listShow" computed property
    listShow() {
      // get() {
      //   return this.fold;
      // },
      // // 如果等于零
      // set() {
      // }
      if (!this.totalCount) {
          this.fold = true;
          return false;
      }
      let show = !this.fold;
      // better scroll初始化
      if (show) {
        // 数据变化了，dom中不一定立即生效
        this.$nextTick(() => {
          if (!this.scroll) {
            this.scroll = new BScroll(this.$refs.listContent, {
              click: true
            });
          } else {
            this.scroll.refresh();
          }
        });
      }
      return show;
    }
  },
  methods: {
    // 所有的效果都是在操作数组，dom自己变化
    empty() {
      this.selectFoods.forEach((food) => {
        food.count = 0;
      })
    },
    addFood(target){
      this.drop(target);
    },
    beforeDrop(el) {
      // 遍历显示的小球
      let count = this.balls.length;
      while (count--) {
        let ball = this.balls[count];
        if (ball.show) {
          // 浏览器接口，获取元素相对视口的位置， 十字架坐标
          // 小球原本在购物车位置
          let rect = ball.el.getBoundingClientRect();
          // 计算小球 到 购物车 x,y差值
          //  正向值
          let x = rect.left - 32;
          // 负值
          let y = -(window.innerHeight - rect.top - 22);
          // 将元素显示出来
          el.style.display = '';
          // 外层元素 做纵向动画
          el.style.webkitTransform = `translate3d(0,${y}px,0)`;
          el.style.transform = `translate3d(0,${y}px,0)`;
          // 内层元素 做横向动画
          let inner = el.getElementsByClassName('inner-hook')[0];
          inner.style.webkitTransform = `translate3d(${x}px,0,0)`;
          inner.style.transform = `translate3d(${x}px,0,0)`;
        }
      }
    },
    dropping(el) {
      /* eslint-disable no-unused-vars */
      // 主动触发浏览器 强制刷新（重绘）
      // todo 这句话 很关键，但是不知道干啥
      // 防止数据未获取，dom异步更新
      let rf = el.offsetHeight;
      this.$nextTick(() => {
        // 将样式重置回来
        el.style.webkitTransform = 'translate3d(0,0,0)';
        el.style.transform = 'translate3d(0,0,0)';
        let inner = el.getElementsByClassName('inner-hook')[0];
        inner.style.webkitTransform = 'translate3d(0,0,0)';
        inner.style.transform = 'translate3d(0,0,0)';
        // el.addEventListener('transitionend', done);
      });
    },
    afterDrop(el) {
      // 将ball的效果重置
      let ball = this.dropBalls.shift();
      if (ball) {
        ball.show = false;
        el.style.display = 'none';
      }
    },
    drop(el) {
      // 拿到相应的元素
      // console.log(el);
      for (let i = 0; i < this.balls.length; i++) {
        let ball = this.balls[i];
        if (!ball.show) {
          ball.show = true;
          ball.el = el;
          this.dropBalls.push(ball);
          return;
        }
      }
    },
    toggleList() {
      if (!this.totalCount) {
        return;
      }
      // 如果不是空，折叠为false
      this.fold = !this.fold;
    },
    hideList() {
      // 更改数据
      this.fold = true;
    },
    pay() {
      if (this.totalPrice < this.minPrice){
        // 如果不满足起送价格 就什么也不做
        return;
      }
      // todo 应该实现 订单详情页面
      window.alert(`支付${this.totalPrice}元`);
    }
  },
  data() {
    return {
      balls:
      [{
        show: false
      },
      {
        show: false
      },
      {
        show: false
      },
      {
        show: false
      },
      {
        show: false
      }],
      // 已经下落小球
      dropBalls: [],
      // 列表是否是折叠的
      fold: false
    };
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/mixin.styl"

  .shopcart
    position : fixed
    left : 0
    bottom : 0
    z-index: 50
    width : 100%
    height : 50px
    background : #000
    .content
      display : flex
      background : #141d27
      font-size: 0
      .content-left
        flex: 1
        .logo-wrapper
          display :inline-block
          vertical-align : top
          position : relative
          top: -10px
          margin : 0 12px
          padding : 6px
          width : 56px
          height : 56px
          box-sizing : border-box
          border-radius : 50%
          background : #141d27
          .logo
            // 撑满内容区
            width : 100%
            height : 100%
            border-radius : 50%
            background : #2b343c
            text-align : center
            &.highlight
              background : rgb(0,160,220)
            .icon-shopping_cart
              line-height : 44px
              font-size : 24px
              color: #80858a
              &.highlight
                color : #ffffff
          .num
            position : absolute
            top : 0
            right : 0
            width: 24px
            height : 16px
            line-height : 16px
            text-align : center
            border-radius : 16px
            font-size : 9px
            font-weight : 700
            color : #ffffff
            background : rgb(240, 20, 20)
            box-shadow : 0 4px 8px 0 rgba(0,0,0,0.4)
        .price
          display :inline-block
          vertical-align : top
          margin-top: 12px
          line-height : 24px
          padding-right : 12px
          box-sizing : border-box
          border-right : 1px solid rgba(255,255,255,0.1)
          font-size : 16px
          font-weight : 700
          color : rgba(255,255,255,0.4)
          &.highlight
            color : #ffffff
        .desc
          display :inline-block
          vertical-align : top
          line-height : 24px
          margin : 12px 0 0 12px
          font-size : 10px
          font-weight : 500
          color : rgba(255,255,255,0.4)
      .content-right
        flex: 0 0 105px
        width : 105px
        // background : #2b333b
        .pay
          height : 56px
          line-height : 48px
          text-align : center
          font-size : 12px
          font-weight : 500
          &.not-enough
            color : rgba(255,255,255,0.4)
            background : #2b333b
          &.enough
            background : #00b43c
            color : #ffffff
    .ball-container
      .ball
        position : fixed
        left : 32px
        bottom : 22px
        z-index : 200
        // 纵轴变化时 bezier曲线
        transition : all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
        .inner
          width : 16px
          height : 16px
          border-radius : 50%
          background : rgb(0, 160, 220)
          transition : all 0.4s linear
    .shopcart-list
      position : absolute
      left : 0
      top : 0
      z-index : -1
      width : 100%
      // 偏移变换
      transform: translate3d(0, -100%, 0)
      &.fold-enter-active, &.fold-leave-active
        transition: all 0.5s
      &.fold-enter, &.fold-leave-to
        transform: translate3d(0, 0, 0)
      .list-header
        height : 40px
        line-height : 40px
        padding : 0 18px
        background : #f3f5f7
        border-bottom : 1px solid rgb(7,17,27,0.1)
        .title
          float : left
          font-size : 14px
          color : rgb(7,17,27)
        .empty
          float : right
          font-size : 12px
          color : rgb(0,160,220)
      .list-content
        padding : 0 18px
        max-height : 217px
        overflow : hidden
        background : #ffffff
        .food
          position : relative
          padding : 12px 0
          box-size : border-box
          border-1px(rgb(7,17,27,0.1))
          .name
            line-height : 24px
            font-size : 14px
            color : rgb(7,17,27)
          .price
            position : absolute
            right : 90px
            bottom : 12px
            line-height : 24px
            font-size : 14px
            font-weight : 700
            color : rgb(240,20,20)
          .cartcontrol-wrapper
            position : absolute
            right : 0
            // 由于自身 存在padding的原因
            bottom : 6px
  .list-mask
    position : fixed
    top: 0
    left: 0
    width : 100%
    height : 100%
    z-index : 40
    background : rgba(7,17,27,0)
    backdrop-filter : blur(10px)
    // 动画之前
    opacity : 1
    &.fade-enter-active, &.fade-leave-active
      transition: all 0.5s
    &.fade-enter, &.fade-leave-active
      opacity: 0
      // background: rgba(7, 17, 27, 0)
</style>
