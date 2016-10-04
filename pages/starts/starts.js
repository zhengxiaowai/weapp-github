var utils = require('../../utils/util.js');
var parseLinkHeader = require('../../utils/parse-link-header.js');

var GITHUB_ME_STARTS_URL = 'https://api.github.com/user/starred';

// 这里的 WARP_SECOND 是解决 js 的 ts 为 13 位的问题
// WARP_SECOND 的单位是 1 秒
var WARP_SECOND = 1000 * 60
var CACHED_TIME = WARP_SECOND * 2 // sec

Page({
  data:{
    // text:"这是一个页面"
    loading: true,
    hasMore: true,
    turnToAuth: false,
    startedRepos: [],
    indexL: 0,
    arrayL: [
      'All',
      'C',
      'C++',
      'Java',
      'C#',
      'Python',
      'JavaScript',
      'Shell',
      'Go',
      'HTML',
      'CSS'
    ]
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.initData();
  },
  onReady:function(){
    // 页面渲染完成
    console.log('on ready');
  },
  onShow:function(){
    // 页面显示
    console.log('on show');
    var turnToAuth = this.data.turnToAuth;
    if (turnToAuth){
      this.initData();
      this.setData({
        turnToAuth: false
      })
    }
    
  },
  onHide:function(){
    // 页面隐藏
    console.log('on hide');
  },
  onUnload:function(){
    // 页面关闭
    console.log('on unload');
  },
  scroll: function(e) {
    //console.log(e)
  },
  initData: function(){
    // 初始化 onload 时候需要的数据
    var startedRepos = wx.getStorageSync('starts');
    
    if (!startedRepos) {
      this.fetchStartedRepos(GITHUB_ME_STARTS_URL);
    } else {
      var nowTs = Date.now();
      var oldTs = parseInt(wx.getStorageSync('requestStartsTs') || 0);
      
      if (nowTs - oldTs > CACHED_TIME || !oldTs) {
        this.fetchStartedRepos(GITHUB_ME_STARTS_URL);
      } else {
        this.setData({
          loading: false,
          startedRepos: JSON.parse(startedRepos)
        })
      }
    }
  },
  loadMore: function(e) {
    link = utils.readDataFromStorage('link');
    var hasMore = false;

    if (link.next) {
      this.fetchStartedRepos(link.next, true);
      hasMore = true;
    }

    this.setData({
      hasMore: hasMore
    })
  },
  enablePullDownRefresh: function(e) {
    console.log(e.dtail.value);
  },
  bindPickerChange: function(e) {
    var index = e.detail.value;
    var selected = this.data.arrayL[index];
    var startedRepos = JSON.parse(wx.getStorageSync('starts'));

    if (index != 0) {
      var selectdArray = startedRepos.filter(item => {
        language = item.language || '';
        return language.toLowerCase() === selected.toLowerCase();
      })

      this.setData({
        indexL: e.detail.value,
        startedRepos: selectdArray
      })
    } else {
      this.setData({
        indexL: e.detail.value,
        startedRepos: startedRepos
      })
    }
    
  },
  fetchStartedRepos: function(url, more) {
    if (!more) {
      more = false;
    }

    return Promise.resolve('user').then(user => {
      var userInfo = wx.getStorageSync(user);

      if (userInfo) {
        return JSON.parse(userInfo);
      } else {
        throw new Error('Unauthorized');
        //wx.redirectTo({url: '../profile/profile'})
      }

    }).then(user => {
      var basic = user.basic_auth;

      return fetch(url, {
        headers: {
          Authorization: 'Basic ' + basic
        }
      })

    }).then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized');
        } else {
          throw new Error('NetworkError');
        }
      }

      // prase link in headers
      prasedLink = parseLinkHeader(res.headers.get('Link'));
      
      // 这里存到缓存中
      // 因为在使用缓存数据时候 data 数据是空的
      utils.saveDataToStorage('link', prasedLink)

      return res.json()
    }).then(json => {
      var newData = json;
      var pickKeys = ['full_name', 'stargazers_count', 'description', 'language'];
      var pickData = utils.pickKvFromArray(json, pickKeys);

      if (more) {
          newData = this.data.startedRepos;
          concatData = pickData;
          newData.push.apply(newData, concatData);
      } else {
        newData = pickData;
      }

      wx.setStorageSync('starts', JSON.stringify(newData));
      wx.setStorageSync('requestStartsTs', Date.now());
      
      this.setData({
        startedRepos: newData,
        loading: false
      })
    }).catch(e => {
      this.setData({
        loading: false
      })
      switch(e.message) {
        case 'Unauthorized':
          this.setData({
            turnToAuth: true
          })
          wx.navigateTo({url: '../profile/profile'})
          break;
        default:
          throw e;
      }
    })
  }
})