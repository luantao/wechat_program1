import {
  allGoods
} from '../../model/good';

Page({
  data: {
    imageList: [],
    name: '',
    remark: '',
    selectedCategory: '和田玉' // 默认选中和田玉
  },

  onLoad() {
    this.getImageList();
  },

  chooseImage() {
    const that = this;
    const currentCount = this.data.imageList.length;
    const remainCount = 9 - currentCount;

    if (remainCount <= 0) {
      wx.showToast({
        title: '最多只能上传9张图片',
        icon: 'none'
      });
      return;
    }

    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      async success(res) {
        const tempFiles = res.tempFiles;
      // 上传所有图片
      const uploadTasks = tempFiles.map(async (image) => {
        // 如果图片已经是网络地址，则直接返回
        if (image.startsWith('http')) {
          return image;
        }

        // 上传本地图片
        return await this.uploadFile(image);
      });

      const imageUrls = await Promise.all(uploadTasks);
      const newImageList = that.data.imageList.concat(imageUrls);
      that.setData({
        imageList: newImageList
      });
      }
    });
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.imageList;

    wx.previewImage({
      current: images[index],
      urls: images
    });
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.imageList;
    images.splice(index, 1);
    this.setData({
      imageList: images
    });
  },

  onNameChange(e) {
    this.setData({
      name: e.detail.value
    });
  },

  onRemarkChange(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category
    });
  },

  async submit() {
    if (this.data.imageList.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      });
      return;
    }

    if (!this.data.name.trim()) {
      wx.showToast({
        title: '请输入名称',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '正在上传...',
      mask: true
    });

    try {
      const imageUrls = this.data.imageList;

      // 提交所有数据到服务器
      const result = await this.submitData({
        images: imageUrls,
        name: this.data.name,
        category: this.data.selectedCategory,
        remark: this.data.remark
      });

      wx.hideLoading();

      if (result.success) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });

        // 清空已上传的图片、名称和备注
        this.setData({
          imageList: [],
          name: '',
          remark: '',
          selectedCategory: '和田玉' // 重置为默认分类
        });
      } else {
        throw new Error(result.message || '提交失败');
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '上传失败，请重试',
        icon: 'none'
      });
    }
  },

  uploadFile(filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: 'https://your-api-domain/upload', // 替换为实际的上传接口地址
        filePath: filePath,
        name: 'file',
        success(res) {
          const data = JSON.parse(res.data);
          if (data.success) {
            resolve(data.url);
          } else {
            reject(new Error(data.message || '图片上传失败'));
          }
        },
        fail(error) {
          reject(new Error('图片上传失败'));
        }
      });
    });
  },

  submitData(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://your-api-domain/submit', // 替换为实际的提交接口地址
        method: 'POST',
        data: data,
        success(res) {
          if (res.statusCode === 200 && res.data.success) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.message || '提交失败'));
          }
        },
        fail(error) {
          reject(new Error('网络请求失败'));
        }
      });
    });
  },

  // 从服务端获取图片列表
  getImageList() {
    const that = this;
    wx.showLoading({
      title: '加载中...'
    });

    wx.request({
      url: 'https://your-api-domain/api/images', // 替换为实际的接口地址
      method: 'GET',
      success(res) {
        if (res.statusCode === 200 && res.data.success) {
          that.setData({
            imageList: res.data.data || []
          });
        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail(error) {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      },
      complete() {
        wx.hideLoading();
      }
    });
  }
})