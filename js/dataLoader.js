/**
 * 数据加载器
 * 负责从GitHub或本地缓存获取诗词数据
 */

class DataLoader {
    constructor(config) {
        this.config = config;
        this.cache = {};
        this.loadedCategories = new Set();
        this.isLoading = false;
        this.loadCallbacks = {};
    }

    /**
     * 加载指定类别的诗词数据
     * @param {string} category 诗词类别
     * @returns {Promise} 返回Promise对象
     */
    loadCategory(category) {
        return new Promise((resolve, reject) => {
            // 如果已经加载过，直接返回缓存数据
            if (this.loadedCategories.has(category)) {
                resolve(this.cache[category]);
                return;
            }
            
            // 如果正在加载中，加入回调队列
            if (this.loadCallbacks[category]) {
                this.loadCallbacks[category].push({resolve, reject});
                return;
            }
            
            this.loadCallbacks[category] = [{resolve, reject}];
            this.isLoading = true;
            
            // 先检查本地存储
            const cachedData = this.getFromLocalStorage(category);
            if (cachedData) {
                this.completeLoading(category, cachedData);
                return;
            }
            
            // 如果本地没有，则从GitHub获取
            this.fetchFromGitHub(category)
                .then(data => {
                    // 保存到本地存储
                    if (this.config.cache.enabled) {
                        this.saveToLocalStorage(category, data);
                    }
                    this.completeLoading(category, data);
                })
                .catch(error => {
                    console.error(`加载${category}数据失败:`, error);
                    this.loadCallbacks[category].forEach(cb => cb.reject(error));
                    delete this.loadCallbacks[category];
                    this.isLoading = false;
                });
        });
    }

