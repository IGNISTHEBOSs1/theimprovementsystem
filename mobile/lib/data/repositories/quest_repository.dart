import 'dart:async';
import 'package:uuid/uuid.dart';
import '../../domain/models/quest.dart';

class QuestRepository {
  QuestRepository() {
    _seedInitialData();
  }

  final _uuid = const Uuid();
  final List<Quest> _quests = [];

  void _seedInitialData() {
    final now = DateTime.now();
    _quests.addAll([
      Quest(
        id: _uuid.v4(),
        title: 'Read 30 pages of Designing Systems',
        priority: QuestPriority.essential,
        timeFrame: 'Today',
        linkedToGoal: true,
        goalName: 'Master Systems',
        seriesId: 'series-reading',
        recurrenceDays: [1, 2, 3, 4, 5],
        createdAt: now.subtract(const Duration(hours: 4)),
      ),
      Quest(
        id: _uuid.v4(),
        title: 'Ship database migration to staging',
        priority: QuestPriority.important,
        timeFrame: 'Today',
        linkedToGoal: true,
        goalName: 'Core Infra',
        createdAt: now.subtract(const Duration(hours: 2)),
      ),
      Quest(
        id: _uuid.v4(),
        title: 'Morning 20-min cardio',
        priority: QuestPriority.essential,
        timeFrame: 'Today',
        completed: true,
        linkedToGoal: true,
        goalName: 'Health & Vitality',
        seriesId: 'series-cardio',
        recurrenceDays: [0, 1, 2, 3, 4, 5, 6],
        createdAt: now.subtract(const Duration(hours: 8)),
        resolvedAt: now.subtract(const Duration(hours: 6)),
      ),
    ]);
  }

  Future<List<Quest>> fetchQuests({bool simulateDelay = true}) async {
    if (simulateDelay) {
      // Small delay to demonstrate delicate VP0 loading skeleton
      await Future<void>.delayed(const Duration(milliseconds: 450));
    }
    return List.unmodifiable(_quests);
  }

  Future<Quest> addQuest({
    required String title,
    required QuestPriority priority,
    bool linkedToGoal = false,
    String? goalName,
    String? seriesId,
    List<int>? recurrenceDays,
  }) async {
    final quest = Quest(
      id: _uuid.v4(),
      title: title.trim(),
      priority: priority,
      timeFrame: 'Today',
      linkedToGoal: linkedToGoal,
      goalName: goalName,
      seriesId: seriesId,
      recurrenceDays: recurrenceDays,
      createdAt: DateTime.now(),
    );

    _quests.insert(0, quest);
    return quest;
  }

  Future<void> completeQuest(String id) async {
    final index = _quests.indexWhere((q) => q.id == id);
    if (index != -1) {
      _quests[index] = _quests[index].copyWith(
        completed: true,
        resolvedAt: DateTime.now(),
      );
    }
  }

  Future<void> cancelQuest(String id) async {
    _quests.removeWhere((q) => q.id == id);
  }
}
