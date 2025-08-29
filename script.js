// DOM 元素引用
const elements = {
    // 上传相关
    uploadA: document.getElementById('uploadA'),
    uploadB: document.getElementById('uploadB'),
    fileA: document.getElementById('fileA'),
    fileB: document.getElementById('fileB'),
    previewA: document.getElementById('previewA'),
    previewB: document.getElementById('previewB'),
    imgA: document.getElementById('imgA'),
    imgB: document.getElementById('imgB'),
    removeA: document.getElementById('removeA'),
    removeB: document.getElementById('removeB'),
    
    // 商品描述相关
    productDescA: document.getElementById('productDescA'),
    productDescB: document.getElementById('productDescB'),
    
    // 分析相关
    promptInput: document.getElementById('promptInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    
    // 结果展示
    resultsSection: document.getElementById('resultsSection'),
    scoreValue: document.getElementById('scoreValue'),
    scoreProgress: document.querySelector('.score-progress'),
    analysisContent: document.getElementById('analysisContent'),
    analysisTime: document.getElementById('analysisTime'),
    
    // 控制相关
    loadingOverlay: document.getElementById('loadingOverlay'),
    resetBtn: document.getElementById('resetBtn')
};

// 应用状态
const state = {
    imageA: null,
    imageB: null,
    descriptionA: '',
    descriptionB: '',
    isAnalyzing: false
};

// 初始化应用
class ProductSimilarityApp {
    constructor() {
        this.initializeEventListeners();
        this.updateAnalyzeButton();
    }

    // 初始化事件监听器
    initializeEventListeners() {
        // 图片上传事件
        this.setupImageUpload('A');
        this.setupImageUpload('B');
        
        // 商品描述输入事件
        this.setupDescriptionInput();
        
        // 分析按钮事件
        elements.analyzeBtn.addEventListener('click', () => this.analyzeProducts());
        
        // 重置按钮事件
        elements.resetBtn.addEventListener('click', () => this.resetAnalysis());
        
        // 拖拽上传事件
        this.setupDragAndDrop();
    }

    // 设置图片上传功能
    setupImageUpload(product) {
        const uploadArea = elements[`upload${product}`];
        const fileInput = elements[`file${product}`];
        const preview = elements[`preview${product}`];
        const img = elements[`img${product}`];
        const removeBtn = elements[`remove${product}`];

        // 点击上传区域
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择事件
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file, product);
            }
        });

        // 删除图片事件
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage(product);
        });
    }

    // 处理图片上传
    handleImageUpload(file, product) {
        // 验证文件类型
        if (!this.validateImageFile(file)) {
            this.showNotification('请上传有效的图片文件 (JPG, PNG, WEBP)', 'error');
            return;
        }

        // 验证文件大小 (最大 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('图片文件大小不能超过 10MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const uploadArea = elements[`upload${product}`];
            const preview = elements[`preview${product}`];
            const img = elements[`img${product}`];

            // 设置图片预览
            img.src = e.target.result;
            
            // 显示预览，隐藏上传区域
            uploadArea.style.display = 'none';
            preview.style.display = 'block';

            // 保存图片数据
            state[`image${product}`] = {
                file: file,
                dataUrl: e.target.result,
                name: file.name
            };

            // 更新分析按钮状态
            this.updateAnalyzeButton();
            
            this.showNotification(`商品${product}图片上传成功`, 'success');
        };

        reader.readAsDataURL(file);
    }

    // 验证图片文件
    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        return validTypes.includes(file.type);
    }

    // 删除图片
    removeImage(product) {
        const uploadArea = elements[`upload${product}`];
        const preview = elements[`preview${product}`];
        const fileInput = elements[`file${product}`];
        const descInput = elements[`productDesc${product}`];

        // 重置界面
        uploadArea.style.display = 'flex';
        preview.style.display = 'none';
        fileInput.value = '';
        descInput.value = '';

        // 清除状态
        state[`image${product}`] = null;
        state[`description${product}`] = '';

        // 更新分析按钮状态
        this.updateAnalyzeButton();

        this.showNotification(`商品${product}图片和描述已删除`, 'info');
    }

    // 设置商品描述输入功能
    setupDescriptionInput() {
        // 商品A描述输入监听
        elements.productDescA.addEventListener('input', (e) => {
            state.descriptionA = e.target.value.trim();
            this.updateAnalyzeButton();
        });

        // 商品B描述输入监听
        elements.productDescB.addEventListener('input', (e) => {
            state.descriptionB = e.target.value.trim();
            this.updateAnalyzeButton();
        });
    }

    // 设置拖拽上传
    setupDragAndDrop() {
        ['A', 'B'].forEach(product => {
            const uploadArea = elements[`upload${product}`];

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImageUpload(files[0], product);
                }
            });
        });
    }

    // 更新分析按钮状态
    updateAnalyzeButton() {
        const hasAllImages = state.imageA && state.imageB;
        elements.analyzeBtn.disabled = !hasAllImages || state.isAnalyzing;
        
        if (hasAllImages && !state.isAnalyzing) {
            elements.analyzeBtn.innerHTML = `
                <i class="fas fa-brain"></i>
                <span>开始AI智能分析</span>
            `;
        } else if (state.isAnalyzing) {
            elements.analyzeBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>分析中...</span>
            `;
        } else {
            elements.analyzeBtn.innerHTML = `
                <i class="fas fa-brain"></i>
                <span>请先上传两个商品图片</span>
            `;
        }
    }

    // 分析商品相似度
    async analyzeProducts() {
        if (!state.imageA || !state.imageB) {
            this.showNotification('请先上传两个商品图片', 'error');
            return;
        }

        if (state.isAnalyzing) return;

        state.isAnalyzing = true;
        this.updateAnalyzeButton();
        this.showLoading(true);

        try {
            // 准备分析数据
            const analysisData = await this.prepareAnalysisData();
            
            // 发送到后端分析
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(analysisData)
            });

            if (!response.ok) {
                throw new Error(`分析请求失败: ${response.statusText}`);
            }

            const result = await response.json();
            
            // 显示分析结果
            this.displayAnalysisResult(result);
            
        } catch (error) {
            console.error('分析过程中出错:', error);
            this.showNotification(`分析失败: ${error.message}`, 'error');
        } finally {
            state.isAnalyzing = false;
            this.updateAnalyzeButton();
            this.showLoading(false);
        }
    }

    // 准备分析数据
    async prepareAnalysisData() {
        const prompt = elements.promptInput.value.trim() || 
            "请分析这两个商品的相似度，从外观、功能、类别等方面进行详细对比，并给出0-100的相似度评分。";

        return {
            imageA: {
                name: state.imageA.name,
                data: state.imageA.dataUrl,
                description: state.descriptionA || ''
            },
            imageB: {
                name: state.imageB.name,
                data: state.imageB.dataUrl,
                description: state.descriptionB || ''
            },
            prompt: prompt,
            timestamp: new Date().toISOString()
        };
    }

    // 显示分析结果
    displayAnalysisResult(result) {
        // 显示结果区域
        elements.resultsSection.style.display = 'block';
        
        // 更新分析时间
        elements.analysisTime.textContent = `分析完成时间: ${new Date().toLocaleString('zh-CN')}`;
        
        // 动画显示相似度评分
        this.animateScoreDisplay(result.similarity_score);
        
        // 显示AI分析内容
        this.displayAnalysisContent(result.analysis_text);
        
        // 平滑滚动到结果区域
        elements.resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });

        this.showNotification('AI分析完成！', 'success');
    }

    // 动画显示评分
    animateScoreDisplay(score) {
        const scoreElement = elements.scoreValue;
        const progressElement = elements.scoreProgress;
        
        // 计算圆环进度
        const circumference = 2 * Math.PI * 50; // 半径为50
        const offset = circumference - (score / 100) * circumference;
        
        // 重置动画
        scoreElement.textContent = '0';
        progressElement.style.strokeDashoffset = circumference;
        
        // 延迟开始动画
        setTimeout(() => {
            // 数字递增动画
            let currentScore = 0;
            const increment = score / 50; // 50步完成动画
            
            const numberInterval = setInterval(() => {
                currentScore += increment;
                if (currentScore >= score) {
                    currentScore = score;
                    clearInterval(numberInterval);
                }
                scoreElement.textContent = Math.round(currentScore);
            }, 40);
            
            // 圆环进度动画
            progressElement.style.strokeDashoffset = offset;
            
            // 根据分数设置颜色
            if (score >= 80) {
                progressElement.style.stroke = '#34a853';
            } else if (score >= 60) {
                progressElement.style.stroke = '#fbbc04';
            } else if (score >= 40) {
                progressElement.style.stroke = '#ff9800';
            } else {
                progressElement.style.stroke = '#ea4335';
            }
        }, 500);
    }

    // 显示AI分析内容
    displayAnalysisContent(analysisText) {
        elements.analysisContent.innerHTML = '';
        
        // 创建打字机效果
        let index = 0;
        const typeSpeed = 30;
        
        function typeWriter() {
            if (index < analysisText.length) {
                elements.analysisContent.innerHTML += analysisText.charAt(index);
                index++;
                setTimeout(typeWriter, typeSpeed);
            }
        }
        
        setTimeout(typeWriter, 1000);
    }

    // 重置分析
    resetAnalysis() {
        // 隐藏结果区域
        elements.resultsSection.style.display = 'none';
        
        // 重置评分显示
        elements.scoreValue.textContent = '0';
        elements.scoreProgress.style.strokeDashoffset = '314';
        elements.scoreProgress.style.stroke = '#4285f4';
        
        // 清空分析内容
        elements.analysisContent.innerHTML = '';
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.showNotification('已重置分析结果', 'info');
    }

    // 显示/隐藏加载状态
    showLoading(show) {
        elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    // 显示通知消息
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // 添加样式
        this.addNotificationStyles();
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 获取通知图标
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // 添加通知样式
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1001;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 400px;
            }
            
            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px 20px;
                border-radius: 12px;
                color: white;
                font-weight: 500;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            
            .notification-success .notification-content {
                background: linear-gradient(45deg, #34a853, #4caf50);
            }
            
            .notification-error .notification-content {
                background: linear-gradient(45deg, #ea4335, #f44336);
            }
            
            .notification-warning .notification-content {
                background: linear-gradient(45deg, #fbbc04, #ff9800);
            }
            
            .notification-info .notification-content {
                background: linear-gradient(45deg, #4285f4, #2196f3);
            }
        `;
        
        document.head.appendChild(style);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ProductSimilarityApp();
});