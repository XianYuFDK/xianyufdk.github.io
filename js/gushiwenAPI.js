/**
 * 古诗文网 API 工具
 * 通过非官方API获取古诗文网的数据
 */

class GushiwenAPI {
    constructor() {
        // 使用代理解决跨域问题
        this.baseURL = 'https://cors.eu.org/https://app.gushiwen.cn/api/';
    }

    /**
     * 获取随机诗句
     * @returns {Promise} 返回随机诗句的Promise对象
     */
    async getRandomPoem() {
        try {
            const response = await fetch(`${this.baseURL}v1/docs/random`);
            
            if (!response.ok) {
                throw new Error(`获取随机诗句失败: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'success' && data.result) {
                const poem = data.result;
                
                // 转换为我们网站使用的格式
                return {
                    title: poem.title,
                    author: poem.author,
                    paragraphs: poem.content.split('\n'),
                    dynasty: poem.dynasty,
                    content: poem.content,
                    category: this.mapDynastyToCategory(poem.dynasty),
                    tags: [poem.dynasty],
                    translation: poem.translation,
                    appreciation: poem.appreciation
                };
            } else {
                throw new Error('获取随机诗句失败: API返回错误');
            }
        } catch (error) {
            console.error('获取古诗文网随机诗句失败:', error);
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
     * @param {number} page 页码，默认为1
     * @returns {Promise} 返回搜索结果的Promise对象
     */
    async searchPoemsByKeyword(keyword, page = 1) {
        try {
            const response = await fetch(`${this.baseURL}v1/docs/search?keywords=${encodeURIComponent(keyword)}&page=${page}`);
            
            if (!response.ok) {
                throw new Error(`搜索诗句失败: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'success' && data.result && data.result.list) {
                // 转换为我们网站使用的格式
                return data.result.list.map(item => ({
                    title: item.title,
                    author: item.author,
                    paragraphs: item.content.split('\n'),
                    dynasty: item.dynasty,
                    content: item.content,
                    category: this.mapDynastyToCategory(item.dynasty),
                    tags: [item.dynasty],
                    id: item.id
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error('搜索古诗文网诗句失败:', error);
            return Promise.resolve([]); // 失败时返回空数组
        }
    }

    /**
     * 获取诗词详情
     * @param {string} id 诗词ID
     * @returns {Promise} 返回诗词详情的Promise对象
     */
    async getPoemDetail(id) {
        try {
            const response = await fetch(`${this.baseURL}v1/docs/view?id=${id}`);
            
            if (!response.ok) {
                throw new Error(`获取诗词详情失败: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'success' && data.result) {
                const poem = data.result;
                
                // 转换为我们网站使用的格式
                return {
                    title: poem.title,
                    author: poem.author,
                    paragraphs: poem.content.split('\n'),
                    dynasty: poem.dynasty,
                    content: poem.content,
                    category: this.mapDynastyToCategory(poem.dynasty),
                    tags: [poem.dynasty],
                    translation: poem.translation,
                    appreciation: poem.appreciation,
                    notes: poem.notes,
                    id: poem.id
                };
            } else {
                throw new Error('获取诗词详情失败: API返回错误');
            }
        } catch (error) {
            console.error('获取古诗文网诗词详情失败:', error);
            return Promise.reject(error);
        }
    }
}
