import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Design constants and metrics adhering to Google Stitch 'Obsidian Kinetic'
/// and Apple iOS / Material 3 touch target standards.
class AppMetrics {
  AppMetrics._();

  /// Strictly enforced minimum touch target size for mobile thumb reach.
  /// Complies with Apple HIG (44pt) and Material 3 (48dp).
  static const double minTouchTarget = 48.0;

  /// Standard screen margins.
  static const double screenMargin = 16.0;

  /// Corner radii following continuous squircle geometry.
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
  static const double radiusPill = 999.0;

  /// Bottom clearance for floating tab dock over the home indicator.
  static const double dockHeight = 64.0;
  static const double dockBottomClearance = 100.0;
}

class AppColors {
  AppColors._();

  // Canvas & Substrates
  static const Color canvas = Color(0xFF090A0F);
  static const Color surface1 = Color(0xFF12141A);
  static const Color surface2 = Color(0xFF181B24);
  static const Color surfaceGlass = Color(0xB312141A); // 70% opacity for blur

  // Accents
  static const Color primary = Color(0xFF6366F1); // Electric Indigo
  static const Color primaryLight = Color(0xFF818CF8); // Neon Lavender
  static const Color tertiary = Color(0xFFA855F7); // Electric Violet

  // Semantic
  static const Color success = Color(0xFF10B981);
  static const Color successBg = Color(0x1A10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningBg = Color(0x1AF59E0B);
  static const Color error = Color(0xFFEF4444);

  // Borders & Dividers
  static const Color border = Color(0x1E94A3B8); // 12% Slate
  static const Color borderHighlight = Color(0x336366F1); // 20% Indigo

  // Text Hierarchy
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF475569);
}

class AppTheme {
  AppTheme._();

  static ThemeData get darkTheme {
    final baseTextTheme = ThemeData.dark().textTheme;
    final textTheme = GoogleFonts.plusJakartaSansTextTheme(baseTextTheme).copyWith(
      headlineLarge: GoogleFonts.plusJakartaSans(
        fontSize: 28.0,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.8,
        color: AppColors.textPrimary,
      ),
      headlineMedium: GoogleFonts.plusJakartaSans(
        fontSize: 20.0,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
        color: AppColors.textPrimary,
      ),
      titleMedium: GoogleFonts.plusJakartaSans(
        fontSize: 15.0,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      bodyLarge: GoogleFonts.plusJakartaSans(
        fontSize: 15.0,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
      ),
      bodyMedium: GoogleFonts.plusJakartaSans(
        fontSize: 13.0,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
      ),
      labelSmall: GoogleFonts.plusJakartaSans(
        fontSize: 11.0,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.8,
        color: AppColors.primaryLight,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.canvas,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.primaryLight,
        tertiary: AppColors.tertiary,
        surface: AppColors.surface1,
        error: AppColors.error,
        onPrimary: Colors.white,
        onSurface: AppColors.textPrimary,
      ),
      textTheme: textTheme,
      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: 1.0,
        space: 1.0,
      ),
      // Enforce Material touch targets to 48dp globally
      materialTapTargetSize: MaterialTapTargetSize.padded,
    );
  }
}
