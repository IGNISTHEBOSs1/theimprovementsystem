import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
import '../../../../domain/models/quest.dart';

class CommitmentBottomSheet extends StatefulWidget {
  const CommitmentBottomSheet({
    super.key,
    required this.onCommit,
  });

  final Function(String title, QuestPriority priority, bool linkedToGoal, String? goalName) onCommit;

  static Future<void> show(
    BuildContext context, {
    required Function(String title, QuestPriority priority, bool linkedToGoal, String? goalName) onCommit,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CommitmentBottomSheet(onCommit: onCommit),
    );
  }

  @override
  State<CommitmentBottomSheet> createState() => _CommitmentBottomSheetState();
}

class _CommitmentBottomSheetState extends State<CommitmentBottomSheet> {
  final _titleController = TextEditingController();
  QuestPriority _priority = QuestPriority.essential;
  bool _linkedToGoal = true;
  final String _defaultGoal = 'Master Systems';

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  void _submit() {
    final text = _titleController.text.trim();
    if (text.isEmpty) return;

    widget.onCommit(
      text,
      _priority,
      _linkedToGoal,
      _linkedToGoal ? _defaultGoal : null,
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface1,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppMetrics.radiusXl)),
        border: Border(top: BorderSide(color: AppColors.border, width: 1.5)),
      ),
      padding: EdgeInsets.only(bottom: bottomInset),
      child: SafeArea(
        top: false,
        bottom: true,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Grab handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.textMuted.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'New Commitment',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontSize: 18,
                        ),
                  ),
                  SizedBox(
                    width: AppMetrics.minTouchTarget,
                    height: AppMetrics.minTouchTarget,
                    child: IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close_rounded, size: 20),
                      tooltip: 'Close',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Text Field with thumb-friendly touch target
              TextField(
                controller: _titleController,
                autofocus: true,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 15),
                decoration: InputDecoration(
                  hintText: 'What is one thing you commit to today?',
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
                  filled: true,
                  fillColor: AppColors.surface2,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppMetrics.radiusMd),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppMetrics.radiusMd),
                    borderSide: const BorderSide(color: AppColors.primary),
                  ),
                ),
                onSubmitted: (_) => _submit(),
              ),
              const SizedBox(height: 16),

              // Goal Linkage Pill Toggle (48dp Touch Target)
              InkWell(
                onTap: () => setState(() => _linkedToGoal = !_linkedToGoal),
                borderRadius: BorderRadius.circular(AppMetrics.radiusMd),
                child: Container(
                  height: AppMetrics.minTouchTarget,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: _linkedToGoal ? AppColors.surface2 : Colors.transparent,
                    borderRadius: BorderRadius.circular(AppMetrics.radiusMd),
                    border: Border.all(
                      color: _linkedToGoal ? AppColors.borderHighlight : AppColors.border,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _linkedToGoal ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded,
                        size: 20,
                        color: _linkedToGoal ? AppColors.primaryLight : AppColors.textMuted,
                      ),
                      const SizedBox(width: 10),
                      const Icon(
                        Icons.track_changes_rounded,
                        size: 16,
                        color: AppColors.primaryLight,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Supports: $_defaultGoal',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: _linkedToGoal ? AppColors.textPrimary : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Priority Selector
              Row(
                children: [
                  const Text('Priority: ', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(width: 8),
                  ...QuestPriority.values.map((p) {
                    final selected = _priority == p;
                    return Padding(
                      padding: const EdgeInsets.only(right: 6.0),
                      child: SizedBox(
                        height: 36,
                        child: FilterChip(
                          label: Text(p.label, style: const TextStyle(fontSize: 12)),
                          selected: selected,
                          onSelected: (_) => setState(() => _priority = p),
                          selectedColor: AppColors.primary.withOpacity(0.25),
                          checkmarkColor: AppColors.primaryLight,
                          side: BorderSide(
                            color: selected ? AppColors.primaryLight : AppColors.border,
                          ),
                          backgroundColor: AppColors.surface2,
                          labelStyle: TextStyle(
                            color: selected ? AppColors.textPrimary : AppColors.textSecondary,
                            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
              const SizedBox(height: 20),

              // Primary Commit Action Button (48dp height minimum)
              SizedBox(
                width: double.infinity,
                height: AppMetrics.minTouchTarget,
                child: FilledButton.icon(
                  onPressed: _submit,
                  icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                  label: const Text('Commit', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppMetrics.radiusPill),
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
