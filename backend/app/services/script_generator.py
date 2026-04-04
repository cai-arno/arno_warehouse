"""AI 脚本生成服务"""
import json
import random
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from tenacity import retry, stop_after_attempt, wait_exponential

from app.models.script import Script, ScriptStatus, ScriptType, Platform
from app.core.config import settings
from app.core.id_generator import generate_id


# ─── 热点话题模拟数据 ──────────────────────────────────────────
_MOCK_HOT_TOPICS = [
    {"id": "HT001", "topic": "年轻人开始爱上炖汤", "category": "美食", "heat_score": 98, "source": "微博热搜", "description": "年轻人养生风潮，炖汤成为新宠"},
    {"id": "HT002", "topic": "iPhone 17 Pro全新配色曝光", "category": "数码", "heat_score": 95, "source": "抖音热榜", "description": "苹果新机配色引热议，渐变金登场"},
    {"id": "HT003", "topic": "特斯拉FSD落地中国", "category": "汽车", "heat_score": 92, "source": "微博热搜", "description": "特斯拉全自动驾驶正式获批国内使用"},
    {"id": "HT004", "topic": "多地取消公摊面积呼声", "category": "房产", "heat_score": 88, "source": "抖音热榜", "description": "购房者呼吁取消公摊面积计价"},
    {"id": "HT005", "topic": "短剧出海爆火", "category": "娱乐", "heat_score": 85, "source": "B站热榜", "description": "国产短剧海外爆火，单集播放破千万"},
    {"id": "HT006", "topic": "露营经济持续升温", "category": "生活", "heat_score": 82, "source": "微博热搜", "description": "精致露营成为周末休闲首选"},
    {"id": "HT007", "topic": "AI写作工具普及", "category": "科技", "heat_score": 80, "source": "知乎热榜", "description": "AI写作进入寻常百姓家"},
    {"id": "HT008", "topic": "演唱会经济爆发", "category": "娱乐", "heat_score": 78, "source": "小红书热榜", "description": "2024年演唱会票房创历史新高"},
]


# ─── 平台风格提示词 ──────────────────────────────────────────
_PLATFORM_STYLE_PROMPTS = {
    Platform.DOUYIN: "风格要求：节奏极快（前3秒必须有爆点），金句频出，情绪价值拉满，适合反复观看。口语化、冲击力强，有记忆点。",
    Platform.KUAISHOU: "风格要求：真实感强，口语化接地气，有亲切感。避免过度包装，展现真实生活场景，让人有共鸣。",
    Platform.BILIBILI: "风格要求：知识感强，信息密度高，逻辑清晰，适合中长篇幅。有弹幕友好设计（埋梗、互动点），可看性强。",
    Platform.XIGUA: "风格要求：资讯感强，标题党风格善用悬念，数据支撑观点。有新闻感，逻辑严密，适合深度内容。",
}


