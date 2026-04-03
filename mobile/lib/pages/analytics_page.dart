import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class AnalyticsPage extends StatelessWidget {
  const AnalyticsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiService>();

    return Scaffold(
      appBar: AppBar(title: const Text('数据看板')),
      body: RefreshIndicator(
        onRefresh: () async {},
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 核心指标
            FutureBuilder<Map<String, dynamic>>(
              future: api.getAnalyticsOverview(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final data = snapshot.data!;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const _SectionTitle('数据概览'),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: _MetricCard(
                          title: '脚本',
                          value: '${data['scripts']?['total'] ?? 0}',
                          subtitle: '已完成 ${data['scripts']?['completed'] ?? 0}',
                          color: const Color(0xFF6C5CE7),
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: _MetricCard(
                          title: '视频',
                          value: '${data['videos']?['total'] ?? 0}',
                          subtitle: '已完成 ${data['videos']?['completed'] ?? 0}',
                          color: const Color(0xFF00B894),
                        )),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _MetricCard(
                      title: '发布',
                      value: '${data['publishing']?['total'] ?? 0}',
                      subtitle: '已发布 ${data['publishing']?['published'] ?? 0}',
                      color: const Color(0xFF0984E3),
                    ),
                  ],
                );
              },
            ),

            const SizedBox(height: 24),

            // 平台分布
            const _SectionTitle('各平台发布量'),
            const SizedBox(height: 12),
            FutureBuilder<Map<String, dynamic>>(
              future: api.getPlatformStats(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final platforms = snapshot.data!['platforms'] ?? [];
                if (platforms.isEmpty) {
                  return const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('暂无数据')));
                }
                return Column(
                  children: [
                    for (final p in platforms)
                      Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: _platformColor(p['platform'] ?? ''),
                            child: Text(
                              (p['platform'] ?? '').substring(0, 1).toUpperCase(),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                          title: Text(p['platform'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('总计 ${p['total'] ?? 0} | 已发布 ${p['published'] ?? 0}'),
                          trailing: Text(
                            '${p['published'] ?? 0}',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: _platformColor(p['platform'] ?? ''),
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Color _platformColor(String platform) {
    return {
      'douyin': const Color(0xFFFE2C55),
      'kuaishou': const Color(0xFFFF4906),
      'wechat': const Color(0xFF07C160),
      'xigua': const Color(0xFFFF6E14),
      'bilibili': const Color(0xFFFB7299),
    }[platform] ?? Colors.grey;
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold));
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final Color color;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.color,
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
            Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color)),
            Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
