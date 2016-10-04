var utils = require("../../utils/util.js");
var parseLinkHeader = require('../../utils/parse-link-header.js');

/* APIs */
var GITHUB_AUTH_URL = 'https://api.github.com';
var GITHUB_USER_DETAIL_URL = 'https://api.github.com/user';
var GITHUB_USER_REPOS_URL = 'https://api.github.com/user/repos?sort=created';

Page({
  data:{
    loading: false,
    hasMore: true,
    disableBtn: false,
    user: {},
    modalHidden: true,
    errorMessage: '',
    has_auth: false,
    userDetail: {},
    myRepos: [],
    turnToAuth: false,
  },
  onLoad:function(options){
    this.initData();
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
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
  },
  onUnload:function(){
    // 页面关闭
  },
  initData: function() {
    userInfo = wx.getStorageSync('user');
    if (userInfo != '') {
      this.setData({
        user: JSON.parse(userInfo),
        has_auth: true
      })

      // user detail
      var userDetail = wx.getStorageSync('userDetail');
      if (!userDetail) {
        this.fetchUserDetail(GITHUB_USER_DETAIL_URL);
      } else {
        this.setData({
          userDetail: JSON.parse(userDetail)
        })
      }

      // my repos
      var myRepos = utils.readDataFromStorage('myRepos');
      if (!myRepos) {
        this.fetchYourRepos(GITHUB_USER_REPOS_URL);
      } else {
        this.setData({
          myRepos: myRepos
        })
      }
    }


  },
  scroll: function () {
    
  },
  scrolltolowers: function(){
    link = utils.readDataFromStorage('yourRepolink');
    var hasMore = false;

    if (link.next) {
      this.fetchYourRepos(link.next, true);
      hasMore = true;
    }

    this.setData({
      hasMore: hasMore
    })
  },
  fetchYourRepos: function(url, more) {
    // 直接获取用户的 repos
    // 不需要做其他的校验
    if (!more) {
      more = false;
    }
    var basic = utils.readDataFromStorage('user').basic_auth;

    return fetch(url, {
      headers: {
        Authorization: 'Basic ' + basic
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error('网络故障');
      }

      // 处理下一页链接
      prasedLink = parseLinkHeader(res.headers.get('Link'));
      
      // 这里存到缓存中
      // 因为在使用缓存数据时候 data 数据是空的
      utils.saveDataToStorage('yourRepolink', prasedLink)

      return res.json()
    }).then(json => {
      var newData = []
      var pickData = utils.pickKvFromArray(json, ['full_name', 'private']);

      if (more) {
        // 在有更多数据的情况下
        // 需要先和之前的数据拼接起来
        newData = this.data.myRepos;
        concatData = pickData;
        newData.push.apply(newData, concatData);
      } else {
        newData = pickData;
      }

      this.setData({
        myRepos: newData
      })

      utils.saveDataToStorage('myRepos', newData);
    }).catch(e => {
      this.setData({
        modalHidden: false,
        errorMessage: e.message
      })
    })
  },
  fetchUserDetail: function(url) {
    var basic = utils.readDataFromStorage('user').basic_auth;

    return fetch(url, {
      headers: {
        Authorization: 'Basic ' + basic
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error('OptionError');
      }

      return res.json()
    }).then(json => {
      this.setData({
        userDetail: json
      })
      utils.saveDataToStorage('userDetail', json);
    }).catch(e => {
      throw e;
    })
  },
  controlOps(status) {
    if (status === 'enable') {
      this.setData({
        loading: false,
        disableBtn: false
      })
    } else if (status === 'disable') {
      this.setData({
        loading: true,
        disableBtn: true
      })
    } else {
      return;
    }
  }, 
  confirmModal(e) {
    this.setData({
      modalHidden: true,
      errorMessage: ''
    })
  },
  formSubmit(e) {
    var formData = e.detail.value;
    var username = formData['username'];
    var password = formData['password'];
    var basic = utils.b64EncodeUnicode(username + ':' + password);
    
    return Promise.resolve().then(() => {
      this.controlOps('disable');

      return fetch(GITHUB_AUTH_URL, {
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
      } else {
        return res.json()
      }
    }).then(json => {
      json.basic_auth = basic;
      wx.setStorageSync('user', JSON.stringify(json));
      this.controlOps('enable');
      wx.redirectTo({
        url: 'profile'
      })
    }).catch(e => {
      console.log(e.message);
      this.controlOps('enable');
      switch (e.message) {
        case 'Unauthorized':
          this.setData({
            modalHidden: false,
            errorMessage: '账号或者密码错误'
          });
          break;
        default:
          this.setData({
            modalHidden: false,
            errorMessage: '网络错误'
          });
      }
    })
  }
})