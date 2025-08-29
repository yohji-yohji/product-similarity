#!/bin/bash

# 安全检查脚本 - 检查项目中是否存在敏感信息

echo "🔍 开始安全检查..."
echo ""

# 检查是否存在真实的API密钥模式
echo "1. 检查API密钥泄露..."
if grep -r "sk-[a-zA-Z0-9]\{32,\}" . --exclude-dir=node_modules --exclude=security-check.sh 2>/dev/null; then
    echo "❌ 发现可能的API密钥！请检查并清理。"
    exit 1
else
    echo "✅ 未发现API密钥泄露"
fi

echo ""

# 检查config.json是否存在敏感信息
echo "2. 检查配置文件..."
if [ -f "config.json" ]; then
    if grep -q "YOUR_.*_API_KEY_HERE\|your-.*-api-key" config.json; then
        echo "✅ config.json 使用占位符，安全"
    else
        echo "⚠️  config.json 可能包含真实密钥，请检查"
        echo "   建议内容应为: YOUR_DASHSCOPE_API_KEY_HERE"
    fi
else
    echo "✅ config.json 不存在（这是正常的，使用config.json.example）"
fi

echo ""

# 检查.gitignore是否配置正确
echo "3. 检查.gitignore配置..."
if [ -f ".gitignore" ]; then
    if grep -q "config.json" .gitignore; then
        echo "✅ .gitignore 已正确配置忽略 config.json"
    else
        echo "❌ .gitignore 缺少 config.json，请添加！"
        exit 1
    fi
else
    echo "❌ 缺少 .gitignore 文件！"
    exit 1
fi

echo ""

# 检查环境变量文件
echo "4. 检查环境变量文件..."
for env_file in .env .env.local .env.production .env.development; do
    if [ -f "$env_file" ]; then
        echo "⚠️  发现环境变量文件: $env_file"
        echo "   请确保其包含在 .gitignore 中且不包含真实密钥"
    fi
done

echo ""

# 检查常见的敏感文件
echo "5. 检查其他敏感文件..."
sensitive_files=("secrets.txt" "api_keys.txt" "private_keys" "credentials.json")
found_sensitive=false

for file in "${sensitive_files[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        echo "❌ 发现敏感文件: $file"
        found_sensitive=true
    fi
done

if [ "$found_sensitive" = false ]; then
    echo "✅ 未发现其他敏感文件"
fi

echo ""
echo "🎉 安全检查完成！"
echo ""
echo "📝 上传到GitHub前的最终检查列表："
echo "   □ 确保 config.json 使用占位符而非真实API密钥"
echo "   □ 确保 .gitignore 包含 config.json 和其他敏感文件"
echo "   □ 确保 README.md 中没有真实的API密钥"
echo "   □ 运行 'git status' 确认不会提交敏感文件"
echo ""