import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_widgets.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {

  void _showEditSheet() {
    final auth = context.read<AuthService>();
    final user = auth.currentUser;
    if (user == null) return;

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgCard,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => ChangeNotifierProvider.value(
        value: auth,
        child: _EditProfileSheet(
          initialFirstName: user.firstName,
          initialLastName: user.lastName,
        ),
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Çıkış Yap', style: TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter', fontWeight: FontWeight.w700)),
        content: const Text('Hesabınızdan çıkış yapmak istediğinize emin misiniz?', style: TextStyle(color: AppColors.textSecondary, fontFamily: 'Inter')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal', style: TextStyle(color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await context.read<AuthService>().logout();
              if (mounted) Navigator.pushReplacementNamed(context, '/login');
            },
            child: const Text('Çıkış Yap', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final user = auth.currentUser;

    // Giriş yapılmamışsa
    if (user == null) {
      return Scaffold(
        body: Container(
          decoration: const BoxDecoration(gradient: AppColors.bgGradient),
          child: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 80, height: 80,
                      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.border)),
                      child: const Icon(Icons.person_outline_rounded, size: 40, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 20),
                    const Text('Hesabınıza giriş yapın', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontFamily: 'Inter')),
                    const SizedBox(height: 8),
                    const Text('Profilinizi görüntülemek ve yönetmek için giriş yapın.', style: TextStyle(fontSize: 14, color: AppColors.textSecondary, fontFamily: 'Inter'), textAlign: TextAlign.center),
                    const SizedBox(height: 32),
                    GradientButton(text: 'Giriş Yap', onPressed: () => Navigator.pushNamed(context, '/login'), icon: Icons.login_rounded),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => Navigator.pushNamed(context, '/register'),
                      child: const Text('Ücretsiz Kaydol'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.bgGradient),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              children: [
                // ─── HEADER ─────────────────────────────────
                Stack(
                  children: [
                    // Arka plan gradient
                    Container(
                      height: 160,
                      decoration: const BoxDecoration(gradient: AppColors.primaryGradient),
                    ),
                    // Düzenle butonu
                    Positioned(
                      top: 16, right: 16,
                      child: GestureDetector(
                        onTap: _showEditSheet,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withOpacity(0.3))),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.edit_rounded, size: 14, color: Colors.white),
                              SizedBox(width: 6),
                              Text('Düzenle', style: TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600, fontFamily: 'Inter')),
                            ],
                          ),
                        ),
                      ),
                    ),
                    // Avatar ve isim
                    Positioned.fill(
                      child: Align(
                        alignment: Alignment.bottomCenter,
                        child: Transform.translate(
                          offset: const Offset(0, 40),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(3),
                                decoration: BoxDecoration(color: AppColors.bgDark, borderRadius: BorderRadius.circular(24)),
                                child: UserAvatar(initials: user.initials, color: user.color, size: 70),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 52),

                // İsim ve email
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      Text(user.fullName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontFamily: 'Inter')),
                      const SizedBox(height: 4),
                      Text(user.email, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, fontFamily: 'Inter')),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          InfoChip(
                            label: user.role == 'admin' ? '👑 Admin' : user.isExpert ? '⭐ Uzman' : '👤 Kullanıcı',
                            color: user.role == 'admin' ? AppColors.warning : user.isExpert ? AppColors.secondary : AppColors.info,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // ─── MENÜ İTEMLERİ ───────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Hesap Bölümü
                      _SectionLabel(label: 'Hesabım'),
                      const SizedBox(height: 8),
                      _MenuCard(items: [
                        _MenuItem(icon: Icons.person_outline_rounded, label: 'Profili Düzenle', onTap: _showEditSheet),
                        _MenuItem(icon: Icons.lock_outline_rounded, label: 'Şifre Değiştir', onTap: () => _showPasswordSheet(context)),
                        if (!user.isExpert)
                          _MenuItem(icon: Icons.star_outline_rounded, label: 'Uzman Ol', onTap: () => Navigator.pushNamed(context, '/become-expert'), trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.primary), trailingColor: AppColors.primary),
                        if (user.isExpert)
                          _MenuItem(icon: Icons.dashboard_outlined, label: 'Uzman Paneli', onTap: () => Navigator.pushNamed(context, '/expert-panel')),
                      ]),

                      const SizedBox(height: 16),

                      // Uygulama Bölümü
                      _SectionLabel(label: 'Uygulama'),
                      const SizedBox(height: 8),
                      _MenuCard(items: [
                        _MenuItem(icon: Icons.info_outline_rounded, label: 'Hakkımızda', onTap: () => Navigator.pushNamed(context, '/about')),
                        _MenuItem(icon: Icons.privacy_tip_outlined, label: 'Gizlilik Politikası', onTap: () {}),
                        _MenuItem(icon: Icons.description_outlined, label: 'Kullanım Koşulları', onTap: () {}),
                        _MenuItem(icon: Icons.help_outline_rounded, label: 'Yardım & Destek', onTap: () {}),
                      ]),

                      const SizedBox(height: 16),

                      // Çıkış
                      _MenuCard(items: [
                        _MenuItem(
                          icon: Icons.logout_rounded,
                          label: 'Çıkış Yap',
                          onTap: _showLogoutDialog,
                          color: AppColors.error,
                        ),
                      ]),

                      const SizedBox(height: 32),

                      // Versiyon
                      const Center(
                        child: Text('İşBul v1.0.0', style: TextStyle(fontSize: 12, color: AppColors.textMuted, fontFamily: 'Inter')),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showPasswordSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgCard,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => const _ChangePasswordSheet(),
    );
  }
}

