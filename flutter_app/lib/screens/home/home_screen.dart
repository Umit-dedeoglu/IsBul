import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/expert_service.dart';
import '../../models/expert_model.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_widgets.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ExpertService _expertService = ExpertService();
  List<ExpertModel> _experts = [];
  bool _loading = true;
  final _searchCtrl = TextEditingController();

  static const List<Map<String, dynamic>> _categories = [
    {'icon': '🛠️', 'label': 'Tadilat', 'value': 'tadilat'},
    {'icon': '🧹', 'label': 'Temizlik', 'value': 'temizlik'},
    {'icon': '🛋️', 'label': 'Mobilya', 'value': 'mobilya'},
    {'icon': '📦', 'label': 'Nakliyat', 'value': 'nakliyat'},
    {'icon': '🎨', 'label': 'Boyacı', 'value': 'boya'},
    {'icon': '💡', 'label': 'Elektrik', 'value': 'elektrik'},
    {'icon': '🔧', 'label': 'Tesisatçı', 'value': 'tesisat'},
    {'icon': '📺', 'label': 'TV Montaj', 'value': 'montaj'},
  ];

  static const List<Map<String, String>> _stats = [
    {'value': '50.000+', 'label': 'Tamamlanan Görev'},
    {'value': '8.500+', 'label': 'Aktif Uzman'},
    {'value': '81', 'label': 'İlde Hizmet'},
    {'value': '%98', 'label': 'Memnuniyet'},
  ];

  @override
  void initState() {
    super.initState();
    _loadExperts();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadExperts() async {
    setState(() => _loading = true);
    final experts = await _expertService.getExperts();
    if (mounted) setState(() { _experts = experts.take(6).toList(); _loading = false; });
  }

  void _onSearch(String q) {
    if (q.trim().isEmpty) return;
    Navigator.pushNamed(context, '/experts', arguments: {'search': q.trim()});
  }

  void _onCategory(String category) {
    Navigator.pushNamed(context, '/experts', arguments: {'category': category});
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final user = auth.currentUser;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.bgGradient),
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: _loadExperts,
            color: AppColors.primary,
            backgroundColor: AppColors.bgCard,
            child: CustomScrollView(
              slivers: [
                // ─── HEADER ─────────────────────────────────────
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Navbar
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user != null ? 'Merhaba, ${user.firstName}! 👋' : 'Hoş Geldiniz! 👋',
                                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontFamily: 'Inter'),
                                ),
                                const Text('Ne arıyorsunuz?', style: TextStyle(fontSize: 14, color: AppColors.textSecondary, fontFamily: 'Inter')),
                              ],
                            ),
                            GestureDetector(
                              onTap: () => Navigator.pushNamed(context, '/profile'),
                              child: user != null
                                  ? UserAvatar(initials: user.initials, color: user.color, size: 44)
                                  : Container(
                                      width: 44, height: 44,
                                      decoration: BoxDecoration(
                                        color: AppColors.bgCard,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: AppColors.border),
                                      ),
                                      child: const Icon(Icons.person_outline_rounded, color: AppColors.textSecondary),
                                    ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // Arama kutusu
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.bgCard,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            children: [
                              const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 16),
                                child: Icon(Icons.search_rounded, color: AppColors.textMuted, size: 22),
                              ),
                              Expanded(
                                child: TextField(
                                  controller: _searchCtrl,
                                  onSubmitted: _onSearch,
                                  style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'Inter'),
                                  decoration: const InputDecoration(
                                    hintText: 'Hizmet veya uzman ara...',
                                    hintStyle: TextStyle(color: AppColors.textMuted, fontFamily: 'Inter'),
                                    border: InputBorder.none,
                                    enabledBorder: InputBorder.none,
                                    focusedBorder: InputBorder.none,
                                    contentPadding: EdgeInsets.symmetric(vertical: 14),
                                  ),
                                ),
                              ),
                              GestureDetector(
                                onTap: () => _onSearch(_searchCtrl.text),
                                child: Container(
                                  margin: const EdgeInsets.all(8),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                  decoration: BoxDecoration(
                                    gradient: AppColors.primaryGradient,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Text('Ara', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13, fontFamily: 'Inter')),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // ─── KATEGORİLER ────────────────────────────────
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionHeader(title: 'Kategoriler'),
                        const SizedBox(height: 16),
                        GridView.count(
                          crossAxisCount: 4,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                          childAspectRatio: 0.85,
                          children: _categories.map((cat) => _CategoryCard(
                            icon: cat['icon'],
                            label: cat['label'],
                            onTap: () => _onCategory(cat['value']),
                          )).toList(),
                        ),
                      ],
                    ),
                  ),
                ),

                // ─── NASIL ÇALIŞIR BANNER ────────────────────────
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Uzman Ol!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white, fontFamily: 'Inter')),
                                const SizedBox(height: 4),
                                const Text('Yeteneklerini paylaş, para kazan', style: TextStyle(fontSize: 12, color: Colors.white70, fontFamily: 'Inter')),
                                const SizedBox(height: 12),
                                GestureDetector(
                                  onTap: () => Navigator.pushNamed(context, '/become-expert'),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: const Text('Başla →', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary, fontFamily: 'Inter')),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Text('🏆', style: TextStyle(fontSize: 56)),
                        ],
                      ),
                    ),
                  ),
                ),

                // ─── ÖNE ÇIKAN UZMANLAR ─────────────────────────
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                    child: SectionHeader(
                      title: 'Öne Çıkan Uzmanlar',
                      actionLabel: 'Tümünü Gör',
                      onAction: () => Navigator.pushNamed(context, '/experts'),
                    ),
                  ),
                ),

                if (_loading)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      child: Column(
                        children: List.generate(3, (_) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Container(
                            height: 88,
                            decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                          ),
                        )),
                      ),
                    ),
                  )
                else if (_experts.isEmpty)
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: Center(child: Text('Henüz uzman bulunamadı', style: TextStyle(color: AppColors.textSecondary, fontFamily: 'Inter'))),
                    ),
                  )
                else
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, i) => Padding(
                        padding: EdgeInsets.fromLTRB(20, i == 0 ? 16 : 0, 20, 12),
                        child: _ExpertListCard(
                          expert: _experts[i],
                          onTap: () => Navigator.pushNamed(context, '/expert-detail', arguments: _experts[i].id),
                        ),
                      ),
                      childCount: _experts.length,
                    ),
                  ),

                // ─── İSTATİSTİKLER ──────────────────────────────
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                    child: GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 2.2,
                      children: _stats.map((s) => Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.bgCard,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(s['value']!, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primary, fontFamily: 'Inter')),
                            Text(s['label']!, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontFamily: 'Inter')),
                          ],
                        ),
                      )).toList(),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── KATEGORİ KARTI ──────────────────────────────────────────
class _CategoryCard extends StatelessWidget {
  final String icon;
  final String label;
  final VoidCallback onTap;

  const _CategoryCard({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(icon, style: const TextStyle(fontSize: 26)),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary, fontFamily: 'Inter'), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

// ─── UZMAN LİSTE KARTI ───────────────────────────────────────
class _ExpertListCard extends StatelessWidget {
  final ExpertModel expert;
  final VoidCallback onTap;

  const _ExpertListCard({required this.expert, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            UserAvatar(initials: expert.initials, color: expert.color, size: 52),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text(expert.fullName, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFamily: 'Inter'), overflow: TextOverflow.ellipsis)),
                      if (expert.isAvailable)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: AppColors.success.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                          child: const Text('Müsait', style: TextStyle(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.w700, fontFamily: 'Inter')),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (expert.category != null)
                    Text(expert.category!, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontFamily: 'Inter')),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      RatingStars(rating: expert.rating, count: expert.reviewCount),
                      const Spacer(),
                      if (expert.hourlyRate > 0)
                        Text('₺${expert.hourlyRate.toStringAsFixed(0)}/saat', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary, fontFamily: 'Inter')),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 20),
          ],
        ),
      ),
    );
  }
}
