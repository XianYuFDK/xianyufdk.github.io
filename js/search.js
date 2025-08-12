/**
 * 搜索引擎
 * 负责搜索诗词数据
 */

class SearchEngine {
    constructor(config, dataLoader) {
        this.config = config;
        this.dataLoader = dataLoader;
        this.lastSearchResults = [];
        this.currentPage = 1;
    }

    /**
     * 搜索诗词
     * @param {string} query 搜索关键词
     * @param {Object} options 搜索选项
     * @returns {Promise} 返回Promise对象
     */
    search(query, options) {
        const {
            category = 'all',
            searchTitle = true,
            searchAuthor = true, 
            searchContent = true,
            searchTags = false
        } = options;
        
        // 重置当前页码
        this.currentPage = 1;
        
        // 如果查询为空，返回空结果
        if (!query || query.trim().length < this.config.search.minSearchLength) {
            return Promise.resolve([]);
        }
        
        query = query.trim().toLowerCase();
        
        // 确定要搜索的类别
        const categories = category === 'all' 
            ? Object.keys(this.config.dataSource.poetryMap) 
            : [category];
            
        // 创建加载所有类别数据的Promise数组
        const loadPromises = categories.map(cat => this.dataLoader.loadCategory(cat));
        
        // 等待所有数据加载完成后搜索
        return Promise.all(loadPromises).then(dataArrays => {
            let allResults = [];
            
            // 遍历每个类别的数据
            dataArrays.forEach((dataArray, index) => {
                const categoryName = categories[index];
                
                const results = this.searchInData(
                    dataArray, 
                    query, 
                    searchTitle, 
                    searchAuthor, 
                    searchContent,
                    searchTags,
                    categoryName
                );
                
                allResults = [...allResults, ...results];
            });
            
            // 保存结果用于分页
            this.lastSearchResults = allResults;
            
            // 返回第一页结果
            return this.getPage(1);
        });
    }

    /**
     * 在数据中搜索
     * @param {Array} data 数据数组
     * @param {string} query 搜索关键词
     * @param {boolean} searchTitle 是否搜索标题
     * @param {boolean} searchAuthor 是否搜索作者
     * @param {boolean} searchContent 是否搜索内容
     * @param {boolean} searchTags 是否搜索标签
     * @param {string} category 类别名称
     * @returns {Array} 返回匹配的结果数组
     */
    searchInData(data, query, searchTitle, searchAuthor, searchContent, searchTags, category) {
        return data.filter(item => {
            // 根据不同数据类型获取标题字段
            const title = item.title || item.rhythmic || '';
            const author = item.author || item.poet || '';
            
            // 获取内容，根据不同数据结构可能有所不同
            let content = '';
            if (item.paragraphs) {
                content = item.paragraphs.join('\n');
            } else if (item.content) {
                content = Array.isArray(item.content) ? item.content.join('\n') : item.content;
            } else if (item.chapter) {
                content = item.chapter;
            }
            
            // 获取标签
            const tags = item.tags || [];
            
            // 检查是否匹配
            let isMatch = false;
            
            if (searchTitle && this.isMatch(title, query)) {
                isMatch = true;
            }
            
            if (!isMatch && searchAuthor && this.isMatch(author, query)) {
                isMatch = true;
            }
            
            if (!isMatch && searchContent && this.isMatch(content, query)) {
                isMatch = true;
            }
            
            if (!isMatch && searchTags && Array.isArray(tags)) {
                isMatch = tags.some(tag => this.isMatch(tag, query));
            }
            
            // 如果匹配，返回格式化的结果
            if (isMatch) {
                return {
                    ...item,
                    category,
                    // 添加高亮信息
                    highlights: this.getHighlights(item, query, searchTitle, searchAuthor, searchContent)
                };
            }
            
            return false;
        });
    }