class ScriptGenerator:
    """脚本生成器"""

    SYSTEM_PROMPT = """你是一位顶级的短视频文案专家，擅长生成爆款视频脚本。
你需要生成具有强吸引力的开场（黄金3秒），内容丰富且有价值的正文，以及有效的行动号召。

输出格式为JSON：
{
    "title": "视频标题",
    "hook": "黄金3秒开场白，吸引观众继续看下去",
    "body": "正文内容，分段呈现，每段控制在50字以内",
    "cta": "行动号召，引导点赞、关注、评论",
    "duration": 预估时长(秒)
}

风格要求：口语化、有感染力、适合短视频平台
"""

    def __init__(self, session: AsyncSession):
        self.session = session

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _call_ai(self, prompt: str, topic: str | None = None) -> dict:
        """调用 AI 生成脚本"""
        # 优先使用 OpenAI 兼容接口
        if settings.OPENAI_API_KEY:
            return await self._call_openai(prompt)
        elif settings.ANTHROPIC_API_KEY:
            return await self._call_anthropic(prompt)
        else:
            # 演示模式：返回假数据（topic 用于生成有意义的假标题）
            demo_topic = topic if topic else (prompt[:50] if prompt else "默认主题")
            return self._generate_demo_script(demo_topic, Platform.DOUYIN)

    async def _call_openai(self, prompt: str) -> dict:
        """调用 OpenAI 兼容 API"""
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.8,
        )
        content = response.choices[0].message.content
        return json.loads(content)

    async def _call_anthropic(self, prompt: str) -> dict:
        """调用 Anthropic API"""
        import anthropic
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=self.SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        content = response.content[0].text
        return json.loads(content)

    def _safe_title(self, raw: str, fallback: str, max_len: int = 200) -> str:
        """截断标题以避免数据库字段溢出"""
        t = (raw or "").strip() or fallback
        return t[:max_len]

    def _generate_demo_script(self, topic: str, platform: Platform = Platform.DOUYIN) -> dict:
        """演示模式：生成假数据"""
        safe_topic = topic[:50]  # 防止超长主题导致标题溢出
        return {
            "title": f"关于{safe_topic}的那些事儿",
            "hook": f"你知道吗？{safe_topic}竟然还能这样用！",
            "body": "第一点：很多人在这一步就错了\n第二点：关键在于细节的把控\n第三点：做好这两点，效果翻倍",
            "cta": "觉得有用就点个赞吧！关注我，每天分享实用技巧",
            "duration": 45,
        }

    def _build_platform_prompt(self, platform: Platform) -> str:
        """构建平台风格提示词"""
        return _PLATFORM_STYLE_PROMPTS.get(platform, _PLATFORM_STYLE_PROMPTS[Platform.DOUYIN])

    # ─── 热点追踪 ───────────────────────────────────────────

    async def get_hot_topics(self, category: str | None = None) -> list[dict]:
        """
        获取当前热点话题列表（演示模式：返回模拟数据）
        实际可接入微博热搜/抖音热榜等API
        """
        topics = _MOCK_HOT_TOPICS
        if category:
            topics = [t for t in topics if t["category"] == category]
        return sorted(topics, key=lambda x: x["heat_score"], reverse=True)

    async def generate_from_hot(
        self,
        hot_topic_id: str,
        script_type: ScriptType = ScriptType.PRODUCT_SHOWCASE,
        platform: Platform = Platform.DOUYIN,
        custom_angle: str | None = None,
        user_id: str | None = None,
    ) -> Script:
        """基于热点话题生成脚本"""
        topics = {t["id"]: t for t in _MOCK_HOT_TOPICS}
        topic_data = topics.get(hot_topic_id)
        if not topic_data:
            raise ValueError(f"热点话题不存在: {hot_topic_id}")

        hot_topic = topic_data["topic"]
        platform_hint = self._build_platform_prompt(platform)
        angle_hint = f"\n切入角度：{custom_angle}" if custom_angle else f"\n切入角度：围绕「{topic_data['description']}」展开，结合{script_type.value}"

        prompt = f"""请为以下热点话题生成一条短视频脚本：

热点话题：{hot_topic}
话题简介：{topic_data['description']}
视频类型：{script_type.value}
{platform_hint}
{angle_hint}

输出格式为JSON：
{{
    "title": "视频标题",
    "hook": "黄金3秒开场白，吸引观众继续看下去",
    "body": "正文内容，分段呈现，每段控制在50字以内",
    "cta": "行动号召，引导点赞、关注、评论",
    "duration": 预估时长(秒)
}}
"""
        try:
            result = await self._call_ai(prompt, topic=hot_topic)
        except Exception:
            result = self._generate_demo_script(hot_topic, platform)

        title_raw = result.get("title", f"热点：{hot_topic}")
        script = Script(
            id=generate_id("scripts"),
            title=self._safe_title(title_raw, f"热点：{hot_topic}"),
            topic=hot_topic[:500],
            script_type=script_type,
            platform=platform,
            hook=result.get("hook", "")[:1000] or "",
            body=result.get("body", "")[:5000] or "",
            cta=result.get("cta", "")[:500] or "",
            duration=result.get("duration", 0) or 0,
            content=json.dumps(result, ensure_ascii=False)[:10000] or "{}",
            status=ScriptStatus.COMPLETED,
            user_id=user_id,
        )
        self.session.add(script)
        await self.session.commit()
        await self.session.refresh(script)
        return script

    # ─── 脚本创意增强 ────────────────────────────────────────

    async def suggest_angles(
        self,
        topic: str,
        script_type: ScriptType = ScriptType.PRODUCT_SHOWCASE,
        count: int = 4,
    ) -> list[dict]:
        """
        为给定主题生成多个创意角度建议
        返回 angle_id, angle_name, description, outline, recommended_platform, estimated_duration
        """
        prompt = f"""请为以下主题生成{count}个不同的短视频创意角度：

主题：{topic}
视频类型：{script_type.value}

要求：角度之间要有明显差异，覆盖不同受众和表现风格

输出格式为JSON（数组）：
[
    {{
        "angle_id": "angle_1",
        "angle_name": "角度名称，如「对比反差」「知识科普」「情感共鸣」",
        "description": "该角度的核心卖点和适合人群",
        "outline": "脚本大纲草稿，3-5个要点，用换行分隔",
        "recommended_platform": "推荐平台(douyin/kuaishou/bilibili/xigua)",
        "estimated_duration": 预估时长(秒)
    }},
    ...
]
"""
        try:
            result = await self._call_ai(prompt, topic=topic)
            angles = result if isinstance(result, list) else result.get("angles", [])
            if not angles:
                raise ValueError("No angles returned")
        except Exception:
            # 演示模式降级
            angles = self._generate_demo_angles(topic, count)

        # 补齐 angle_id
        for i, a in enumerate(angles):
            if "angle_id" not in a:
                a["angle_id"] = f"angle_{i+1}"
        return angles

    def _generate_demo_angles(self, topic: str, count: int) -> list[dict]:
        """演示模式：生成假创意角度"""
        demo_angles = [
            {"angle_name": "知识科普", "description": f"深入解析{topic}背后的原理，适合求知型受众", "outline": "引入：常见误区\n原理：为什么是这样\n实操：具体怎么做\n总结：关键要点", "recommended_platform": "bilibili", "estimated_duration": 90},
            {"angle_name": "情感共鸣", "description": f"用故事引发情感共鸣，打动观众内心", "outline": "开场： relatable场景\n冲突：问题出现\n高潮：情绪爆发\n结尾：给出希望", "recommended_platform": "douyin", "estimated_duration": 45},
            {"angle_name": "对比反差", "description": f"通过对比制造反差感，吸引眼球", "outline": "错误示范 vs 正确做法\n反差效果展示\n分析原因\n给出建议", "recommended_platform": "kuaishou", "estimated_duration": 60},
            {"angle_name": "实用技巧", "description": f"提供干货满满的实用技巧，看完就能用", "outline": "痛点引入\n技巧1：快速上手\n技巧2：进阶用法\n技巧3：避坑指南\n总结", "recommended_platform": "xigua", "estimated_duration": 120},
            {"angle_name": "热点蹭势", "description": f"结合当下热点，快速产出内容获取流量", "outline": "热点引入\n关联主题\n独特视角\n互动引导", "recommended_platform": "douyin", "estimated_duration": 30},
            {"angle_name": "种草测评", "description": f"真实测评体验，给出购买/使用建议", "outline": "开箱第一印象\n核心功能体验\n优缺点总结\n适合人群推荐", "recommended_platform": "kuaishou", "estimated_duration": 75},
        ]
        return demo_angles[:count]

    async def generate(
        self,
        topic: str,
        script_type: ScriptType = ScriptType.PRODUCT_SHOWCASE,
        quantity: int = 1,
        style: str | None = None,
        platform: Platform = Platform.DOUYIN,
        user_id: str | None = None,
    ) -> Script:
        """生成脚本（支持平台差异化）"""
        style_hint = f"\n风格要求：{style}" if style else ""
        platform_hint = self._build_platform_prompt(platform)
        prompt = f"""请为以下主题生成{quantity}条短视频脚本：

主题：{topic}
类型：{script_type.value}
{platform_hint}
{style_hint}

输出格式为JSON：
{{
    "title": "视频标题",
    "hook": "黄金3秒开场白，吸引观众继续看下去",
    "body": "正文内容，分段呈现，每段控制在50字以内",
    "cta": "行动号召，引导点赞、关注、评论",
    "duration": 预估时长(秒)
}}
"""
        try:
            result = await self._call_ai(prompt, topic=topic)
        except Exception:
            # 失败时使用演示数据
            result = self._generate_demo_script(topic, platform)

        title_raw = result.get("title", f"关于{topic}的脚本")
        script = Script(
            id=generate_id("scripts"),
            title=self._safe_title(title_raw, f"关于{topic}的脚本"),
            topic=topic[:500],
            script_type=script_type,
            platform=platform,
            hook=result.get("hook", "")[:1000] or "",
            body=result.get("body", "")[:5000] or "",
            cta=result.get("cta", "")[:500] or "",
            duration=result.get("duration", 0) or 0,
            content=json.dumps(result, ensure_ascii=False)[:10000] or "{}",
            status=ScriptStatus.COMPLETED,
            user_id=user_id,
        )
        self.session.add(script)
        await self.session.commit()
        await self.session.refresh(script)
        return script
