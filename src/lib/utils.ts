import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 获取项目根目录路径
 * 在服务端环境下返回项目根路径
 */
export function getProjectRoot(): string {
  // 使用 Node.js 的 __dirname 或 process.cwd() 来获取项目根目录
  return process.cwd();
}
