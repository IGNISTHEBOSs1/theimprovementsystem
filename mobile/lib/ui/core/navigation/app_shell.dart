import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../features/quests/views/quests_screen.dart';
import '../theme.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    QuestsScreen(),
    _PlaceholderScreen(title: "Today's Focus", icon: Icons.timer_outlined),
    _PlaceholderScreen(title: 'Patterns & Mentor', icon: Icons.psychology_outlined),
    _PlaceholderScreen(title: 'Journey & Trajectory', icon: Icons.explore_outlined),
  ];

  void _onTabTapped(int index) {
    if (_currentIndex != index) {
      HapticFeedback.selectionClick();
      setState(() => _currentIndex = index);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: Stack(
        children: [
          // Screen View with delicate crossfade transition
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            switchInCurve: Curves.easeOut,
            switchOutCurve: Curves.easeIn,
            child: KeyedSubtree(
              key: ValueKey<int>(_currentIndex),
              child: _screens[_currentIndex],
            ),
          ),

          // Floating Frosted Glass Tab Dock (Stitch Obsidian Kinetic & VP0 spec)
          Positioned(
            left: 20,
            right: 20,
            bottom: 0,
            child: SafeArea(
              top: false,
              bottom: true,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppMetrics.radiusPill),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 24.0, sigmaY: 24.0),
                    child: Container(
                      height: AppMetrics.dockHeight,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceGlass,
                        borderRadius: BorderRadius.circular(AppMetrics.radiusPill),
                        border: Border.all(color: AppColors.border, width: 1.0),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x66000000),
                            offset: Offset(0, 10),
                            blurRadius: 30,
                            spreadRadius: -2,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildDockItem(
                            index: 0,
                            icon: Icons.checklist_rounded,
                            label: 'Commitments',
                          ),
                          _buildDockItem(
                            index: 1,
                            icon: Icons.bolt_rounded,
                            label: 'Focus',
                          ),
                          _buildDockItem(
                            index: 2,
                            icon: Icons.psychology_rounded,
                            label: 'Mentor',
                          ),
                          _buildDockItem(
                            index: 3,
                            icon: Icons.explore_rounded,
                            label: 'Journey',
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDockItem({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = _currentIndex == index;

    return Expanded(
      child: InkWell(
        onTap: () => _onTabTapped(index),
        borderRadius: BorderRadius.circular(AppMetrics.radiusPill),
        // Guaranteed minimum 48x48dp touch target
        child: SizedBox(
          height: AppMetrics.dockHeight,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary.withOpacity(0.18) : Colors.transparent,
                  borderRadius: BorderRadius.circular(AppMetrics.radiusPill),
                ),
                child: Icon(
                  icon,
                  size: 22,
                  color: isSelected ? AppColors.primaryLight : AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 2),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? AppColors.textPrimary : AppColors.textMuted,
                ),
                child: Text(label),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PlaceholderScreen extends StatelessWidget {
  const _PlaceholderScreen({required this.title, required this.icon});

  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.surface1,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.border),
              ),
              child: Icon(icon, size: 28, color: AppColors.primaryLight),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 6),
            const Text(
              'Under native construction',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}
