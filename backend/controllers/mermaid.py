"""
Mermaid转换控制器
处理Mermaid图表转换相关的API请求
"""
from flask import request
from flask_restx import Namespace, Resource, fields
from services.graph.mermaid_converter import MermaidConverterService

# 创建命名空间
mermaid_ns = Namespace('mermaid', description='Mermaid图表转换API')

# 定义API模型
mermaid_convert_model = mermaid_ns.model('MermaidConvert', {
    'mermaid': fields.String(required=True, description='Mermaid图表内容')
})

@mermaid_ns.route('/convert')
class MermaidConvertResource(Resource):
    @mermaid_ns.expect(mermaid_convert_model)
    @mermaid_ns.produces(['application/json'])
    def post(self):
        """
        将Mermaid图表转换为知识图谱数据结构
        """
        try:
            # 获取请求数据
            data = request.json
            mermaid_content = data.get('mermaid')
            
            if not mermaid_content:
                return {'error': 'Missing mermaid content'}, 400
            
            # 创建转换服务实例
            converter_service = MermaidConverterService()
            
            # 执行转换
            graph_data = converter_service.convert_mermaid_to_graph(mermaid_content)
            
            # 返回转换结果
            return {
                'success': True,
                'data': graph_data,
                'message': 'Mermaid content converted successfully'
            }, 200
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to convert Mermaid content'
            }, 500