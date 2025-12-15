from flask import Flask
from flask_restx import Api


def create_app():
    app = Flask(__name__)

    # 配置
    app.config.from_object('configs.app_config')

    # 初始化扩展
    from extensions import db, migrate, redis_client, celery
    db.init_app(app)
    migrate.init_app(app, db)
    redis_client.init_app(app)
    
    # 初始化Celery
    celery.init_app(app)

    # API配置
    api = Api(app, version='1.0', title='Knowledge Graph API', description='知识图谱编辑器API')

    # 注册命名空间
    from controllers.graph import graph_ns
    from controllers.workspace import workspace_ns
    from controllers.common import common_ns
    
    api.add_namespace(graph_ns, path='/v1/graphs')
    api.add_namespace(workspace_ns, path='/v1/workspace')
    api.add_namespace(common_ns, path='/v1/common')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5001)