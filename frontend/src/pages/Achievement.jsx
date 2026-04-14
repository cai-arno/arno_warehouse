import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar, Tabs } from 'antd-mobile';

const ACHIEVEMENTS = [
  { id: 1, name: '初出茅庐', name_informal: '做了第一道题，了不起！', icon: '🎯', completed: true },
  { id: 2, name: '连续7天打卡', name_informal: '一周没断，继续保持！', icon: '🔥', completed: true },
  { id: 3, name: '错题歼灭者', name_informal: '10道错题被你搞定了', icon: '💪', completed: false, progress: 7, target: 10 },
  { id: 4, name: '解题马拉松', name_informal: '一口气50题，你是怎么做到的？', icon: '🏃', completed: false, progress: 32, target: 50 },
  { id: 5, name: '月度学习达人', name_informal: '一个月都来了？学霸上身了？', icon: '🌟', completed: false, progress: 12, target: 30 },
  { id: 6, name: '正确率90%', name_informal: '十题对九题，这波可以', icon: '🎖️', completed: true },
];

const WEEKLY_REPORT = {
  week: '2024年第15周（4.8-4.14）',
  summary: {
    totalQuestions: 86,
    correctRate: 76,
    studyDays: 6,
    avgDaily: 14,
  },
  subjects: [
    { name: '数学', questions: 35, correct: 28, rate: 80 },
    { name: '物理', questions: 25, correct: 17, rate: 68 },
    { name: '英语', questions: 26, correct: 21, rate: 81 },
  ],
  insights: [
    { type: 'strength', text: '数学计算题正确率高，保持！' },
    { type: 'weakness', text: '物理力学部分失分多，建议加强' },
    { type: 'tip', text: '本周错题本复习效果明显，继续坚持' },
  ],
  weekComparison: { questions: +12, rate: +3 },
};

export default function Achievement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('achievements');

  const completed = ACHIEVEMENTS.filter(a => a.completed);
  const inProgress = ACHIEVEMENTS.filter(a => !a.completed);

  const renderAchievements = () => (
    <div>
      {/* 总体进度 */}
      <div style={{ background: '#fff', margin: 12, borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>总进度</span>
          <span style={{ color: '#1677ff', fontWeight: 600 }}>{completed.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <ProgressBar percent={Math.round((completed.length / ACHIEVEMENTS.length) * 100)} />
        <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
          再获得 <span style={{ color: '#1677ff', fontWeight: 600 }}>{ACHIEVEMENTS.length - completed.length}</span> 个成就即可解锁全部成就
        </div>
      </div>

      {/* 进行中 */}
      {inProgress.length > 0 && (
        <div style={{ margin: '0 12px 12px' }}>
          <div style={{ fontWeight: 600, marginBottom: 12, padding: '0 4px' }}>进行中</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {inProgress.map((a) => (
              <div key={a.id} style={{ background: '#fff', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#fa8c16' }}>{a.name_informal}</div>
                  </div>
                </div>
                <ProgressBar percent={Math.round((a.progress / a.target) * 100)} />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  {a.progress}/{a.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 已获得 */}
      <div style={{ margin: '0 12px' }}>
        <div style={{ fontWeight: 600, marginBottom: 12, padding: '0 4px' }}>已获得 ({completed.length})</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {completed.map((a) => (
            <div key={a.id} style={{
              background: '#fff', borderRadius: 12, padding: 14,
              border: '1px solid #b7eb8f'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 28 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: '#52c41a' }}>✓ 已获得</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReport = () => (
    <div>
      {/* 周报标题 */}
      <div style={{ background: '#fff', margin: 12, borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{WEEKLY_REPORT.week}</div>
        <div style={{ fontSize: 12, color: '#999' }}>学习报告</div>
      </div>

      {/* 本周概览 */}
      <div style={{ background: '#fff', margin: '0 12px 12px', borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>本周概览</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
          {[
            { label: '完成题数', value: WEEKLY_REPORT.summary.totalQuestions, unit: '题', delta: `+${WEEKLY_REPORT.weekComparison.questions}` },
            { label: '正确率', value: WEEKLY_REPORT.summary.correctRate, unit: '%', delta: `+${WEEKLY_REPORT.weekComparison.rate}%` },
            { label: '学习天数', value: WEEKLY_REPORT.summary.studyDays, unit: '天' },
            { label: '日均题数', value: WEEKLY_REPORT.summary.avgDaily, unit: '题/天' },
          ].map((item) => (
            <div key={item.label} style={{ background: '#f5f5f5', borderRadius: 8, padding: '12px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}>{item.value}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{item.label}</div>
              {item.delta && <div style={{ fontSize: 10, color: '#52c41a' }}>{item.delta} ↑</div>}
            </div>
          ))}
        </div>
      </div>

      {/* 各学科数据 */}
      <div style={{ background: '#fff', margin: '0 12px 12px', borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>学科数据</div>
        {WEEKLY_REPORT.subjects.map((s) => (
          <div key={s.name} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</span>
              <span style={{ fontSize: 13, color: '#666' }}>{s.correct}/{s.questions}题 · {s.rate}%</span>
            </div>
            <ProgressBar percent={s.rate} />
          </div>
        ))}
      </div>

      {/* 学习洞察 */}
      <div style={{ background: '#fff', margin: '0 12px', borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>本周洞察</div>
        {WEEKLY_REPORT.insights.map((insight, idx) => (
          <div key={idx} style={{
            padding: '10px 12px', borderRadius: 8, marginBottom: 8,
            background: insight.type === 'strength' ? '#f6ffed' : insight.type === 'weakness' ? '#fff2f0' : '#e6f4ff',
            fontSize: 13, lineHeight: 1.6,
            color: insight.type === 'strength' ? '#52c41a' : insight.type === 'weakness' ? '#ff4d4f' : '#1677ff'
          }}>
            {insight.type === 'strength' && '💪 '}
            {insight.type === 'weakness' && '📌 '}
            {insight.type === 'tip' && '💡 '}
            {insight.text}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 80 }}>
      {/* 顶部 */}
      <div style={{
        background: '#fff', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span onClick={() => navigate(-1)} style={{ fontSize: 20 }}>←</span>
        <span style={{ fontWeight: 600 }}>学习成就</span>
        <span style={{ fontSize: 20 }}>🏆</span>
      </div>

      {/* 标签页 */}
      <div style={{ background: '#fff', padding: '0 16px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          style={{ '--title-font-size': '15px' }}
        >
          <Tabs.Tab title="🏆 成就" key="achievements">
            {renderAchievements()}
          </Tabs.Tab>
          <Tabs.Tab title="📊 学习报告" key="report">
            {renderReport()}
          </Tabs.Tab>
        </Tabs>
      </div>
    </div>
  );
}
