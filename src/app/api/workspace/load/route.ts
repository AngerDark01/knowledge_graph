import { NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { StorageData, StorageDataSchema } from '@/types/workspace/storage'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key') || 'kg-editor:workspace.json'

    // 构建文件路径 - 使用 process.cwd() 直接获取项目根目录
    const filePath = path.join(process.cwd(), 'public', 'workspace', key)

    // 检查文件是否存在
    try {
      await fs.access(filePath)
    } catch {
      return new Response(JSON.stringify({ error: '文件不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(content)

    // 验证数据格式
    const validatedData = StorageDataSchema.parse(parsed)

    return new Response(JSON.stringify(validatedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('加载工作区失败:', error)
    return new Response(JSON.stringify({ error: '加载失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}