import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toast } from 'antd-mobile';

const MOCK_QUESTION = {
  id: 1,
  title: '已知二次函数 y = ax² + bx + c，当 x = 1 时，y = 3；当 x = 2 时，y = 5；当 x = 3 时，y = 9，求 a + b + c 的值。',
  options: { A: '1', B: '2', C: '3', D: '4' },
  correct_answer: 'C',
  analysis: '将三组条件代入函数得：\n① a + b + c = 3\n② 4a + 2b + c = 5\n③ 9a + 3b + c = 9\n\n由②-①得：3a + b = 2\n由③-②得：5a + b = 4\n\n解得：a = 1, b = -1, c = 3\n所以 a + b + c = 1 - 1 + 3 = 3\n\n答案为 C。',
  teacher_comment: '这道题是典型的代入法求系数，很多同学看到三个条件就慌了。其实一步一步来，把每个条件写成方程，然后两两相减消元，思路就很清晰了。记住：看到"当x=..."就老老实实代进去，这是基本功。',
  comment_author: '张老师团队',
  wrong_reason_tags: ['计算失误', '审题不清', '知识点遗忘', '思路跑偏'],
  similar_questions: [
    { id: 101, title: '已知一次函数 y = kx + b，经过点(1,2)和(3,4)，求 k+b', difficulty: 2 },
    { id: 102, title: '二次函数过三点(0,1)、(1,3)、(2,7)，求解析式', difficulty: 3 },
  ],
};

export default function AnswerAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedReason, setSelectedReason] = useState(null);
  const [similarQuestions] = useState(MOCK_QUESTION.similar_questions);

  const question = MOCK_QUESTION;
  const questionId = location.state?.questionId;

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    Toast.show({
      content: `已选择：${reason}`,
      icon: 'success',
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 80 }}>
      {/* 顶部 */}
      <div style={{
        background: '#fff', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span onClick={() => navigate(-1)} style={{ fontSize: 20 }}>←</span>
        <span style={{ fontWeight: 600 }}>答案解析</span>
        <span style={{ color: '#52c41a', fontSize: 13 }}>✓ 已掌握</span>
      </div>

      {/* 题目结果 */}
      <div style={{ padding: 16 }}>
        {/* 正确与否标识 */}
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 16,
          background: '#f6ffed', border: '1px solid #b7eb8f',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <span style={{ color: '#52c41a', fontWeight: 600 }}>回答正确</span>
        </div>

        {/* 题目 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            {question.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(question.options).map(([key, value]) => (
              <div
                key={key}
                style={{
                  padding: '10px 14px', borderRadius: 6, fontSize: 14,
                  background: key === question.correct_answer ? '#f6ffed' : '#f5f5f5',
                  border: key === question.correct_answer ? '1px solid #b7eb8f' : '1px solid transparent',
                  color: key === question.correct_answer ? '#52c41a' : '#666',
                }}
              >
                <span style={{ fontWeight: 600, marginRight: 8 }}>{key}.</span>
                {value}
                {key === question.correct_answer && <span style={{ marginLeft: 8 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* 标准解析 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📖</span> 标准解析
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>
            {question.analysis}
          </div>
        </div>

        {/* 名师点评 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
          border: '1px solid #667eea33', borderRadius: 12, padding: 16, marginBottom: 12
        }}>
          <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>👨‍🏫</span> 名师点评
            <span style={{ fontSize: 11, color: '#667eea', marginLeft: 6 }}>
              {question.comment_author}
            </span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: '#444' }}>
            {question.teacher_comment}
          </div>
        </div>

        {/* 错因分析（答错时显示） */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔍</span> 错因分析
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {question.wrong_reason_tags.map((tag) => (
              <div
                key={tag}
                onClick={() => handleReasonSelect(tag)}
                style={{
                  padding: '8px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  background: selectedReason === tag ? '#1677ff' : '#f5f5f5',
                  color: selectedReason === tag ? '#fff' : '#666',
                  border: selectedReason === tag ? '1px solid #1677ff' : '1px solid #f0f0f0',
                }}
              >
                {selectedReason === tag ? '✓ ' : ''}{tag}
              </div>
            ))}
          </div>
        </div>

        {/* 同类题推荐 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📚</span> 同类题推荐
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {similarQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => navigate('/practice', { state: { questionId: q.id } })}
                style={{
                  padding: '12px 14px', borderRadius: 8, background: '#fafafa',
                  border: '1px solid #f0f0f0', cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 14, marginBottom: 6 }}>{q.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
                  <span>难度：{'⭐'.repeat(q.difficulty)}</span>
                  <span style={{ color: '#1677ff' }}>立即练习 →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16,
        background: '#fff', borderTop: '1px solid #f0f0f0'
      }}>
        <button
          onClick={() => navigate('/practice')}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 8,
            background: '#1677ff', color: '#fff', fontSize: 16, fontWeight: 600, border: 'none'
          }}
        >
          继续练习
        </button>
      </div>
    </div>
  );
}
