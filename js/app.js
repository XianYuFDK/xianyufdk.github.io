/**
 * 主应用程序
 * 负责页面交互和展示
 */

// 初始化API
const jinrishiciAPI = new JinrishiciAPI();
const gushiciOneAPI = new GushiciOneAPI();
const gushiwenAPI = new GushiwenAPI();

// 初始化数据加载器和搜索引擎
const dataLoader = new DataLoader(CONFIG);
const searchEngine = new SearchEngine(CONFIG, dataLoader);

// API管理器
const apiManager = {
    apis: {
        'github': dataLoader,
        'jinrishici': jinrishiciAPI,
        'gushicione': gushiciOneAPI,
        'gushiwen': gushiwenAPI
    },
    
    // 获取随机诗词
    async getRandomPoem() {
        // 使用配置的随机诗词API
        const apiName = CONFIG.api.randomPoemApi;
        const api = this.apis[apiName];
        
        try {
            if (apiName === 'github') {
                return await api.getRandomPoetry();
            } else {
                return await api.getRandomPoem();
            }
        } catch (error) {
            console.error(`使用 ${apiName} API 获取随机诗词失败:`, error);
            
            // 如果启用了自动故障转移，尝试其他API
            if (CONFIG.api.autoFailover) {
                console.log('尝试使用其他API...');
                
                // 按优先级尝试其他API
                const apiPriority = ['jinrishici', 'gushiwen', 'gushicione', 'github'];
                
                for (const name of apiPriority) {
                    if (name !== apiName) {
                        try {
                            const fallbackApi = this.apis[name];
                            if (name === 'github') {
                                return await fallbackApi.getRandomPoetry();
                            } else {
                                return await fallbackApi.getRandomPoem();
                            }
                        } catch (fallbackError) {
                            console.error(`使用备用 ${name} API 获取随机诗词失败:`, fallbackError);
                        }
                    }
                }
            }
            
            // 所有API都失败，返回一个默认诗词
            return {
                title: '无法获取诗词',
                author: '系统提示',
                paragraphs: ['抱歉，无法获取诗词数据。', '请检查网络连接或稍后再试。'],
                category: 'tang'
            };
        }
    },
    
    // 搜索诗词
    async searchPoems(query, options) {
        // 使用配置的搜索API
        const apiName = CONFIG.api.searchApi;
        
        if (apiName === 'github') {
            return await searchEngine.search(query, options);
        } else if (apiName === 'gushiwen') {
            try {
                return await gushiwenAPI.searchPoemsByKeyword(query);
            } catch (error) {
                console.error('使用古诗文网API搜索失败:', error);
                
                // 如果启用了自动故障转移，使用GitHub API
                if (CONFIG.api.autoFailover) {
                    return await searchEngine.search(query, options);
                }
                
                return [];
            }
        }
        
        return [];
    }
};

// DOM元素
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchTitle = document.getElementById('search-title');
const searchAuthor = document.getElementById('search-author');
const searchContent = document.getElementById('search-content');
const searchTags = document.getElementById('search-tags');
const poetryCategory = document.getElementById('poetry-category');
const searchStatus = document.getElementById('search-status');
const resultsCount = document.getElementById('results-count');
const countNumber = document.getElementById('count-number');
const resultsList = document.getElementById('results-list');
const noResults = document.getElementById('no-results');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreButton = document.getElementById('load-more-button');
const poetryDetail = document.getElementById('poetry-detail');
const backToResults = document.getElementById('back-to-results');
const randomTitle = document.getElementById('random-title');
const randomAuthor = document.getElementById('random-author');
const randomContent = document.getElementById('random-content');
const randomButton = document.getElementById('random-button');

// API设置元素
const searchApiSelect = document.getElementById('search-api-select');
const randomApiSelect = document.getElementById('random-api-select');
const autoFailoverSwitch = document.getElementById('auto-failover-switch');
const localCacheSwitch = document.getElementById('local-cache-switch');
const localDataSwitch = document.getElementById('local-data-switch');
const saveApiSettingsButton = document.getElementById('save-api-settings');

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    // 加载保存的API设置
    loadApiSettings();
    
    // 初始化随机诗词
    loadRandomPoetry();
    
    // 注册事件监听器
    registerEventListeners();
});

/**
 * 注册事件监听器
 */
