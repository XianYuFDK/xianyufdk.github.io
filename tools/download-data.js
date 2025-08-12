/**
 * 数据下载工具
 * 
 * 本脚本用于从 Chinese-Poetry GitHub 仓库下载诗词数据
 * 使用 Node.js 运行
 * 
 * 使用方法：
 * 1. 安装 Node.js
 * 2. 运行 node download-data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置信息
const config = {
    // 数据源 URL（使用 raw.githubusercontent.com）
    baseUrl: 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/',
    
    // 输出目录
    outputDir: path.join(__dirname, '..', 'data', 'chinese-poetry'),
    
    // 数据集配置
    dataSets: [
        {
            name: '诗经',
            dirName: 'shijing',
            files: ['shijing.json']
        },
        {
            name: '唐诗',
            dirName: 'tang',
            files: [
                'poet.tang.0.json',
                'poet.tang.1.json',
                'poet.tang.2.json',
                'poet.tang.3.json',
                'poet.tang.4.json',
                'poet.tang.5.json',
                'poet.tang.6.json',
                'poet.tang.7.json',
                'poet.tang.8.json',
                'poet.tang.9.json',
                'poet.tang.10.json'
            ]
        },
        {
            name: '宋诗',
            dirName: 'song',
            files: [
                'poet.song.0.json',
                'poet.song.1.json',
                'poet.song.2.json',
                'poet.song.3.json',
                'poet.song.4.json',
                'poet.song.5.json',
                'poet.song.6.json',
                'poet.song.7.json',
                'poet.song.8.json',
                'poet.song.9.json',
                'poet.song.10.json'
            ]
        },
        {
            name: '宋词',
            dirName: 'ci',
            files: [
                'ci.song.0.json',
                'ci.song.1.json',
                'ci.song.2.json',
                'ci.song.3.json',
                'ci.song.4.json',
                'ci.song.5.json',
                'ci.song.6.json',
                'ci.song.7.json',
                'ci.song.8.json',
                'ci.song.9.json'
            ]
        },
        {
            name: '论语',
            dirName: 'lunyu',
            files: ['lunyu.json']
        },
        {
            name: '曹操诗集',
            dirName: 'caocaoshiji',
            files: ['caocao.json']
        },
        {
            name: '元曲',
            dirName: 'yuan',
            files: ['yuanqu.json']
        }
    ]
};

/**
 * 创建目录（如果不存在）
 * @param {string} dirPath 目录路径
 */
function createDirectoryIfNotExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`创建目录: ${dirPath}`);
    }
}

/**
 * 下载文件
 * @param {string} url 文件URL
 * @param {string} outputPath 输出路径
 * @returns {Promise} Promise对象
 */
