import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Segmented } from 'antd-mobile';
import { questionAPI } from '../services/api';

const STATUS_CONFIG = {
  unmastered: { label: '未掌握', color: '#ff4d4f', bg: '#fff2f0', emoji: '🔴' },
  learning: { label: '学习中', color: '#fa8c16', bg: '#fff7e6', emoji: '🟡' },
  mastered: { label: '已掌握', color: '#52c41a', bg: '#f6ffed', emoji: '🟢' },
};

export default function WrongQuestions() {
  const navigate = useNavigate();
  const [wrongList, setWrongList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadWrongQuestions();
  }, []);

  const loadWrongQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionAPI.getWrongQuestions({});
      if (data.length === 0) {
        setWrongList(getMockData());
      } else {
        setWrongList(data);
      }
    } catch (err) {
      setWrongList(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => [
    {
      id: 1,
      question_id: 1,
      status: 'unmastered',
      review_count: 2,
      wrong_reason: '计算失误',
      question: {
        id: 1,
        title: '已知二次函数 y = ax² + bx + c，当 x = 1 时，y = 3...',
        correct_answer: 'C',
      },
      user_answer: 'B',
    },
    {
      id: 2,
      question_id: 2,
      status: 'learning',
      review_count: 1,
      wrong_reason: '审题不清',
      question: {
        id: 2,
        title: '下列句子中，没有语病的一项是...',
        correct_answer: 'C',
      },
      user_answer: 'D',
    },
    {
      id: 3,
      question_id: 3,
      status: 'mastered',
      review_count: 5,
      wrong_reason: '知识点遗忘',
      question: {
        id: 3,
        title: '若 |x - 1| + (y + 2)² = 0，则 x + y = ?',
        correct_answer: 'A',
      },
      user_answer: 'B',
    },
  ];

  const filteredList = filterStatus === 'all'
    ? wrongList
    : wrongList.filter(item => item.status === filterStatus);

  const stats = {
    total: wrongList.length,
    unmastered: wrongList.filter(w => w.status === 'unmastered').length,
    learning: wrongList.filter(w => w.status === 'learning').length,
    mastered: wrongList.filter(w => w.status === 'mastered').length,
  };

  const handleStatusChange = async (wrongId, newStatus) => {
    try {
      await questionAPI.updateWrongStatus(wrongId, { status: newStatus });
      loadWrongQuestions();
    } catch (err) {
      // 乐观更新
      setWrongList(list =>
        list.map(item =>
          item.id === wrongId ? { ...item, status: newStatus } : item
        )
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部 */}
      <div style={{
        background: '#fff', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span onClick={() => navigate(-1)} style={{ fontSize: 20 }}>←</span>
        <span style={{ fontWeight: 600 }}>错题本</span>
        <span onClick={() => navigate('/practice')} style={{ color: '#1677ff', fontSize: 14 }}>去练习</span>
      </div>

      {/* 底部统计 */}
      <div style={{
        margin: 12, padding: 16, background: '#fff', borderRadius: 12,
        display: 'flex', justifyContent: 'space-around'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f' }}>{stats.unmastered}</div>
          <div style={{ fontSize: 12, color: '#666' }}>新增</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#fa8c16' }}>{stats.learning}</div>
          <div style={{ fontSize: 12, color: '#666' }}>学习中</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{stats.mastered}</div>
          <div style={{ fontSize: 12, color: '#666' }}>已掌握</div>
        </div>
      </div>

      {/* 筛选 */}
      <div style={{ padding: '0 12px 12px' }}>
        <Segmented
          value={filterStatus}
          onChange={(val) => setFilterStatus(val)}
          options={[
            { label: '全部', value: 'all' },
            { label: '🔴未掌握', value: 'unmastered' },
            { label: '🟡学习中', value: 'learning' },
            { label: '🟢已掌握', value: 'mastered' },
          ]}
          style={{ width: '100%' }}
        />
      </div>

      {/* 错题列表 */}
      <div style={{ padding: '0 12px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div>
        ) : filteredList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div>暂无错题，太棒了！</div>
          </div>
        ) : (
          filteredList.map((item) => {
            const config = STATUS_CONFIG[item.status];
            return (
              <div
                key={item.id}
                style={{ marginBottom: 12, padding: 16, background: '#fff', borderRadius: 12 }}
              >
                {/* 状态标签 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{
                    padding: '4px 10px', borderRadius: 12, fontSize: 12,
                    background: config.bg, color: config.color
                  }}>
                    {config.emoji} {config.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    复习 {item.review_count} 次
                  </div>
                </div>

                {/* 题目 */}
                <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                  {item.question.title}
                </div>

                {/* 答案对比 */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, padding: 10, background: '#fff2f0', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#ff4d4f', marginBottom: 2 }}>你的答案</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#ff4d4f' }}>{item.user_answer}</div>
                  </div>
                  <div style={{ flex: 1, padding: 10, background: '#f6ffed', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#52c41a', marginBottom: 2 }}>正确答案</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#52c41a' }}>{item.question.correct_answer}</div>
                  </div>
                </div>

                {/* 错因 */}
                {item.wrong_reason && (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                    错因：{item.wrong_reason}
                  </div>
                )}

                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {item.status !== 'mastered' && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'mastered')}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13,
                        border: '1px solid #52c41a', color: '#52c41a', background: '#fff'
                      }}
                    >
                      ✓ 已掌握
                    </button>
                  )}
                  {item.status === 'unmastered' && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'learning')}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13,
                        border: '1px solid #fa8c16', color: '#fa8c16', background: '#fff'
                      }}
                    >
                      🔄 学习中
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/analysis', { state: { questionId: item.question_id } })}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13,
                      border: 'none', background: '#1677ff', color: '#fff'
                    }}
                  >
                    查看解析
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
