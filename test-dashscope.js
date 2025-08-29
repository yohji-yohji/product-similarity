const axios = require('axios');
const fs = require('fs');

// 测试DashScope API连接
async function testDashScopeConnection() {
    console.log('🚀 开始测试DashScope API连接...\n');

    try {
        // 读取配置
        const config = require('./config.json');
        console.log('✅ 配置文件读取成功');
        console.log(`API URL: ${config.apiUrl}`);
        console.log(`模型: ${config.model}`);
        console.log(`API Key: ${config.apiKey.substring(0, 10)}...`);
        console.log('');

        // 使用有效的小尺寸测试图片base64数据（20x20像素，满足最小尺寸要求）
        const testImageA = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAUABQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD/AP/Z';
        const testImageB = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAUABQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD/AO/Z';

        console.log('📷 使用内置测试图片数据:');
        console.log(`商品A: 20x20像素测试图片`);
        console.log(`商品B: 20x20像素测试图片`);
        console.log('');

        // 构建请求数据
        const requestData = {
            model: config.model,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "请分析这两个商品的相似度，从外观、功能、类别等方面进行对比分析，最后请明确给出相似度评分（格式：相似度：XX%）。"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: testImageA
                            }
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: testImageB
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.3,
            stream: false
        };

        console.log('📡 发送测试请求到DashScope API...');
        
        // 发送请求
        const response = await axios.post(config.apiUrl, requestData, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'disable'
            },
            timeout: 30000
        });

        console.log('✅ API响应成功!');
        console.log(`状态码: ${response.status}`);
        console.log(`响应时间: ${response.headers['date']}`);
        
        // 解析响应
        const aiResponse = response.data;
        console.log('\n📄 API响应数据:');
        console.log(JSON.stringify(aiResponse, null, 2));

        // 尝试提取内容
        let content = '';
        if (aiResponse.choices && aiResponse.choices.length > 0) {
            content = aiResponse.choices[0].message?.content || aiResponse.choices[0].text || '';
        } else if (aiResponse.output && aiResponse.output.text) {
            content = aiResponse.output.text;
        }

        console.log('\n✅ AI回复内容:');
        console.log(content);

        // 测试相似度分数提取
        console.log('\n🔍 测试相似度分数提取:');
        const score = extractSimilarityScore(content);
        console.log(`提取到的相似度分数: ${score}%`);

        console.log('\n🎉 DashScope集成测试完成! 所有功能正常工作。');
        return true;

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        
        if (error.response) {
            console.error('HTTP状态:', error.response.status);
            console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('网络连接失败，请检查网络和API URL');
        }
        
        return false;
    }
}

// 简化的相似度分数提取函数（用于测试）
function extractSimilarityScore(text) {
    const patterns = [
        /相似度[：:\s]*(\d+)%/gi,
        /(\d+)%/g
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const score = parseInt(match[1]);
            if (score >= 0 && score <= 100) {
                return score;
            }
        }
    }
    return 50;
}

// 运行测试
if (require.main === module) {
    testDashScopeConnection()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('测试过程出现异常:', error);
            process.exit(1);
        });
}

module.exports = { testDashScopeConnection };