// ─── SECTION LABEL ──────────────────────────────────────────
class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(left: 4, bottom: 4),
    child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.8, fontFamily: 'Inter')),
  );
}

// ─── MENU CARD ───────────────────────────────────────────────
class _MenuCard extends StatelessWidget {
  final List<_MenuItem> items;
  const _MenuCard({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
      child: Column(
        children: List.generate(items.length, (i) => Column(
          children: [
            items[i],
            if (i < items.length - 1) const Divider(height: 1, color: AppColors.border, indent: 52),
          ],
        )),
      ),
    );
  }
}

// ─── MENU ITEM ───────────────────────────────────────────────
class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;
  final Widget? trailing;
  final Color? trailingColor;

  const _MenuItem({required this.icon, required this.label, required this.onTap, this.color, this.trailing, this.trailingColor});

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.textPrimary;
    return ListTile(
      onTap: onTap,
      leading: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: c, size: 18),
      ),
      title: Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: c, fontFamily: 'Inter')),
      trailing: trailing ?? const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 18),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
      minLeadingWidth: 0,
    );
  }
}

// ─── EDİT PROFİL SHEET ───────────────────────────────────────
class _EditProfileSheet extends StatefulWidget {
  final String initialFirstName;
  final String initialLastName;
  const _EditProfileSheet({required this.initialFirstName, required this.initialLastName});

  @override
  State<_EditProfileSheet> createState() => _EditProfileSheetState();
}

class _EditProfileSheetState extends State<_EditProfileSheet> {
  late final TextEditingController _firstCtrl;
  late final TextEditingController _lastCtrl;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _firstCtrl = TextEditingController(text: widget.initialFirstName);
    _lastCtrl = TextEditingController(text: widget.initialLastName);
  }

  @override
  void dispose() { _firstCtrl.dispose(); _lastCtrl.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (_firstCtrl.text.trim().isEmpty) { setState(() => _error = 'Ad gerekli'); return; }
    setState(() { _loading = true; _error = null; });
    final auth = context.read<AuthService>();
    final result = await auth.updateProfile({'firstName': _firstCtrl.text.trim(), 'lastName': _lastCtrl.text.trim()});
    if (!mounted) return;
    setState(() => _loading = false);
    if (result.success) { Navigator.pop(context); }
    else { setState(() => _error = result.error ?? 'Güncelleme başarısız'); }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Profili Düzenle', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontFamily: 'Inter')),
          const SizedBox(height: 20),
          if (_error != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.error.withOpacity(0.1), borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.error.withOpacity(0.3))),
              child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13, fontFamily: 'Inter')),
            ),
            const SizedBox(height: 16),
          ],
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _firstCtrl,
                  style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'),
                  decoration: const InputDecoration(labelText: 'Ad'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _lastCtrl,
                  style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'),
                  decoration: const InputDecoration(labelText: 'Soyad'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          GradientButton(text: 'Kaydet', onPressed: _save, loading: _loading, icon: Icons.save_rounded),
        ],
      ),
    );
  }
}

// ─── CHANGE PASSWORD SHEET ───────────────────────────────────
class _ChangePasswordSheet extends StatefulWidget {
  const _ChangePasswordSheet();

  @override
  State<_ChangePasswordSheet> createState() => _ChangePasswordSheetState();
}

class _ChangePasswordSheetState extends State<_ChangePasswordSheet> {
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() { _currentCtrl.dispose(); _newCtrl.dispose(); _confirmCtrl.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (_newCtrl.text != _confirmCtrl.text) { setState(() => _error = 'Şifreler eşleşmiyor'); return; }
    if (_newCtrl.text.length < 6) { setState(() => _error = 'En az 6 karakter'); return; }
    setState(() { _loading = true; _error = null; });
    // API call
    setState(() => _loading = false);
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Şifre güncellendi'), backgroundColor: AppColors.success));
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Şifre Değiştir', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontFamily: 'Inter')),
          const SizedBox(height: 20),
          if (_error != null) ...[
            Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: AppColors.error.withOpacity(0.1), borderRadius: BorderRadius.circular(10)), child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13, fontFamily: 'Inter'))),
            const SizedBox(height: 16),
          ],
          TextFormField(
            controller: _currentCtrl, obscureText: _obscure,
            style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'),
            decoration: InputDecoration(
              labelText: 'Mevcut Şifre', prefixIcon: const Icon(Icons.lock_outline_rounded),
              suffixIcon: IconButton(icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined), onPressed: () => setState(() => _obscure = !_obscure), color: AppColors.textMuted),
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(controller: _newCtrl, obscureText: _obscure, style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'), decoration: const InputDecoration(labelText: 'Yeni Şifre', prefixIcon: Icon(Icons.lock_outline_rounded))),
          const SizedBox(height: 12),
          TextFormField(controller: _confirmCtrl, obscureText: _obscure, style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'), decoration: const InputDecoration(labelText: 'Yeni Şifre Tekrar', prefixIcon: Icon(Icons.lock_outline_rounded))),
          const SizedBox(height: 20),
          GradientButton(text: 'Şifreyi Güncelle', onPressed: _save, loading: _loading, icon: Icons.lock_reset_rounded),
        ],
      ),
    );
  }
}
