import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../services/expert_service.dart';
import '../../models/expert_model.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_widgets.dart';

class ExpertDetailScreen extends StatefulWidget {
  final String expertId;
  const ExpertDetailScreen({super.key, required this.expertId});

  @override
  State<ExpertDetailScreen> createState() => _ExpertDetailScreenState();
}

class _ExpertDetailScreenState extends State<ExpertDetailScreen> {
  final ExpertService _service = ExpertService();
  ExpertModel? _expert;
  List<ReviewModel> _reviews = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    final expert = await _service.getExpert(widget.expertId);
    if (expert != null) {
      final reviews = await _service.getReviews(widget.expertId);
      if (mounted) setState(() { _expert = expert; _reviews = reviews; _loading = false; });
    } else {
      if (mounted) setState(() { _error = 'Uzman bulunamadı.'; _loading = false; });
    }
  }

  Future<void> _callExpert() async {
    if (_expert?.phone == null) return;
    final uri = Uri.parse('tel:${_expert!.phone}');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  void _showBookingSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _BookingSheet(expert: _expert!),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.bgGradient),
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : _error != null
                ? ErrorState(message: _error!, onRetry: _load)
                : _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    final e = _expert!;
    return CustomScrollView(
      slivers: [
        // ─── APP BAR ──────────────────────────────────────
        SliverAppBar(
          expandedHeight: 200,
          pinned: true,
          backgroundColor: AppColors.bgDark,
          leading: GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.black38, borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            ),
          ),
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(gradient: AppColors.primaryGradient),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 40),
                    UserAvatar(initials: e.initials, color: e.color, size: 80),
                    const SizedBox(height: 12),
                    Text(e.fullName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white, fontFamily: 'Inter')),
                    if (e.category != null)
                      Text(e.category!, style: const TextStyle(fontSize: 14, color: Colors.white70, fontFamily: 'Inter')),
                  ],
                ),
              ),
            ),
          ),
        ),

        // ─── ÖZET STAT KARTI ──────────────────────────────
        SliverToBoxAdapter(
          child: Container(
            margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _StatItem(value: e.rating.toStringAsFixed(1), label: 'Puan', icon: Icons.star_rounded, color: const Color(0xFFFBBF24)),
                _Divider(),
                _StatItem(value: e.reviewCount.toString(), label: 'Yorum', icon: Icons.chat_bubble_outline_rounded, color: AppColors.info),
                _Divider(),
                _StatItem(value: '₺${e.hourlyRate.toStringAsFixed(0)}', label: 'Saatlik', icon: Icons.payments_outlined, color: AppColors.success),
                _Divider(),
                _StatItem(
                  value: e.isAvailable ? 'Müsait' : 'Meşgul',
                  label: 'Durum',
                  icon: e.isAvailable ? Icons.check_circle_outline_rounded : Icons.cancel_outlined,
                  color: e.isAvailable ? AppColors.success : AppColors.error,
                ),
              ],
            ),
          ),
        ),

        // ─── KONUM VE KATEGORİ ────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Wrap(
              spacing: 8, runSpacing: 8,
              children: [
                if (e.city != null) InfoChip(label: '📍 ${e.city}', color: AppColors.accent),
                if (e.category != null) InfoChip(label: '🔧 ${e.category}', color: AppColors.primary),
                ...e.skills.take(4).map((s) => InfoChip(label: s, color: AppColors.secondary)),
              ],
            ),
          ),
        ),

        // ─── HAKKINDA ────────────────────────────────────
        if (e.bio != null && e.bio!.isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Hakkında', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFamily: 'Inter')),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                    child: Text(e.bio!, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6, fontFamily: 'Inter')),
                  ),
                ],
              ),
            ),
          ),

        // ─── YORUMLAR ────────────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionHeader(title: 'Yorumlar (${_reviews.length})'),
                const SizedBox(height: 12),
                if (_reviews.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                    child: const Center(child: Text('Henüz yorum yok', style: TextStyle(color: AppColors.textMuted, fontFamily: 'Inter'))),
                  )
                else
                  ..._reviews.take(5).map((r) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              UserAvatar(initials: r.reviewerName.isNotEmpty ? r.reviewerName[0].toUpperCase() : 'U', size: 36),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(r.reviewerName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFamily: 'Inter')),
                                    RatingStars(rating: r.rating, size: 12),
                                  ],
                                ),
                              ),
                              if (r.createdAt != null)
                                Text(
                                  '${r.createdAt!.day}/${r.createdAt!.month}/${r.createdAt!.year}',
                                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontFamily: 'Inter'),
                                ),
                            ],
                          ),
                          if (r.text != null && r.text!.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(r.text!, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5, fontFamily: 'Inter')),
                          ],
                        ],
                      ),
                    ),
                  )),
              ],
            ),
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 120)),
      ],
    );
  }
}

// ─── STAT İTEM ────────────────────────────────────────────
class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color color;

  const _StatItem({required this.value, required this.label, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: color, fontFamily: 'Inter')),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontFamily: 'Inter')),
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Container(width: 1, height: 40, color: AppColors.border);
}

// ─── BOOKING SHEET ────────────────────────────────────────
class _BookingSheet extends StatelessWidget {
  final ExpertModel expert;
  const _BookingSheet({required this.expert});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              UserAvatar(initials: expert.initials, color: expert.color, size: 44),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(expert.fullName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFamily: 'Inter')),
                    if (expert.category != null)
                      Text(expert.category!, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontFamily: 'Inter')),
                  ],
                ),
              ),
              Text('₺${expert.hourlyRate.toStringAsFixed(0)}/saat', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primary, fontFamily: 'Inter')),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(color: AppColors.border),
          const SizedBox(height: 16),
          const Text('Bu uzmanla isbul.online üzerinden iletişime geçebilirsiniz.', style: TextStyle(color: AppColors.textSecondary, fontSize: 14, fontFamily: 'Inter')),
          const SizedBox(height: 20),
          GradientButton(
            text: 'Web\'de Görüntüle',
            icon: Icons.open_in_browser_rounded,
            onPressed: () async {
              final url = Uri.parse('https://isbul.online/uzman-profil.html?id=${expert.id}');
              if (await canLaunchUrl(url)) await launchUrl(url, mode: LaunchMode.externalApplication);
            },
          ),
        ],
      ),
    );
  }
}
