import 'package:flutter/material.dart';
import '../../../../core/theme.dart';

/// Delicate component loading skeleton matching the VP0 structure.
/// Provides a subtle, calm opacity pulsation while data loads.
class Vp0SkeletonLoader extends StatefulWidget {
  const Vp0SkeletonLoader({super.key});

  @override
  State<Vp0SkeletonLoader> createState() => _Vp0SkeletonLoaderState();
}

class _Vp0SkeletonLoaderState extends State<Vp0SkeletonLoader> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _animation = Tween<double>(begin: 0.25, end: 0.65).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Opacity(
          opacity: _animation.value,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Capacity Meter Skeleton
              Container(
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.surface1,
                  borderRadius: BorderRadius.circular(AppMetrics.radiusXl),
                  border: Border.all(color: AppColors.border),
                ),
              ),
              const SizedBox(height: 16),

              // Ledger Container Skeleton
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surface1,
                  borderRadius: BorderRadius.circular(AppMetrics.radiusXl),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _buildRowSkeleton(),
                    const Divider(color: AppColors.border, height: 1),
                    _buildRowSkeleton(),
                    const Divider(color: AppColors.border, height: 1),
                    _buildRowSkeleton(),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRowSkeleton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: AppColors.surface2,
              borderRadius: BorderRadius.circular(AppMetrics.radiusSm),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  height: 14,
                  decoration: BoxDecoration(
                    color: AppColors.surface2,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: 120,
                  height: 10,
                  decoration: BoxDecoration(
                    color: AppColors.surface2,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
