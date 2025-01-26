import { allGoods } from '../../model/good';

Page({
  data: {
    imageList: allGoods.map(good => ({ url: good.primaryImage, price: `${good.minSalePrice / 100}元` }))
  },
  uploadImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        const newImage = {
          url: tempFilePaths[0],
          price: '100元'
        };
        that.setData({
          imageList: [...that.data.imageList, newImage]
        });
      }
    })
  }
})
