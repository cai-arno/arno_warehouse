import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toast, Dialog } from 'antd-mobile';
import { questionAPI } from '../services/api';

const DIFFICULTY_STARS = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
const SOURCE_LABELS = { '中考': '中考', '高考': '高考', '模拟': '模拟卷', '原创': '原创' };

export default function QuestionPractice() {
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ source: null, difficulty: null });

  useEffect(() => {
    loadQuestions();
  }, [location.state?.subjectId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionAPI.getQuestions(location.state?.subjectId ? { subject_id: location.state.subjectId } : {});
      if (data.length === 0) {
        // 模拟数据用于演示
        setQuestions(getMockQuestions());
      } else {
        setQuestions(data);
      }
    } catch (err) {
      setQuestions(getMockQuestions());
    } finally {
      setLoading(false);
    }
  };

  const getMockQuestions = () => [
    {
      id: 1,
      title: '已知二次函数 y = ax² + bx + c，当 x = 1 时，y = 3；当 x = 2 时，y = 5；当 x = 3 时，y = 9，求 a + b + c 的值。',
      options: { A: '1', B: '2', C: '3', D: '4' },
      difficulty: 3,
      source: '中考',
      source_year: '2023 浙江',
    },
    {
      id: 2,
      title: '下列句子中，没有语病的一项是（）',
      options: { A: '通过这次活动，使我们增长了见识', B: '为了防止不再发生交通事故', C: '我们要继承和发扬艰苦奋斗的优良传统', D: '我们必须认真克服并随时发现自己的缺点' },
      difficulty: 2,
      source: '模拟',
      source_year: '2024 北京',
    },
    {
      id: 3,
      title: '若 |x - 1| + (y + 2)² = 0，则 x + y = ?',
      options: { A: '-1', B: '1', C: '-3', D: '3' },
      difficulty: 2,
      source: '中考',
      source_year: '2022 广东',
    },
  ];

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    if (!selectedAnswer) {
      Toast.show('请选择一个答案');
      return;
    }
    setSubmitted(true);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      // 提交答案到后端
      if (selectedAnswer) {
        try {
          await questionAPI.submitAnswer({
            question_id: currentQuestion.id,
            user_answer: selectedAnswer,
            time_spent: 30,
          });
        } catch (err) {}
      }
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    } else {
      Dialog.alert({
        content: '恭喜完成本次练习！',
        confirmText: '查看结果',
        onConfirm: () => navigate('/analysis', { state: { questionId: questions[0].id } }),
      });
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>加载中...</div>;
  }

  if (!currentQuestion) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无题目</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部 */}
      <div style={{
        background: '#fff', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span onClick={() => navigate(-1)} style={{ fontSize: 20 }}>←</span>
        <span style={{ fontWeight: 600 }}>题库练习</span>
        <span style={{ color: '#999', fontSize: 14 }}>{currentIndex + 1}/{questions.length}</span>
      </div>

      {/* 筛选栏 */}
      <div style={{
        background: '#fff', padding: '12px 16px',
        display: 'flex', gap: 8, overflowX: 'auto'
      }}>
        {['全部', '中考', '高考', '模拟', '原创'].map((s) => (
          <div
            key={s}
            onClick={() => setFilters({ ...filters, source: s === '全部' ? null : s })}
            style={{
              padding: '6px 12px', borderRadius: 16, fontSize: 12, whiteSpace: 'nowrap',
              background: (filters.source === s || (s === '全部' && !filters.source)) ? '#1677ff' : '#f5f5f5',
              color: (filters.source === s || (s === '全部' && !filters.source)) ? '#fff' : '#666',
            }}
          >
            {s}
          </div>
        ))}
      </div>

      {/* 题目 */}
      <div style={{ padding: '16px' }}>
        {/* 题目标题 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 11,
              background: currentQuestion.source === '中考' ? '#e6f4ff' : '#f5f5f5',
              color: currentQuestion.source === '中考' ? '#1677ff' : '#666',
            }}>
              {SOURCE_LABELS[currentQuestion.source] || currentQuestion.source} · {currentQuestion.source_year}
            </span>
            <span style={{ fontSize: 12, color: '#fa8c16' }}>
              {DIFFICULTY_STARS[currentQuestion.difficulty]}
            </span>
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>
            {currentQuestion.title}
          </div>
        </div>

        {/* 选项 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(currentQuestion.options).map(([key, value]) => {
            let style = {
              padding: '14px 16px', borderRadius: 8, fontSize: 15,
              border: '2px solid #f0f0f0', cursor: 'pointer',
              transition: 'all 0.2s',
            };
            let bgColor = '#fff';

            if (submitted) {
              if (key === currentQuestion.correct_answer) {
                bgColor = '#f6ffed';
                style.borderColor = '#52c41a';
                style.background = '#f6ffed';
              } else if (key === selectedAnswer && key !== currentQuestion.correct_answer) {
                bgColor = '#fff2f0';
                style.borderColor = '#ff4d4f';
                style.background = '#fff2f0';
              }
            } else if (selectedAnswer === key) {
              style.borderColor = '#1677ff';
              style.background = '#e6f4ff';
            }

            return (
              <div
                key={key}
                onClick={() => !submitted && setSelectedAnswer(key)}
                style={{ ...style, background: bgColor }}
              >
                <span style={{
                  display: 'inline-block', width: 24, height: 24, lineHeight: '24px',
                  textAlign: 'center', borderRadius: '50%', marginRight: 12,
                  background: selectedAnswer === key ? '#1677ff' : '#f5f5f5',
                  color: selectedAnswer === key ? '#fff' : '#666',
                  fontSize: 13, fontWeight: 600,
                }}>
                  {key}
                </span>
                {value}
              </div>
            );
          })}
        </div>

        {/* 操作栏 */}
        {submitted && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff', borderRadius: 8, display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: '#666', cursor: 'pointer' }}>
              🤍 收藏
            </div>
            <div style={{ width: 1, background: '#f0f0f0' }} />
            <div
              onClick={() => navigate('/analysis', { state: { questionId: currentQuestion.id } })}
              style={{ flex: 1, textAlign: 'center', fontSize: 13, color: '#1677ff', cursor: 'pointer' }}
            >
              查看解析
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16,
        background: '#fff', borderTop: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            {submitted ? (
              <button
                onClick={handleNext}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 8,
                  background: '#1677ff', color: '#fff', fontSize: 16, fontWeight: 600,
                  border: 'none'
                }}
              >
                {currentIndex < questions.length - 1 ? '下一题' : '完成'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 8,
                  background: selectedAnswer ? '#1677ff' : '#ccc',
                  color: '#fff', fontSize: 16, fontWeight: 600, border: 'none'
                }}
              >
                提交答案
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
