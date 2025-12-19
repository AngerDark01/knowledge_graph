"""
Mermaid图表转换服务
将上传的Mermaid图表转换为知识图谱编辑器的数据结构
"""
import re
import uuid
from datetime import datetime
from typing import Dict, List, Any


class MermaidConverterService:
    """
    Mermaid转换服务类
    将Mermaid图表语法转换为知识图谱编辑器的数据结构
    """

    def __init__(self):
        # 定义正则表达式模式来解析Mermaid语法
        self.node_pattern = r'(\w+)\["?([^"\]]+)"?\]'  # 匹配 A["Node Title"]
        self.edge_pattern = r'(\w+)\s*[-.]+>\s*(\w+)'  # 匹配 A --> B 或 A -.-> B
        self.group_pattern = r'subgraph\s+(\w+)(?:\["?([^"\]]+)"?\])?'  # 匹配 subgraph A["Group Title"]

        # 初始化存储结构
        self.node_map = {}  # 存储节点映射
        self.edge_list = []  # 存储边列表
        self.group_map = {}  # 存储群组映射
        self.node_to_group = {}  # 存储节点与群组的关系

    def convert_mermaid_to_graph(self, mermaid_content: str) -> dict:
        """
        将Mermaid内容转换为知识图谱编辑器的数据结构
        """
        # 重置状态
        self.reset_state()

        # 解析Mermaid内容
        lines = mermaid_content.strip().split('\n')

        in_subgraph = False
        current_group_id = None

        for line in lines:
            line = line.strip()

            # 检查是否是子图开始
            subgraph_match = re.match(self.group_pattern, line)
            if subgraph_match:
                in_subgraph = True
                group_id = subgraph_match.group(1)
                group_title = subgraph_match.group(2) or f"Group {group_id}"

                # 创建群组节点
                group_node = self.create_group_node(group_id, group_title)
                self.group_map[group_id] = group_node
                current_group_id = group_id
                continue

            # 检查是否是子图结束
            if line.lower().startswith('end') or line.lower().startswith('endsubgraph'):
                in_subgraph = False
                current_group_id = None
                continue

            # 解析节点定义
            node_matches = re.findall(self.node_pattern, line)
            for node_id, node_title in node_matches:
                if node_id not in self.node_map:
                    node = self.create_node(node_id, node_title)
                    self.node_map[node_id] = node

                    # 如果在子图中，记录节点与群组的关系
                    if in_subgraph and current_group_id:
                        self.node_to_group[node_id] = current_group_id

            # 解析边定义
            edge_matches = re.findall(self.edge_pattern, line)
            for source_id, target_id in edge_matches:
                # 检查ID是否存在于已定义的节点中
                if source_id in self.node_map and target_id in self.node_map:
                    edge = self.create_edge(source_id, target_id, line)
                    self.edge_list.append(edge)

        # 构建最终的数据结构
        return self.build_graph_data()

    def create_node(self, node_id: str, title: str) -> dict:
        """创建节点对象"""
        return {
            "id": f"node_{node_id}_{str(uuid.uuid4())[:8]}",
            "type": "node",
            "position": {"x": 0, "y": 0},  # 初始位置，后续由前端布局决定
            "title": title,
            "content": "",
            "attributes": {},
            "tags": [],
            "summary": "",
            "isEditing": False,
            "isExpanded": False,
            "width": 150,  # 默认宽度
            "height": 100,  # 默认高度
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }

    def create_group_node(self, group_id: str, title: str) -> dict:
        """创建群组节点对象"""
        return {
            "id": f"group_{group_id}_{str(uuid.uuid4())[:8]}",
            "type": "group",
            "position": {"x": 0, "y": 0},
            "title": title,
            "content": "",
            "attributes": {},
            "tags": [],
            "summary": "",
            "isEditing": False,
            "collapsed": False,
            "nodeIds": [],
            "groupId": None,
            "boundary": {"minX": 0, "minY": 0, "maxX": 200, "maxY": 200},  # 初始边界
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }

    def create_edge(self, source_id: str, target_id: str, line: str) -> dict:
        """创建边对象"""
        return {
            "id": f"edge_{source_id}_{target_id}_{str(uuid.uuid4())[:8]}",
            "source": self.node_map[source_id].id,
            "target": self.node_map[target_id].id,
            "label": line.split('>')[-1].strip() if '>' in line else "",
            "data": {
                "customProperties": {}
            },
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }

    def build_graph_data(self) -> dict:
        """构建知识图谱编辑器的数据结构"""
        nodes = []
        edges = []

        # 添加普通节点
        for node_id, node_data in self.node_map.items():
            # 如果节点属于某个群组，设置groupId
            if node_id in self.node_to_group:
                group_id = self.node_to_group[node_id]
                if group_id in self.group_map:
                    node_data["groupId"] = self.group_map[group_id].id
                    # 更新群组的nodeIds列表
                    self.group_map[group_id]["nodeIds"].append(node_data["id"])

            nodes.append(node_data)

        # 添加群组
        for group_data in self.group_map.values():
            nodes.append(group_data)

        # 添加边
        for edge_data in self.edge_list:
            edges.append(edge_data)

        return {
            "nodes": nodes,
            "edges": edges
        }

    def reset_state(self):
        """重置解析器状态"""
        self.node_map = {}
        self.edge_list = []
        self.group_map = {}
        self.node_to_group = {}