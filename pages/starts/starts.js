
var GITHUB_ME_STARTS_URL = 'https://api.github.com/user/starred';

Page({
  data:{
    // text:"这是一个页面"
    loading: true,
    startedRepos: [],
    indexL: 0,
    arrayL: [
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
    this.fetchStartedRepos()
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
  bindPickerChange: function(e) {
    console.log(e.detail.value);
    this.setData({
      indexL: e.detail.value
    })
  },
  fetchStartedRepos: function() {
    return Promise.resolve('user').then(user => {
      var userInfo = JSON.parse(wx.getStorageSync(user));

      if (userInfo) {
        return userInfo;
      } else {
        throw new Error('Unauthorized');
        //wx.redirectTo({url: '../profile/profile'})
      }

    }).then(user => {
      var basic = user.basic_auth;

      return fetch(GITHUB_ME_STARTS_URL, {
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
      return res.json()
    }).then(json => {
      this.setData({
        startedRepos: json,
        loading: false
      })
    }).catch(e => {
      this.setData({
        loading: false
      })
      switch(e.message) {
        case 'Unauthorized':
          wx.redirectTo({url: '../profile/profile'})
          break;
        default:
          console.log(e.message);
      }
    })
  }
})