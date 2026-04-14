import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar, Badge } from 'antd-mobile';
import { questionAPI } from '../services/api';

const SUBJECT_COLORS = {
  '语文': '#4A90D9',
  '数学': '#52C41A',
  '英语': '#FA8C16',
  '物理': '#722ED1',
  '化学': '#EB2F96',
  '历史': '#8B5CF6',
};

export default function JuniorSection() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    questionAPI.getSubjects()
      .then(setSubjects)
      .finally(() => setLoading(false));
  }, []);

  // 模拟本周进度数据
  const weeklyProgress = {
    chapter: '二次函数',
    progress: 65,
    stats: { learned: 12, total: 18, days: 8 },
  };

  // 中考专题
  const examTopics = [
    { name: '函数', icon: '📈' },
    { name: '几何', icon: '📐' },
    { name: '方程', icon: '⚖️' },
    { name: '压轴题', icon: '🔥' },
    { name: '模拟卷', icon: '📋' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部导航 */}
      <div style={{
        background: '#fff', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span onClick={() => navigate(-1)} style={{ fontSize: 20 }}>←</span>
        <span style={{ fontWeight: 600, fontSize: 18 }}>初中专区</span>
      </div>

      {/* 学科卡片 */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => navigate('/practice', { state: { subjectId: subject.id } })}
              style={{
                padding: '16px 8px', background: '#fff', borderRadius: 12,
                textAlign: 'center', cursor: 'pointer',
                borderTop: `3px solid ${subject.color || SUBJECT_COLORS[subject.name] || '#999'}`
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {subject.name === '数学' ? '📐' : subject.name === '语文' ? '📚' : subject.name === '英语' ? '🔤' : subject.name === '物理' ? '⚗️' : subject.name === '化学' ? '🧪' : '📜'}
              </div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{subject.name}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                已学 {Math.floor(Math.random() * 20 + 5)} 天
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 本周进度 */}
      <div style={{ margin: '0 16px 12px', padding: '16px', background: '#fff', borderRadius: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>本周进度</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
          当前章节：{weeklyProgress.chapter}
        </div>
        <ProgressBar percent={weeklyProgress.progress} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#999' }}>
          <span>已学 {weeklyProgress.stats.learned}/{weeklyProgress.stats.total} 节</span>
          <span>已坚持 {weeklyProgress.stats.days} 天</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #1677ff', color: '#1677ff', background: '#fff', fontSize: 13 }}>
            继续学习
          </button>
          <button style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #52c41a', color: '#52c41a', background: '#fff', fontSize: 13 }}>
            章节测试
          </button>
          <button style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #fa8c16', color: '#fa8c16', background: '#fff', fontSize: 13 }}>
            错题本
          </button>
        </div>
      </div>

      {/* 中考专题 */}
      <div style={{ margin: '0 16px 20px', padding: '16px', background: '#fff', borderRadius: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>中考专题</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {examTopics.map((topic) => (
            <div
              key={topic.name}
              style={{
                padding: '8px 14px', background: '#f5f5f5', borderRadius: 20,
                fontSize: 13, cursor: 'pointer'
              }}
            >
              <span style={{ marginRight: 4 }}>{topic.icon}</span>
              {topic.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
