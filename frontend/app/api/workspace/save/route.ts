import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { StorageDataSchema } from '@/types/workspace/storage';
import { getProjectRoot } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 检查 body.data 是否存在
    if (!body || body.data === undefined || body.data === null) {
      console.error('错误：body.data 不存在或为 undefined/null');
      console.error('完整请求体:', body);
      return NextResponse.json(
        { error: '保存失败', details: '请求体中缺少 data 字段' },
        { status: 400 }
      );
    }

    const key = body.key || 'kg-editor:workspace.json';

    // 验证数据格式 - 首先解析为 unknown，再逐步验证
    const parseResult = StorageDataSchema.safeParse(body.data);

    if (!parseResult.success) {
      console.error('数据验证失败:', parseResult.error);
      console.error('验证错误详情:', JSON.stringify(parseResult.error.format(), null, 2));
      return NextResponse.json(
        {
          error: '保存失败',
          details: JSON.stringify(parseResult.error.format(), null, 2)
        },
        { status: 400 }
      );
    }

    const validatedData = parseResult.data;

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
