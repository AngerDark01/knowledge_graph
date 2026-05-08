import { Node } from '../types/graph/models';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateNodeContent = (node: Node): ValidationResult => {
  const errors: string[] = [];

  // 验证标题
  if (!node.title || node.title.trim().length === 0) {
    errors.push('标题不能为空');
  } else if (node.title.length > 100) {
    errors.push('标题长度不能超过100个字符');
  }

  // 验证内容
  if (node.content && node.content.length > 10000) {
    errors.push('内容长度不能超过10000个字符');
  }

  // 验证摘要
  if (node.summary && node.summary.length > 500) {
    errors.push('摘要长度不能超过500个字符');
  }

  // 验证标签
  if (node.tags && node.tags.length > 20) {
    errors.push('标签数量不能超过20个');
  }

  if (node.tags) {
    for (const tag of node.tags) {
      if (tag.length > 50) {
        errors.push(`标签 "${tag}" 长度不能超过50个字符`);
      }
      if (tag.trim().length === 0) {
        errors.push('标签不能为空');
      }
    }
  }

  // 验证结构化属性 - 尝试JSON序列化以检查有效性
  try {
    if (node.attributes) {
      JSON.stringify(node.attributes);
    }
  } catch {
    errors.push('结构化属性格式不正确');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTags = (tags: string[]): ValidationResult => {
  const errors: string[] = [];

  if (tags.length > 20) {
    errors.push('标签数量不能超过20个');
  }

  for (const tag of tags) {
    if (tag.length > 50) {
      errors.push(`标签 "${tag}" 长度不能超过50个字符`);
    }
    if (tag.trim().length === 0) {
      errors.push('标签不能为空');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