    /**
     * 从数据源获取数据
     * @param {string} category 诗词类别
     * @returns {Promise} 返回Promise对象
     */
    async fetchFromGitHub(category) {
        if (!this.config.dataSource.poetryMap[category]) {
            throw new Error(`不支持的诗词类别: ${category}`);
        }
        
        const {path, files} = this.config.dataSource.poetryMap[category];
        const useLocalData = this.config.dataSource.useLocalData;
        const localPath = this.config.dataSource.localPath;
        const baseUrl = this.config.dataSource.baseUrl;
        const fallbackUrls = this.config.dataSource.fallbackUrls || [];
        
        const allData = [];
        
        // 显示加载状态
        document.getElementById('search-status').classList.remove('d-none');
        
        // 添加状态提示
        const statusElement = document.getElementById('search-status');
        const originalStatusHTML = statusElement.innerHTML;
        
        for (const file of files) {
            // 首先尝试本地数据
            let loaded = false;
            
            if (useLocalData) {
                try {
                    statusElement.innerHTML = `
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">加载中...</span>
                        </div>
                        <p class="mt-2">正在从本地加载 ${category} 数据...</p>
                    `;
                    
                    const response = await fetch(`${localPath}${path}${file}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    allData.push(...data);
                    loaded = true;
                    console.log(`成功从本地加载 ${file}`);
                } catch (error) {
                    console.error(`从本地加载文件 ${file} 失败:`, error);
                    // 本地加载失败，尝试远程数据源
                }
            }
            
            // 如果本地数据加载失败或未启用本地数据，尝试主数据源
            if (!loaded && !useLocalData) {
                try {
                    statusElement.innerHTML = `
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">加载中...</span>
                        </div>
                        <p class="mt-2">正在从主数据源加载 ${category} 数据...</p>
                    `;
                    
                    const response = await fetch(`${baseUrl}${path}${file}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    allData.push(...data);
                    loaded = true;
                } catch (error) {
                    console.error(`从主数据源加载文件 ${file} 失败:`, error);
                    // 继续尝试备用数据源
                }
                
                // 如果主数据源失败，尝试备用数据源
                if (!loaded) {
                    for (let i = 0; i < fallbackUrls.length; i++) {
                        try {
                            statusElement.innerHTML = `
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">加载中...</span>
                                </div>
                                <p class="mt-2">尝试备用数据源 ${i+1}...</p>
                            `;
                            
                            const fallbackUrl = fallbackUrls[i];
                            const response = await fetch(`${fallbackUrl}${path}${file}`);
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            const data = await response.json();
                            allData.push(...data);
                            loaded = true;
                            break; // 成功加载，跳出备用数据源循环
                        } catch (error) {
                            console.error(`从备用数据源 ${i+1} 加载文件 ${file} 失败:`, error);
                            // 继续尝试下一个备用数据源
                        }
                    }
                }
            }
            
            // 如果所有数据源都失败，显示错误信息
            if (!loaded) {
                console.error(`所有数据源加载文件 ${file} 失败`);
                // 我们会继续尝试加载其他文件
            }
        }
        
        // 恢复原始加载状态显示
        statusElement.innerHTML = originalStatusHTML;
        
        // 如果没有加载到任何数据，显示错误信息
        if (allData.length === 0) {
            // 在页面上显示错误消息
            const alertElement = document.createElement('div');
            alertElement.className = 'alert alert-danger';
            alertElement.role = 'alert';
            alertElement.innerHTML = `
                <h4 class="alert-heading">数据加载失败</h4>
                <p>无法加载诗词数据。这可能是由于以下原因：</p>
                <ul>
                    <li>本地数据文件丢失或损坏</li>
                    <li>网络连接问题</li>
                    <li>数据源暂时不可用</li>
                    <li>浏览器的跨域资源共享(CORS)限制</li>
                </ul>
                <p>您可以尝试刷新页面或稍后再试。</p>
                <button class="btn btn-outline-danger" onclick="location.reload()">刷新页面</button>
            `;
            document.querySelector('.results-container').prepend(alertElement);
        }
        
        // 隐藏加载状态
        document.getElementById('search-status').classList.add('d-none');
        
        return allData;
    }

    /**
     * 从本地存储获取数据
     * @param {string} category 诗词类别
     * @returns {Array|null} 返回数据数组或null
     */
    getFromLocalStorage(category) {
        try {
            const key = `poetry_${category}`;
            const storedData = localStorage.getItem(key);
            
            if (!storedData) return null;
            
            const {timestamp, data} = JSON.parse(storedData);
            
            // 检查数据是否过期
            if (Date.now() - timestamp > this.config.cache.expireTime) {
                localStorage.removeItem(key);
                return null;
            }
            
            return data;
        } catch (error) {
            console.warn('从本地存储获取数据失败:', error);
            return null;
        }
    }

    /**
     * 保存数据到本地存储
     * @param {string} category 诗词类别
     * @param {Array} data 数据数组
     */
    saveToLocalStorage(category, data) {
        try {
            const key = `poetry_${category}`;
            const storedData = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(key, JSON.stringify(storedData));
        } catch (error) {
            console.warn('保存数据到本地存储失败:', error);
            // 可能是因为数据过大或存储空间不足，这里可以静默失败
        }
    }

    /**
     * 完成加载过程
     * @param {string} category 诗词类别
     * @param {Array} data 数据数组
     */
    completeLoading(category, data) {
        this.cache[category] = data;
        this.loadedCategories.add(category);
        this.isLoading = false;
        
        // 调用所有等待的回调
        if (this.loadCallbacks[category]) {
            this.loadCallbacks[category].forEach(cb => cb.resolve(data));
            delete this.loadCallbacks[category];
        }
    }

    /**
     * 获取随机诗词
     * @param {string} category 诗词类别，默认为配置中的默认类别
     * @returns {Promise} 返回Promise对象
     */
    getRandomPoetry(category = this.config.randomPoetry.defaultCategory) {
        return this.loadCategory(category).then(data => {
            if (!data || data.length === 0) {
                throw new Error('没有可用的诗词数据');
            }
            const randomIndex = Math.floor(Math.random() * data.length);
            return data[randomIndex];
        });
    }

    /**
     * 清除本地缓存
     * @param {string} category 诗词类别，如果不指定则清除所有缓存
     */
    clearCache(category = null) {
        if (category) {
            const key = `poetry_${category}`;
            localStorage.removeItem(key);
            delete this.cache[category];
            this.loadedCategories.delete(category);
        } else {
            // 清除所有诗词缓存
            Object.keys(this.config.dataSource.poetryMap).forEach(cat => {
                const key = `poetry_${cat}`;
                localStorage.removeItem(key);
            });
            this.cache = {};
            this.loadedCategories.clear();
        }
    }
}
