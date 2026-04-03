"""AI 脚本生成服务"""
import json
from sqlalchemy.ext.asyncio import AsyncSession
from tenacity import retry, stop_after_attempt, wait_exponential

from app.models.script import Script, ScriptStatus, ScriptType
from app.core.config import settings
from app.core.id_generator import generate_id


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
    async def _call_ai(self, prompt: str) -> dict:
        """调用 AI 生成脚本"""
        # 优先使用 OpenAI 兼容接口
        if settings.OPENAI_API_KEY:
            return await self._call_openai(prompt)
        elif settings.ANTHROPIC_API_KEY:
            return await self._call_anthropic(prompt)
        else:
            # 演示模式：返回假数据
            return self._generate_demo_script(prompt)

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

    def _generate_demo_script(self, topic: str) -> dict:
        """演示模式：生成假数据"""
        return {
            "title": f"关于{topic}的那些事儿",
            "hook": "你知道吗？{topic}竟然还能这样用！",
            "body": "第一点：很多人在这一步就错了\n第二点：关键在于细节的把控\n第三点：做好这两点，效果翻倍",
            "cta": "觉得有用就点个赞吧！关注我，每天分享实用技巧",
            "duration": 45,
        }

    async def generate(
        self,
        topic: str,
        script_type: ScriptType = ScriptType.PRODUCT_SHOWCASE,
        quantity: int = 1,
        style: str | None = None,
        user_id: str | None = None,
    ) -> Script:
        """生成脚本"""
        style_hint = f"\n风格要求：{style}" if style else ""
        prompt = f"""请为以下主题生成{quantity}条短视频脚本：

主题：{topic}
类型：{script_type.value}
{style_hint}
"""

        try:
            result = await self._call_ai(prompt)
        except Exception as e:
            # 失败时使用演示数据
            result = self._generate_demo_script(topic)

        script = Script(
            id=generate_id("scripts"),
            title=result.get("title", f"关于{topic}的脚本"),
            topic=topic,
            script_type=script_type,
            hook=result.get("hook", ""),
            body=result.get("body", ""),
            cta=result.get("cta", ""),
            duration=result.get("duration", 0),
            content=json.dumps(result, ensure_ascii=False),
            status=ScriptStatus.COMPLETED,
            user_id=user_id,
        )
        self.session.add(script)
        await self.session.commit()
        await self.session.refresh(script)
        return script
