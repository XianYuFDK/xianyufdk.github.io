/**
 * 今日诗词 API 工具
 * 用于获取今日诗词的诗句
 */

class JinrishiciAPI {
    constructor() {
        this.token = '';
        this.initialized = false;
        this.baseURL = 'https://v2.jinrishici.com/';
    }

    /**
     * 初始化 API
     * @returns {Promise} 返回初始化结果的Promise对象
     */
    async init() {
        if (this.initialized) {
            return Promise.resolve();
        }

        try {
            // 从本地存储中获取token
            const storedToken = localStorage.getItem('jinrishici-token');
            
            if (storedToken) {
                this.token = storedToken;
                this.initialized = true;
                return Promise.resolve();
            } else {
                // 获取新token
                return this.getToken();
            }
        } catch (error) {
            console.error('初始化今日诗词API失败:', error);
            return Promise.reject(error);
        }
    }

    /**
     * 获取 Token
     * @returns {Promise} 返回获取Token的Promise对象
     */
    async getToken() {
        try {
            const response = await fetch(`${this.baseURL}token`);
            if (!response.ok) {
                throw new Error(`获取token失败: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.status === 'success') {
                this.token = data.data;
                localStorage.setItem('jinrishici-token', this.token);
                this.initialized = true;
                return Promise.resolve();
            } else {
                throw new Error(`获取token失败: ${data.message}`);
            }
        } catch (error) {
            console.error('获取今日诗词token失败:', error);
            return Promise.reject(error);
        }
    }

    /**
     * 获取随机诗句
     * @returns {Promise} 返回随机诗句的Promise对象
     */
    async getRandomPoem() {
        try {
            if (!this.initialized) {
                await this.init();
            }

            const response = await fetch(`${this.baseURL}sentence`, {
                headers: {
                    'X-User-Token': this.token
                }
            });

            if (!response.ok) {
                throw new Error(`获取随机诗句失败: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                // 转换为我们网站使用的格式
                return {
                    title: data.data.origin.title,
                    author: data.data.origin.author,
                    paragraphs: data.data.origin.content,
                    dynasty: data.data.origin.dynasty,
                    content: data.data.origin.content.join('\n'),
                    category: this.mapDynastyToCategory(data.data.origin.dynasty),
                    tags: [data.data.origin.dynasty]
                };
            } else {
                throw new Error(`获取随机诗句失败: ${data.message}`);
            }
        } catch (error) {
            console.error('获取今日诗词随机诗句失败:', error);
            return Promise.reject(error);
        }
    }

    /**
     * 将朝代映射为类别
     * @param {string} dynasty 朝代
     * @returns {string} 类别
     */
    mapDynastyToCategory(dynasty) {
        const dynastyMap = {
            '先秦': 'shi',
            '两汉': 'shi',
            '魏晋': 'caocao',
            '南北朝': 'caocao',
            '隋代': 'tang',
            '唐代': 'tang',
            '宋代': 'song',
            '元代': 'yuan',
            '明代': 'ming',
            '清代': 'qing'
        };
        
        return dynastyMap[dynasty] || 'tang';
    }

    /**
     * 搜索诗句
     * @param {string} keyword 关键词
     * @returns {Promise} 返回搜索结果的Promise对象
     */
    async searchPoemsByKeyword(keyword) {
        // 今日诗词API不支持搜索，这里返回空数组
        return Promise.resolve([]);
    }
}