function registerEventListeners() {
    // 搜索按钮点击事件
    searchButton.addEventListener('click', performSearch);
    
    // 输入框回车事件
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // 加载更多按钮点击事件
    loadMoreButton.addEventListener('click', loadMoreResults);
    
    // 返回搜索结果按钮点击事件
    backToResults.addEventListener('click', () => {
        poetryDetail.classList.add('d-none');
        resultsList.parentElement.classList.remove('d-none');
        if (loadMoreContainer.classList.contains('d-none') && searchEngine.hasMorePages()) {
            loadMoreContainer.classList.remove('d-none');
        }
    });
    
    // 随机诗词按钮点击事件
    randomButton.addEventListener('click', loadRandomPoetry);
    
    // API设置保存按钮点击事件
    if (saveApiSettingsButton) {
        saveApiSettingsButton.addEventListener('click', saveApiSettings);
    }
}

/**
 * 加载API设置
 */
function loadApiSettings() {
    try {
        // 从本地存储加载API设置
        const savedSettings = localStorage.getItem('poetry_api_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // 更新配置
            CONFIG.api.defaultApi = settings.defaultApi || CONFIG.api.defaultApi;
            CONFIG.api.randomPoemApi = settings.randomPoemApi || CONFIG.api.randomPoemApi;
            CONFIG.api.searchApi = settings.searchApi || CONFIG.api.searchApi;
            CONFIG.api.autoFailover = settings.autoFailover !== undefined ? settings.autoFailover : CONFIG.api.autoFailover;
            CONFIG.cache.enabled = settings.localCache !== undefined ? settings.localCache : CONFIG.cache.enabled;
            CONFIG.dataSource.useLocalData = settings.useLocalData !== undefined ? settings.useLocalData : CONFIG.dataSource.useLocalData;
            
            // 更新UI
            if (searchApiSelect) searchApiSelect.value = CONFIG.api.searchApi;
            if (randomApiSelect) randomApiSelect.value = CONFIG.api.randomPoemApi;
            if (autoFailoverSwitch) autoFailoverSwitch.checked = CONFIG.api.autoFailover;
            if (localCacheSwitch) localCacheSwitch.checked = CONFIG.cache.enabled;
            if (localDataSwitch) localDataSwitch.checked = CONFIG.dataSource.useLocalData;
        }
    } catch (error) {
        console.error('加载API设置失败:', error);
    }
}

/**
 * 保存API设置
 */
function saveApiSettings() {
    try {
        // 获取设置值
        const searchApi = searchApiSelect ? searchApiSelect.value : CONFIG.api.searchApi;
        const randomApi = randomApiSelect ? randomApiSelect.value : CONFIG.api.randomPoemApi;
        const autoFailover = autoFailoverSwitch ? autoFailoverSwitch.checked : CONFIG.api.autoFailover;
        const localCache = localCacheSwitch ? localCacheSwitch.checked : CONFIG.cache.enabled;
        const useLocalData = localDataSwitch ? localDataSwitch.checked : CONFIG.dataSource.useLocalData;
        
        // 更新配置
        CONFIG.api.defaultApi = searchApi;
        CONFIG.api.randomPoemApi = randomApi;
        CONFIG.api.searchApi = searchApi;
        CONFIG.api.autoFailover = autoFailover;
        CONFIG.cache.enabled = localCache;
        CONFIG.dataSource.useLocalData = useLocalData;
        
        // 保存到本地存储
        const settings = {
            defaultApi: searchApi,
            randomPoemApi: randomApi,
            searchApi: searchApi,
            autoFailover: autoFailover,
            localCache: localCache,
            useLocalData: useLocalData
        };
        
        localStorage.setItem('poetry_api_settings', JSON.stringify(settings));
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('apiSettingsModal'));
        if (modal) {
            modal.hide();
        }
        
        // 显示成功提示
        alert('设置已保存！');
        
        // 提示刷新页面以应用本地数据设置
        if (useLocalData !== CONFIG.dataSource.useLocalData) {
            if (confirm('切换本地数据设置需要刷新页面才能生效。是否立即刷新？')) {
                window.location.reload();
            }
        }
    } catch (error) {
        console.error('保存API设置失败:', error);
        alert('保存设置失败，请稍后再试');
    }
}

/**
 * 执行搜索
 */
