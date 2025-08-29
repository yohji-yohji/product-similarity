const axios = require('axios');

// 简化的DashScope API连接测试（仅文本，无图片）
async function testDashScopeTextOnly() {
    console.log('🚀 开始DashScope文本API连接测试...\n');

    try {
        // 读取配置
        const config = require('./config.json');
        console.log('✅ 配置文件读取成功');
        console.log(`API URL: ${config.apiUrl}`);
        console.log(`API Key: ${config.apiKey.substring(0, 10)}...`);
        console.log('');

        // 构建纯文本请求数据
        const requestData = {
            model: "qwen-turbo", // 使用文本模型测试连接
            messages: [
                {
                    role: "user",
                    content: "这是一个API连接测试，请回复：连接成功！并给出一个示例相似度分数，格式：相似度：75%"
                }
            ],
            max_tokens: 100,
            temperature: 0.3,
            stream: false
        };

        console.log('📡 发送文本测试请求到DashScope API...');
        
        // 发送请求（使用文本API端点）
        const textApiUrl = config.apiUrl; // 使用相同的端点
        const response = await axios.post(textApiUrl, requestData, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'disable'
            },
            timeout: 30000
        });

        console.log('✅ API响应成功!');
        console.log(`状态码: ${response.status}`);
        
        // 解析响应
        const aiResponse = response.data;
        console.log('\n📄 API响应数据:');
        console.log(JSON.stringify(aiResponse, null, 2));

        // 提取内容
        let content = '';
        if (aiResponse.choices && aiResponse.choices.length > 0) {
            content = aiResponse.choices[0].message?.content || aiResponse.choices[0].text || '';
        }

        console.log('\n✅ AI回复内容:');
        console.log(content);

        console.log('\n🎉 DashScope API连接测试成功! 基础功能正常。');
        console.log('💡 现在可以尝试启动完整系统: npm start');
        return true;

    } catch (error) {
        console.error('❌ 文本测试也失败:', error.message);
        
        if (error.response) {
            console.error('HTTP状态:', error.response.status);
            console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
        
        console.log('\n🔧 可能的解决方案:');
        console.log('1. 检查API Key是否有效');
        console.log('2. 检查网络连接');
        console.log('3. 检查DashScope服务状态');
        console.log('4. 尝试不同的模型名称');
        
        return false;
    }
}

// 运行测试
if (require.main === module) {
    testDashScopeTextOnly()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('测试过程出现异常:', error);
            process.exit(1);
        });
}

module.exports = { testDashScopeTextOnly };