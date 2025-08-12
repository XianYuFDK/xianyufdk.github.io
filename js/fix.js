/**
 * 修复工具
 * 用于检测和修复常见问题
 */
class PoetryFix {
    constructor(config) {
        this.config = config;
        this.initialConfig = JSON.parse(JSON.stringify(config)); // 深拷贝初始配置
    }
    
    /**
     * 自动检测网站部署路径并修复配置
     */
    autoDetectBasePath() {
        return new Promise((resolve) => {
            // 获取当前网站的基本路径
            const currentPath = window.location.pathname;
            let basePath = '';
            
            // 提取基本路径，如 /gushichi/
            const match = currentPath.match(/^(\/[^\/]+\/)/);
            if (match) {
                basePath = match[1];
            }
            
            console.log('检测到网站部署路径:', basePath);
            
            // 根据检测到的基本路径修复本地数据路径
            if (basePath) {
                const originalPath = this.config.dataSource.localPath;
                const newPath = basePath + (originalPath.startsWith('./') ? originalPath.substring(2) : originalPath);
                
                console.log('更新本地数据路径:', newPath);
                this.config.dataSource.localPath = newPath;
                
                // 尝试验证新路径是否有效
                this.testLocalPath(this.config.dataSource.localPath)
                    .then(isValid => {
                        if (!isValid) {
                            console.warn('自动检测的路径无效，尝试备用路径...');
                            // 尝试几种常见的基本路径模式
                            return this.tryAlternativePaths();
                        }
                        return true;
                    })
                    .then(() => resolve(true));
            } else {
                // 如果没有检测到特定路径，直接尝试验证并修复
                this.tryAlternativePaths().then(() => resolve(true));
            }
        });
    }
    
    /**
     * 尝试备用路径
     */
    async tryAlternativePaths() {
        const pathOptions = [
            '/gushichi/data/chinese-poetry/',
            './data/chinese-poetry/',
            '../data/chinese-poetry/',
            '/data/chinese-poetry/',
            'data/chinese-poetry/'
        ];
        
        // 提前测试所有路径，取最快的有效路径
        const testResults = await Promise.all(
            pathOptions.map(path => this.testLocalPath(path).then(isValid => ({ path, isValid })))
        );
        
        const validPath = testResults.find(result => result.isValid);
        if (validPath) {
            console.log('找到有效的数据路径:', validPath.path);
            this.config.dataSource.localPath = validPath.path;
            return true;
        } else {
            console.error('无法找到有效的本地数据路径，切换到远程数据源');
            this.config.dataSource.useLocalData = false;
            return false;
        }
    }
    
    /**
     * 测试路径是否有效
     */
    testLocalPath(path) {
        return new Promise((resolve) => {
            // 尝试加载一个唐诗文件作为测试
            fetch(`${path}tang/tang-poems.json`)
                .then(response => {
                    if (response.ok) {
                        console.log(`路径 ${path} 测试成功`);
                        resolve(true);
                    } else {
                        console.warn(`路径 ${path} 测试失败: ${response.status}`);
                        resolve(false);
                    }
                })
                .catch(error => {
                    console.warn(`路径 ${path} 测试错误:`, error);
                    resolve(false);
                });
            
            // 设置超时，防止请求卡住
            setTimeout(() => resolve(false), 2000);
        });
    }
    
    /**
     * 修复API配置
     */
    fixApiSettings() {
        // 自动启用故障转移
        this.config.api.autoFailover = true;
        
        // 如果本地数据是首选但无法加载，则尝试使用jinrishici作为随机诗词API
        if (this.config.api.randomPoemApi === 'github') {
            this.config.api.randomPoemApi = 'jinrishici';
        }
        
        console.log('API设置已修复');
        return true;
    }
    
    /**
     * 报告配置变化
     */
    reportConfigChanges() {
        const changes = [];
        
        // 比较并报告变更
        if (this.initialConfig.dataSource.localPath !== this.config.dataSource.localPath) {
            changes.push(`本地数据路径: ${this.initialConfig.dataSource.localPath} -> ${this.config.dataSource.localPath}`);
        }
        
        if (this.initialConfig.dataSource.useLocalData !== this.config.dataSource.useLocalData) {
            changes.push(`使用本地数据: ${this.initialConfig.dataSource.useLocalData} -> ${this.config.dataSource.useLocalData}`);
        }
        
        if (this.initialConfig.api.randomPoemApi !== this.config.api.randomPoemApi) {
            changes.push(`随机诗词API: ${this.initialConfig.api.randomPoemApi} -> ${this.config.api.randomPoemApi}`);
        }
        
        if (this.initialConfig.api.autoFailover !== this.config.api.autoFailover) {
            changes.push(`自动故障转移: ${this.initialConfig.api.autoFailover} -> ${this.config.api.autoFailover}`);
        }
        
        return changes;
    }
    
    /**
     * 运行所有修复
     */
    async runAll() {
        try {
            console.log('正在运行自动修复...');
            
            await this.autoDetectBasePath();
            this.fixApiSettings();
            
            const changes = this.reportConfigChanges();
            if (changes.length > 0) {
                console.log('配置已更新:', changes);
                return {
                    success: true,
                    changes: changes
                };
            } else {
                console.log('无需配置修复');
                return {
                    success: true,
                    changes: []
                };
            }
        } catch (error) {
            console.error('修复过程出错:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
