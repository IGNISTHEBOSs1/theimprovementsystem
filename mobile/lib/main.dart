import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'data/repositories/quest_repository.dart';
import 'ui/core/navigation/app_shell.dart';
import 'ui/core/theme.dart';
import 'ui/features/quests/view_models/quests_view_model.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Edge-to-edge transparent system overlays for modern iOS & Android devices
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.light,
      systemNavigationBarDividerColor: Colors.transparent,
    ),
  );

  runApp(const TisMobileApp());
}

class TisMobileApp extends StatelessWidget {
  const TisMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Data layer repository
        Provider<QuestRepository>(
          create: (_) => QuestRepository(),
        ),
        // Presentation layer view models
        ChangeNotifierProvider<QuestsViewModel>(
          create: (context) => QuestsViewModel(
            repository: context.read<QuestRepository>(),
          ),
        ),
      ],
      child: MaterialApp(
        title: 'The Improvement System',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const AppShell(),
      ),
    );
  }
}
