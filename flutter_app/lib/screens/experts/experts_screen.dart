import 'package:flutter/material.dart';
import '../../services/expert_service.dart';
import '../../models/expert_model.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_widgets.dart';

class ExpertsScreen extends StatefulWidget {
  const ExpertsScreen({super.key});

  @override
  State<ExpertsScreen> createState() => _ExpertsScreenState();
}

class _ExpertsScreenState extends State<ExpertsScreen> {
  final ExpertService _service = ExpertService();
  final _searchCtrl = TextEditingController();
  List<ExpertModel> _experts = [];
  List<ExpertModel> _filtered = [];
  bool _loading = true;
  String? _error;
  String? _selectedCategory;
  String? _selectedCity;
  String _sortBy = 'rating';

  static const _categories = [
    'Tümü', 'Tadilat', 'Temizlik', 'Mobilya', 'Nakliyat',
    'Boyacı', 'Elektrik', 'Tesisat', 'Montaj',
  ];

  static const _cities = [
    'Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Bursa',
    'Antalya', 'Adana', 'Konya', 'Gaziantep',
  ];

  @override
  void initState() {
    super.initState();
    // Route arguments varsa uygula
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Map<String, dynamic>) {
        if (args['category'] != null) _selectedCategory = args['category'];
        if (args['search'] != null) _searchCtrl.text = args['search'];
      }
      _loadExperts();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadExperts() async {
    setState(() { _loading = true; _error = null; });
    try {
      final experts = await _service.getExperts(
        category: _selectedCategory,
        city: _selectedCity,
        search: _searchCtrl.text.trim(),
        sort: _sortBy,
      );
      if (mounted) {
        setState(() {
          _experts = experts;
          _filtered = experts;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = 'Uzmanlar yüklenemedi.'; _loading = false; });
    }
  }

  void _onSearch(String q) => _loadExperts();

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      isScrollControlled: true,
      builder: (_) => _FilterSheet(
        selectedCategory: _selectedCategory,
        selectedCity: _selectedCity,
        sortBy: _sortBy,
        onApply: (cat, city, sort) {
          setState(() {
            _selectedCategory = cat;
            _selectedCity = city;
            _sortBy = sort;
          });
          Navigator.pop(context);
          _loadExperts();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.bgGradient),
        child: SafeArea(
          child: Column(
            children: [
              // ─── HEADER ────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Text('Uzmanlar', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontFamily: 'Inter')),
                        const Spacer(),
                        if (_loading)
                          const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2.5)),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Arama + Filtre
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 46,
                            decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                            child: Row(
                              children: [
                                const Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 12),
                                  child: Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
                                ),
                                Expanded(
                                  child: TextField(
                                    controller: _searchCtrl,
                                    onSubmitted: _onSearch,
                                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontFamily: 'Inter'),
                                    decoration: const InputDecoration(
                                      hintText: 'Ad veya hizmet ara...',
                                      hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14, fontFamily: 'Inter'),
                                      border: InputBorder.none, enabledBorder: InputBorder.none, focusedBorder: InputBorder.none,
                                      contentPadding: EdgeInsets.symmetric(vertical: 12),
                                    ),
                                  ),
                                ),
                                if (_searchCtrl.text.isNotEmpty)
                                  IconButton(
                                    icon: const Icon(Icons.clear_rounded, size: 18, color: AppColors.textMuted),
                                    onPressed: () { _searchCtrl.clear(); _loadExperts(); },
                                  ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: _showFilterSheet,
                          child: Container(
                            width: 46, height: 46,
                            decoration: BoxDecoration(
                              color: (_selectedCategory != null || _selectedCity != null)
                                  ? AppColors.primary.withOpacity(0.2)
                                  : AppColors.bgCard,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: (_selectedCategory != null || _selectedCity != null)
                                    ? AppColors.primary
                                    : AppColors.border,
                              ),
                            ),
                            child: Icon(
                              Icons.tune_rounded,
                              color: (_selectedCategory != null || _selectedCity != null) ? AppColors.primary : AppColors.textMuted,
                              size: 20,
                            ),
                          ),
                        ),
                      ],
                    ),

                    // Aktif filtreler
                    if (_selectedCategory != null || _selectedCity != null) ...[
                      const SizedBox(height: 10),
                      SizedBox(
                        height: 30,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: [
                            if (_selectedCategory != null)
                              _FilterChip(label: _selectedCategory!, onRemove: () { setState(() => _selectedCategory = null); _loadExperts(); }),
                            if (_selectedCity != null) ...[
                              if (_selectedCategory != null) const SizedBox(width: 8),
                              _FilterChip(label: _selectedCity!, onRemove: () { setState(() => _selectedCity = null); _loadExperts(); }),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              // ─── SONUÇ SAYISI ─────────────────────────────
              if (!_loading && _error == null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      '${_filtered.length} uzman bulundu',
                      style: const TextStyle(fontSize: 13, color: AppColors.textMuted, fontFamily: 'Inter'),
                    ),
                  ),
                ),

              const SizedBox(height: 12),

              // ─── LİSTE ────────────────────────────────────
              Expanded(
                child: _error != null
                    ? ErrorState(message: _error!, onRetry: _loadExperts)
                    : _loading
                        ? ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            itemCount: 5,
                            itemBuilder: (_, i) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: Container(height: 90, decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border))),
                            ),
                          )
                        : _filtered.isEmpty
                            ? const Center(child: Text('Uzman bulunamadı.\nFarklı filtreler deneyin.', style: TextStyle(color: AppColors.textSecondary, fontFamily: 'Inter'), textAlign: TextAlign.center))
                            : ListView.builder(
                                padding: const EdgeInsets.symmetric(horizontal: 20),
                                itemCount: _filtered.length,
                                itemBuilder: (_, i) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: _ExpertCard(
                                    expert: _filtered[i],
                                    onTap: () => Navigator.pushNamed(context, '/expert-detail', arguments: _filtered[i].id),
                                  ),
                                ),
                              ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── UZMAN KARTI ────────────────────────────────────────────
