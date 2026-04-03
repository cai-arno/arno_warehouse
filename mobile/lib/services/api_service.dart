import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class ApiService extends ChangeNotifier {
  late final Dio _dio;

  // TODO: 配置实际 API 地址
  static const _baseUrl = 'http://localhost:8000/api/v1';

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
    ));
  }

  // ============ Scripts ============
  Future<List<dynamic>> getScripts({int page = 1, int pageSize = 20}) async {
    final resp = await _dio.get('/scripts', queryParameters: {'page': page, 'page_size': pageSize});
    return resp.data['data']['items'] ?? [];
  }

  Future<Map<String, dynamic>> generateScript({
    required String topic,
    required String scriptType,
    int quantity = 1,
    String? style,
  }) async {
    final resp = await _dio.post('/scripts/generate', data: {
      'topic': topic,
      'script_type': scriptType,
      'quantity': quantity,
      if (style != null) 'style': style,
    });
    return resp.data['data'];
  }

  Future<void> deleteScript(int id) async {
    await _dio.delete('/scripts/$id');
  }

  // ============ Videos ============
  Future<List<dynamic>> getVideos({int page = 1, int pageSize = 20}) async {
    final resp = await _dio.get('/videos', queryParameters: {'page': page, 'page_size': pageSize});
    return resp.data['data']['items'] ?? [];
  }

  Future<Map<String, dynamic>> createVideo({required int scriptId, int? templateId}) async {
    final resp = await _dio.post('/videos', data: {
      'script_id': scriptId,
      if (templateId != null) 'template_id': templateId,
    });
    return resp.data['data'];
  }

  Future<void> renderVideo(int videoId) async {
    await _dio.post('/videos/render', data: {'video_id': videoId});
  }

  // ============ Analytics ============
  Future<Map<String, dynamic>> getAnalyticsOverview() async {
    final resp = await _dio.get('/analytics/overview');
    return resp.data['data'];
  }

  Future<List<dynamic>> getAnalyticsTrends({int days = 7}) async {
    final resp = await _dio.get('/analytics/trends', queryParameters: {'days': days});
    return resp.data['data']['scripts'] ?? [];
  }

  Future<Map<String, dynamic>> getPlatformStats() async {
    final resp = await _dio.get('/analytics/platforms');
    return resp.data['data'];
  }
}
