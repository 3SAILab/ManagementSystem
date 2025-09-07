#!/usr/bin/env python3
"""
第一阶段数据填充脚本
填充基础测试数据，包括：部门、职位、员工、客户、合同、工单、子任务
"""

import sys
import os
from datetime import datetime, date
from decimal import Decimal

sys.path.append(os.path.dirname(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')))

from backend.config import settings
from backend.models.department import Department
from backend.models.position import Position
from backend.models.employee import Employee, EmployeeStatus, EmployeeRole
from backend.models.client import Client, ClientStatus, ClientScale
from backend.models.contract import Contract, ContractType
from backend.models.ticket import Ticket
from backend.models.sub_task import SubTask
from backend.models.file_resource import FileResource
from backend.models.client_activity_log import ClientActivityLog
from backend.models.progress_log import ProgressLog
from backend.models.product_type import ProductType

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from backend.db.session import Base
import bcrypt

class Phase1DataPopulator:
    def __init__(self):
        self.password_hash = self._hash_password("123456qwerty")
        # 创建同步数据库引擎和会话
        self.engine = create_engine(settings.DATABASE_URL)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def _hash_password(self, password: str) -> str:
        """生成密码哈希"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def populate_departments(self, session):
        """填充部门数据"""
        departments_data = [
            {"id": 1, "name": "人事行政部"},
            {"id": 6, "name": "营销管理部"},
            {"id": 7, "name": "生产部"},
            {"id": 8, "name": "AI部"}
        ]
        
        print("填充部门数据...")
        for dept_data in departments_data:
            dept = Department(**dept_data)
            session.add(dept)
            print(f"  创建部门: {dept_data['name']}")
        
        print("部门数据填充完成\n")
        session.commit()
    
    def populate_product_types(self, session):
        """填充产品类型数据"""
        product_types_data = [
            {"name": "文具", "sort_order": 1},
            {"name": "家电", "sort_order": 2},
            {"name": "服装", "sort_order": 3},
            {"name": "鞋类", "sort_order": 4},
            {"name": "家具", "sort_order": 5},
            {"name": "厨具", "sort_order": 6},
            {"name": "饰品", "sort_order": 7},
            {"name": "食品", "sort_order": 8},
            {"name": "箱包", "sort_order": 9},
            {"name": "图书", "sort_order": 10},
            {"name": "保健品", "sort_order": 11},
            {"name": "情趣", "sort_order": 12},
            {"name": "化妆品", "sort_order": 13},
            {"name": "玩具", "sort_order": 14},
            {"name": "床上用品", "sort_order": 15},
            {"name": "宠物用品", "sort_order": 16},
            {"name": "其他", "sort_order": 999}
        ]
        
        print("填充产品类型数据...")
        for product_type_data in product_types_data:
            product_type = ProductType(**product_type_data)
            session.add(product_type)
            print(f"  创建产品类型: {product_type_data['name']} (排序: {product_type_data['sort_order']})")
        
        print("产品类型数据填充完成\n")
        session.commit()
    
    def populate_positions(self, session):
        """填充职位数据"""
        positions_data = [
            {"id": 5, "name": "销售", "department_id": 6},      # 营销管理部
            {"id": 10, "name": "美工", "department_id": 7},     # 生产部
            {"id": 12, "name": "渲染", "department_id": 7},     # 生产部
            {"id": 13, "name": "人事专员", "department_id": 1}, # 人事行政部
            {"id": 25, "name": "IT", "department_id": 8},       # AI部
            {"id": 28, "name": "HRBP", "department_id": 1},     # 人事行政部
            {"id": 29, "name": "运营", "department_id": 6}      # 营销管理部
        ]
        
        print("填充职位数据...")
        for pos_data in positions_data:
            position = Position(**pos_data)
            session.add(position)
            print(f"  创建职位: {pos_data['name']} (部门ID: {pos_data['department_id']})")
        
        print("职位数据填充完成\n")
        session.commit()
    
    def populate_employees(self, session):
        """填充员工数据"""
        employees_data = [
            {
                "name": "系统管理员",
                "email": "admin@example.com",
                "password_hash": self.password_hash,
                "role": EmployeeRole.admin,
                "department_id": 1,
                "position_id": 13,
                "hire_date": date(2024, 1, 1),
                "status": EmployeeStatus.active,
                "base_salary": Decimal("10000.00"),
                "is_probation": False
            },
            {
                "name": "张销售",
                "email": "sales1@example.com",
                "password_hash": self.password_hash,
                "role": EmployeeRole.employee,
                "department_id": 6,
                "position_id": 5,
                "hire_date": date(2024, 1, 15),
                "status": EmployeeStatus.active,
                "base_salary": Decimal("8000.00"),
                "is_probation": False
            },
            {
                "name": "李美工",
                "email": "artist1@example.com",
                "password_hash": self.password_hash,
                "role": EmployeeRole.employee,
                "department_id": 7,
                "position_id": 10,
                "hire_date": date(2024, 2, 1),
                "status": EmployeeStatus.active,
                "base_salary": Decimal("7000.00"),
                "is_probation": False
            },
            {
                "name": "王运营经理",
                "email": "operation_manager@example.com",
                "password_hash": self.password_hash,
                "role": EmployeeRole.manager,
                "department_id": 6,
                "position_id": 29,
                "hire_date": date(2023, 12, 1),
                "status": EmployeeStatus.active,
                "base_salary": Decimal("12000.00"),
                "is_probation": False
            },
            {
                "name": "陈渲染",
                "email": "render1@example.com",
                "password_hash": self.password_hash,
                "role": EmployeeRole.employee,
                "department_id": 7,
                "position_id": 12,
                "hire_date": date(2024, 1, 20),
                "status": EmployeeStatus.active,
                "base_salary": Decimal("7500.00"),
                "is_probation": False
            },
            {
                "name": "刘IT",
                "email": "it1@example.com",
                "password_hash": self.password_hash,
                "role": EmployeeRole.employee,
                "department_id": 8,
                "position_id": 25,
                "hire_date": date(2024, 1, 10),
                "status": EmployeeStatus.active,
                "base_salary": Decimal("9000.00"),
                "is_probation": False
            }
        ]
        
        print("填充员工数据...")
        for emp_data in employees_data:
            employee = Employee(**emp_data)
            session.add(employee)
            print(f"  创建员工: {emp_data['name']} ({emp_data['email']}) - {emp_data['role'].value}")
        
        print("员工数据填充完成\n")
        session.commit()
    
    def populate_clients(self, session):
        """填充客户数据"""
        # 获取销售员工ID
        sales1 = session.execute(
            select(Employee).where(Employee.email == "sales1@example.com")
        ).scalar()
        sales1_id = sales1.id
        
        operation_manager = session.execute(
            select(Employee).where(Employee.email == "operation_manager@example.com")
        ).scalar()
        operation_manager_id = operation_manager.id
        
        clients_data = [
            {
                "sales_id": sales1_id,
                "name": "测试电商公司A",
                "contact_name": "王经理",
                "contact_phone": "13800138001",
                "address": {
                    "province": "广东省",
                    "city": "深圳市",
                    "area": "南山区",
                    "detail": "科技园南区1号楼"
                },
                "source": "线上",
                "product_type": "家电1",
                "scale": ClientScale.中,
                "status": ClientStatus.跟进中,
                "access_time": datetime(2024, 1, 1, 10, 0, 0)
            },
            {
                "sales_id": sales1_id,
                "name": "服装贸易有限公司",
                "contact_name": "李总",
                "contact_phone": "13800138002",
                "address": {
                    "province": "浙江省",
                    "city": "杭州市",
                    "area": "西湖区",
                    "detail": "文三路100号"
                },
                "source": "线下",
                "product_type": "服装1",
                "scale": ClientScale.大,
                "status": ClientStatus.已成交,
                "access_time": datetime(2024, 1, 2, 14, 0, 0)
            },
            {
                "sales_id": operation_manager_id,
                "name": "文具用品批发商",
                "contact_name": "赵经理",
                "contact_phone": "13800138003",
                "address": {
                    "province": "上海市",
                    "city": "上海市",
                    "area": "浦东新区",
                    "detail": "陆家嘴金融中心"
                },
                "source": "线上",
                "product_type": "文具1",
                "scale": ClientScale.小,
                "status": ClientStatus.试单中,
                "access_time": datetime(2024, 1, 5, 9, 30, 0)
            },
            {
                "sales_id": operation_manager_id,
                "name": "化妆品连锁店",
                "contact_name": "孙女士",
                "contact_phone": "13800138004",
                "address": {
                    "province": "北京市",
                    "city": "北京市",
                    "area": "朝阳区",
                    "detail": "三里屯商业街"
                },
                "source": "活动",
                "product_type": "化妆品1",
                "scale": ClientScale.大,
                "status": ClientStatus.复购,
                "access_time": datetime(2024, 1, 10, 16, 20, 0)
            },
            {
                "sales_id": sales1_id,
                "name": "玩具制造厂",
                "contact_name": "陈老板",
                "contact_phone": "13800138005",
                "address": {
                    "province": "广东省",
                    "city": "东莞市",
                    "area": "长安镇",
                    "detail": "工业园区B栋"
                },
                "source": "线下",
                "product_type": "玩具111",
                "scale": ClientScale.中,
                "status": ClientStatus.客户流失,
                "access_time": datetime(2024, 1, 15, 11, 45, 0)
            }
        ]
        
        print("填充客户数据...")
        for client_data in clients_data:
            client = Client(**client_data)
            session.add(client)
            print(f"  创建客户: {client_data['name']} - {client_data['product_type']} ({client_data['status'].value})")
        
        print("客户数据填充完成\n")
        session.commit()
    
    def populate_contracts(self, session):
        """填充合同数据"""
        # 获取客户和员工ID
        client_data = {}
        for phone in ["13800138002", "13800138003", "13800138004"]:
            client = session.execute(
                select(Client).where(Client.contact_phone == phone)
            ).scalar()
            client_data[phone] = client
        
        sales1 = session.execute(
            select(Employee).where(Employee.email == "sales1@example.com")
        ).scalar()
        sales1_id = sales1.id
        
        operation_manager = session.execute(
            select(Employee).where(Employee.email == "operation_manager@example.com")
        ).scalar()
        operation_manager_id = operation_manager.id
        
        contracts_data = [
            {
                "client_id": client_data["13800138002"].id,
                "sales_id": sales1_id,
                "is_recharged": False,
                "contract_type": ContractType.首单,
                "status": "进行中",
                "total_amount": Decimal("50000.00"),
                "paid_amount": Decimal("25000.00"),
                "commission_rate": Decimal("0.10"),
                "detail_pages": 20,
                "video_count": 5,
                "image_count": 50,
                "workflow_count": 3,
                "transaction_time": datetime(2024, 1, 3, 9, 0, 0)
            },
            {
                "client_id": client_data["13800138003"].id,
                "sales_id": operation_manager_id,
                "is_recharged": False,
                "contract_type": ContractType.试单,
                "status": "已完成",
                "total_amount": Decimal("8000.00"),
                "paid_amount": Decimal("8000.00"),
                "commission_rate": Decimal("0.08"),
                "detail_pages": 5,
                "video_count": 1,
                "image_count": 15,
                "workflow_count": 1,
                "transaction_time": datetime(2024, 1, 6, 14, 30, 0)
            },
            {
                "client_id": client_data["13800138004"].id,
                "sales_id": operation_manager_id,
                "is_recharged": True,
                "contract_type": ContractType.复购,
                "status": "进行中",
                "total_amount": Decimal("80000.00"),
                "paid_amount": Decimal("40000.00"),
                "commission_rate": Decimal("0.12"),
                "detail_pages": 30,
                "video_count": 10,
                "image_count": 80,
                "workflow_count": 5,
                "transaction_time": datetime(2024, 1, 12, 10, 15, 0)
            }
        ]
        
        print("填充合同数据...")
        for contract_data in contracts_data:
            contract = Contract(**contract_data)
            session.add(contract)
            print(f"  创建合同: {contract_data['contract_type'].value} - ¥{contract_data['total_amount']}")
        
        print("合同数据填充完成\n")
        session.commit()
    
    def populate_tickets(self, session):
        """填充工单数据"""
        # 获取合同ID
        contracts = session.execute(select(Contract)).scalars().all()
        
        # 根据客户电话映射合同
        client_contract_map = {}
        for contract in contracts:
            client = session.execute(
                select(Client).where(Client.id == contract.client_id)
            ).scalar()
            client_contract_map[client.contact_phone] = contract.id
        
        tickets_data = [
            {
                "name": "服装详情页设计",
                "contract_id": client_contract_map["13800138002"],
                "need_shoot": False,
                "need_watermark": True,
                "detail_pages": 5,
                "video_count": 1,
                "image_count": 15,
                "workflow_count": 1,
                "wechat_group": "服装设计沟通群",
                "notes": "主推女装连衣裙系列",
                "priority": "高",
                "platform": "国内"
            },
            {
                "name": "文具产品拍摄制作",
                "contract_id": client_contract_map["13800138003"],
                "need_shoot": True,
                "need_watermark": False,
                "detail_pages": 2,
                "video_count": 0,
                "image_count": 8,
                "workflow_count": 0,
                "wechat_group": "文具制作群",
                "notes": "办公用品系列",
                "priority": "中",
                "platform": "国内"
            },
            {
                "name": "化妆品广告视频",
                "contract_id": client_contract_map["13800138004"],
                "need_shoot": True,
                "need_watermark": True,
                "detail_pages": 3,
                "video_count": 2,
                "image_count": 10,
                "workflow_count": 1,
                "wechat_group": "化妆品项目群",
                "notes": "护肤品推广视频",
                "priority": "高",
                "platform": "国外"
            },
            {
                "name": "化妆品详情页优化",
                "contract_id": client_contract_map["13800138004"],
                "need_shoot": False,
                "need_watermark": True,
                "detail_pages": 8,
                "video_count": 1,
                "image_count": 25,
                "workflow_count": 2,
                "wechat_group": "化妆品项目群",
                "notes": "多SKU产品页面",
                "priority": "中",
                "platform": "国内"
            }
        ]
        
        print("填充工单数据...")
        for ticket_data in tickets_data:
            ticket = Ticket(**ticket_data)
            session.add(ticket)
            print(f"  创建工单: {ticket_data['name']} ({ticket_data['priority']})")
        
        print("工单数据填充完成\n")
        session.commit()
    
    def populate_subtasks(self, session):
        """填充子任务数据"""
        # 获取工单和员工ID
        tickets = {}
        for name in ["服装详情页设计", "文具产品拍摄制作", "化妆品广告视频"]:
            ticket = session.execute(
                select(Ticket).where(Ticket.name == name)
            ).scalar()
            tickets[name] = ticket
        
        artist1 = session.execute(
            select(Employee).where(Employee.email == "artist1@example.com")
        ).scalar()
        artist1_id = artist1.id
        
        render1 = session.execute(
            select(Employee).where(Employee.email == "render1@example.com")
        ).scalar()
        render1_id = render1.id
        
        subtasks_data = [
            {
                "ticket_id": tickets["服装详情页设计"].id,
                "assignee_id": artist1_id,
                "task_type": "美工",
                "status": "进行中",
                "progress": 75,
                "edit_count": 1,
                "assigned_at": datetime(2024, 1, 4, 9, 0, 0)
            },
            {
                "ticket_id": tickets["文具产品拍摄制作"].id,
                "assignee_id": artist1_id,
                "task_type": "美工",
                "status": "已完工",
                "progress": 100,
                "edit_count": 0,
                "assigned_at": datetime(2024, 1, 7, 10, 0, 0)
            },
            {
                "ticket_id": tickets["化妆品广告视频"].id,
                "assignee_id": render1_id,
                "task_type": "渲染",
                "status": "未开始",
                "progress": 0,
                "edit_count": 0,
                "assigned_at": datetime(2024, 1, 13, 14, 0, 0)
            }
        ]
        
        print("填充子任务数据...")
        for subtask_data in subtasks_data:
            subtask = SubTask(**subtask_data)
            session.add(subtask)
            print(f"  创建子任务: {subtask_data['task_type']} ({subtask_data['status']}) - 进度{subtask_data['progress']}%")
        
        print("子任务数据填充完成\n")
        session.commit()
    
    def verify_data(self, session):
        """验证填充的数据"""
        print("验证数据填充结果...")
        
        tables = [
            (Department, "部门"),
            (ProductType, "产品类型"),
            (Position, "职位"),
            (Employee, "员工"),
            (Client, "客户"),
            (Contract, "合同"),
            (Ticket, "工单"),
            (SubTask, "子任务")
        ]
        
        for model, name in tables:
            result = session.execute(select(model)).scalars().all()
            count = len(result)
            print(f"  {name}: {count} 条记录")
        
        print("\n数据验证完成")
    
    def run(self):
        """执行完整的数据填充流程"""
        print("开始执行第一阶段数据填充...")
        print("=" * 50)
        
        # 清空并重新创建所有表
        print("清空现有数据库表...")
        Base.metadata.drop_all(bind=self.engine)
        print("现有数据库表已清空")
        
        print("创建数据库表...")
        Base.metadata.create_all(bind=self.engine)
        print("数据库表创建完成\n")
        
        try:
            session = self.SessionLocal()
            try:
                self.populate_departments(session)
                self.populate_product_types(session)
                self.populate_positions(session)
                self.populate_employees(session)
                self.populate_clients(session)
                self.populate_contracts(session)
                self.populate_tickets(session)
                self.populate_subtasks(session)
                self.verify_data(session)
                # session.commit()  # 每个步骤都已单独提交
            except Exception as e:
                session.rollback()
                raise e
            finally:
                session.close()
                
            print("\n" + "=" * 50)
            print("第一阶段数据填充完成！")
            print("\n默认登录信息:")
            print("  管理员: admin@example.com / 123456qwerty")
            print("  销售: sales1@example.com / 123456qwerty")
            print("  美工: artist1@example.com / 123456qwerty")
            print("  运营经理: operation_manager@example.com / 123456qwerty")
            print("  渲染: render1@example.com / 123456qwerty")
            print("  IT: it1@example.com / 123456qwerty")
            
        except Exception as e:
            print(f"数据填充失败: {str(e)}")
            raise

def main():
    """主函数"""
    populator = Phase1DataPopulator()
    populator.run()

if __name__ == "__main__":
    main()