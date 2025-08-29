# 生成测试图片的Python脚本
# 运行这个脚本生成两个简单的测试商品图片

from PIL import Image, ImageDraw, ImageFont
import base64
import io

def create_test_product_image(text, color, size=(200, 200)):
    """创建一个简单的商品测试图片"""
    # 创建图片
    img = Image.new('RGB', size, color=color)
    draw = ImageDraw.Draw(img)
    
    # 绘制商品框
    margin = 20
    draw.rectangle([margin, margin, size[0]-margin, size[1]-margin], 
                  outline='white', width=3)
    
    # 添加文字
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    # 计算文字位置（居中）
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (size[0] - text_width) // 2
    y = (size[1] - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    
    return img

def image_to_base64(image):
    """将PIL图片转换为base64字符串"""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG", quality=85)
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/jpeg;base64,{img_str}"

if __name__ == "__main__":
    # 创建两个测试商品图片
    product_a = create_test_product_image("商品A\n智能手表", (70, 130, 180))  # 蓝色
    product_b = create_test_product_image("商品B\n数码设备", (220, 80, 80))   # 红色
    
    # 转换为base64
    base64_a = image_to_base64(product_a)
    base64_b = image_to_base64(product_b)
    
    print("// 商品A的base64数据")
    print(f"const testImageA = '{base64_a}';")
    print()
    print("// 商品B的base64数据") 
    print(f"const testImageB = '{base64_b}';")
    print()
    print("图片生成完成！请将上面的代码复制到test-dashscope.js中使用。")