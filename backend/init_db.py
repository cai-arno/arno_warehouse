"""
数据库初始化脚本
运行方式: python init_db.py
"""
import sys
sys.path.insert(0, '/home/arno/banxue-academy/backend')

from core.database import SessionLocal, engine, Base
from core.security import get_password_hash
from models.user import User, StudentProfile, ParentProfile
from models.question import Subject, Chapter, Question
from models.achievement import Achievement, AbilityDimension

def init_database():
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # ========== 初始化学科 ==========
        subjects = [
            {"name": "语文", "alias": "语文", "color": "#4A90D9", "sort_order": 1},
            {"name": "数学", "alias": "数学", "color": "#52C41A", "sort_order": 2},
            {"name": "英语", "alias": "英语", "color": "#FA8C16", "sort_order": 3},
            {"name": "物理", "alias": "物理", "color": "#722ED1", "sort_order": 4},
            {"name": "化学", "alias": "化学", "color": "#EB2F96", "sort_order": 5},
            {"name": "历史", "alias": "历史", "color": "#8B5CF6", "sort_order": 6},
        ]
        
        for s in subjects:
            existing = db.query(Subject).filter(Subject.name == s["name"]).first()
            if not existing:
                subject = Subject(**s)
                db.add(subject)
        
        db.commit()
        print("✅ 学科初始化完成")
        
        # ========== 初始化能力维度 ==========
        dimensions = [
            {
                "code": "knowledge_extraction",
                "name": "知识提取力",
                "description": "从题目中提取关键信息和知识点的能力",
                "icon": "bulb",
                "weight": 1.0,
                "sort_order": 1
            },
            {
                "code": "logical_analysis",
                "name": "逻辑分析力",
                "description": "分析问题、梳理逻辑链条的能力",
                "icon": "analysis",
                "weight": 1.2,
                "sort_order": 2
            },
            {
                "code": "memory_retention",
                "name": "记忆保持力",
                "description": "长期记忆和灵活调取知识的能力",
                "icon": "brain",
                "weight": 1.0,
                "sort_order": 3
            },
            {
                "code": "exam_pressure",
                "name": "应试抗压力",
                "description": "在考试压力下保持稳定发挥的能力",
                "icon": "shield",
                "weight": 0.8,
                "sort_order": 4
            },
            {
                "code": "metacognition",
                "name": "元认知力",
                "description": "对自身学习状态和方法的认知调节能力",
                "icon": "compass",
                "weight": 1.0,
                "sort_order": 5
            },
        ]
        
        for d in dimensions:
            existing = db.query(AbilityDimension).filter(AbilityDimension.code == d["code"]).first()
            if not existing:
                dim = AbilityDimension(**d)
                db.add(dim)
        
        db.commit()
        print("✅ 能力维度初始化完成")
        
        # ========== 初始化成就 ==========
        achievements = [
            {
                "code": "first_question",
                "name": "初出茅庐",
                "name_informal": "做了第一道题，了不起！",
                "description": "完成第一道练习题",
                "category": "time",
                "requirement": {"type": "total_questions", "value": 1},
                "reward_points": 10
            },
            {
                "code": "streak_7",
                "name": "连续7天打卡",
                "name_informal": "一周没断，继续保持！",
                "description": "连续打卡7天",
                "category": "streak",
                "requirement": {"type": "streak_days", "value": 7},
                "reward_points": 70
            },
            {
                "code": "streak_30",
                "name": "月度学习达人",
                "name_informal": "一个月都来了？学霸上身了？",
                "description": "连续打卡30天",
                "category": "streak",
                "requirement": {"type": "streak_days", "value": 30},
                "reward_points": 300
            },
            {
                "code": "wrong_master_10",
                "name": "错题歼灭者",
                "name_informal": "10道错题被你搞定了",
                "description": "掌握10道错题",
                "category": "challenge",
                "requirement": {"type": "mastered_wrong", "value": 10},
                "reward_points": 100
            },
            {
                "code": "correct_rate_90",
                "name": "正确率90%",
                "name_informal": "十题对九题，这波可以",
                "description": "单日正确率达到90%以上",
                "category": "challenge",
                "requirement": {"type": "daily_correct_rate", "value": 90},
                "reward_points": 50
            },
            {
                "code": "marathon_50",
                "name": "解题马拉松",
                "name_informal": "一口气50题，你是怎么做到的？",
                "description": "一天内完成50道题",
                "category": "time",
                "requirement": {"type": "daily_questions", "value": 50},
                "reward_points": 200
            },
        ]
        
        for a in achievements:
            existing = db.query(Achievement).filter(Achievement.code == a["code"]).first()
            if not existing:
                ach = Achievement(**a)
                db.add(ach)
        
        db.commit()
        print("✅ 成就初始化完成")
        
        # ========== 创建测试用户 ==========
        test_user = db.query(User).filter(User.phone == "13800138000").first()
        if not test_user:
            test_user = User(
                phone="13800138000",
                password_hash=get_password_hash("test123"),
                nickname="测试同学",
                user_type="student"
            )
            db.add(test_user)
            db.flush()
            
            # 创建学生档案
            profile = StudentProfile(
                user_id=test_user.id,
                grade="初三",
                subjects=["数学", "物理"],
                total_study_minutes=120,
                total_questions=45,
                correct_rate=0.78,
                streak_days=5
            )
            db.add(profile)
        
        db.commit()
        print("✅ 测试用户创建完成 (手机号: 13800138000, 密码: test123)")
        
        print("\n🎉 数据库初始化全部完成！")
        
    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
