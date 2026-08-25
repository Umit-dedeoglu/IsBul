import 'api_client.dart';
import '../models/expert_model.dart';

class ExpertService {
  Future<List<ExpertModel>> getExperts({
    String? city,
    String? category,
    String? search,
    String? sort,
  }) async {
    final params = <String, String>{};
    if (city != null && city.isNotEmpty) params['city'] = city;
    if (category != null && category.isNotEmpty) params['category'] = category;
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (sort != null && sort.isNotEmpty) params['sort'] = sort;

    final query = params.isNotEmpty
        ? '?${params.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&')}'
        : '';

    final res = await ApiClient.get('/experts$query');
    if (res['success'] == true && res['experts'] != null) {
      final list = res['experts'] as List;
      return list.map((e) => ExpertModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<ExpertModel?> getExpert(String id) async {
    final res = await ApiClient.get('/experts/$id');
    if (res['success'] == true && res['expert'] != null) {
      return ExpertModel.fromJson(res['expert']);
    }
    return null;
  }

  Future<List<ReviewModel>> getReviews(String expertId) async {
    final res = await ApiClient.get('/reviews/$expertId');
    if (res['success'] == true && res['reviews'] != null) {
      final list = res['reviews'] as List;
      return list.map((e) => ReviewModel.fromJson(e)).toList();
    }
    return [];
  }
}
