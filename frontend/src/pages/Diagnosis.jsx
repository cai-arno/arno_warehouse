import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DIMENSIONS = [
  { code: 'knowledge_extraction', name: '知识提取力', score: 72, icon: '💡', desc: '从题目中提取关键信息和知识点的能力', suggestion: '多做归纳总结题，培养快速定位关键词的习惯' },
  { code: 'logical_analysis', name: '逻辑分析力', score: 85, icon: '🧠', desc: '分析问题、梳理逻辑链条的能力', suggestion: '你的强项！继续保持，多挑战压轴题' },
  { code: 'memory_retention', name: '记忆保持力', score: 58, icon: '📝', desc: '长期记忆和灵活调取知识的能力', suggestion: '建议用错题本反复巩固，同类题做3遍以上' },
  { code: 'exam_pressure', name: '应试抗压力', score: 65, icon: '🛡️', desc: '在考试压力下保持稳定发挥的能力', suggestion: '平时练习限定时间，适应高压环境' },
  { code: 'metacognition', name: '元认知力', score: 70, icon: '🎯', desc: '对自身学习状态和方法的认知调节能力', suggestion: '养成考后复盘习惯，分析失分原因而不是只关注分数' },
];

export default function Diagnosis() {
  const navigate = useNavigate();

  const overallScore = Math.round(DIMENSIONS.reduce((sum, d) => sum + d.score * (d.code === 'logical_analysis' ? 1.2 : 1), 0) / DIMENSIONS.reduce((sum, d) => sum + (d.code === 'logical_analysis' ? 1.2 : 1), 0));

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部 */}
      <div style={{
        background: '#fff', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span onClick={() => navigate(-1)} style={{ fontSize: 20 }}>←</span>
        <span style={{ fontWeight: 600 }}>能力诊断</span>
        <span style={{ fontSize: 20 }}>🔬</span>
      </div>

      {/* 雷达图占位 */}
      <div style={{ background: '#fff', margin: 12, borderRadius: 12, padding: 20, textAlign: 'center' }}>
        <div style={{
          width: 180, height: 180, margin: '0 auto 16px', borderRadius: '50%',
          background: 'conic-gradient(#1677ff 0deg 120deg, #52c41a 120deg 200deg, #fa8c16 200deg 280deg, #722ed1 280deg 360deg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%', background: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1677ff' }}>{overallScore}</div>
            <div style={{ fontSize: 11, color: '#999' }}>综合得分</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#666' }}>五维能力雷达图</div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>最近一次诊断：2024-04-10</div>
      </div>

      {/* 能力说明 */}
      <div style={{ margin: '0 12px' }}>
        <div style={{ fontWeight: 600, marginBottom: 12, padding: '0 4px' }}>能力详情</div>
        {DIMENSIONS.map((dim) => (
          <div key={dim.code} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 24 }}>{dim.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{dim.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{dim.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: dim.score >= 80 ? '#52c41a' : dim.score >= 60 ? '#fa8c16' : '#ff4d4f' }}>{dim.score}</div>
                <div style={{ fontSize: 10, color: '#999' }}>分值</div>
              </div>
            </div>
            <div style={{
              padding: '8px 12px', background: '#f5f5f5', borderRadius: 6,
              fontSize: 12, color: '#666', lineHeight: 1.6
            }}>
              💬 {dim.suggestion}
            </div>
          </div>
        ))}
      </div>

      {/* 差异化定位说明 */}
      <div style={{
        margin: '12px 12px 20px', padding: 16, background: '#e6f4ff',
        borderRadius: 12, border: '1px solid #91caff'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#1677ff' }}>🔬 这就是伴学网的不同</div>
        <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}>
          普通题库只告诉你「答对/答错」，伴学网告诉你「为什么对/为什么错」，以及你的思维哪里有盲区。能力诊断让我们能针对性训练，而不是盲目刷题。
        </div>
      </div>
    </div>
  );
}
