import 'package:flutter/material.dart';

/// Visual variants of [AppButton].
enum AppButtonVariant { primary, danger }

/// Shared button with a horizontal gradient, a soft coloured shadow and
/// hover / pressed / focus / disabled states.
///
/// It wraps a native [ElevatedButton], so semantics, keyboard activation,
/// focus handling and `onPressed == null` (disabled) behave as before.
class AppButton extends StatefulWidget {
  const AppButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.variant = AppButtonVariant.primary,
    this.padding = const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
    this.textStyle,
  });

  final VoidCallback? onPressed;
  final Widget child;
  final AppButtonVariant variant;
  final EdgeInsetsGeometry padding;
  final TextStyle? textStyle;

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  bool _hovered = false;
  bool _pressed = false;
  bool _focused = false;

  static const _radius = 28.0; // pill shape

  // Both gradients keep white text above ~4.5:1 contrast at every stop.
  List<Color> get _colors {
    switch (widget.variant) {
      case AppButtonVariant.primary:
        return const [Color(0xFF00796B), Color(0xFF1565C0)];
      case AppButtonVariant.danger:
        return const [Color(0xFFBF360C), Color(0xFFC62828)];
    }
  }

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null;
    final colors = _colors;
    final reduceMotion = MediaQuery.of(context).disableAnimations;
    final duration =
        reduceMotion ? Duration.zero : const Duration(milliseconds: 200);

    final lifted = enabled && _hovered && !_pressed;
    final pressed = enabled && _pressed;

    final decoration = BoxDecoration(
      borderRadius: BorderRadius.circular(_radius),
      gradient: LinearGradient(
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
        colors: enabled
            ? colors
            : const [Color(0xFFBDBDBD), Color(0xFF9E9E9E)],
      ),
      boxShadow: !enabled
          ? const []
          : [
              // Layered shadow: a tight contact shadow plus a soft coloured one.
              BoxShadow(
                color: Colors.black.withValues(alpha: pressed ? 0.10 : 0.18),
                blurRadius: pressed ? 2 : 4,
                offset: Offset(0, pressed ? 1 : 2),
              ),
              BoxShadow(
                color: colors.last.withValues(alpha: pressed ? 0.20 : 0.38),
                blurRadius: pressed ? 6 : (lifted ? 22 : 14),
                offset: Offset(0, pressed ? 2 : (lifted ? 10 : 6)),
              ),
            ],
      // Visible keyboard-focus ring.
      border: _focused
          ? Border.all(color: Colors.white, width: 2)
          : null,
    );

    return AnimatedContainer(
      duration: duration,
      curve: Curves.easeOutCubic,
      transformAlignment: Alignment.center,
      transform: Matrix4.translationValues(
        0,
        pressed ? 1 : (lifted ? -3 : 0),
        0,
      )..scale(pressed ? 0.98 : 1.0),
      decoration: decoration,
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        onFocusChange: (value) => setState(() => _focused = value),
        child: MouseRegion(
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() {
            _hovered = false;
            _pressed = false;
          }),
          child: Listener(
            onPointerDown: (_) => setState(() => _pressed = true),
            onPointerUp: (_) => setState(() => _pressed = false),
            onPointerCancel: (_) => setState(() => _pressed = false),
            child: ElevatedButton(
              onPressed: widget.onPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                disabledBackgroundColor: Colors.transparent,
                foregroundColor: Colors.white,
                disabledForegroundColor: Colors.white70,
                shadowColor: Colors.transparent,
                elevation: 0,
                padding: widget.padding,
                textStyle: widget.textStyle ??
                    const TextStyle(
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.3,
                    ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(_radius),
                ),
              ),
              child: widget.child,
            ),
          ),
        ),
      ),
    );
  }
}