function performSearch() {
    const query = searchInput.value.trim();
    
    if (query.length < CONFIG.search.minSearchLength) {
        alert(`请输入至少 ${CONFIG.search.minSearchLength} 个字符进行搜索`);
        return;
    }
    
    // 获取搜索选项
    const options = {
        category: poetryCategory.value,
        searchTitle: searchTitle.checked,
        searchAuthor: searchAuthor.checked,
        searchContent: searchContent.checked,
        searchTags: searchTags.checked
    };
    
    // 显示加载状态
    searchStatus.classList.remove('d-none');
    resultsList.innerHTML = '';
    noResults.classList.add('d-none');
    resultsCount.classList.add('d-none');
    loadMoreContainer.classList.add('d-none');
    poetryDetail.classList.add('d-none');
    
    // 使用API管理器执行搜索
    apiManager.searchPoems(query, options)
        .then(results => {
            // 隐藏加载状态
            searchStatus.classList.add('d-none');
            
            // 显示结果数量
            let totalResults;
            if (CONFIG.api.searchApi === 'github') {
                totalResults = searchEngine.getTotalResults();
            } else {
                totalResults = results.length;
                // 将结果保存到搜索引擎以支持分页
                searchEngine.lastSearchResults = results;
                searchEngine.currentPage = 1;
            }
            
            countNumber.textContent = totalResults;
            resultsCount.classList.remove('d-none');
            
            // 显示结果或无结果提示
            if (totalResults > 0) {
                // 如果不是使用GitHub API，则只显示第一页结果
                if (CONFIG.api.searchApi !== 'github') {
                    displayResults(searchEngine.getPage(1));
                } else {
                    displayResults(results);
                }
                
                // 如果有更多页，显示加载更多按钮
                if (searchEngine.hasMorePages()) {
                    loadMoreContainer.classList.remove('d-none');
                } else {
                    loadMoreContainer.classList.add('d-none');
                }
            } else {
                noResults.classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error('搜索出错:', error);
            searchStatus.classList.add('d-none');
            alert('搜索过程中发生错误，请稍后重试');
        });
}

/**
 * 显示搜索结果
 * @param {Array} results 结果数组
 * @param {boolean} append 是否追加结果（用于加载更多）
 */
function displayResults(results, append = false) {
    if (!append) {
        resultsList.innerHTML = '';
    }
    
    results.forEach(result => {
        const card = createPoetryCard(result);
        resultsList.appendChild(card);
        
        // 添加点击事件，显示详情
        card.addEventListener('click', () => {
            displayPoetryDetail(result);
        });
    });
}

/**
 * 创建诗词卡片
 * @param {Object} poetry 诗词对象
 * @returns {HTMLElement} 卡片元素
 */
function createPoetryCard(poetry) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    // 获取标题和作者
    const title = poetry.title || poetry.rhythmic || '无题';
    const author = poetry.author || poetry.poet || '佚名';
    const dynasty = getCategoryLabel(poetry.category);
    
    // 获取内容预览
    let contentPreview = '';
    if (poetry.paragraphs && poetry.paragraphs.length > 0) {
        contentPreview = poetry.paragraphs.slice(0, 2).join('\n');
        if (poetry.paragraphs.length > 2) {
            contentPreview += '...';
        }
    } else if (poetry.content) {
        const contentArray = Array.isArray(poetry.content) ? poetry.content : [poetry.content];
        contentPreview = contentArray.slice(0, 2).join('\n');
        if (contentArray.length > 2) {
            contentPreview += '...';
        }
    } else if (poetry.chapter) {
        contentPreview = poetry.chapter.substring(0, 50) + (poetry.chapter.length > 50 ? '...' : '');
    }
    
    col.innerHTML = `
        <div class="poetry-card card h-100">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${dynasty} · ${author}</h6>
                <div class="card-text poetry-content">${contentPreview}</div>
            </div>
            <div class="card-footer bg-transparent text-center">
                <small class="text-muted">点击查看详情</small>
            </div>
        </div>
    `;
    
    return col;
}

/**
 * 显示诗词详情
 * @param {Object} poetry 诗词对象
 */
