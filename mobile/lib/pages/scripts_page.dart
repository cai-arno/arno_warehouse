import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class ScriptsPage extends StatefulWidget {
  const ScriptsPage({super.key});

  @override
  State<ScriptsPage> createState() => _ScriptsPageState();
}

class _ScriptsPageState extends State<ScriptsPage> {
  final _topicController = TextEditingController();
  String _selectedType = 'product_showcase';

  final _scriptTypes = {
    'product_showcase': '产品展示',
    'tutorial': '教程讲解',
    'story': '故事叙述',
    'review': '测评种草',
    'lifestyle': '生活场景',
  };

  @override
  void dispose() {
    _topicController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('脚本管理'),
      ),
      body: Column(
        children: [
          // 生成表单
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('AI 生成脚本', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _topicController,
                    decoration: const InputDecoration(
                      labelText: '主题',
                      hintText: '例如：夏季护肤小技巧',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _selectedType,
                    decoration: const InputDecoration(labelText: '视频类型', border: OutlineInputBorder()),
                    items: _scriptTypes.entries
                        .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                        .toList(),
                    onChanged: (v) => setState(() => _selectedType = v!),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () async {
                      if (_topicController.text.isEmpty) return;
                      try {
                        await api.generateScript(
                          topic: _topicController.text,
                          scriptType: _selectedType,
                        );
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('脚本生成中...')),
                          );
                          _topicController.clear();
                        }
                      } catch (e) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('生成失败: $e')),
                          );
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6C5CE7),
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('开始生成'),
                  ),
                ],
              ),
            ),
          ),

          // 脚本列表
          Expanded(
            child: FutureBuilder(
              future: api.getScripts(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                final scripts = snapshot.data ?? [];
                if (scripts.isEmpty) {
                  return const Center(child: Text('暂无脚本'));
                }
                return ListView.builder(
                  itemCount: scripts.length,
                  itemBuilder: (context, index) {
                    final script = scripts[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: ListTile(
                        title: Text(script['title'] ?? '无标题'),
                        subtitle: Text(
                          script['hook'] ?? '',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: Chip(
                          label: Text(
                            script['status'] == 'completed' ? '已完成' : '生成中',
                            style: const TextStyle(fontSize: 12),
                          ),
                          backgroundColor: script['status'] == 'completed'
                              ? Colors.green[100]
                              : Colors.orange[100],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
