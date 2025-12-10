import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { StorageDataSchema } from '@/types/workspace/storage';
import { getProjectRoot } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key') || 'kg-editor:workspace.json';

    // 构建文件路径
    const filePath = path.join(getProjectRoot(), 'public', 'workspace', key);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);

    // 验证数据格式
    const validatedData = StorageDataSchema.parse(parsed);

    return NextResponse.json(validatedData, { status: 200 });
  } catch (error) {
    console.error('加载工作区失败:', error);
    return NextResponse.json(
      { error: '加载失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
