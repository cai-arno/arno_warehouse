import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('🎬 短视频工厂'),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => Navigator.pushNamed(context, '/scripts'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // 刷新数据
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 快捷入口
            _SectionTitle(title: '快捷入口'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _QuickActionCard(
                  icon: Icons.article,
                  title: '生成脚本',
                  color: const Color(0xFF6C5CE7),
                  onTap: () {},
                )),
                const SizedBox(width: 12),
                Expanded(child: _QuickActionCard(
                  icon: Icons.video_call,
                  title: '视频剪辑',
                  color: const Color(0xFF00B894),
                  onTap: () {},
                )),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _QuickActionCard(
                  icon: Icons.cloud,
                  title: '素材中心',
                  color: const Color(0xFFE17055),
                  onTap: () {},
                )),
                const SizedBox(width: 12),
                Expanded(child: _QuickActionCard(
                  icon: Icons.send,
                  title: '发布管理',
                  color: const Color(0xFF0984E3),
                  onTap: () {},
                )),
              ],
            ),

            const SizedBox(height: 24),

            // 统计卡片
            _SectionTitle(title: '数据概览'),
            const SizedBox(height: 12),
            FutureBuilder<Map<String, dynamic>>(
              future: api.getAnalyticsOverview(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final data = snapshot.data!;
                return Column(
                  children: [
                    Row(
                      children: [
                        Expanded(child: _StatCard(title: '脚本', value: '${data['scripts']?['total'] ?? 0}', subtitle: '已完成 ${data['scripts']?['completed'] ?? 0}')),
                        const SizedBox(width: 12),
                        Expanded(child: _StatCard(title: '视频', value: '${data['videos']?['total'] ?? 0}', subtitle: '已完成 ${data['videos']?['completed'] ?? 0}')),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _StatCard(title: '发布', value: '${data['publishing']?['total'] ?? 0}', subtitle: '已发布 ${data['publishing']?['published'] ?? 0}'),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold));
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.title,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(icon, size: 32, color: color),
              const SizedBox(height: 8),
              Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;

  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
