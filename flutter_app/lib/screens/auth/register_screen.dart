import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_widgets.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  bool _loading = false;
  bool _obscure = true;
  bool _kvkkAccepted = false;
  String? _error;

  @override
  void dispose() {
    _firstNameCtrl.dispose(); _lastNameCtrl.dispose();
    _emailCtrl.dispose(); _passCtrl.dispose(); _confirmPassCtrl.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_kvkkAccepted) {
      setState(() => _error = 'Kullanım koşullarını kabul etmelisiniz');
      return;
    }
    setState(() { _loading = true; _error = null; });

    final auth = context.read<AuthService>();
    final result = await auth.register(
      firstName: _firstNameCtrl.text.trim(),
      lastName: _lastNameCtrl.text.trim(),
      email: _emailCtrl.text.trim(),
      password: _passCtrl.text,
    );

    if (!mounted) return;
    setState(() => _loading = false);

    if (result.success) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      setState(() => _error = result.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.bgGradient),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 32),

                // Geri butonu
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
                        child: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary, size: 20),
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Text('Hesap Oluştur', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontFamily: 'Inter')),
                  ],
                ),

                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.only(left: 56),
                  child: Text('Ücretsiz, hemen başla', style: TextStyle(fontSize: 14, color: AppColors.textSecondary, fontFamily: 'Inter')),
                ),

                const SizedBox(height: 32),

                // Hata
                if (_error != null) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.error.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 18),
                        const SizedBox(width: 10),
                        Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13, fontFamily: 'Inter'))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      // Ad Soyad - yan yana
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _firstNameCtrl,
                              textInputAction: TextInputAction.next,
                              style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'),
                              decoration: const InputDecoration(labelText: 'Ad'),
                              validator: (v) => v == null || v.isEmpty ? 'Ad gerekli' : null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _lastNameCtrl,
                              textInputAction: TextInputAction.next,
                              style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'),
                              decoration: const InputDecoration(labelText: 'Soyad'),
                              validator: (v) => v == null || v.isEmpty ? 'Soyad gerekli' : null,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Email
                      TextFormField(
                        controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'),
                        decoration: const InputDecoration(labelText: 'E-posta adresi', prefixIcon: Icon(Icons.email_outlined)),
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'E-posta gerekli';
                          if (!v.contains('@')) return 'Geçerli e-posta girin';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Şifre
                      TextFormField(
                        controller: _passCtrl,
                        obscureText: _obscure,
                        textInputAction: TextInputAction.next,
                        style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'),
                        decoration: InputDecoration(
                          labelText: 'Şifre',
                          prefixIcon: const Icon(Icons.lock_outline_rounded),
                          suffixIcon: IconButton(
                            icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                            onPressed: () => setState(() => _obscure = !_obscure),
                            color: AppColors.textMuted,
                          ),
                        ),
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Şifre gerekli';
                          if (v.length < 6) return 'En az 6 karakter';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Şifre onay
                      TextFormField(
                        controller: _confirmPassCtrl,
                        obscureText: _obscure,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _register(),
                        style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'),
                        decoration: const InputDecoration(labelText: 'Şifre Tekrar', prefixIcon: Icon(Icons.lock_outline_rounded)),
                        validator: (v) {
                          if (v != _passCtrl.text) return 'Şifreler eşleşmiyor';
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),

                      // KVKK onayı
                      GestureDetector(
                        onTap: () => setState(() => _kvkkAccepted = !_kvkkAccepted),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 22, height: 22,
                              child: Checkbox(
                                value: _kvkkAccepted,
                                onChanged: (v) => setState(() => _kvkkAccepted = v ?? false),
                                activeColor: AppColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                              ),
                            ),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Text(
                                'Kullanım Koşulları ve Gizlilik Politikası\'nı okudum, kabul ediyorum.',
                                style: TextStyle(fontSize: 13, color: AppColors.textSecondary, fontFamily: 'Inter'),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      GradientButton(
                        text: 'Ücretsiz Kaydol',
                        onPressed: _register,
                        loading: _loading,
                        icon: Icons.person_add_outlined,
                      ),

                      const SizedBox(height: 16),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('Zaten hesabınız var mı?', style: TextStyle(color: AppColors.textSecondary, fontFamily: 'Inter')),
                          TextButton(
                            onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                            child: const Text('Giriş Yap', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