class _ExpertCard extends StatelessWidget {
  final ExpertModel expert;
  final VoidCallback onTap;

  const _ExpertCard({required this.expert, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            UserAvatar(initials: expert.initials, color: expert.color, size: 56),
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
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle)),
                              const SizedBox(width: 4),
                              const Text('Müsait', style: TextStyle(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.w700, fontFamily: 'Inter')),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (expert.category != null) ...[
                        InfoChip(label: expert.category!, icon: Icons.work_outline_rounded, color: AppColors.primary),
                        const SizedBox(width: 6),
                      ],
                      if (expert.city != null)
                        InfoChip(label: expert.city!, icon: Icons.location_on_outlined, color: AppColors.accent),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      RatingStars(rating: expert.rating, count: expert.reviewCount, size: 13),
                      const Spacer(),
                      if (expert.hourlyRate > 0)
                        Text('₺${expert.hourlyRate.toStringAsFixed(0)}/saat', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary, fontFamily: 'Inter')),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── FİLTRE CHIP ────────────────────────────────────────────
class _FilterChip extends StatelessWidget {
  final String label;
  final VoidCallback onRemove;

  const _FilterChip({required this.label, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600, fontFamily: 'Inter')),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: onRemove,
            child: const Icon(Icons.close_rounded, size: 14, color: AppColors.primary),
          ),
        ],
      ),
    );
  }
}

// ─── FİLTRE BOTTOM SHEET ────────────────────────────────────
class _FilterSheet extends StatefulWidget {
  final String? selectedCategory;
  final String? selectedCity;
  final String sortBy;
  final Function(String?, String?, String) onApply;

  const _FilterSheet({this.selectedCategory, this.selectedCity, required this.sortBy, required this.onApply});

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  String? _category;
  String? _city;
  String _sort = 'rating';

  static const _categories = ['Tadilat', 'Temizlik', 'Mobilya', 'Nakliyat', 'Boyacı', 'Elektrik', 'Tesisat', 'Montaj'];
  static const _cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep'];
  static const _sorts = [
    {'value': 'rating', 'label': 'En Yüksek Puan'},
    {'value': 'price_asc', 'label': 'En Düşük Fiyat'},
    {'value': 'price_desc', 'label': 'En Yüksek Fiyat'},
    {'value': 'reviews', 'label': 'En Çok Yorum'},
  ];

  @override
  void initState() {
    super.initState();
    _category = widget.selectedCategory;
    _city = widget.selectedCity;
    _sort = widget.sortBy;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Filtreler', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontFamily: 'Inter')),
              const Spacer(),
              TextButton(
                onPressed: () { setState(() { _category = null; _city = null; _sort = 'rating'; }); },
                child: const Text('Temizle', style: TextStyle(color: AppColors.error, fontSize: 13)),
              ),
            ],
          ),
          const Divider(color: AppColors.border),
          const SizedBox(height: 12),

          const Text('Kategori', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textSecondary, fontFamily: 'Inter')),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: _categories.map((c) => GestureDetector(
              onTap: () => setState(() => _category = _category == c ? null : c),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: _category == c ? AppColors.primary.withOpacity(0.2) : AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _category == c ? AppColors.primary : AppColors.border),
                ),
                child: Text(c, style: TextStyle(fontSize: 13, color: _category == c ? AppColors.primary : AppColors.textSecondary, fontWeight: _category == c ? FontWeight.w700 : FontWeight.w500, fontFamily: 'Inter')),
              ),
            )).toList(),
          ),

          const SizedBox(height: 20),
          const Text('Şehir', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textSecondary, fontFamily: 'Inter')),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: _cities.map((c) => GestureDetector(
              onTap: () => setState(() => _city = _city == c ? null : c),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: _city == c ? AppColors.accent.withOpacity(0.2) : AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _city == c ? AppColors.accent : AppColors.border),
                ),
                child: Text(c, style: TextStyle(fontSize: 13, color: _city == c ? AppColors.accent : AppColors.textSecondary, fontWeight: _city == c ? FontWeight.w700 : FontWeight.w500, fontFamily: 'Inter')),
              ),
            )).toList(),
          ),

          const SizedBox(height: 20),
          const Text('Sıralama', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textSecondary, fontFamily: 'Inter')),
          const SizedBox(height: 10),
          ..._sorts.map((s) => RadioListTile<String>(
            value: s['value']!,
            groupValue: _sort,
            onChanged: (v) => setState(() => _sort = v ?? 'rating'),
            title: Text(s['label']!, style: const TextStyle(fontSize: 14, color: AppColors.textPrimary, fontFamily: 'Inter')),
            activeColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
            visualDensity: VisualDensity.compact,
          )),

          const SizedBox(height: 16),
          GradientButton(text: 'Filtreleri Uygula', onPressed: () => widget.onApply(_category, _city, _sort), icon: Icons.check_rounded),
        ],
      ),
    );
  }
}
