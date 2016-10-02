var utils = require("../../utils/util.js");

var GITHUB_SEARCH_URL = 'https://api.github.com/search/repositories';

Page({
  data: {
      repos: [],
      loading: true
  },
  onLoad: function(){
      this.fetchTrendingData();
  },
  fetchTrendingData() {
      var last7date = utils.getWeekDate();

      trendingData = wx.getStorageSync('trending:' + last7date);
      if ( trendingData === "") {
        return fetch(GITHUB_SEARCH_URL+ '?' + 'sort=starts&' + 'order=desc&' + 'q=created:>' + last7date + '&' + 'per_page=25')
            .then(res => {
                if (!res.ok) {
                    console.log("error："+ response.status);
                    return;
                }
                return res.json();
            })
            .then(json => {
                wx.setStorageSync('trending:' + last7date, JSON.stringify(json));
                this.setData({
                    repos: json.items,
                    loading: false
                })
            })
            .catch(e => {
                console.error(e);
            })
      } else {
          return Promise.resolve(JSON.parse(trendingData)).then(json => {
              this.setData({
                    repos: json.items,
                    loading: false
                })
          })
      }

  }
})