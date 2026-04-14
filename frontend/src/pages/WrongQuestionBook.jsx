import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Dialog } from 'antd-mobile';
import { questionAPI } from '../services/api';

const STATUS_CONFIG = {
  unmastered: { label: '未掌握', color: '#ff4d4f', bg: '#fff2f0', icon: '🔴' },
  learning: { label: '学习中', color: '#fa8c16', bg: '#fff7e6', icon: '🟡' },
  mastered: { label: '已掌握', color: '#52c41a', bg: '#f6ffed', icon: '🟢' },
};

const MOCK_WRONG_QUESTIONS = [
  {
    id: 1,
    question_id: 101,
    user_answer: 'A',
    wrong_reason: '计算失误',
    status: 'unmastered',
    review_count: 0,
    created_at: '2024-04-10',
    question: {
      title: '已知二次函数 y = ax² + bx + c，当 x = 1 时，y = 3；当 x = 2 时，y = 5；当 x = 3 时，y = 9，求 a + b + c 的值。',
      correct_answer: 'C',
      options: { A: '1', B: '2', C: '3', D: '4' },
    },
  },
  {
    id: 2,
    question_id: 102,
    user_answer: 'B',
    wrong_reason: '审题不清',
    status: 'learning',
    review_count: 2,
    created_at: '2024-04-08',
    question: {
      title: '若 |x - 1| + (y + 2)² = 0，则 x + y = ?',
      correct_answer: 'A',
      options: { A: '-1', B: '1', C: '-3', D: '3' },
    },
  },
  {
    id: 3,
    question_id: 103,
    user_answer: 'D',
    wrong_reason: '知识点遗忘',
    status: 'mastered',
    review_count: 5,
    created_at: '2024-04-01',
    question: {
      title: '下列句子中，没有语病的一项是（）',
      correct_answer: 'C',
      options: { A: '通过这次活动，使我们增长了见识', B: '为了防止不再发生交通事故', C: '我们要继承和发扬艰苦奋斗的优良传统', D: '我们必须认真克服并随时发现自己的缺点' },
    },
  },
];

export default function WrongQuestionBook() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWrongQuestions();
  }, []);

  const loadWrongQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionAPI.getWrongQuestions({});
      setQuestions(data.length > 0 ? data : MOCK_WRONG_QUESTIONS);
    } catch (err) {
      setQuestions(MOCK_WRONG_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = activeTab === 'all'
    ? questions
    : questions.filter(q => q.status === activeTab);

  const stats = {
    total: questions.length,
    unmastered: questions.filter(q => q.status === 'unmastered').length,
    learning: questions.filter(q => q.status === 'learning').length,
    mastered: questions.filter(q => q.status === 'mastered').length,
  };

  const handlePractice = (q) => {
    navigate('/practice', { state: { questionId: q.question_id } });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await questionAPI.updateWrongStatus(id, { status: newStatus });
      setQuestions(questions.map(q => q.id === id ? { ...q, status: newStatus } : q));
    } catch (err) {
      // 乐观更新
      setQuestions(questions.map(q => q.id === id ? { ...q, status: newStatus } : q));
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
        <span style={{ fontSize: 20 }}>📝</span>
      </div>

      {/* 统计 */}
      <div style={{
        background: '#fff', margin: 12, borderRadius: 12, padding: 16,
        display: 'flex', justifyContent: 'space-around'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#1677ff' }}>{stats.total}</div>
          <div style={{ fontSize: 12, color: '#666' }}>错题总数</div>
        </div>
        <div style={{ width: 1, background: '#f0f0f0' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f' }}>{stats.unmastered}</div>
          <div style={{ fontSize: 12, color: '#666' }}>未掌握</div>
        </div>
        <div style={{ width: 1, background: '#f0f0f0' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{stats.mastered}</div>
          <div style={{ fontSize: 12, color: '#666' }}>已掌握</div>
        </div>
      </div>

      {/* 标签页 */}
      <div style={{
        background: '#fff', padding: '0 16px', display: 'flex',
        borderBottom: '1px solid #f0f0f0', overflowX: 'auto'
      }}>
        {[
          { key: 'all', label: '全部' },
          { key: 'unmastered', label: '🔴 未掌握' },
          { key: 'learning', label: '🟡 学习中' },
          { key: 'mastered', label: '🟢 已掌握' },
        ].map(tab => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 16px', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
              borderBottom: activeTab === tab.key ? '2px solid #1677ff' : '2px solid transparent',
              color: activeTab === tab.key ? '#1677ff' : '#666',
              fontWeight: activeTab === tab.key ? 600 : 400,
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* 错题列表 */}
      <div style={{ padding: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div>
        ) : filteredQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <div>暂无错题</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>太棒了，把错题都消灭了！</div>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const statusInfo = STATUS_CONFIG[q.status];
            return (
              <div
                key={q.id}
                style={{
                  background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
                  borderLeft: `4px solid ${statusInfo.color}`
                }}
              >
                {/* 状态标签 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 12, fontSize: 12,
                    background: statusInfo.bg, color: statusInfo.color
                  }}>
                    {statusInfo.icon} {statusInfo.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    复习 {q.review_count} 次
                  </div>
                </div>

                {/* 题目 */}
                <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                  {q.question.title}
                </div>

                {/* 答案对比 */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 13 }}>
                  <div style={{ color: '#ff4d4f' }}>
                    你的答案：{q.question.options[q.user_answer]}
                  </div>
                  <div style={{ color: '#52c41a' }}>
                    正确答案：{q.question.options[q.question.correct_answer]}
                  </div>
                </div>

                {/* 错因 */}
                {q.wrong_reason && (
                  <div style={{
                    padding: '8px 12px', background: '#fff7e6', borderRadius: 6,
                    fontSize: 12, color: '#fa8c16', marginBottom: 12
                  }}>
                    错因：{q.wrong_reason}
                  </div>
                )}

                {/* 操作 */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handlePractice(q)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 6, fontSize: 13,
                      background: '#1677ff', color: '#fff', border: 'none', fontWeight: 500
                    }}
                  >
                    立即练习
                  </button>
                  {q.status !== 'mastered' && (
                    <button
                      onClick={() => handleStatusChange(q.id, q.status === 'unmastered' ? 'learning' : 'mastered')}
                      style={{
                        padding: '10px 12px', borderRadius: 6, fontSize: 13,
                        background: '#f5f5f5', color: '#666', border: 'none'
                      }}
                    >
                      {q.status === 'unmastered' ? '学习中' : '已掌握'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
