class ExpertModel {
  final String id;
  final String firstName;
  final String lastName;
  final String? avatar;
  final String? color;
  final String? category;
  final String? city;
  final double rating;
  final int reviewCount;
  final double hourlyRate;
  final bool isAvailable;
  final String? bio;
  final List<String> skills;
  final String? phone;

  ExpertModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.avatar,
    this.color,
    this.category,
    this.city,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.hourlyRate = 0.0,
    this.isAvailable = false,
    this.bio,
    this.skills = const [],
    this.phone,
  });

  String get fullName => '$firstName $lastName'.trim();
  String get initials => '${firstName.isNotEmpty ? firstName[0] : ''}${lastName.isNotEmpty ? lastName[0] : ''}'.toUpperCase();

  factory ExpertModel.fromJson(Map<String, dynamic> json) {
    List<String> parseSkills(dynamic skills) {
      if (skills == null) return [];
      if (skills is List) return skills.map((e) => e.toString()).toList();
      if (skills is String) {
        try {
          return (skills.split(',') as List).map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
        } catch (_) { return []; }
      }
      return [];
    }

    return ExpertModel(
      id: json['id']?.toString() ?? '',
      firstName: json['firstName'] ?? json['first_name'] ?? '',
      lastName: json['lastName'] ?? json['last_name'] ?? '',
      avatar: json['avatar'],
      color: json['color'] ?? '#6C63FF',
      category: json['category'],
      city: json['city'],
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['reviewCount'] ?? json['review_count'] ?? 0,
      hourlyRate: (json['hourlyRate'] ?? json['hourly_rate'] as num?)?.toDouble() ?? 0.0,
      isAvailable: json['isAvailable'] ?? json['is_available'] ?? false,
      bio: json['bio'],
      skills: parseSkills(json['skills']),
      phone: json['phone'],
    );
  }
}

class ReviewModel {
  final String id;
  final String reviewerName;
  final double rating;
  final String? text;
  final DateTime? createdAt;

  ReviewModel({
    required this.id,
    required this.reviewerName,
    required this.rating,
    this.text,
    this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id']?.toString() ?? '',
      reviewerName: json['reviewerName'] ?? json['reviewer_name'] ?? 'Anonim',
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      text: json['text'] ?? json['comment'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}
