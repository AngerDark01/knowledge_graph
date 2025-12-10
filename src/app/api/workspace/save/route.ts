import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { StorageDataSchema } from '@/types/workspace/storage';
import { getProjectRoot } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = body.key || 'kg-editor:workspace.json';

    // 验证数据格式
    const validatedData = StorageDataSchema.parse(body.data);

    // 确保目录存在
    const dirPath = path.join(getProjectRoot(), 'public', 'workspace');
    await fs.mkdir(dirPath, { recursive: true });

    // 构建文件路径
    const filePath = path.join(dirPath, key);

    // 将 Date 转换为 ISO 字符串进行存储
    const serializedData = JSON.stringify(validatedData, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }, 2); // 使用2个空格缩进，便于阅读

    // 写入文件
    await fs.writeFile(filePath, serializedData, 'utf-8');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('保存工作区失败:', error);
    return NextResponse.json(
      { error: '保存失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
