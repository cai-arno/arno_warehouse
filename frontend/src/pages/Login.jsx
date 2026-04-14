import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [userType, setUserType] = useState('student');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!phone || !password) {
      Toast.show('请填写手机号和密码');
      return;
    }
    if (isRegister && !nickname) {
      Toast.show('请填写昵称');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register({ phone, password, nickname, user_type: userType });
        Toast.show('注册成功');
      } else {
        await login(phone, password);
        Toast.show('登录成功');
      }
      navigate('/home');
    } catch (err) {
      Toast.show(err.response?.data?.detail || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, color: '#1a1a1a', marginBottom: 8 }}>伴学网</h1>
        <p style={{ color: '#666', fontSize: 14 }}>你的视频生产线</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
        {/* 身份切换 */}
        {isRegister && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>我是</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div
                onClick={() => setUserType('student')}
                style={{
                  flex: 1, padding: '10px 0', textAlign: 'center',
                  borderRadius: 8, border: `2px solid ${userType === 'student' ? '#1677ff' : '#eee'}`,
                  color: userType === 'student' ? '#1677ff' : '#666',
                  fontWeight: userType === 'student' ? 600 : 400,
                }}
              >
                学生
              </div>
              <div
                onClick={() => setUserType('parent')}
                style={{
                  flex: 1, padding: '10px 0', textAlign: 'center',
                  borderRadius: 8, border: `2px solid ${userType === 'parent' ? '#1677ff' : '#eee'}`,
                  color: userType === 'parent' ? '#1677ff' : '#666',
                  fontWeight: userType === 'parent' ? 600 : 400,
                }}
              >
                家长
              </div>
            </div>
          </div>
        )}

        {isRegister && (
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8,
                border: '1px solid #eee', fontSize: 16, boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <input
            type="tel"
            placeholder="手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              border: '1px solid #eee', fontSize: 16, boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              border: '1px solid #eee', fontSize: 16, boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 8,
            background: '#1677ff', color: '#fff', fontSize: 16,
            border: 'none', fontWeight: 600,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '处理中...' : isRegister ? '注册' : '登录'}
        </button>

        <div
          onClick={() => setIsRegister(!isRegister)}
          style={{ textAlign: 'center', marginTop: 16, color: '#1677ff', fontSize: 14 }}
        >
          {isRegister ? '已有账号？登录' : '没有账号？注册'}
        </div>
      </div>
    </div>
  );
}
