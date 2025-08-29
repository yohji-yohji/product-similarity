const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// 配置文件上传
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 限制
    },
    fileFilter: (req, file, cb) => {
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件类型'), false);
        }
    }
});

// DashScope多模态AI模型配置
class MultiModalAI {
    constructor() {
        // 优先使用环境变量配置
        this.apiUrl = process.env.DASHSCOPE_URL || process.env.AI_API_URL || '';
        this.apiKey = process.env.DASHSCOPE_API_KEY || process.env.AI_API_KEY || '';
        this.model = process.env.DASHSCOPE_MODEL || 'qwen-vl-max-latest';
        
        // 如果环境变量未设置，尝试读取配置文件
        if (!this.apiUrl || !this.apiKey) {
            try {
                const config = require('./config.json');
                this.apiUrl = config.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
                this.apiKey = config.apiKey || '';
                this.model = config.model || 'qwen-vl-max-latest';
            } catch (error) {
                console.warn('警告: 未找到AI模型配置，请设置环境变量或创建config.json文件');
            }
        }

        // 设置默认的DashScope配置
        if (!this.apiUrl) {
            this.apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
        }
    }

    // 验证配置
    isConfigured() {
        return this.apiUrl && this.apiKey;
    }

    // 分析商品相似度 - 专门适配DashScope API
    async analyzeProductSimilarity(imageA, imageB, prompt) {
        if (!this.isConfigured()) {
            throw new Error('DashScope AI模型未配置，请设置API URL和KEY');
        }

        try {
            // 构建DashScope兼容的请求数据
            const requestData = {
                model: this.model, // 使用qwen-vl-max-latest或配置的模型
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `${prompt}

商品A信息：
- 图片文件名：${imageA.name}
- 商品描述：${imageA.description || '未提供描述'}

商品B信息：
- 图片文件名：${imageB.name}  
- 商品描述：${imageB.description || '未提供描述'}

请结合图片和商品描述信息，从外观特征、功能定位、品牌类别、使用场景等维度全面对比分析这两个商品的相似度，并在回答最后明确给出相似度评分（格式：相似度：XX%）。`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageA.data
                                }
                            },
                            {
                                type: "image_url", 
                                image_url: {
                                    url: imageB.data
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 2000,
                temperature: 0.3, // 降低温度以获得更一致的分析结果
                stream: false
            };

            console.log(`调用DashScope API: ${this.apiUrl}`);
            console.log(`使用模型: ${this.model}`);

            // 发送请求到DashScope API
            const response = await axios.post(this.apiUrl, requestData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-DashScope-SSE': 'disable' // 禁用SSE流式传输
                },
                timeout: 60000 // 60秒超时，视觉分析需要更多时间
            });

            console.log('DashScope API响应状态:', response.status);

