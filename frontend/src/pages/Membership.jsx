import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Toast } from 'antd-mobile';

const PLANS = [
  {
    id: 'monthly',
    name: '月度会员',
    price: '¥39',
    period: '/月',
    features: [
      '每日500题练习额度',
      '无限收藏题目',
      '学习报告查看',
      '能力诊断',
    ],
    unavailable: ['团队协作', '专属客服'],
    highlight: false,
  },
  {
    id: 'quarterly',
    name: '季度会员',
    price: '¥99',
    period: '/季度',
    badge: '推荐',
    features: [
      '每日1000题练习额度',
      '无限收藏题目',
      '学习报告查看',
      '能力诊断',
      '无限错题本',
    ],
    unavailable: ['团队协作'],
    highlight: true,
  },
  {
    id: 'yearly',
    name: '年度会员',
    price: '¥299',
    period: '/年',
    badge: '超值',
    features: [
      '无限练习额度',
      '无限收藏题目',
      '学习报告查看',
      '能力诊断',
      '无限错题本',
      '优先名师点评',
    ],
    unavailable: [],
    highlight: false,
  },
];

const FAQS = [
  { q: '30天退款保障怎么申请？', a: '购买后30天内，如对服务不满意，可联系客服申请全额退款。我们承诺：只要不满意，无理由退款。' },
  { q: '会员可以多设备使用吗？', a: '同一账号最多绑定2台设备，方便手机和平板同步学习数据。' },
  { q: '学生没有支付能力怎么办？', a: '家长可以绑定学生账号代为购买，操作路径：家长端→购买会员→绑定学生。' },
  { q: '免费版有哪些限制？', a: '免费版每日5题练习，查看简单解析，无学习报告和能力诊断。' },
];

export default function Membership() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handlePurchase = () => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    Dialog.confirm({
      title: '确认购买',
      content: `确定购买 ${plan.name}（${plan.price}）？\n\n购买后即刻生效，30天内不满意可无理由退款。`,
      confirmText: '确认购买',
      cancelText: '再想想',
      onConfirm: () => {
        Toast.show({ content: '购买成功！会员已激活', icon: 'success' });
        navigate('/home');
      },
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 80 }}>
      {/* 顶部 */}
      <div style={{
        background: '#fff', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span onClick={() => navigate(-1)} style={{ fontSize: 20 }}>←</span>
        <span style={{ fontWeight: 600, fontSize: 18 }}>开通会员</span>
      </div>

      {/* 未成年退款保障 */}
      <div style={{
        margin: 12, padding: '12px 16px', background: '#f6ffed',
        borderRadius: 12, border: '1px solid #b7eb8f', display: 'flex', alignItems: 'center', gap: 10
      }}>
        <span style={{ fontSize: 24 }}>🛡️</span>
        <div>
          <div style={{ fontWeight: 600, color: '#52c41a', fontSize: 14 }}>未成年人30天退款保障</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>购买后30天内不满意，无理由退款</div>
        </div>
      </div>

      {/* 会员方案 */}
      <div style={{ padding: '0 12px' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>选择方案</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                background: '#fff', borderRadius: 12, padding: 16,
                border: `2px solid ${selectedPlan === plan.id ? '#1677ff' : 'transparent'}`,
                position: 'relative', cursor: 'pointer',
                boxShadow: selectedPlan === plan.id ? '0 2px 8px rgba(22,119,255,0.15)' : 'none',
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -8, right: 12,
                  padding: '2px 8px', background: plan.highlight ? '#1677ff' : '#fa8c16',
                  color: '#fff', fontSize: 11, borderRadius: 8, fontWeight: 600
                }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 600 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: '#999' }}>{plan.period}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ fontSize: 12, color: '#52c41a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>✓</span> {f}
                  </div>
                ))}
                {plan.unavailable.map((f) => (
                  <div key={f} style={{ fontSize: 12, color: '#ccc', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>✗</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 特权说明 */}
      <div style={{ margin: '16px 12px', background: '#fff', borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>会员特权说明</div>
        {[
          { icon: '📊', title: '学习报告', desc: '周报/月报，详细分析知识点掌握情况' },
          { icon: '🧠', title: '能力诊断', desc: '五维能力图谱，精准定位提升方向' },
          { icon: '📚', title: '无限错题本', desc: '不再受限，错题是提分宝库' },
          { icon: '👨‍🏫', title: '名师点评', desc: '核心高频题有名师详细点评' },
        ].map((item) => (
          <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ margin: '0 12px' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>常见问题</div>
        {FAQS.map((faq, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
            <div
              onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              style={{
                padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>{faq.q}</span>
              <span style={{ color: '#999', transition: 'transform 0.2s', transform: expandedFaq === idx ? 'rotate(180deg)' : 'none' }}>▼</span>
            </div>
            {expandedFaq === idx && (
              <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#666', lineHeight: 1.7 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 底部购买按钮 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16,
        background: '#fff', borderTop: '1px solid #f0f0f0'
      }}>
        <button
          onClick={handlePurchase}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 8,
            background: '#1677ff', color: '#fff', fontSize: 16, fontWeight: 600, border: 'none'
          }}
        >
          立即开通 · {PLANS.find(p => p.id === selectedPlan)?.price}
        </button>
      </div>
    </div>
  );
}
