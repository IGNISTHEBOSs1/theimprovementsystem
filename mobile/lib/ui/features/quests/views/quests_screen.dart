import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme.dart';
import '../view_models/quests_view_model.dart';
import 'widgets/capacity_meter.dart';
import 'widgets/commitment_bottom_sheet.dart';
import 'widgets/quest_ledger_tile.dart';
import 'widgets/skeleton_loader.dart';

class QuestsScreen extends StatelessWidget {
  const QuestsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<QuestsViewModel>();
    final dateKicker = DateFormat('EEEE, d MMM').format(DateTime.now()).toUpperCase();

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        top: true,
        bottom: false, // Bottom is handled by bottom dock clearance
        child: RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: AppColors.surface1,
          onRefresh: viewModel.refresh,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            slivers: [
              // Safe-area padded header
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(
                  AppMetrics.screenMargin,
                  12.0,
                  AppMetrics.screenMargin,
                  8.0,
                ),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Date Kicker (VP0 & Stitch spec)
                      Text(
                        dateKicker,
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                      const SizedBox(height: 4),

                      // Large Title Row + 48dp Quick Action
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Your Commitments',
                            style: Theme.of(context).textTheme.headlineLarge,
                          ),
                          SizedBox(
                            width: AppMetrics.minTouchTarget,
                            height: AppMetrics.minTouchTarget,
                            child: IconButton(
                              onPressed: () {
                                CommitmentBottomSheet.show(
                                  context,
                                  onCommit: (title, priority, linked, goal) {
                                    viewModel.commitNew(
                                      title: title,
                                      priority: priority,
                                      linkedToGoal: linked,
                                      goalName: goal,
                                    );
                                  },
                                );
                              },
                              icon: const Icon(
                                Icons.add_rounded,
                                size: 26,
                                color: AppColors.textPrimary,
                              ),
                              tooltip: 'New commitment',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Main Body Content
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: AppMetrics.screenMargin),
                sliver: SliverToBoxAdapter(
                  child: viewModel.isLoading
                      ? const Padding(
                          padding: EdgeInsets.only(top: 16.0),
                          child: Vp0SkeletonLoader(),
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 12),

                            // Capacity Meter Section (Google Stitch Obsidian Kinetic)
                            CapacityMeterWidget(
                              committedCount: viewModel.committedSlotsCount,
                              maxSlots: QuestsViewModel.maxSlots,
                              onAddPressed: () {
                                CommitmentBottomSheet.show(
                                  context,
                                  onCommit: (title, priority, linked, goal) {
                                    viewModel.commitNew(
                                      title: title,
                                      priority: priority,
                                      linkedToGoal: linked,
                                      goalName: goal,
                                    );
                                  },
                                );
                              },
                            ),
                            const SizedBox(height: 24),

                            // Active Commitments Ledger Label
                            Padding(
                              padding: const EdgeInsets.only(left: 4.0, bottom: 8.0),
                              child: Text(
                                "TODAY'S LEDGER",
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                      color: AppColors.textMuted,
                                      letterSpacing: 1.0,
                                      fontSize: 11,
                                    ),
                              ),
                            ),

                            // Unified Receipt Ledger Container
                            if (viewModel.activeQuests.isNotEmpty)
                              Container(
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
                                child: ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  padding: EdgeInsets.zero,
                                  itemCount: viewModel.activeQuests.length,
                                  separatorBuilder: (_, __) => const Divider(height: 1),
                                  itemBuilder: (context, index) {
                                    final quest = viewModel.activeQuests[index];
                                    return QuestLedgerTile(
                                      quest: quest,
                                      isAnimatingCompleted: viewModel.isAnimatingCompleted(quest.id),
                                      onToggleComplete: () => viewModel.completeQuest(quest.id),
                                      onCancel: () => viewModel.cancelQuest(quest.id),
                                    );
                                  },
                                ),
                              )
                            else
                              // Empty state
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
                                decoration: BoxDecoration(
                                  color: AppColors.surface1,
                                  borderRadius: BorderRadius.circular(AppMetrics.radiusXl),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Column(
                                  children: [
                                    Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: AppColors.surface2,
                                        shape: BoxShape.circle,
                                        border: Border.all(color: AppColors.border),
                                      ),
                                      child: const Icon(
                                        Icons.check_circle_outline_rounded,
                                        size: 24,
                                        color: AppColors.primaryLight,
                                      ),
                                    ),
                                    const SizedBox(height: 14),
                                    const Text(
                                      'No Active Commitments',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text(
                                      'Commit to one high-leverage step for today.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                    ),
                                    const SizedBox(height: 20),
                                    SizedBox(
                                      height: AppMetrics.minTouchTarget,
                                      child: FilledButton.icon(
                                        onPressed: () {
                                          CommitmentBottomSheet.show(
                                            context,
                                            onCommit: (title, priority, linked, goal) {
                                              viewModel.commitNew(
                                                title: title,
                                                priority: priority,
                                                linkedToGoal: linked,
                                                goalName: goal,
                                              );
                                            },
                                          );
                                        },
                                        icon: const Icon(Icons.add_rounded, size: 18),
                                        label: const Text('Make a commitment'),
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

                            // Completed Section (If any)
                            if (viewModel.completedQuests.isNotEmpty) ...[
                              const SizedBox(height: 28),
                              Padding(
                                padding: const EdgeInsets.only(left: 4.0, bottom: 8.0),
                                child: Text(
                                  'COMPLETED TODAY (${viewModel.completedQuests.length})',
                                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                        color: AppColors.textMuted,
                                        letterSpacing: 1.0,
                                        fontSize: 11,
                                      ),
                                ),
                              ),
                              Container(
                                decoration: BoxDecoration(
                                  color: AppColors.surface1.withOpacity(0.6),
                                  borderRadius: BorderRadius.circular(AppMetrics.radiusXl),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  padding: EdgeInsets.zero,
                                  itemCount: viewModel.completedQuests.length,
                                  separatorBuilder: (_, __) => const Divider(height: 1),
                                  itemBuilder: (context, index) {
                                    final quest = viewModel.completedQuests[index];
                                    return QuestLedgerTile(
                                      quest: quest,
                                      isAnimatingCompleted: false,
                                      onToggleComplete: () {},
                                      onCancel: () {},
                                    );
                                  },
                                ),
                              ),
                            ],

                            // Dynamic clearance padding so bottom items never get hidden by floating dock
                            const SizedBox(height: AppMetrics.dockBottomClearance),
                          ],
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
