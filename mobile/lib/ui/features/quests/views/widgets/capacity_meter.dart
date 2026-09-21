import 'package:flutter/material.dart';
import '../../../../core/theme.dart';

/// Capacity status widget implementing Google Stitch 'Obsidian Kinetic' specs.
/// Displays discrete segmented micro-pills and clear focus guidance.
class CapacityMeterWidget extends StatelessWidget {
  const CapacityMeterWidget({
    super.key,
    required this.committedCount,
    required this.maxSlots,
    required this.onAddPressed,
  });

  final int committedCount;
  final int maxSlots;
  final VoidCallback onAddPressed;

  @override
  Widget build(BuildContext context) {
    final remaining = (maxSlots - committedCount).clamp(0, maxSlots);
    final isFull = committedCount >= maxSlots;

    return Container(
      padding: const EdgeInsets.all(AppMetrics.screenMargin),
      decoration: BoxDecoration(
        color: AppColors.surface1,
        borderRadius: BorderRadius.circular(AppMetrics.radiusXl),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x2A000000),
            offset: Offset(0, 4),
            blurRadius: 16,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.surface2,
                      borderRadius: BorderRadius.circular(AppMetrics.radiusPill),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Text(
                      'CAPACITY STATUS',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppColors.primaryLight,
                            fontSize: 10,
                          ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '$committedCount of $maxSlots Commitments',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),

              // Quick Add Touch Target (48x48 Minimum)
              if (!isFull)
                SizedBox(
                  width: AppMetrics.minTouchTarget,
                  height: AppMetrics.minTouchTarget,
                  child: IconButton(
                    onPressed: onAddPressed,
                    icon: const Icon(
                      Icons.add_circle_outline_rounded,
                      size: 22,
                      color: AppColors.primaryLight,
                    ),
                    tooltip: 'Add commitment',
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // 3-Segmented Pill Gauges
          Row(
            children: List.generate(maxSlots, (index) {
              final isFilled = index < committedCount;

              return Expanded(
                child: Padding(
                  padding: EdgeInsets.only(right: index < maxSlots - 1 ? 4.0 : 0.0),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeOutCubic,
                    height: 8,
                    decoration: BoxDecoration(
                      color: isFilled ? AppColors.primary : AppColors.surface2,
                      borderRadius: BorderRadius.circular(AppMetrics.radiusPill),
                      border: Border.all(
                        color: isFilled ? AppColors.primaryLight : AppColors.border,
                        width: 1,
                      ),
                      boxShadow: isFilled
                          ? const [
                              BoxShadow(
                                color: Color(0x406366F1),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ]
                          : null,
                    ),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 10),

          // Guidance sub-line
          Text(
            isFull
              ? 'Focus locked · Complete an active commitment before adding another'
              : '$remaining ${remaining == 1 ? 'slot' : 'slots'} available · Commit only to what matters today',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: isFull ? AppColors.warning : AppColors.textSecondary,
                  fontSize: 12,
                ),
          ),
        ],
      ),
    );
  }
}
