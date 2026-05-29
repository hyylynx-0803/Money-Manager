export interface CategoryDef {
  name: string
  icon: string
  keywords: string[]
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { name: '餐饮', icon: '🍽️', keywords: ['吃', '饭', '餐', '外卖', '食堂', '火锅', '烧烤', '面', '粉', '粥', '水果', '零食', '饮料', '奶茶', '咖啡', '喝酒', '请客', '聚餐', '肯德基', '麦当劳', '早餐', '午餐', '晚餐', '夜宵', '饭店', '馆子', '炒菜', '自助', '烤鱼', '麻辣烫', '串串', '小吃'] },
  { name: '交通', icon: '🚗', keywords: ['打车', '滴滴', '地铁', '公交', '高铁', '火车', '飞机', '加油', '停车', '过路费', '骑行', '共享单车', '出租车', '网约车', '车票', '机票', '油', 'etc', 'ETC'] },
  { name: '购物', icon: '🛍️', keywords: ['淘宝', '京东', '拼多多', '衣服', '鞋', '包', '数码', '手机', '电脑', '日用品', '超市', '便利店', '网购', '下单', '剁手', '商场', '试衣', '裤子', '裙子', '外套', '电器', '家电', '化妆品', '护肤品'] },
  { name: '住房', icon: '🏠', keywords: ['房租', '房贷', '水电', '物业', '燃气', '网费', '维修', '装修', '家居', '水费', '电费', '取暖', '宽带', '房东'] },
  { name: '娱乐', icon: '🎮', keywords: ['电影', '唱歌', 'KTV', '游戏', '旅游', '景点', '门票', '演出', '运动', '健身', '会员', '订阅', '视频', '游泳', '爬山', '徒步', '音乐', '演唱会', '话剧', '展览', '博物馆'] },
  { name: '医疗', icon: '💊', keywords: ['看病', '药', '挂号', '体检', '医院', '牙科', '门诊', '住院', '保险', '药房', '药店', '诊所', '检查', '化验'] },
  { name: '教育', icon: '📚', keywords: ['书', '课', '培训', '考试', '报名', '网课', '学费', '文具', '课程', '学习', '教材', '考证'] },
  { name: '人情', icon: '🎁', keywords: ['红包', '礼物', '随礼', '结婚', '生日', '过年', '请客', '聚会', '送礼', '随份子', '压岁钱'] },
  { name: '日用', icon: '🏪', keywords: ['纸巾', '洗护', '理发', '话费', '快递', '宠物', '烟酒', '美甲', '护肤', '洗衣', '沐浴', '牙膏', '牙刷', '垃圾袋', '充电', '手机壳', '贴膜'] },
  { name: '其他', icon: '💸', keywords: [] },
]

export const INCOME_CATEGORIES: CategoryDef[] = [
  { name: '工资', icon: '💼', keywords: ['工资', '发薪', '薪水', '月薪', '发工资', '基本工资', '薪资'] },
  { name: '奖金', icon: '🏆', keywords: ['奖金', '年终奖', '绩效', '提成', '分红', '季度奖'] },
  { name: '兼职', icon: '💻', keywords: ['兼职', '副业', '接单', '外包', '稿费', '私活', '业余'] },
  { name: '理财', icon: '📈', keywords: ['理财', '基金', '股票', '利息', '收益', '余额宝', '零钱通', '投资', '股息'] },
  { name: '退款', icon: '↩️', keywords: ['退款', '退', '报销', '返现', '返利'] },
  { name: '其他', icon: '💰', keywords: [] },
]

export function getCategoryIcon(category: string, type: 'expense' | 'income'): string {
  const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const found = list.find((c) => c.name === category)
  return found?.icon ?? '💰'
}
