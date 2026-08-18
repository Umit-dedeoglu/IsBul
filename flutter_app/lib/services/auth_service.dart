import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';
import '../models/user_model.dart';

class AuthService extends ChangeNotifier {
  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;

  // ─── KAYITLI KULLANICI YÜKLE ────────────────────────────────
  Future<bool> loadUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('isbul_jwt');
      if (token == null) return false;

      final authJson = prefs.getString('isbul_auth');
      if (authJson != null) {
        _currentUser = UserModel.fromJson(jsonDecode(authJson));
        return true;
      }

      // Token var ama cache yok → API'den al
      final res = await ApiClient.get('/auth/me');
      if (res['success'] == true && res['user'] != null) {
        _currentUser = UserModel.fromJson(res['user']);
        await _saveUser(_currentUser!);
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // ─── GİRİŞ YAP ─────────────────────────────────────────────
  Future<AuthResult> login(String email, String password) async {
    final res = await ApiClient.post('/auth/login', {
      'email': email,
      'password': password,
    }, auth: false);

    if (res['success'] == true && res['token'] != null) {
      await ApiClient.setToken(res['token']);
      _currentUser = UserModel.fromJson(res['user']);
      await _saveUser(_currentUser!);
      notifyListeners();
      return AuthResult(success: true);
    }
    return AuthResult(
      success: false,
      error: res['error']?['message'] ?? 'Giriş başarısız.',
    );
  }

  // ─── KAYIT OL ───────────────────────────────────────────────
  Future<AuthResult> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    final res = await ApiClient.post('/auth/register', {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'password': password,
      'role': 'customer',
    }, auth: false);

    if (res['success'] == true && res['token'] != null) {
      await ApiClient.setToken(res['token']);
      _currentUser = UserModel.fromJson(res['user']);
      await _saveUser(_currentUser!);
      notifyListeners();
      return AuthResult(success: true);
    }
    return AuthResult(
      success: false,
      error: res['error']?['message'] ?? 'Kayıt başarısız.',
    );
  }

  // ─── ÇIKIŞ YAP ──────────────────────────────────────────────
  Future<void> logout() async {
    _currentUser = null;
    await ApiClient.clearToken();
    notifyListeners();
  }

  // ─── PROFİL GÜNCELLE ────────────────────────────────────────
  Future<AuthResult> updateProfile(Map<String, dynamic> updates) async {
    final res = await ApiClient.patch('/users/profile', updates);
    if (res['success'] == true && res['user'] != null) {
      _currentUser = UserModel.fromJson(res['user']);
      await _saveUser(_currentUser!);
      notifyListeners();
      return AuthResult(success: true);
    }
    return AuthResult(success: false, error: res['error']?['message'] ?? 'Güncelleme başarısız.');
  }

  Future<void> _saveUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('isbul_auth', jsonEncode(user.toJson()));
  }
}

class AuthResult {
  final bool success;
  final String? error;
  const AuthResult({required this.success, this.error});
}
