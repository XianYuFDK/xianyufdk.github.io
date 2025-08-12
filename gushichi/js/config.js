/**
 * 配置文件
 * 定义数据源和基本配置
 */

const CONFIG = {
    // GitHub 数据源配置
    dataSource: {
        // GitHub raw content URL 前缀
        baseUrl: 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/',
        
        // 诗词数据映射
        poetryMap: {
            // 诗经
            shi: {
                path: 'shijing/',
                files: ['shijing.json']
            },
            // 唐诗
            tang: {
                path: 'quan_tang_shi/',
                files: Array.from({length: 57}, (_, i) => `json/poet.tang.${i * 1000}.json`)
            },
            // 宋词
            song: {
                path: 'ci/',
                files: ['ci.song.0.json', 'ci.song.1000.json', 'ci.song.2000.json', 
                        'ci.song.3000.json', 'ci.song.4000.json', 'ci.song.5000.json',
                        'ci.song.6000.json', 'ci.song.7000.json', 'ci.song.8000.json',
                        'ci.song.9000.json', 'ci.song.10000.json', 'ci.song.11000.json',
                        'ci.song.12000.json', 'ci.song.13000.json', 'ci.song.14000.json',
                        'ci.song.15000.json', 'ci.song.16000.json', 'ci.song.17000.json',
                        'ci.song.18000.json', 'ci.song.19000.json', 'ci.song.20000.json']
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