function displayPoetryDetail(poetry) {
    // 隐藏结果列表和加载更多按钮
    resultsList.parentElement.classList.add('d-none');
    loadMoreContainer.classList.add('d-none');
    
    // 获取诗词信息
    const title = poetry.title || poetry.rhythmic || '无题';
    const author = poetry.author || poetry.poet || '佚名';
    const dynasty = getCategoryLabel(poetry.category);
    
    // 获取诗词内容
    let content = '';
    if (poetry.paragraphs && poetry.paragraphs.length > 0) {
        content = poetry.paragraphs.join('\n');
    } else if (poetry.content) {
        content = Array.isArray(poetry.content) ? poetry.content.join('\n') : poetry.content;
    } else if (poetry.chapter) {
        content = poetry.chapter;
    }
    
    // 更新详情视图
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-dynasty').textContent = dynasty;
    document.getElementById('detail-author').textContent = author;
    document.getElementById('detail-content').textContent = content;
    
    // 处理注释（如果有）
    const detailNotes = document.getElementById('detail-notes');
    if (poetry.notes) {
        detailNotes.innerHTML = `<h6>注释</h6><div class="notes-content">${poetry.notes}</div>`;
        detailNotes.classList.remove('d-none');
    } else {
        detailNotes.innerHTML = '';
        detailNotes.classList.add('d-none');
    }
    
    // 处理翻译（如果有）
    const detailTranslation = document.getElementById('detail-translation');
    if (poetry.translation) {
        detailTranslation.innerHTML = `<h6>译文</h6><div class="translation-content">${poetry.translation}</div>`;
        detailTranslation.classList.remove('d-none');
    } else {
        detailTranslation.innerHTML = '';
        detailTranslation.classList.add('d-none');
    }
    
    // 处理赏析（如果有）
    const detailAppreciation = document.getElementById('detail-appreciation');
    if (poetry.appreciation) {
        detailAppreciation.innerHTML = `<h6>赏析</h6><div class="appreciation-content">${poetry.appreciation}</div>`;
        detailAppreciation.classList.remove('d-none');
    } else {
        detailAppreciation.innerHTML = '';
        detailAppreciation.classList.add('d-none');
    }
    
    // 显示详情视图
    poetryDetail.classList.remove('d-none');
}

/**
 * 加载更多结果
 */
function loadMoreResults() {
    // 显示加载状态
    loadMoreButton.disabled = true;
    loadMoreButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 加载中...';
    
    // 获取下一页结果
    const nextPageResults = searchEngine.getNextPage();
    
    // 追加显示结果
    displayResults(nextPageResults, true);
    
    // 恢复按钮状态
    loadMoreButton.disabled = false;
    loadMoreButton.textContent = '加载更多';
    
    // 如果没有更多结果，隐藏按钮
    if (!searchEngine.hasMorePages()) {
        loadMoreContainer.classList.add('d-none');
    }
}

/**
 * 加载随机诗词
 */
function loadRandomPoetry() {
    // 显示加载状态
    randomTitle.textContent = '加载中...';
    randomAuthor.textContent = '';
    randomContent.textContent = '';
    
    // 使用API管理器获取随机诗词
    apiManager.getRandomPoem()
        .then(poetry => {
            if (!poetry) {
                throw new Error('获取随机诗词失败');
            }
            
            // 更新随机诗词卡片
            const title = poetry.title || poetry.rhythmic || '无题';
            const author = poetry.author || poetry.poet || '佚名';
            const dynasty = poetry.dynasty || getCategoryLabel(poetry.category);
            
            let content = '';
            if (poetry.paragraphs && poetry.paragraphs.length > 0) {
                content = poetry.paragraphs.join('\n');
            } else if (poetry.content) {
                content = Array.isArray(poetry.content) ? poetry.content.join('\n') : poetry.content;
            } else if (poetry.chapter) {
                content = poetry.chapter;
            }
            
            randomTitle.textContent = title;
            randomAuthor.textContent = dynasty ? `${dynasty} · ${author}` : author;
            randomContent.textContent = content;
            
            // 添加加载成功的标志
            document.querySelector('.random-poetry').classList.remove('load-failed');
            document.getElementById('random-button').textContent = '换一首';
        })
        .catch(error => {
            console.error('加载随机诗词失败:', error);
            randomTitle.textContent = '加载失败';
            randomAuthor.textContent = '';
            randomContent.textContent = '无法加载随机诗词，请刷新页面或稍后再试。\n\n可能原因：\n1. 网络连接问题\n2. API 暂时不可用\n3. 本地数据路径配置错误';
            
            // 添加加载失败的标志
            document.querySelector('.random-poetry').classList.add('load-failed');
            document.getElementById('random-button').textContent = '重试';
            
            // 显示API设置按钮
            const apiSettingsBtn = document.getElementById('api-settings-btn');
            if (apiSettingsBtn) {
                apiSettingsBtn.classList.add('btn-warning');
                apiSettingsBtn.innerHTML = '<i class="bi bi-gear"></i> 修复设置';
                apiSettingsBtn.style.animation = 'pulse 2s infinite';
            }
        });
}

/**
 * 获取类别标签
 * @param {string} category 类别代码
 * @returns {string} 类别标签
 */
function getCategoryLabel(category) {
    const categoryMap = {
        'shi': '诗经',
        'tang': '唐诗',
        'song': '宋词',
        'yuan': '元曲',
        'lunyu': '论语',
        'caocao': '魏晋'
    };
    
    return categoryMap[category] || '古诗词';
}
