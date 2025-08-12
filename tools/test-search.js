/**
 * 搜索功能测试脚本
 * 
 * 这个脚本用于测试网站的搜索功能是否正常工作
 * 可以在浏览器控制台中运行
 */

(async function() {
    console.log('===== 古诗词搜索测试 =====');
    
    // 测试搜索设置
    const testQueries = [
        { query: '春晓', category: 'tang', expected: '孟浩然' },
        { query: '学而', category: 'lunyu', expected: '学而篇' },
        { query: '风', category: 'shi', expected: '诗经' }
    ];
    
    // 检查配置
    console.log('检查配置...');
    console.log('使用本地数据:', CONFIG.dataSource.useLocalData);
    console.log('本地数据路径:', CONFIG.dataSource.localPath);
    
    // 执行测试
    for (const test of testQueries) {
        console.log(`\n测试搜索: "${test.query}" (分类: ${test.category})`);
        
        try {
            // 设置搜索选项
            const options = {
                category: test.category,
                searchTitle: true,
                searchAuthor: true,
                searchContent: true,
                searchTags: true
            };
            
            // 执行搜索
            console.log('正在搜索...');
            const results = await apiManager.searchPoems(test.query, options);
            
            // 输出结果
            console.log(`找到 ${results.length} 条结果`);
            
            if (results.length > 0) {
                console.log('前三条结果:');
                results.slice(0, 3).forEach((item, index) => {
                    const title = item.title || item.rhythmic || '无题';
                    const author = item.author || item.poet || '佚名';
                    const preview = item.paragraphs ? 
                        item.paragraphs.slice(0, 1).join('') : 
                        (item.content ? item.content.slice(0, 20) : '');
                    
                    console.log(`[${index + 1}] ${title} - ${author}: ${preview}...`);
                });
                
                // 检查预期结果
                const hasExpected = results.some(item => {
                    const content = JSON.stringify(item);
                    return content.includes(test.expected);
                });
                
                console.log(`测试结果: ${hasExpected ? '✓ 通过' : '✗ 失败'} (预期包含 "${test.expected}")`);
            } else {
                console.log(`测试结果: ✗ 失败 (未找到结果，预期包含 "${test.expected}")`);
            }
        } catch (error) {
            console.error(`测试错误:`, error);
            console.log(`测试结果: ✗ 失败 (发生错误)`);
        }
    }
    
    console.log('\n===== 测试完成 =====');
})();
