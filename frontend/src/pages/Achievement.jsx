import { useNavigate } from 'react-router-dom';
import { ProgressBar } from 'antd-mobile';

const ACHIEVEMENTS = [
  { id: 1, name: '初出茅庐', name_informal: '做了第一道题，了不起！', icon: '🎯', completed: true },
  { id: 2, name: '连续7天打卡', name_informal: '一周没断，继续保持！', icon: '🔥', completed: true },
  { id: 3, name: '错题歼灭者', name_informal: '10道错题被你搞定了', icon: '💪', completed: false, progress: 7, target: 10 },
  { id: 4, name: '解题马拉松', name_informal: '一口气50题，你是怎么做到的？', icon: '🏃', completed: false, progress: 32, target: 50 },
  { id: 5, name: '月度学习达人', name_informal: '一个月都来了？学霸上身了？', icon: '🌟', completed: false, progress: 12, target: 30 },
  { id: 6, name: '正确率90%', name_informal: '十题对九题，这波可以', icon: '🎖️', completed: true },
];

export default function Achievement() {
  const navigate = useNavigate();

  const completed = ACHIEVEMENTS.filter(a => a.completed);
  const inProgress = ACHIEVEMENTS.filter(a => !a.completed);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
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
}
