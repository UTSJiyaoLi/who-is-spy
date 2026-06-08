export const defaultWordBank = [
  // 饮品
  { civilian: '可乐', spy: '雪碧', category: '饮品' },
  { civilian: '咖啡', spy: '奶茶', category: '饮品' },
  { civilian: '牛奶', spy: '豆浆', category: '饮品' },
  { civilian: '橙汁', spy: '苹果汁', category: '饮品' },
  { civilian: '啤酒', spy: '白酒', category: '饮品' },
  
  // 美食
  { civilian: '火锅', spy: '烧烤', category: '美食' },
  { civilian: '披萨', spy: '汉堡', category: '美食' },
  { civilian: '寿司', spy: '生鱼片', category: '美食' },
  { civilian: '饺子', spy: '馄饨', category: '美食' },
  { civilian: '面条', spy: '米粉', category: '美食' },
  { civilian: '巧克力', spy: '糖果', category: '美食' },
  { civilian: '蛋糕', spy: '面包', category: '美食' },
  
  // 交通
  { civilian: '地铁', spy: '公交', category: '交通' },
  { civilian: '高铁', spy: '动车', category: '交通' },
  { civilian: '飞机', spy: '直升机', category: '交通' },
  { civilian: '自行车', spy: '电动车', category: '交通' },
  { civilian: '轮船', spy: '游艇', category: '交通' },
  
  // 职业
  { civilian: '医生', spy: '护士', category: '职业' },
  { civilian: '老师', spy: '教授', category: '职业' },
  { civilian: '警察', spy: '保安', category: '职业' },
  { civilian: '厨师', spy: '烘焙师', category: '职业' },
  { civilian: '演员', spy: '歌手', category: '职业' },
  { civilian: '律师', spy: '法官', category: '职业' },
  
  // 软件/平台
  { civilian: '微信', spy: 'QQ', category: '软件' },
  { civilian: '淘宝', spy: '京东', category: '软件' },
  { civilian: '抖音', spy: '快手', category: '软件' },
  { civilian: '微博', spy: '小红书', category: '软件' },
  { civilian: '百度', spy: '谷歌', category: '软件' },
  
  // 运动
  { civilian: '篮球', spy: '足球', category: '运动' },
  { civilian: '羽毛球', spy: '乒乓球', category: '运动' },
  { civilian: '游泳', spy: '潜水', category: '运动' },
  { civilian: '跑步', spy: '竞走', category: '运动' },
  { civilian: '瑜伽', spy: '普拉提', category: '运动' },
  
  // 动物
  { civilian: '猫', spy: '狗', category: '动物' },
  { civilian: '狮子', spy: '老虎', category: '动物' },
  { civilian: '企鹅', spy: '海豹', category: '动物' },
  { civilian: '熊猫', spy: '棕熊', category: '动物' },
  { civilian: '老鹰', spy: '猫头鹰', category: '动物' },
  
  // 影视
  { civilian: '电影', spy: '电视剧', category: '影视' },
  { civilian: '喜剧', spy: '悲剧', category: '影视' },
  { civilian: '动漫', spy: '卡通', category: '影视' },
  { civilian: '纪录片', spy: '真人秀', category: '影视' },
  
  // 季节/自然
  { civilian: '夏天', spy: '冬天', category: '季节' },
  { civilian: '春天', spy: '秋天', category: '季节' },
  { civilian: '雨', spy: '雪', category: '自然' },
  { civilian: '山', spy: '海', category: '自然' },
  { civilian: '森林', spy: '草原', category: '自然' },
  
  // 日常物品
  { civilian: '手机', spy: '平板', category: '物品' },
  { civilian: '眼镜', spy: '墨镜', category: '物品' },
  { civilian: '背包', spy: '手提包', category: '物品' },
  { civilian: '雨伞', spy: '阳伞', category: '物品' },
  { civilian: '手表', spy: '手环', category: '物品' },
  
  // 地点
  { civilian: '超市', spy: '便利店', category: '地点' },
  { civilian: '图书馆', spy: '书店', category: '地点' },
  { civilian: '公园', spy: '游乐场', category: '地点' },
  { civilian: '酒店', spy: '民宿', category: '地点' },
  { civilian: '医院', spy: '诊所', category: '地点' },
  
  // 名人/角色
  { civilian: '孙悟空', spy: '哪吒', category: '角色' },
  { civilian: '关羽', spy: '张飞', category: '角色' },
  { civilian: '李白', spy: '杜甫', category: '角色' },
  { civilian: '玛丽莲梦露', spy: '奥黛丽赫本', category: '名人' }
]

export const categories = [...new Set(defaultWordBank.map(w => w.category))]

export function getRandomWordPair(category = null, customWords = []) {
  const allWords = [...defaultWordBank, ...customWords]
  let pool = category ? allWords.filter(w => w.category === category) : allWords
  if (pool.length === 0) pool = allWords
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}
