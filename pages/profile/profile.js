var utils = require("../../utils/util.js");

var GITHUB_AUTH_URL = 'https://api.github.com';
var GITHUB_USER_DETAIL_URL = 'https://api.github.com/user';

Page({
  data:{
    loading: false,
    disableBtn: false,
    user: {},
    modalHidden: true,
    errorMessage: '',
    has_auth: false,
    userDetail: {}
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    userInfo = wx.getStorageSync('user');
    if (userInfo === '') {
      // 无登录
      this.setData({
        options: options,
      })
    } else {
      this.setData({
        user: JSON.parse(userInfo),
        has_auth: true
      })
    }

    // user detail
    var userDetail = wx.getStorageSync('userDetail');
    if (!userDetail) {
      this.fetchUserDetail(GITHUB_USER_DETAIL_URL);
    } else {
      this.setData({
        userDetail: JSON.parse(userDetail)
      })
    }
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
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
      console.log(json);
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