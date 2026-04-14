import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, ProgressBar } from 'antd-mobile';
import { authAPI } from '../services/api';

const TOOL_ICONS = {
  '能力诊断': '🔬',
  '题库练习': '📝',
  '错题本': '📕',
  '学习成就': '🏆',
};

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    authAPI.getProfile().then(setProfile).catch(() => {});
  }, []);

  const tools = [
    { name: '能力诊断', path: '/diagnosis', color: '#1677ff' },
    { name: '题库练习', path: '/practice', color: '#52c41a' },
    { name: '错题本', path: '/wrong', color: '#fa8c16' },
    { name: '学习成就', path: '/achievement', color: '#722ed1' },
  ];

  // 模拟数据
  const todayProgress = {
    minutes: 45,
    targetMinutes: 60,
    questions: 8,
    targetQuestions: 10,
    streakDays: 5,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部导航 */}
      <div style={{
        background: '#fff', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🎓</span>
          <span style={{ fontWeight: 600, fontSize: 18 }}>伴学网</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span
            onClick={() => navigate('/membership')}
            style={{ fontSize: 20, cursor: 'pointer' }}
          >👑</span>
          <span
            onClick={() => navigate('/profile')}
            style={{ fontSize: 20, cursor: 'pointer' }}
          >👤</span>
        </div>
      </div>

      {/* Banner */}
      <div style={{
        margin: '12px 16px', padding: '20px 16px', borderRadius: 12,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff'
      }}>
        <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>
          名师点评团队审核 · 伴学网出品
        </div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          这些坑，我见过太多学生踩过
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
          做完题再看解析，事半功倍 →
        </div>
      </div>

      {/* 提分入口 */}
      <div style={{
        margin: '0 16px 12px', padding: '16px', background: '#fff', borderRadius: 12
      }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>我要提分</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div
            onClick={() => navigate('/junior')}
            style={{
              flex: 1, padding: '16px 0', textAlign: 'center',
              background: '#e6f4ff', borderRadius: 8, color: '#1677ff', fontWeight: 600
            }}
          >
            初中专区
          </div>
          <div
            onClick={() => navigate('/senior')}
            style={{
              flex: 1, padding: '16px 0', textAlign: 'center',
              background: '#f6ffed', borderRadius: 8, color: '#52c41a', fontWeight: 600
            }}
          >
            高中专区
          </div>
        </div>
      </div>

      {/* 今日学习 */}
      <div style={{
        margin: '0 16px 12px', padding: '16px', background: '#fff', borderRadius: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>今日学习</span>
          <span style={{ fontSize: 12, color: '#999' }}>连续{todayProgress.streakDays}天打卡 🔥</span>
        </div>

        <ProgressBar
          percent={Math.round((todayProgress.minutes / todayProgress.targetMinutes) * 100)}
          style={{ marginBottom: 8 }}
        />
        <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
          学习时长 {todayProgress.minutes}/{todayProgress.targetMinutes} 分钟
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 0', background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1677ff' }}>{todayProgress.questions}</div>
            <div style={{ fontSize: 12, color: '#666' }}>完成题数</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 0', background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}>{todayProgress.streakDays}</div>
            <div style={{ fontSize: 12, color: '#666' }}>打卡天数</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 0', background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#fa8c16' }}>78%</div>
            <div style={{ fontSize: 12, color: '#666' }}>正确率</div>
          </div>
        </div>
      </div>

      {/* 提分工具 */}
      <div style={{
        margin: '0 16px 12px', padding: '16px', background: '#fff', borderRadius: 12
      }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>提分工具</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {tools.map((tool) => (
            <div
              key={tool.name}
              onClick={() => navigate(tool.path)}
              style={{
                padding: '16px 12px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid #f0f0f0', textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{TOOL_ICONS[tool.name]}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{tool.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 快速开始 */}
      <div style={{
        margin: '0 16px 20px', padding: '16px', background: '#fff', borderRadius: 12
      }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>快速开始</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div
            onClick={() => navigate('/practice')}
            style={{
              flex: 1, padding: '12px 0', textAlign: 'center',
              background: '#fff7e6', borderRadius: 8, color: '#fa8c16', fontSize: 14, fontWeight: 500
            }}
          >
            继续练习
          </div>
          <div
            onClick={() => navigate('/wrong')}
            style={{
              flex: 1, padding: '12px 0', textAlign: 'center',
              background: '#fff7e6', borderRadius: 8, color: '#fa8c16', fontSize: 14, fontWeight: 500
            }}
          >
            错题复习
          </div>
          <div
            onClick={() => navigate('/practice')}
            style={{
              flex: 1, padding: '12px 0', textAlign: 'center',
              background: '#fff7e6', borderRadius: 8, color: '#fa8c16', fontSize: 14, fontWeight: 500
            }}
          >
            今日任务
          </div>
        </div>
      </div>
    </div>
  );
}
