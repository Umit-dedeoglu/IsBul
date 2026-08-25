class UserModel {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? avatar;
  final String? color;
  final String role;
  final bool isExpert;
  final ExpertData? expertData;

  UserModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.avatar,
    this.color,
    required this.role,
    this.isExpert = false,
    this.expertData,
  });

  String get fullName => '$firstName $lastName'.trim();
  String get initials => '${firstName.isNotEmpty ? firstName[0] : ''}${lastName.isNotEmpty ? lastName[0] : ''}'.toUpperCase();

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      firstName: json['firstName'] ?? json['first_name'] ?? '',
      lastName: json['lastName'] ?? json['last_name'] ?? '',
      email: json['email'] ?? '',
      avatar: json['avatar'],
      color: json['color'] ?? '#6C63FF',
      role: json['role'] ?? 'customer',
      isExpert: json['isExpert'] ?? json['is_expert'] ?? false,
      expertData: json['expertData'] != null ? ExpertData.fromJson(json['expertData']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'firstName': firstName,
    'lastName': lastName,
    'email': email,
    'avatar': avatar,
    'color': color,
    'role': role,
    'isExpert': isExpert,
  };
}

class ExpertData {
  final String? category;
  final String? city;
  final double? rating;
  final int? reviewCount;
  final double? hourlyRate;
  final bool? isAvailable;

  ExpertData({
    this.category,
    this.city,
    this.rating,
    this.reviewCount,
    this.hourlyRate,
    this.isAvailable,
  });

  factory ExpertData.fromJson(Map<String, dynamic> json) {
    return ExpertData(
      category: json['category'],
      city: json['city'],
      rating: (json['rating'] as num?)?.toDouble(),
      reviewCount: json['reviewCount'] ?? json['review_count'],
      hourlyRate: (json['hourlyRate'] ?? json['hourly_rate'] as num?)?.toDouble(),
      isAvailable: json['isAvailable'] ?? json['is_available'],
    );
  }
}
