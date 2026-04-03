import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class VideosPage extends StatelessWidget {
  const VideosPage({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiService>();

    return Scaffold(
      appBar: AppBar(title: const Text('视频剪辑')),
      body: FutureBuilder(
        future: api.getVideos(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final videos = snapshot.data ?? [];
          if (videos.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.video_off, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('暂无视频', style: TextStyle(color: Colors.grey)),
                  Text('先生成脚本再创建视频', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: videos.length,
            itemBuilder: (context, index) {
              final video = videos[index];
              final status = video['status'] ?? 'pending';
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 缩略图
                    Container(
                      height: 160,
                      width: double.infinity,
                      color: Colors.grey[200],
                      child: const Icon(Icons.play_circle_outline, size: 48, color: Colors.grey),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  video['title'] ?? '无标题',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              _StatusChip(status: status),
                            ],
                          ),
                          const SizedBox(height: 8),
                          if (status == 'rendering')
                            LinearProgressIndicator(value: (video['progress'] ?? 0) / 100),
                          const SizedBox(height: 4),
                          Text(
                            '时长: ${video['duration'] ?? 0}s | 尺寸: ${video['width'] ?? 1080}x${video['height'] ?? 1920}',
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          if (status == 'pending')
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: ElevatedButton(
                                onPressed: () => api.renderVideo(video['id']),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF6C5CE7),
                                  foregroundColor: Colors.white,
                                ),
                                child: const Text('开始渲染'),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final config = {
      'pending': (Colors.grey, '待处理'),
      'rendering': (Colors.blue, '渲染中'),
      'completed': (Colors.green, '已完成'),
      'failed': (Colors.red, '失败'),
    };
    final (color, text) = config[status] ?? (Colors.grey, status);
    return Chip(
      label: Text(text, style: const TextStyle(fontSize: 12, color: Colors.white)),
      backgroundColor: color,
      padding: EdgeInsets.zero,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
