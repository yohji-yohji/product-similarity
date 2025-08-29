# 商品相似度智能检测系统

基于多模态AI技术的商品相似度分析平台，支持图像对比分析和智能评分。

## 🚀 功能特点

- **智能图像分析**: 基于多模态AI模型的商品图片智能分析
- **相似度评分**: 0-100分的精确相似度评分系统
- **自定义提示词**: 支持用户自定义AI分析提示词
- **美观界面**: 现代化的响应式Web界面设计
- **实时分析**: 支持实时图片上传和分析结果展示
- **拖拽上传**: 支持拖拽方式上传图片文件

## 📁 项目结构

```
simop-product-similarity/
├── index.html          # 前端主页面
├── styles.css          # 样式文件
├── script.js           # 前端JavaScript逻辑
├── server.js           # Node.js后端服务器
├── package.json        # 项目依赖配置
├── config.json.example # 配置文件示例
└── uploads/            # 图片上传目录（自动创建）
```

## 🛠️ 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置多模态AI模型

**重要：请勿将包含真实API密钥的config.json文件提交到GitHub！**

复制配置文件示例：
```bash
cp config.json.example config.json
```

编辑 `config.json` 文件，填入您的多模态AI模型API信息：

**阿里云DashScope配置：**
```json
{
  "apiUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
  "apiKey": "您的DashScope API密钥",
  "model": "qwen-vl-max-latest"
}
```

**获取DashScope API Key：**
1. 访问 [阿里云DashScope控制台](https://dashscope.console.aliyun.com/)
2. 注册并创建API Key
3. 将API Key填入config.json文件

**或者使用环境变量（推荐用于生产环境）：**
```bash
export DASHSCOPE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
export DASHSCOPE_API_KEY="您的API密钥"
export DASHSCOPE_MODEL="qwen-vl-max-latest"
```

### 3. 启动服务

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 http://localhost:3000 启动

## 🎯 使用指南

1. **上传图片**: 点击或拖拽上传两个商品图片
2. **配置提示词**: 在提示词区域输入您的分析要求
3. **开始分析**: 点击"开始AI智能分析"按钮
4. **查看结果**: 查看相似度评分和详细的AI分析报告

## 🔧 API接口

### 分析接口
- **URL**: `POST /api/analyze`
- **Content-Type**: `application/json`
- **请求体**:
  ```json
  {
    "imageA": {
      "name": "商品A图片名称",
      "data": "base64编码的图片数据"
    },
    "imageB": {
      "name": "商品B图片名称", 
      "data": "base64编码的图片数据"
    },
    "prompt": "分析提示词"
  }
  ```
- **响应**:
  ```json
  {
    "similarity_score": 85,
    "analysis_text": "详细的AI分析报告...",
    "metadata": {
      "analyzed_at": "2024-01-01T00:00:00.000Z",
      "analysis_mode": "real"
    }
  }
  ```

### 健康检查
- **URL**: `GET /api/health`
- **响应**:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "ai_configured": true
  }
  ```

## 🤖 多模态AI模型支持

该系统支持多种多模态AI模型：

- **OpenAI GPT-4 Vision**: 需要配置OpenAI API
- **Google Gemini Vision**: 支持Google多模态模型
- **其他兼容模型**: 支持符合标准格式的多模态API

### 配置示例

**OpenAI GPT-4 Vision**:
```json
{
  "apiUrl": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-your-openai-api-key"
}
```

**自定义模型**:
```json
{
  "apiUrl": "https://your-ai-service.com/v1/analyze",
  "apiKey": "your-custom-api-key"
}
```

## 📝 自定义提示词示例

- **基础对比**: "请分析这两个商品的相似度，从外观、功能、类别等方面进行对比，并给出0-100的评分。"
- **详细分析**: "请详细分析这两个商品在设计风格、材质、用途、品牌定位等方面的相似性和差异性。"
- **特定领域**: "作为电商专家，请分析这两个商品是否属于同一类目，并评估其市场竞争关系。"

## 🚨 注意事项

1. **图片大小限制**: 单张图片最大10MB
2. **支持格式**: JPG, PNG, WEBP
3. **API配置**: 未配置真实AI模型时将使用模拟数据
4. **网络要求**: 需要稳定的网络连接访问AI模型API

## 🔒 安全注意事项

**重要安全提醒：**

1. **配置文件安全**：
   - `config.json` 文件包含API密钥，已被添加到 `.gitignore`
   - 请勿将包含真实API密钥的配置文件提交到版本控制系统
   - 生产环境建议使用环境变量而非配置文件

2. **API密钥管理**：
   - 定期轮换API密钥
   - 设置API使用限制和监控
   - 不要在代码、文档或日志中硬编码API密钥

3. **环境变量示例**：
   ```bash
   # 推荐的生产环境配置方式
   export DASHSCOPE_API_KEY="your-real-api-key"
   export DASHSCOPE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" 
   export DASHSCOPE_MODEL="qwen-vl-max-latest"
   ```

## 🔍 故障排除

### 常见问题

1. **分析失败**: 检查AI模型API配置是否正确
2. **图片上传失败**: 确认图片格式和大小符合要求
3. **服务启动失败**: 检查端口3000是否被占用

### 日志查看
服务器运行时会在控制台输出详细日志，包括：
- 分析请求信息
- AI模型调用状态  
- 错误信息和堆栈

## 📧 技术支持

如遇到问题，请检查：
1. Node.js版本 >= 14.0.0
2. AI模型API配置正确性
3. 网络连接状态
4. 控制台错误日志

## 📄 许可证

MIT License - 详见 LICENSE 文件