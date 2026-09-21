enum QuestPriority {
  essential,
  important,
  optional;

  String get label {
    switch (this) {
      case QuestPriority.essential:
        return 'Essential';
      case QuestPriority.important:
        return 'Important';
      case QuestPriority.optional:
        return 'Optional';
    }
  }

  static QuestPriority fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'important':
        return QuestPriority.important;
      case 'optional':
        return QuestPriority.optional;
      case 'essential':
      default:
        return QuestPriority.essential;
    }
  }
}

class Quest {
  const Quest({
    required this.id,
    required this.title,
    this.priority = QuestPriority.essential,
    this.timeFrame = 'Today',
    this.completed = false,
    this.failed = false,
    this.linkedToGoal = false,
    this.goalName,
    this.seriesId,
    this.recurrenceDays,
    required this.createdAt,
    this.resolvedAt,
  });

  final String id;
  final String title;
  final QuestPriority priority;
  final String timeFrame;
  final bool completed;
  final bool failed;
  final bool linkedToGoal;
  final String? goalName;
  final String? seriesId;
  final List<int>? recurrenceDays;
  final DateTime createdAt;
  final DateTime? resolvedAt;

  bool get isRecurring => seriesId != null && seriesId!.isNotEmpty;
  bool get isDone => completed || failed;

  Quest copyWith({
    String? id,
    String? title,
    QuestPriority? priority,
    String? timeFrame,
    bool? completed,
    bool? failed,
    bool? linkedToGoal,
    String? goalName,
    String? seriesId,
    List<int>? recurrenceDays,
    DateTime? createdAt,
    DateTime? resolvedAt,
  }) {
    return Quest(
      id: id ?? this.id,
      title: title ?? this.title,
      priority: priority ?? this.priority,
      timeFrame: timeFrame ?? this.timeFrame,
      completed: completed ?? this.completed,
      failed: failed ?? this.failed,
      linkedToGoal: linkedToGoal ?? this.linkedToGoal,
      goalName: goalName ?? this.goalName,
      seriesId: seriesId ?? this.seriesId,
      recurrenceDays: recurrenceDays ?? this.recurrenceDays,
      createdAt: createdAt ?? this.createdAt,
      resolvedAt: resolvedAt ?? this.resolvedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'priority': priority.name,
      'timeFrame': timeFrame,
      'completed': completed,
      'failed': failed,
      'linkedToGoal': linkedToGoal,
      'goalName': goalName,
      'seriesId': seriesId,
      'recurrenceDays': recurrenceDays,
      'createdAt': createdAt.toIso8601String(),
      'resolvedAt': resolvedAt?.toIso8601String(),
    };
  }

  factory Quest.fromJson(Map<String, dynamic> json) {
    return Quest(
      id: json['id'] as String,
      title: json['title'] as String,
      priority: QuestPriority.fromString(json['priority'] as String?),
      timeFrame: (json['timeFrame'] as String?) ?? 'Today',
      completed: (json['completed'] as bool?) ?? false,
      failed: (json['failed'] as bool?) ?? false,
      linkedToGoal: (json['linkedToGoal'] as bool?) ?? false,
      goalName: json['goalName'] as String?,
      seriesId: json['seriesId'] as String?,
      recurrenceDays: (json['recurrenceDays'] as List<dynamic>?)?.map((e) => e as int).toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      resolvedAt: json['resolvedAt'] != null ? DateTime.parse(json['resolvedAt'] as String) : null,
    );
  }
}
