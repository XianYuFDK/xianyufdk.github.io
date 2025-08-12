/**
 * 配置文件
 * 定义数据源和基本配置
 */

const CONFIG = {
    // API 配置
    api: {
        // 是否使用外部API
        useExternalApis: true,
        
        // 默认API，可选值：'github', 'jinrishici', 'gushicione', 'gushiwen'
        defaultApi: 'github',
        
        // 随机诗词API，可选值：'github', 'jinrishici', 'gushicione', 'gushiwen'
        randomPoemApi: 'jinrishici',
        
        // 搜索API，可选值：'github', 'gushiwen'
        searchApi: 'github',
        
        // API自动故障转移，当某个API失败时自动尝试其他API
        autoFailover: true
    },
    
    // 数据源配置
    dataSource: {
        // 使用本地数据
        useLocalData: true,
        
        // 本地数据路径
        localPath: './data/chinese-poetry/',
        
        // 备份：主数据源 (使用CORS代理)
        baseUrl: 'https://cors.eu.org/https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/',
        
        // 备份：备用数据源列表 (按优先级排序)
        fallbackUrls: [
            'https://raw.gitmirror.com/chinese-poetry/chinese-poetry/master/',
            'https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/'
        ],
        
        // 诗词数据映射
        poetryMap: {
            // 诗经
            shi: {
                path: 'shijing/',
                files: ['shijing.json']
            },
            // 唐诗
            tang: {
                path: 'tang/',
                files: ['tang-poems.json']
            },
            // 宋词
            song: {
                path: 'ci/',
                files: ['ci-songs.json']
            },
            // 元曲
            yuan: {
                path: 'yuan/',
                files: ['yuanqu.json']
            },
            // 论语
            lunyu: {
                path: 'lunyu/',
                files: ['lunyu.json']
            },
            // 曹操诗集
            caocao: {
                path: 'caocaoshiji/',
                files: ['caocao.json']
            }
        }
    },
    
    // 本地数据缓存设置
    cache: {
        enabled: true,
        expireTime: 7 * 24 * 60 * 60 * 1000 // 7天（毫秒）
    },
    
    // 每页显示结果数
    resultsPerPage: 12,
    
    // 随机诗词配置
    randomPoetry: {
        // 默认获取唐诗
        defaultCategory: 'tang',
        // 每次展示新诗的间隔（毫秒）
        autoChangeInterval: null // 设为null表示不自动切换，或设置时间如 60000（1分钟）
    },
    
    // 搜索设置
    search: {
        minSearchLength: 1,
        highlightMatchedText: true,
        fuzzySearch: true
    }
};
