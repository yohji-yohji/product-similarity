# Product Similarity AI Detection System

An intelligent product similarity analysis platform based on multimodal AI technology, supporting image comparison analysis and intelligent scoring.

## 🚀 Features

- **Intelligent Image Analysis**: Smart product image analysis based on multimodal AI models
- **Similarity Scoring**: Precise similarity scoring system from 0-100
- **Custom Prompts**: Support for user-defined AI analysis prompts
- **Beautiful Interface**: Modern responsive web interface design
- **Real-time Analysis**: Support for real-time image upload and analysis result display
- **Drag & Drop Upload**: Support for drag-and-drop image file upload

## 📁 Project Structure

```
simop-product-similarity/
├── index.html          # Frontend main page
├── styles.css          # Style files
├── script.js           # Frontend JavaScript logic
├── server.js           # Node.js backend server
├── package.json        # Project dependency configuration
├── config.json.example # Configuration file example
└── uploads/            # Image upload directory (auto-created)
```

## 🛠️ Installation and Configuration

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Multimodal AI Model

**Important: Do not commit config.json files containing real API keys to GitHub!**

Copy the configuration file example:
```bash
cp config.json.example config.json
```

Edit the `config.json` file and fill in your multimodal AI model API information:

**Alibaba Cloud DashScope Configuration:**
```json
{
  "apiUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
  "apiKey": "Your DashScope API Key",
  "model": "qwen-vl-max-latest"
}
```

**Get DashScope API Key:**
1. Visit [Alibaba Cloud DashScope Console](https://dashscope.console.aliyun.com/)
2. Register and create an API Key
3. Fill the API Key into config.json file

**Or use environment variables (recommended for production):**
```bash
export DASHSCOPE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
export DASHSCOPE_API_KEY="Your API Key"
export DASHSCOPE_MODEL="qwen-vl-max-latest"
```

### 3. Start Service

Development mode (auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start at http://localhost:3000

## 🎯 Usage Guide

1. **Upload Images**: Click or drag to upload two product images
2. **Configure Prompts**: Enter your analysis requirements in the prompt area
3. **Start Analysis**: Click the "Start AI Smart Analysis" button
4. **View Results**: View similarity scores and detailed AI analysis reports

## 🔧 API Endpoints

### Analysis Endpoint
- **URL**: `POST /api/analyze`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "imageA": {
      "name": "Product A image name",
      "data": "Base64 encoded image data"
    },
    "imageB": {
      "name": "Product B image name", 
      "data": "Base64 encoded image data"
    },
    "prompt": "Analysis prompt"
  }
  ```
- **Response**:
  ```json
  {
    "similarity_score": 85,
    "analysis_text": "Detailed AI analysis report...",
    "metadata": {
      "analyzed_at": "2024-01-01T00:00:00.000Z",
      "analysis_mode": "real"
    }
  }
  ```

### Health Check
- **URL**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "ai_configured": true
  }
  ```

## 🤖 Multimodal AI Model Support

The system supports multiple multimodal AI models:

- **OpenAI GPT-4 Vision**: Requires OpenAI API configuration
- **Google Gemini Vision**: Supports Google multimodal models
- **Other Compatible Models**: Supports multimodal APIs that conform to standard formats

### Configuration Examples

**OpenAI GPT-4 Vision**:
```json
{
  "apiUrl": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-your-openai-api-key"
}
```

**Custom Model**:
```json
{
  "apiUrl": "https://your-ai-service.com/v1/analyze",
  "apiKey": "your-custom-api-key"
}
```

## 📝 Custom Prompt Examples

- **Basic Comparison**: "Please analyze the similarity between these two products, comparing their appearance, functionality, category, etc., and provide a score from 0-100."
- **Detailed Analysis**: "Please provide a detailed analysis of the similarities and differences between these two products in terms of design style, materials, purpose, brand positioning, etc."
- **Domain-specific**: "As an e-commerce expert, please analyze whether these two products belong to the same category and assess their market competitive relationship."

## 🚨 Important Notes

1. **Image Size Limit**: Maximum 10MB per image
2. **Supported Formats**: JPG, PNG, WEBP
3. **API Configuration**: When real AI model is not configured, mock data will be used
4. **Network Requirements**: Stable network connection required to access AI model APIs

## 🔒 Security Considerations

**Important Security Reminders:**

1. **Configuration File Security**:
   - `config.json` file contains API keys and is added to `.gitignore`
   - Do not commit configuration files containing real API keys to version control systems
   - Use environment variables instead of configuration files in production environments

2. **API Key Management**:
   - Regularly rotate API keys
   - Set API usage limits and monitoring
   - Do not hardcode API keys in code, documentation, or logs

3. **Environment Variable Example**:
   ```bash
   # Recommended production environment configuration
   export DASHSCOPE_API_KEY="your-real-api-key"
   export DASHSCOPE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" 
   export DASHSCOPE_MODEL="qwen-vl-max-latest"
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Analysis Failed**: Check if AI model API configuration is correct
2. **Image Upload Failed**: Ensure image format and size meet requirements
3. **Service Start Failed**: Check if port 3000 is occupied

### View Logs
The server will output detailed logs to the console during runtime, including:
- Analysis request information
- AI model call status  
- Error messages and stack traces

## 📧 Technical Support

If you encounter issues, please check:
1. Node.js version >= 14.0.0
2. AI model API configuration correctness
3. Network connection status
4. Console error logs

## 📄 License

MIT License - See LICENSE file for details