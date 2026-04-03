import 'package:flutter/material.dart';

class PublishingPage extends StatelessWidget {
  const PublishingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('发布管理')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.send_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('发布管理', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('多平台定时发布', style: TextStyle(color: Colors.grey)),
            SizedBox(height: 4),
            Text('抖音 / 快手 / 视频号 / 西瓜 / B站', style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
