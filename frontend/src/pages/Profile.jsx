import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部 */}
      <div style={{
        background: '#fff', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span onClick={() => navigate(-1)} style={{ fontSize: 20 }}>←</span>
        <span style={{ fontWeight: 600, fontSize: 18 }}>我的</span>
      </div>

      {/* 用户信息 */}
      <div style={{ background: '#fff', margin: 12, borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#e6f4ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
          }}>
            👤
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{user?.nickname || '同学'}</div>
            <div style={{ fontSize: 13, color: '#666' }}>手机号：{user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</div>
          </div>
        </div>
      </div>

      {/* 会员卡片 */}
      <div
        onClick={() => navigate('/membership')}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          margin: '0 12px 12px', borderRadius: 12, padding: 16,
          color: '#fff', cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>开通会员</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>解锁无限练习、学习报告等特权</div>
          </div>
          <div style={{
            padding: '6px 14px', background: 'rgba(255,255,255,0.2)',
            borderRadius: 20, fontSize: 13
          }}>
            立即开通 →
          </div>
        </div>
      </div>

      {/* 学习数据 */}
      <div style={{ background: '#fff', margin: '0 12px 12px', borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>学习数据</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: '学习天数', value: '45', unit: '天' },
            { label: '完成题数', value: '328', unit: '题' },
            { label: '正确率', value: '78', unit: '%' },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#1677ff' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 设置 */}
      <div style={{ background: '#fff', margin: '0 12px 12px', borderRadius: 12 }}>
        {[
          { label: '家长通知', value: '已绑定', icon: '👨‍👩‍👧', onClick: () => {} },
          { label: '护眼提醒', value: '45分钟', icon: '👁️', onClick: () => {} },
          { label: '账号设置', value: '', icon: '⚙️', onClick: () => {} },
        ].map((item, idx, arr) => (
          <div
            key={item.label}
            onClick={item.onClick}
            style={{
              padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: idx < arr.length - 1 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 15 }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#999', fontSize: 14 }}>
              {item.value}
              <span style={{ fontSize: 14 }}>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* 退出登录 */}
      <div style={{ padding: '0 12px' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 8,
            background: '#fff', color: '#ff4d4f', fontSize: 15,
            border: '1px solid #ff4d4f'
          }}
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
