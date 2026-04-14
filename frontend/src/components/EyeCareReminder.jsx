import { useState, useEffect } from 'react';
import { Dialog, Toast } from 'antd-mobile';

export default function EyeCareReminder({ enabled = true, intervalMinutes = 45, onRemind, onExtend }) {
  const [showReminder, setShowReminder] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    // 每45分钟弹出一次
    const remindAt = Date.now() + intervalMinutes * 60 * 1000;
    const timer = setTimeout(() => {
      setShowReminder(true);
      setSecondsLeft(300); // 5分钟倒计时
      onRemind?.();
    }, intervalMinutes * 60 * 1000);

    return () => clearTimeout(timer);
  }, [enabled, intervalMinutes]);

  useEffect(() => {
    if (!showReminder || secondsLeft <= 0) return;

    const countdown = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [showReminder]);

  const handleExtend = () => {
    setShowReminder(false);
    onExtend?.();
    Toast.show({ content: '已延长5分钟', icon: 'success' });
  };

  const handleRest = () => {
    setShowReminder(false);
    Toast.show({ content: '休息一下，眼睛也需要放松哦！' });
  };

  if (!showReminder) return null;

  return (
    <Dialog
      visible={showReminder}
      title={null}
      content={null}
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>👀</div>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>该休息一下啦</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 1.6 }}>
          你已经学习了{intervalMinutes}分钟了<br />
          保护眼睛，远眺5分钟再继续吧
        </div>
        <div style={{
          padding: '10px 16px', background: '#fff7e6', borderRadius: 8,
          fontSize: 13, color: '#fa8c16', marginBottom: 16
        }}>
          ⏰ {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')} 后自动关闭
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleRest}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 8,
              background: '#fff', color: '#1677ff', fontSize: 15,
              border: '1px solid #1677ff', fontWeight: 500
            }}
          >
            休息一下
          </button>
          <button
            onClick={handleExtend}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 8,
              background: '#f5f5f5', color: '#666', fontSize: 15,
              border: 'none'
            }}
          >
            再学5分钟
          </button>
        </div>
      </div>
    </Dialog>
  );
}
