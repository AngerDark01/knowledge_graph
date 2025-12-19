#!/usr/bin/env python3
import sys
import os

# 添加用户包目录到路径中
sys.path.insert(0, '/home/aseit/.local/lib/python3.10/site-packages')

# 设置项目根目录为当前工作目录
project_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(project_dir)

# 导入并运行应用
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)