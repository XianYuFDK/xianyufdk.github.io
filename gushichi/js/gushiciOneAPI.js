/**
 * 古诗词·一言 API 工具
 * 用于获取古诗词一言的诗句
 */

class GushiciOneAPI {
    constructor() {
        this.baseURL = 'https://v1.jinrishici.com/';
        this.categories = ['all', 'shuqing', 'siji', 'shanshui', 'tianqi', 'renwu', 'huahua', 'aiqing', 'shenghuo', 'zheli', 'guanshangyuntu'];
        this.categoryNames = {
            'all': '全部',
            'shuqing': '抒情',
            'siji': '四季',
            'shanshui': '山水',
            'tianqi': '天气',
            'renwu': '人物',
            'huahua': '花卉',
            'aiqing': '爱情',
            'shenghuo': '生活',
            'zheli': '哲理',
            'guanshangyuntu': '古诗词·一言'
        };
    }

    /**
     * 获取随机诗句
     * @param {string} category 类别，默认为全部
     * @returns {Promise} 返回随机诗句的Promise对象
     */
    async getRandomPoem(category = 'all') {
        try {
            // 确保类别有效
            if (!this.categories.includes(category)) {
                category = 'all';
            }

            const response = await fetch(`${this.baseURL}${category}`);
            
            if (!response.ok) {
                throw new Error(`获取随机诗句失败: ${response.status}`);
            }

            const data = await response.json();
            
            // 转换为我们网站使用的格式
            return {
                title: '古诗词一言',
                author: data.author || '佚名',
                paragraphs: [data.content],
                dynasty: data.origin || '',
                content: data.content,
                category: 'tang', // 默认分类为唐诗
                tags: [this.categoryNames[category]]
            };
        } catch (error) {
            console.error('获取古诗词一言随机诗句失败:', error);
            return Promise.reject(error);
        }
    }

    /**
     * 搜索诗句
     * @param {string} keyword 关键词
     * @returns {Promise} 返回搜索结果的Promise对象
     */
    async searchPoemsByKeyword(keyword) {
        // 古诗词一言API不支持搜索，这里返回空数组
        return Promise.resolve([]);
    }
}