    /**
     * 检查文本是否匹配查询
     * @param {string} text 文本
     * @param {string} query 查询词
     * @returns {boolean} 是否匹配
     */
    isMatch(text, query) {
        if (!text) return false;
        
        text = text.toLowerCase();
        
        if (this.config.search.fuzzySearch) {
            // 如果启用模糊搜索，检查文本是否包含查询词中任意一个字符
            for (const char of query) {
                if (text.includes(char)) {
                    return true;
                }
            }
            return false;
        } else {
            // 精确匹配，检查文本是否包含完整查询词
            return text.includes(query);
        }
    }

    /**
     * 获取高亮信息
     * @param {Object} item 诗词项
     * @param {string} query 查询词
     * @param {boolean} searchTitle 是否搜索标题
     * @param {boolean} searchAuthor 是否搜索作者
     * @param {boolean} searchContent 是否搜索内容
     * @returns {Object} 高亮信息
     */
    getHighlights(item, query, searchTitle, searchAuthor, searchContent) {
        if (!this.config.search.highlightMatchedText) return null;
        
        const highlights = {};
        
        // 获取标题和作者
        const title = item.title || item.rhythmic || '';
        const author = item.author || item.poet || '';
        
        // 获取内容
        let content = '';
        let contentArray = [];
        if (item.paragraphs) {
            content = item.paragraphs.join('\n');
            contentArray = item.paragraphs;
        } else if (item.content) {
            contentArray = Array.isArray(item.content) ? item.content : [item.content];
            content = contentArray.join('\n');
        } else if (item.chapter) {
            content = item.chapter;
            contentArray = [item.chapter];
        }
        
        // 检查标题
        if (searchTitle && title && this.isMatch(title, query)) {
            highlights.title = this.highlightText(title, query);
        }
        
        // 检查作者
        if (searchAuthor && author && this.isMatch(author, query)) {
            highlights.author = this.highlightText(author, query);
        }
        
        // 检查内容
        if (searchContent && content) {
            const matchedLines = [];
            for (let i = 0; i < contentArray.length; i++) {
                if (this.isMatch(contentArray[i], query)) {
                    matchedLines.push({
                        index: i,
                        text: this.highlightText(contentArray[i], query)
                    });
                }
            }
            if (matchedLines.length > 0) {
                highlights.content = matchedLines;
            }
        }
        
        return highlights;
    }

    /**
     * 高亮文本中匹配查询词的部分
     * @param {string} text 文本
     * @param {string} query 查询词
     * @returns {string} 高亮后的文本
     */
    highlightText(text, query) {
        if (!text) return '';
        
        if (this.config.search.fuzzySearch) {
            // 如果是模糊搜索，高亮所有匹配的单个字符
            let result = text;
            for (const char of query) {
                const regex = new RegExp(char, 'gi');
                result = result.replace(regex, match => `<mark>${match}</mark>`);
            }
            return result;
        } else {
            // 精确匹配，高亮完整的查询词
            const regex = new RegExp(query, 'gi');
            return text.replace(regex, match => `<mark>${match}</mark>`);
        }
    }

    /**
     * 获取指定页码的结果
     * @param {number} page 页码
     * @returns {Array} 当前页的结果
     */
    getPage(page = 1) {
        const resultsPerPage = this.config.resultsPerPage;
        const startIndex = (page - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        
        this.currentPage = page;
        
        return this.lastSearchResults.slice(startIndex, endIndex);
    }

    /**
     * 获取下一页结果
     * @returns {Array} 下一页的结果
     */
    getNextPage() {
        return this.getPage(this.currentPage + 1);
    }

    /**
     * 获取结果总数
     * @returns {number} 结果总数
     */
    getTotalResults() {
        return this.lastSearchResults.length;
    }

    /**
     * 获取总页数
     * @returns {number} 总页数
     */
    getTotalPages() {
        return Math.ceil(this.getTotalResults() / this.config.resultsPerPage);
    }

    /**
     * 检查是否有更多页
     * @returns {boolean} 是否有更多页
     */
    hasMorePages() {
        return this.currentPage < this.getTotalPages();
    }

    /**
     * 重置搜索结果
     */
    reset() {
        this.lastSearchResults = [];
        this.currentPage = 1;
    }
}