            // 处理AI响应
            const aiResponse = response.data;
            return this.parseAIResponse(aiResponse);

        } catch (error) {
            console.error('AI分析错误:', error);
            
            if (error.response) {
                throw new Error(`AI服务响应错误: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.request) {
                throw new Error('无法连接到AI服务，请检查网络连接');
            } else {
                throw new Error(`AI分析失败: ${error.message}`);
            }
        }
    }

    // 解析DashScope AI响应并提取相似度分数
    parseAIResponse(aiResponse) {
        try {
            let analysisText = '';
            
            // 解析DashScope API响应格式
            if (aiResponse.choices && aiResponse.choices.length > 0) {
                const choice = aiResponse.choices[0];
                if (choice.message && choice.message.content) {
                    analysisText = choice.message.content;
                } else if (choice.text) {
                    analysisText = choice.text;
                }
            } else if (aiResponse.output && aiResponse.output.text) {
                // DashScope原生API格式
                analysisText = aiResponse.output.text;
            } else if (aiResponse.content) {
                analysisText = aiResponse.content;
            } else if (aiResponse.text) {
                analysisText = aiResponse.text;
            } else {
                console.warn('未知的响应格式:', JSON.stringify(aiResponse, null, 2));
                analysisText = '收到了AI分析结果，但格式解析存在问题。';
            }

            console.log('解析到的分析文本长度:', analysisText.length);

            // 尝试从文本中提取相似度分数
            const similarityScore = this.extractSimilarityScore(analysisText);

            return {
                similarity_score: similarityScore,
                analysis_text: analysisText.trim(),
                model_used: this.model,
                tokens_used: aiResponse.usage?.total_tokens || 0,
                raw_response: aiResponse
            };
        } catch (error) {
            console.error('解析DashScope AI响应错误:', error);
            console.error('原始响应:', JSON.stringify(aiResponse, null, 2));
            return {
                similarity_score: 50,
                analysis_text: '解析AI响应时出现错误，但分析已完成。如果问题持续，请检查API配置。',
                error: error.message,
                raw_response: aiResponse
            };
        }
    }

    // 从通义千问AI回复文本中提取相似度分数
    extractSimilarityScore(text) {
        console.log('尝试从以下文本提取相似度分数:', text.substring(0, 200) + '...');
        
        // 针对中文AI模型优化的模式匹配
        const patterns = [
            // 精确匹配模式
            /相似度[：:\s]*(\d+)%/gi,
            /相似程度[：:\s]*(\d+)%/gi,
            /匹配度[：:\s]*(\d+)%/gi,
            /相似性[：:\s]*(\d+)%/gi,
            /相似度为[：:\s]*(\d+)%/gi,
            /相似度是[：:\s]*(\d+)%/gi,
            /相似度达到[：:\s]*(\d+)%/gi,
            
            // 数字后跟百分号的通用模式
            /(\d+)%/g,
            
            // 评分相关
            /评分[：:\s]*(\d+)[分%]/gi,
            /得分[：:\s]*(\d+)[分%]/gi,
            /分数[：:\s]*(\d+)[分%]/gi,
            
            // 英文模式（兼容）
            /similarity[：:\s]*(\d+)%/gi,
            /score[：:\s]*(\d+)%/gi,
            
            // 宽松匹配：纯数字（在特定上下文中）
            /[相似匹配评分得]\w*[：:\s]*(\d+)(?![.]\d)/gi
        ];

        // 收集所有可能的分数
        const possibleScores = [];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const score = parseInt(match[1]);
                if (score >= 0 && score <= 100) {
                    possibleScores.push({
                        score: score,
                        context: text.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
                        pattern: pattern.source
                    });
                }
            }
        }

        console.log('找到的可能分数:', possibleScores);

        // 选择最佳分数
        if (possibleScores.length > 0) {
            // 优先选择在相似度相关上下文中的分数
            const contextualScore = possibleScores.find(item => 
                /相似|匹配|similarity|score/i.test(item.context)
            );
            
            if (contextualScore) {
                console.log(`选择上下文相关分数: ${contextualScore.score}%`);
                return contextualScore.score;
            }
            
            // 如果没有上下文相关的，选择第一个有效分数
            console.log(`选择第一个有效分数: ${possibleScores[0].score}%`);
            return possibleScores[0].score;
        }

        // 基于关键词的语义分析
        const semanticScore = this.analyzeSemanticSimilarity(text);
        if (semanticScore !== null) {
            console.log(`基于语义分析的分数: ${semanticScore}%`);
            return semanticScore;
        }

        // 默认分数
        console.log('使用默认分数: 50%');
        return 50;
    }

    // 基于关键词的语义相似度分析
    analyzeSemanticSimilarity(text) {
        const lowerText = text.toLowerCase();
        
        // 高相似度关键词
        if (lowerText.includes('几乎完全相同') || lowerText.includes('基本一致') || 
            lowerText.includes('高度相似') || lowerText.includes('非常相似')) {
            return 90;
        }
        
        // 中高相似度
        if (lowerText.includes('相当相似') || lowerText.includes('比较相似') ||
            lowerText.includes('明显相似') || lowerText.includes('较为相似')) {
            return 75;
        }
        
        // 中等相似度
        if (lowerText.includes('有一定相似') || lowerText.includes('部分相似') ||
            lowerText.includes('某些方面相似') || lowerText.includes('一些相似')) {
            return 55;
        }
        
        // 低相似度
        if (lowerText.includes('差异较大') || lowerText.includes('不太相似') ||
            lowerText.includes('明显不同') || lowerText.includes('差别明显')) {
            return 30;
        }
        
        // 极低相似度
        if (lowerText.includes('完全不同') || lowerText.includes('截然不同') ||
            lowerText.includes('毫无相似') || lowerText.includes('差异巨大')) {
            return 10;
        }
        
        return null; // 无法判断
    }
    // 生成模拟分析结果（用于测试）
    generateMockResult(imageA, imageB, prompt) {
        const mockScores = [75, 82, 63, 90, 45, 78, 67, 85, 72, 58];
        const randomScore = mockScores[Math.floor(Math.random() * mockScores.length)];
        
        const mockAnalysis = `
基于AI多模态分析，结合商品图片和描述信息，这两个商品的详细对比如下：

**商品信息概览：**
- 商品A：${imageA.name}
  ${imageA.description ? `描述：${imageA.description}` : '(未提供描述信息)'}
- 商品B：${imageB.name}
  ${imageB.description ? `描述：${imageB.description}` : '(未提供描述信息)'}

**外观特征分析：**
- 商品A: 具有独特的设计风格和视觉特征
- 商品B: 展现出相应的产品形态和外观元素

**功能定位对比：**
${imageA.description && imageB.description ? 
`- 基于描述信息，两个商品在功能定位上${randomScore > 70 ? '较为接近' : '存在差异'}
- 使用场景相似度: ${Math.max(0, randomScore - 5)}%` : 
'- 缺少详细描述信息，主要基于视觉特征进行分析'}

**相似度评估：**
- 产品类别相似度: ${randomScore}%
- 外观设计相似度: ${Math.max(0, randomScore - 10)}%
- 功能特征相似度: ${Math.min(100, randomScore + 5)}%
${imageA.description || imageB.description ? `- 描述信息匹配度: ${Math.max(20, randomScore - 15)}%` : ''}

**综合分析：**
两个商品在整体特征上显示出 ${randomScore}% 的相似度。${randomScore > 80 ? '产品具有高度相似性，可能属于同类产品或竞品关系。' : randomScore > 60 ? '产品存在较明显的相似特征，但也有自身的差异化定位。' : randomScore > 40 ? '产品有一定相似性，但差异特征更为显著。' : '产品差异较大，属于不同定位的商品类型。'}

${imageA.description && imageB.description ? 
`**商品描述分析建议：**
商品描述信息有助于更准确的相似度判断。建议在描述中包含品牌、核心功能、目标用户群体等关键信息，以获得更精准的分析结果。` : 
`**提示：**
如果提供更详细的商品描述信息（如品牌、功能、定位等），可以获得更准确的相似度分析结果。`}

**相似度：${randomScore}%**
        `.trim();

        return {
            similarity_score: randomScore,
            analysis_text: mockAnalysis,
            is_mock: true
        };
    }
}

// 创建AI分析实例
const aiAnalyzer = new MultiModalAI();

// 路由定义

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        ai_configured: aiAnalyzer.isConfigured()
    });
});

// 商品相似度分析接口
app.post('/api/analyze', async (req, res) => {
    try {
        const { imageA, imageB, prompt } = req.body;

        // 验证输入数据
        if (!imageA || !imageB) {
            return res.status(400).json({
                error: '缺少必要的图片数据',
                message: '请确保上传了两张商品图片'
            });
        }

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({
                error: '缺少分析提示词',
                message: '请提供分析提示词'
            });
        }

        console.log('开始分析商品相似度...');
        console.log(`商品A: ${imageA.name}`);
        console.log(`商品B: ${imageB.name}`);
        console.log(`提示词: ${prompt.substring(0, 100)}...`);

        let result;

        // 检查是否配置了真实的AI模型
        if (aiAnalyzer.isConfigured()) {
            // 使用真实的AI模型分析
            result = await aiAnalyzer.analyzeProductSimilarity(imageA, imageB, prompt);
            console.log('使用真实AI模型完成分析');
        } else {
            // 使用模拟结果
            console.log('警告: 使用模拟AI分析结果（请配置真实的AI模型）');
            result = aiAnalyzer.generateMockResult(imageA, imageB, prompt);
        }

        // 添加分析元数据
        result.metadata = {
            analyzed_at: new Date().toISOString(),
            image_a_name: imageA.name,
            image_b_name: imageB.name,
            prompt_length: prompt.length,
            analysis_mode: aiAnalyzer.isConfigured() ? 'real' : 'mock'
        };

        console.log(`分析完成，相似度: ${result.similarity_score}%`);

        res.json(result);

    } catch (error) {
        console.error('分析过程中出错:', error);
        
        res.status(500).json({
            error: '分析失败',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 配置上传接口（如果需要文件上传而不是base64）
app.post('/api/upload', upload.fields([
    { name: 'imageA', maxCount: 1 },
    { name: 'imageB', maxCount: 1 }
]), (req, res) => {
    try {
        if (!req.files || !req.files.imageA || !req.files.imageB) {
            return res.status(400).json({
                error: '缺少图片文件',
                message: '请上传两张商品图片'
            });
        }

        const imageA = req.files.imageA[0];
        const imageB = req.files.imageB[0];

        res.json({
            message: '图片上传成功',
            images: {
                imageA: {
                    filename: imageA.filename,
                    originalName: imageA.originalname,
                    path: imageA.path,
                    size: imageA.size
                },
                imageB: {
                    filename: imageB.filename,
                    originalName: imageB.originalname,
                    path: imageB.path,
                    size: imageB.size
                }
            }
        });
    } catch (error) {
        console.error('文件上传错误:', error);
        res.status(500).json({
            error: '上传失败',
            message: error.message
        });
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: '文件过大',
                message: '图片文件大小不能超过10MB'
            });
        }
    }
    
    res.status(500).json({
        error: '服务器内部错误',
        message: error.message
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        error: '接口不存在',
        message: `找不到接口: ${req.method} ${req.path}`
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`商品相似度检测服务器已启动`);
    console.log(`访问地址: http://localhost:${PORT}`);
    console.log(`AI模型配置状态: ${aiAnalyzer.isConfigured() ? '已配置' : '未配置（将使用模拟数据）'}`);
    console.log(`=================================`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    process.exit(0);
});