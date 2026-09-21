import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
import '../../../../domain/models/quest.dart';

class QuestLedgerTile extends StatelessWidget {
  const QuestLedgerTile({
    super.key,
    required this.quest,
    required this.isAnimatingCompleted,
    required this.onToggleComplete,
    required this.onCancel,
  });

  final Quest quest;
  final bool isAnimatingCompleted;
  final VoidCallback onToggleComplete;
  final VoidCallback onCancel;

  @override
  Widget build(BuildContext context) {
    final isCompleted = quest.completed || isAnimatingCompleted;

    return AnimatedOpacity(
      duration: const Duration(milliseconds: 240),
      opacity: isCompleted ? 0.65 : 1.0,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 240),
        color: isCompleted ? const Color(0x0D10B981) : Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // LEFT AXIS: Dedicated 48x48dp Touch Target for Tactile Squircle Checkbox
              SizedBox(
                width: AppMetrics.minTouchTarget,
                height: AppMetrics.minTouchTarget,
                child: InkWell(
                  onTap: isCompleted ? null : onToggleComplete,
                  borderRadius: BorderRadius.circular(AppMetrics.radiusSm),
                  child: Center(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: isCompleted ? AppColors.success : AppColors.surface2,
                        borderRadius: BorderRadius.circular(AppMetrics.radiusSm),
                        border: Border.all(
                          color: isCompleted ? AppColors.success : AppColors.border,
                          width: 1.5,
                        ),
                        boxShadow: isCompleted
                            ? const [
                                BoxShadow(
                                  color: Color(0x4010B981),
                                  blurRadius: 10,
                                  spreadRadius: 1,
                                ),
                              ]
                            : null,
                      ),
                      child: isCompleted
                          ? const Center(
                              child: Icon(
                                Icons.check_rounded,
                                size: 16,
                                color: Colors.white,
                              ),
                            )
                          : null,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 4),

              // CENTER: Manufactured text baseline
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      quest.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            decoration: isCompleted ? TextDecoration.lineThrough : null,
                            decorationColor: AppColors.textMuted,
                            color: isCompleted ? AppColors.textMuted : AppColors.textPrimary,
                            fontWeight: isCompleted ? FontWeight.w400 : FontWeight.w600,
                          ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),

                    // Secondary context line (Goal pill & Cadence tag)
                    Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 6,
                      children: [
                        // Goal Pill (Show, Don't Tell)
                        if (quest.linkedToGoal && quest.goalName != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.surface2,
                              borderRadius: BorderRadius.circular(AppMetrics.radiusPill),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.track_changes_rounded,
                                  size: 11,
                                  color: AppColors.primaryLight,
                                ),
                                const SizedBox(width: 4),
                                ConstrainedBox(
                                  constraints: const BoxConstraints(maxWidth: 130),
                                  child: Text(
                                    quest.goalName!,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.textSecondary,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),

                        // Cadence Indicator
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              quest.isRecurring ? Icons.repeat_rounded : Icons.bolt_rounded,
                              size: 12,
                              color: quest.isRecurring ? AppColors.primaryLight : AppColors.warning,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              quest.isRecurring ? 'Daily' : 'Today',
                              style: const TextStyle(
                                fontSize: 11,
                                fontFamily: 'monospace',
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),

                        // Relational Emphasis: Non-essential priority only
                        if (quest.priority != QuestPriority.essential)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: AppColors.warningBg,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: AppColors.warning.withOpacity(0.3)),
                            ),
                            child: Text(
                              quest.priority.label,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColors.warning,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),

              // RIGHT AXIS: Action Target (48x48dp touch target)
              if (!isCompleted)
                SizedBox(
                  width: AppMetrics.minTouchTarget,
                  height: AppMetrics.minTouchTarget,
                  child: IconButton(
                    onPressed: onCancel,
                    icon: const Icon(
                      Icons.close_rounded,
                      size: 18,
                      color: AppColors.textMuted,
                    ),
                    tooltip: 'Withdraw commitment',
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
