import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import '../../../../data/repositories/quest_repository.dart';
import '../../../../domain/models/quest.dart';

class QuestsViewModel extends ChangeNotifier {
  QuestsViewModel({required QuestRepository repository}) : _repository = repository {
    loadQuests();
  }

  final QuestRepository _repository;

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  List<Quest> _quests = [];
  final Set<String> _animatingCompletedIds = {};

  static const int maxSlots = 3;

  List<Quest> get activeQuests => _quests.where((q) => !q.isDone).toList();
  List<Quest> get completedQuests => _quests.where((q) => q.completed).toList();
  List<Quest> get upcomingSeries => _quests.where((q) => q.isRecurring && q.isDone).toList();

  int get committedSlotsCount => activeQuests.length;
  int get slotsRemaining => (maxSlots - committedSlotsCount).clamp(0, maxSlots);
  bool get isAtCapacity => committedSlotsCount >= maxSlots;

  bool isAnimatingCompleted(String id) => _animatingCompletedIds.contains(id);

  Future<void> loadQuests() async {
    _isLoading = true;
    notifyListeners();

    try {
      _quests = await _repository.fetchQuests();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    _quests = await _repository.fetchQuests(simulateDelay: false);
    notifyListeners();
  }

  Future<void> completeQuest(String id) async {
    if (_animatingCompletedIds.contains(id)) return;

    // Haptic feedback for tactical closure
    HapticFeedback.lightImpact();
    _animatingCompletedIds.add(id);
    notifyListeners();

    // Delicate 260ms cognitive delay for animation
    await Future<void>.delayed(const Duration(milliseconds: 260));

    await _repository.completeQuest(id);
    _animatingCompletedIds.remove(id);
    _quests = await _repository.fetchQuests(simulateDelay: false);
    notifyListeners();
  }

  Future<bool> commitNew({
    required String title,
    required QuestPriority priority,
    bool linkedToGoal = false,
    String? goalName,
    String? seriesId,
    List<int>? recurrenceDays,
  }) async {
    if (isAtCapacity || title.trim().isEmpty) return false;

    HapticFeedback.mediumImpact();
    await _repository.addQuest(
      title: title,
      priority: priority,
      linkedToGoal: linkedToGoal,
      goalName: goalName,
      seriesId: seriesId,
      recurrenceDays: recurrenceDays,
    );

    _quests = await _repository.fetchQuests(simulateDelay: false);
    notifyListeners();
    return true;
  }

  Future<void> cancelQuest(String id) async {
    HapticFeedback.selectionClick();
    await _repository.cancelQuest(id);
    _quests = await _repository.fetchQuests(simulateDelay: false);
    notifyListeners();
  }
}