function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`请求失败，状态码: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
            
            file.on('error', (err) => {
                fs.unlinkSync(outputPath);
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlinkSync(outputPath);
            reject(err);
        });
    });
}

/**
 * 下载数据集
 * @param {Object} dataSet 数据集配置
 */
async function downloadDataSet(dataSet) {
    console.log(`开始下载 ${dataSet.name} 数据...`);
    
    const outputDir = path.join(config.outputDir, dataSet.dirName);
    createDirectoryIfNotExists(outputDir);
    
    for (const file of dataSet.files) {
        const url = `${config.baseUrl}${dataSet.dirName}/${file}`;
        const outputPath = path.join(outputDir, file);
        
        console.log(`  下载 ${file}...`);
        try {
            await downloadFile(url, outputPath);
            console.log(`  √ 下载完成: ${file}`);
        } catch (error) {
            console.error(`  × 下载失败: ${file}`, error);
        }
    }
    
    console.log(`${dataSet.name} 数据下载完成。`);
}

/**
 * 合并唐诗数据为单个文件
 */
async function mergeData() {
    console.log('开始合并数据...');
    
    try {
        // 合并唐诗
        const tangOutputPath = path.join(config.outputDir, 'tang', 'tang-poems.json');
        console.log('合并唐诗数据到单个文件...');
        
        let tangData = [];
        for (let i = 0; i <= 10; i++) {
            const filePath = path.join(config.outputDir, 'tang', `poet.tang.${i}.json`);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                tangData = tangData.concat(data);
                console.log(`  已合并 poet.tang.${i}.json (${data.length} 条记录)`);
            }
        }
        
        fs.writeFileSync(tangOutputPath, JSON.stringify(tangData), 'utf-8');
        console.log(`唐诗数据合并完成，共 ${tangData.length} 条记录。`);
        
        // 合并宋词
        const ciOutputPath = path.join(config.outputDir, 'ci', 'ci-songs.json');
        console.log('合并宋词数据到单个文件...');
        
        let ciData = [];
        for (let i = 0; i <= 9; i++) {
            const filePath = path.join(config.outputDir, 'ci', `ci.song.${i}.json`);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                ciData = ciData.concat(data);
                console.log(`  已合并 ci.song.${i}.json (${data.length} 条记录)`);
            }
        }
        
        fs.writeFileSync(ciOutputPath, JSON.stringify(ciData), 'utf-8');
        console.log(`宋词数据合并完成，共 ${ciData.length} 条记录。`);
    } catch (error) {
        console.error('合并数据出错:', error);
    }
}

/**
 * 创建数据清单
 */
function createDataManifest() {
    console.log('创建数据清单...');
    
    try {
        const manifestPath = path.join(config.outputDir, 'manifest.json');
        const manifest = {
            createdAt: new Date().toISOString(),
            dataSets: {}
        };
        
        // 收集数据集信息
        config.dataSets.forEach(dataSet => {
            const dirPath = path.join(config.outputDir, dataSet.dirName);
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath);
                let totalSize = 0;
                let recordCount = 0;
                
                // 计算文件总大小
                files.forEach(file => {
                    const filePath = path.join(dirPath, file);
                    const stats = fs.statSync(filePath);
                    totalSize += stats.size;
                    
                    // 尝试获取记录数
                    if (file.endsWith('.json')) {
                        try {
                            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                            if (Array.isArray(data)) {
                                recordCount += data.length;
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                });
                
                manifest.dataSets[dataSet.name] = {
                    directory: dataSet.dirName,
                    files: files,
                    totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
                    recordCount: recordCount
                };
            }
        });
        
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
        console.log(`数据清单已创建: ${manifestPath}`);
    } catch (error) {
        console.error('创建数据清单出错:', error);
    }
}

/**
 * 创建 README 文件
 */
function createReadme() {
    console.log('创建 README 文件...');
    
    try {
        const readmePath = path.join(config.outputDir, 'README.md');
        const manifestPath = path.join(config.outputDir, 'manifest.json');
        
        if (!fs.existsSync(manifestPath)) {
            console.log('未找到数据清单，跳过创建 README');
            return;
        }
        
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        let readmeContent = `# 古诗词数据

数据来源: [chinese-poetry/chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)

## 数据集概况

| 数据集 | 文件数 | 大小 | 记录数 |
|-------|-------|-----|-------|
`;
        
        Object.entries(manifest.dataSets).forEach(([name, info]) => {
            readmeContent += `| ${name} | ${info.files.length} | ${info.totalSize} | ${info.recordCount} |\n`;
        });
        
        readmeContent += `\n## 下载时间

${new Date(manifest.createdAt).toLocaleString()}

## 使用方法

此数据可直接用于古诗词搜索网站，无需额外处理。通过在网站设置中启用"优先使用本地数据"选项，可以优先从本地加载数据，提高访问速度并减少对外部API的依赖。
`;
        
        fs.writeFileSync(readmePath, readmeContent, 'utf-8');
        console.log(`README 已创建: ${readmePath}`);
    } catch (error) {
        console.error('创建 README 出错:', error);
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('==== 古诗词数据下载工具 ====');
    console.log(`输出目录: ${config.outputDir}`);
    
    // 创建输出根目录
    createDirectoryIfNotExists(config.outputDir);
    
    // 下载所有数据集
    for (const dataSet of config.dataSets) {
        await downloadDataSet(dataSet);
    }
    
    // 合并数据
    await mergeData();
    
    // 创建数据清单
    createDataManifest();
    
    // 创建 README
    createReadme();
    
    console.log('==== 下载完成 ====');
}

// 运行主函数
main().catch(console.error);
