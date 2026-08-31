import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await AttendanceNotificationService.initialize();

  runApp(const MaxosmithStaffApp());
}
// =====================================================
// LOCAL LOGIN CONFIGURATION
// =====================================================
//
// These credentials are stored inside the application.
// For production use, authentication should be moved to a secure server.
//
class AuthConfig {
  static const String username = 'user2073';
  static const String password = '57194864833';
}

// =====================================================
// ATTENDANCE NOTIFICATION SERVICE
// =====================================================

class AttendanceNotificationService {
  static final FlutterLocalNotificationsPlugin
      _notifications = FlutterLocalNotificationsPlugin();

  static const int reminderNotificationId = 73001;

  static Future<void> initialize() async {
    tz.initializeTimeZones();

    try {
      final timezoneInfo =
          await FlutterTimezone.getLocalTimezone();

      tz.setLocalLocation(
        tz.getLocation(timezoneInfo.identifier),
      );
    } catch (_) {
      // UTC will be used if the device timezone cannot be detected.
    }

    const androidSettings =
        AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );

    const appleSettings =
        DarwinInitializationSettings();

    const initializationSettings =
        InitializationSettings(
      android: androidSettings,
      iOS: appleSettings,
      macOS: appleSettings,
    );

    await _notifications.initialize(
      settings: initializationSettings,
    );

    final androidPlugin = _notifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();

    await androidPlugin
        ?.requestNotificationsPermission();

    final iosPlugin = _notifications
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>();

    await iosPlugin?.requestPermissions(
      alert: true,
      badge: true,
      sound: true,
    );
  }

  static Future<void> cancelReminder() async {
    await _notifications.cancel(
      id: reminderNotificationId,
    );
  }

  static Future<void> scheduleNextReminder({
    required String username,
    required bool todayAlreadyMarked,
  }) async {
    await cancelReminder();

    final now = tz.TZDateTime.now(tz.local);

    var reminderDate = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      19,
      30,
    );

    final todayIsSunday =
        now.weekday == DateTime.sunday;

    /*
     * When today's attendance is already marked,
     * today is Sunday, or 7:30 PM has passed,
     * schedule the reminder for the next working day.
     */
    if (todayAlreadyMarked ||
        todayIsSunday ||
        !reminderDate.isAfter(now)) {
      reminderDate =
          reminderDate.add(const Duration(days: 1));
    }

    while (
        reminderDate.weekday == DateTime.sunday) {
      reminderDate =
          reminderDate.add(const Duration(days: 1));
    }

    const androidDetails =
        AndroidNotificationDetails(
      'attendance_reminder_channel',
      'Attendance Reminders',
      channelDescription:
          'Reminder to mark daily attendance after 7:00 PM.',
      importance: Importance.high,
      priority: Priority.high,
      category: AndroidNotificationCategory.reminder,
    );

    const appleDetails =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const notificationDetails =
        NotificationDetails(
      android: androidDetails,
      iOS: appleDetails,
      macOS: appleDetails,
    );

    await _notifications.zonedSchedule(
      id: reminderNotificationId,
      title: 'Attendance Reminder',
      body:
          '$username, your attendance has not been marked. Please mark it now.',
      scheduledDate: reminderDate,
      notificationDetails: notificationDetails,
      androidScheduleMode:
          AndroidScheduleMode.inexactAllowWhileIdle,
      payload: 'attendance-reminder',
    );
  }
}

// =====================================================
// GOOGLE APPS SCRIPT API
// =====================================================
//
// Replace the URL below with the /exec URL from:
// Apps Script > Deploy > Manage deployments > Web app.
//
class ApiConfig {
  static const String webAppUrl =
      'https://script.google.com/macros/s/AKfycbz-U_uDOv-gGBQpbp4NHZeybcsy9AbexHhVM-mgVH-C0rek8yLLJ5VglR-504AxXYnj/exec';
}

class OrderApi {
  static Uri _getUri(
    String action, [
    Map<String, String>? parameters,
  ]) {
    return Uri.parse(ApiConfig.webAppUrl).replace(
      queryParameters: <String, String>{
        'action': action,
        ...?parameters,
      },
    );
  }

  static Future<Map<String, dynamic>> _post(
    Map<String, dynamic> body,
  ) async {
    _validateUrl();

    final request = http.Request(
      'POST',
      Uri.parse(ApiConfig.webAppUrl),
    )
      ..headers['Content-Type'] = 'application/json; charset=UTF-8'
      ..body = jsonEncode(body)
      ..followRedirects = false;

    final streamedResponse = await request
        .send()
        .timeout(const Duration(seconds: 30));

    var response = await http.Response.fromStream(streamedResponse);

    // Google Apps Script ContentService commonly returns a 302 redirect
    // to script.googleusercontent.com after processing a POST request.
    // Dart does not automatically follow this POST redirect in every case,
    // so fetch the redirected response manually.
    if (_isRedirect(response.statusCode)) {
      final location = response.headers['location'];

      if (location == null || location.trim().isEmpty) {
        throw Exception(
          'Server redirected the request without a destination URL.',
        );
      }

      final redirectUri = Uri.parse(location);

      response = await http
          .get(redirectUri)
          .timeout(const Duration(seconds: 30));
    }

    return _decodeResponse(response);
  }

  static bool _isRedirect(int statusCode) {
    return statusCode == 301 ||
        statusCode == 302 ||
        statusCode == 303 ||
        statusCode == 307 ||
        statusCode == 308;
  }

  static Map<String, dynamic> _decodeResponse(
    http.Response response,
  ) {
    if (response.statusCode < 200 ||
        response.statusCode >= 300) {
      throw Exception(
        'Server error ${response.statusCode}.',
      );
    }

    if (response.body.trim().isEmpty) {
      throw Exception('The server returned an empty response.');
    }

    dynamic decoded;

    try {
      decoded = jsonDecode(response.body);
    } on FormatException {
      throw Exception(
        'The server returned an invalid response: '
        '${response.body.length > 150 ? response.body.substring(0, 150) : response.body}',
      );
    }

    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid response received.');
    }

    if (decoded['success'] != true) {
      throw Exception(
        decoded['message']?.toString() ??
            'The request was unsuccessful.',
      );
    }

    return decoded;
  }

  static Future<Map<String, dynamic>> _get(
    String action, [
    Map<String, String>? parameters,
  ]) async {
    _validateUrl();

    final response = await http
        .get(_getUri(action, parameters))
        .timeout(const Duration(seconds: 30));

    if (response.statusCode < 200 ||
        response.statusCode >= 300) {
      throw Exception(
        'Server error ${response.statusCode}.',
      );
    }

    final decoded = jsonDecode(response.body);

    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid response received.');
    }

    if (decoded['success'] != true) {
      throw Exception(
        decoded['message']?.toString() ??
            'The request was unsuccessful.',
      );
    }

    return decoded;
  }

  static void _validateUrl() {
    if (ApiConfig.webAppUrl.contains('PASTE_YOUR_')) {
      throw Exception(
        'Add your Google Apps Script /exec URL '
        'inside ApiConfig.webAppUrl.',
      );
    }
  }

  static Future<List<String>> getProducts() async {
    final result = await _get('getProducts');
    final values = result['products'];

    if (values is! List) return <String>[];

    return values
        .map((value) => value.toString().trim())
        .where((value) => value.isNotEmpty)
        .toSet()
        .toList()
      ..sort();
  }

  static Future<List<StaffOrder>> getOrders() async {
    final result = await _get('getOrders');
    final values = result['orders'];

    if (values is! List) return <StaffOrder>[];

    return values
        .whereType<Map>()
        .map(
          (value) => StaffOrder.fromJson(
            Map<String, dynamic>.from(value),
          ),
        )
        .toList();
  }

  static Future<StaffOrder> saveOrder(
    StaffOrder order,
  ) async {
    final result = await _post({
      'action': 'saveOrder',
      'order': order.toJson(),
    });

    return StaffOrder.fromJson(
      Map<String, dynamic>.from(result['order'] as Map),
    );
  }

  static Future<StaffOrder> updateOrder(
    StaffOrder order,
  ) async {
    final result = await _post({
      'action': 'updateOrder',
      'order': order.toJson(),
    });

    return StaffOrder.fromJson(
      Map<String, dynamic>.from(result['order'] as Map),
    );
  }

  static Future<void> deleteOrder(
    String orderId,
  ) async {
    await _post({
      'action': 'deleteOrder',
      'orderId': orderId,
    });
  }

  static Future<Map<String, dynamic>> markDelivered(
    String orderId,
    String deliveredDate,
  ) {
    return _post({
      'action': 'markOrderDelivered',
      'orderId': orderId,
      'deliveredDate': deliveredDate,
    });
  }
}

// =====================================================
// MAXOSMITH COLOUR THEME
// =====================================================

class AppColors {
  static const Color primaryBlue = Color(0xFF12649A);
  static const Color darkBlue = Color(0xFF0B4F7C);
  static const Color lightBlue = Color(0xFFEAF5FC);

  static const Color primaryGreen = Color(0xFF00AD5F);
  static const Color darkGreen = Color(0xFF008A4C);
  static const Color lightGreen = Color(0xFFE7F8F0);

  static const Color white = Colors.white;
  static const Color background = Color(0xFFF5F9FC);

  static const Color textDark = Color(0xFF1F2937);
  static const Color textGrey = Color(0xFF64748B);
  static const Color border = Color(0xFFD8E6F0);

  static const Color errorRed = Color(0xFFD32F2F);
}

// =====================================================
// MAIN APPLICATION
// =====================================================

class MaxosmithStaffApp extends StatelessWidget {
  const MaxosmithStaffApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'MAXOSMITH Staff App',
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primaryBlue,
          primary: AppColors.primaryBlue,
          secondary: AppColors.primaryGreen,
          error: AppColors.errorRed,
          surface: AppColors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.primaryBlue,
          foregroundColor: AppColors.white,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
          titleTextStyle: TextStyle(
            color: AppColors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.white,
          labelStyle: const TextStyle(
            color: AppColors.textGrey,
          ),
          hintStyle: const TextStyle(
            color: AppColors.textGrey,
          ),
          errorStyle: const TextStyle(
            color: AppColors.errorRed,
            fontWeight: FontWeight.w500,
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 17,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(
              color: AppColors.border,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(
              color: AppColors.primaryBlue,
              width: 2,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(
              color: AppColors.errorRed,
              width: 1.5,
            ),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(
              color: AppColors.errorRed,
              width: 2,
            ),
          ),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}

// =====================================================
// SPLASH SCREEN
// =====================================================

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    openLoginScreen();
  }

  Future<void> openLoginScreen() async {
    await Future.delayed(
      const Duration(milliseconds: 1800),
    );

    if (!mounted) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => const LoginScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.white,
              AppColors.lightBlue,
              AppColors.lightGreen,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 28,
              vertical: 24,
            ),
            child: Column(
              children: [
                const Spacer(),

                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(25),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x1A12649A),
                        blurRadius: 30,
                        offset: Offset(0, 12),
                      ),
                    ],
                  ),
                  child: Image.asset(
                    'assets/images/logo.png',
                    height: 145,
                    fit: BoxFit.contain,
                    errorBuilder: (
                      context,
                      error,
                      stackTrace,
                    ) {
                      return const Icon(
                        Icons.local_pharmacy,
                        color: AppColors.primaryGreen,
                        size: 90,
                      );
                    },
                  ),
                ),

                const SizedBox(height: 30),

                const Text(
                  'STAFF APPLICATION',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.primaryBlue,
                    fontSize: 21,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),

                const SizedBox(height: 10),

                const Text(
                  'One App. Complete Business.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.textGrey,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),

                const SizedBox(height: 36),

                const SizedBox(
                  width: 34,
                  height: 34,
                  child: CircularProgressIndicator(
                    color: AppColors.primaryGreen,
                    strokeWidth: 3,
                  ),
                ),

                const Spacer(),

                const Text(
                  'Powered by MAXOSMITH',
                  style: TextStyle(
                    color: AppColors.textGrey,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// =====================================================
// LOGIN SCREEN
// =====================================================

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GlobalKey<FormState> formKey = GlobalKey<FormState>();

  final TextEditingController usernameController =
      TextEditingController();

  final TextEditingController passwordController =
      TextEditingController();

  bool hidePassword = true;
  bool isLoggingIn = false;

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  String? validateUsername(String? value) {
    final username = value?.trim() ?? '';

    if (username.isEmpty) {
      return 'Please enter your username';
    }

    return null;
  }

  String? validatePassword(String? value) {
    final password = value?.trim() ?? '';

    if (password.isEmpty) {
      return 'Please enter your password';
    }

    if (password.length < 4) {
      return 'Password must contain at least 4 characters';
    }

    return null;
  }

  Future<void> login() async {
    FocusScope.of(context).unfocus();

    final isValid =
        formKey.currentState?.validate() ?? false;

    if (!isValid) {
      showErrorMessage(
        'Please correct the highlighted errors.',
      );
      return;
    }

    final username = usernameController.text.trim();
    final password = passwordController.text;

    setState(() {
      isLoggingIn = true;
    });

    await Future.delayed(
      const Duration(milliseconds: 500),
    );

    if (!mounted) return;

    if (username != AuthConfig.username ||
        password != AuthConfig.password) {
      setState(() {
        isLoggingIn = false;
      });

      showErrorMessage('Incorrect username or password.');
      return;
    }

    setState(() {
      isLoggingIn = false;
    });

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => HomePage(
          username: username,
        ),
      ),
    );
  }

  void showErrorMessage(String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.errorRed,
        behavior: SnackBarBehavior.floating,
        content: Row(
          children: [
            const Icon(
              Icons.error_outline,
              color: AppColors.white,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(message),
            ),
          ],
        ),
      ),
    );
  }

  void showInformationMessage(String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.primaryBlue,
        behavior: SnackBarBehavior.floating,
        content: Row(
          children: [
            const Icon(
              Icons.info_outline,
              color: AppColors.white,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(message),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior:
              ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 28,
          ),
          child: Form(
            key: formKey,
            child: Column(
              children: [
                const SizedBox(height: 15),

                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: AppColors.border,
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x1412649A),
                        blurRadius: 24,
                        offset: Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Image.asset(
                    'assets/images/logo.png',
                    height: 105,
                    fit: BoxFit.contain,
                    errorBuilder: (
                      context,
                      error,
                      stackTrace,
                    ) {
                      return const Icon(
                        Icons.local_pharmacy,
                        size: 80,
                        color: AppColors.primaryGreen,
                      );
                    },
                  ),
                ),

                const SizedBox(height: 28),

                const Text(
                  'Staff Login',
                  style: TextStyle(
                    color: AppColors.primaryBlue,
                    fontSize: 29,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 8),

                const Text(
                  'Sign in to access your staff dashboard',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.textGrey,
                    fontSize: 15,
                  ),
                ),

                const SizedBox(height: 34),

                TextFormField(
                  controller: usernameController,
                  keyboardType: TextInputType.text,
                  textInputAction: TextInputAction.next,
                  validator: validateUsername,
                  autocorrect: false,
                  enableSuggestions: false,
                  autovalidateMode:
                      AutovalidateMode.onUserInteraction,
                  decoration: const InputDecoration(
                    labelText: 'Username',
                    hintText: 'Enter your username',
                    prefixIcon: Icon(
                      Icons.person_outline,
                      color: AppColors.primaryBlue,
                    ),
                  ),
                ),

                const SizedBox(height: 18),

                TextFormField(
                  controller: passwordController,
                  obscureText: hidePassword,
                  textInputAction: TextInputAction.done,
                  validator: validatePassword,
                  autovalidateMode:
                      AutovalidateMode.onUserInteraction,
                  onFieldSubmitted: (_) {
                    login();
                  },
                  decoration: InputDecoration(
                    labelText: 'Password',
                    hintText: 'Enter your password',
                    prefixIcon: const Icon(
                      Icons.lock_outline,
                      color: AppColors.primaryBlue,
                    ),
                    suffixIcon: IconButton(
                      onPressed: () {
                        setState(() {
                          hidePassword = !hidePassword;
                        });
                      },
                      icon: Icon(
                        hidePassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 28),

                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: FilledButton(
                    onPressed:
                        isLoggingIn ? null : login,
                    style: FilledButton.styleFrom(
                      backgroundColor:
                          AppColors.primaryBlue,
                      foregroundColor: AppColors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(16),
                      ),
                    ),
                    child: isLoggingIn
                        ? const SizedBox(
                            width: 25,
                            height: 25,
                            child:
                                CircularProgressIndicator(
                              color: AppColors.white,
                              strokeWidth: 2.5,
                            ),
                          )
                        : const Row(
                            mainAxisAlignment:
                                MainAxisAlignment.center,
                            children: [
                              Icon(Icons.login),
                              SizedBox(width: 10),
                              Text(
                                'LOGIN',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight:
                                      FontWeight.bold,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),

                const SizedBox(height: 14),

                TextButton(
                  onPressed: () {
                    showDialog<void>(
                      context: context,
                      builder: (dialogContext) {
                        return AlertDialog(
                          backgroundColor: AppColors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          title: const Row(
                            children: [
                              Icon(
                                Icons.lock_person_outlined,
                                color: AppColors.primaryBlue,
                              ),
                              SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'Password Access Restricted',
                                  style: TextStyle(
                                    color: AppColors.primaryBlue,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          content: const Text(
                            'Please contact the administrator. Staff members '
                            'do not have access to change the password.',
                          ),
                          actions: [
                            FilledButton(
                              onPressed: () {
                                Navigator.pop(dialogContext);
                              },
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.primaryBlue,
                                foregroundColor: AppColors.white,
                              ),
                              child: const Text('OK'),
                            ),
                          ],
                        );
                      },
                    );
                  },
                  child: const Text(
                    'Forgot Password?',
                    style: TextStyle(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                Container(
                  width: 75,
                  height: 4,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        AppColors.primaryBlue,
                        AppColors.primaryGreen,
                      ],
                    ),
                    borderRadius:
                        BorderRadius.circular(20),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// =====================================================
// HOME PAGE
// =====================================================

class HomePage extends StatelessWidget {
  final String username;

  const HomePage({
    super.key,
    required this.username,
  });

  void openModule(
    BuildContext context,
    String moduleName,
  ) {
    if (moduleName == 'Orders') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OrdersScreen(
            username: username,
          ),
        ),
      );
      return;
    }

    if (moduleName == 'Attendance') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => AttendanceScreen(
            username: username,
          ),
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            ModulePlaceholderScreen(
          moduleName: moduleName,
        ),
      ),
    );
  }

  void logout(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Row(
            children: [
              Icon(
                Icons.logout,
                color: AppColors.primaryBlue,
              ),
              SizedBox(width: 10),
              Text(
                'Logout',
                style: TextStyle(
                  color: AppColors.primaryBlue,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          content: const Text(
            'Are you sure you want to logout?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                Navigator.pop(dialogContext);

                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                        const LoginScreen(),
                  ),
                  (route) => false,
                );
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.errorRed,
                foregroundColor: AppColors.white,
              ),
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        toolbarHeight: 68,
        title: Row(
          children: [
            Container(
              width: 43,
              height: 43,
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(11),
              ),
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.contain,
                errorBuilder: (
                  context,
                  error,
                  stackTrace,
                ) {
                  return const Icon(
                    Icons.local_pharmacy,
                    color: AppColors.primaryGreen,
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  'MAXOSMITH',
                  style: TextStyle(
                    color: AppColors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Staff App',
                  style: TextStyle(
                    color: Color(0xFFD8ECFA),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () {
              logout(context);
            },
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            20,
            22,
            20,
            20,
          ),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      AppColors.primaryBlue,
                      AppColors.darkBlue,
                    ],
                  ),
                  borderRadius:
                      BorderRadius.circular(22),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment:
                            CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Welcome, $username',
                            style: const TextStyle(
                              color: AppColors.white,
                              fontSize: 22,
                              fontWeight:
                                  FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 7),
                          const Text(
                            'Manage your daily staff activities',
                            style: TextStyle(
                              color: Color(0xFFD8ECFA),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const CircleAvatar(
                      radius: 27,
                      backgroundColor:
                          AppColors.primaryGreen,
                      child: Icon(
                        Icons.person_outline,
                        color: AppColors.white,
                        size: 30,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 27),

              const Text(
                'Staff Services',
                style: TextStyle(
                  color: AppColors.textDark,
                  fontSize: 21,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                'Select a service to continue',
                style: TextStyle(
                  color: AppColors.textGrey,
                  fontSize: 14,
                ),
              ),

              const SizedBox(height: 18),

              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 15,
                  mainAxisSpacing: 15,

                  // More card height prevents overflow.
                  childAspectRatio: 0.92,

                  children: [
                    DashboardCard(
                      icon: Icons
                          .shopping_cart_checkout_outlined,
                      title: 'Orders',
                      subtitle:
                          'Create and view orders',
                      iconBackground:
                          AppColors.lightBlue,
                      iconColor:
                          AppColors.primaryBlue,
                      onTap: () {
                        openModule(context, 'Orders');
                      },
                    ),
                    DashboardCard(
                      icon: Icons
                          .account_balance_wallet_outlined,
                      title: 'Ledger',
                      subtitle:
                          'View account ledger',
                      iconBackground:
                          AppColors.lightGreen,
                      iconColor:
                          AppColors.primaryGreen,
                      onTap: () {
                        openModule(context, 'Ledger');
                      },
                    ),
                    DashboardCard(
                      icon: Icons.people_alt_outlined,
                      title: 'Customers',
                      subtitle:
                          'Manage customer records',
                      iconBackground:
                          AppColors.lightBlue,
                      iconColor:
                          AppColors.primaryBlue,
                      onTap: () {
                        openModule(
                          context,
                          'Customers',
                        );
                      },
                    ),
                    DashboardCard(
                      icon: Icons
                          .fact_check_outlined,
                      title: 'Attendance',
                      subtitle:
                          'Mark and view attendance',
                      iconBackground:
                          AppColors.lightGreen,
                      iconColor:
                          AppColors.primaryGreen,
                      onTap: () {
                        openModule(
                          context,
                          'Attendance',
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// =====================================================
// DASHBOARD CARD
// =====================================================

class DashboardCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color iconBackground;
  final Color iconColor;
  final VoidCallback onTap;

  const DashboardCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.iconBackground,
    required this.iconColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppColors.border,
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x1012649A),
                blurRadius: 12,
                offset: Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Container(
                width: 53,
                height: 53,
                decoration: BoxDecoration(
                  color: iconBackground,
                  borderRadius:
                      BorderRadius.circular(16),
                ),
                child: Icon(
                  icon,
                  color: iconColor,
                  size: 29,
                ),
              ),

              const SizedBox(height: 13),

              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.textDark,
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 6),

              Expanded(
                child: Text(
                  subtitle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textGrey,
                    fontSize: 12.5,
                    height: 1.3,
                  ),
                ),
              ),

              const Align(
                alignment: Alignment.centerRight,
                child: Icon(
                  Icons.arrow_forward_rounded,
                  color: AppColors.primaryGreen,
                  size: 22,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// =====================================================
// ATTENDANCE SCREEN
// =====================================================

enum AttendanceStatus {
  present,
  absent,
  halfDay,
}

class AttendanceScreen extends StatefulWidget {
  final String username;

  const AttendanceScreen({
    super.key,
    required this.username,
  });

  @override
  State<AttendanceScreen> createState() {
    return _AttendanceScreenState();
  }
}

class _AttendanceScreenState
    extends State<AttendanceScreen>
    with WidgetsBindingObserver {
  static const int attendanceOpeningHour = 19;

  final SharedPreferencesAsync preferences =
      SharedPreferencesAsync();

  final Map<String, AttendanceStatus>
      attendanceRecords =
      <String, AttendanceStatus>{};

  late DateTime displayedMonth;
  late DateTime today;

  DateTime currentTime = DateTime.now();

  bool isLoading = true;

  Timer? clockTimer;

  static const List<String> monthNames =
      <String>[
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  static const List<String> weekdayNames =
      <String>[
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  String get recordsStorageKey {
    return 'attendance_records_'
        '${widget.username.trim().toLowerCase()}';
  }

  String get startDateStorageKey {
    return 'attendance_start_'
        '${widget.username.trim().toLowerCase()}';
  }

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addObserver(this);

    final now = DateTime.now();

    today = dateOnly(now);
    currentTime = now;

    displayedMonth = DateTime(
      today.year,
      today.month,
    );

    initializeAttendance();

    clockTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) {
        refreshCurrentTime();
      },
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    clockTimer?.cancel();

    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(
    AppLifecycleState state,
  ) {
    if (state == AppLifecycleState.resumed) {
      initializeAttendance();
    }
  }

  DateTime dateOnly(DateTime value) {
    return DateTime(
      value.year,
      value.month,
      value.day,
    );
  }

  bool isSameDate(
    DateTime first,
    DateTime second,
  ) {
    return first.year == second.year &&
        first.month == second.month &&
        first.day == second.day;
  }

  bool isBeforeToday(DateTime date) {
    return dateOnly(date).isBefore(today);
  }

  bool isAfterToday(DateTime date) {
    return dateOnly(date).isAfter(today);
  }

  bool isSunday(DateTime date) {
    return date.weekday == DateTime.sunday;
  }

  bool attendanceWindowIsOpen() {
    return currentTime.hour >=
        attendanceOpeningHour;
  }

  String dateKey(DateTime date) {
    return '${date.year}-'
        '${date.month.toString().padLeft(2, '0')}-'
        '${date.day.toString().padLeft(2, '0')}';
  }

  DateTime? parseDateKey(String value) {
    final parts = value.split('-');

    if (parts.length != 3) {
      return null;
    }

    final year = int.tryParse(parts[0]);
    final month = int.tryParse(parts[1]);
    final day = int.tryParse(parts[2]);

    if (year == null ||
        month == null ||
        day == null) {
      return null;
    }

    return DateTime(year, month, day);
  }

  String formattedDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year}';
  }

  String formattedTime(DateTime time) {
    final hour12 = time.hour == 0
        ? 12
        : time.hour > 12
            ? time.hour - 12
            : time.hour;

    final minute =
        time.minute.toString().padLeft(2, '0');

    final period =
        time.hour >= 12 ? 'PM' : 'AM';

    return '$hour12:$minute $period';
  }

  String statusLabel(
    AttendanceStatus status,
  ) {
    switch (status) {
      case AttendanceStatus.present:
        return 'Present';

      case AttendanceStatus.absent:
        return 'Absent';

      case AttendanceStatus.halfDay:
        return 'Half Day';
    }
  }

  Color statusColor(
    AttendanceStatus status,
  ) {
    switch (status) {
      case AttendanceStatus.present:
        return AppColors.primaryGreen;

      case AttendanceStatus.absent:
        return AppColors.errorRed;

      case AttendanceStatus.halfDay:
        return const Color(0xFFF59E0B);
    }
  }

  IconData statusIcon(
    AttendanceStatus status,
  ) {
    switch (status) {
      case AttendanceStatus.present:
        return Icons.check_circle_outline;

      case AttendanceStatus.absent:
        return Icons.cancel_outlined;

      case AttendanceStatus.halfDay:
        return Icons.timelapse_outlined;
    }
  }

  AttendanceStatus? statusFor(
    DateTime date,
  ) {
    return attendanceRecords[dateKey(date)];
  }

  bool isAlreadyMarked(DateTime date) {
    return attendanceRecords.containsKey(
      dateKey(date),
    );
  }

  AttendanceStatus? statusFromStorage(
    String value,
  ) {
    for (final status
        in AttendanceStatus.values) {
      if (status.name == value) {
        return status;
      }
    }

    return null;
  }

  Future<void> initializeAttendance() async {
    final now = DateTime.now();

    today = dateOnly(now);
    currentTime = now;

    await loadAttendanceRecords();
    await markMissedWorkingDaysAbsent();

    final todayMarked =
        isAlreadyMarked(today);

    await AttendanceNotificationService
        .scheduleNextReminder(
      username: widget.username,
      todayAlreadyMarked: todayMarked,
    );

    if (!mounted) {
      return;
    }

    final currentMonth = DateTime(
      today.year,
      today.month,
    );

    setState(() {
      if (displayedMonth
          .isAfter(currentMonth)) {
        displayedMonth = currentMonth;
      }

      isLoading = false;
    });
  }

  Future<void>
      loadAttendanceRecords() async {
    attendanceRecords.clear();

    final storedJson =
        await preferences.getString(
      recordsStorageKey,
    );

    if (storedJson == null ||
        storedJson.trim().isEmpty) {
      return;
    }

    try {
      final decoded = jsonDecode(storedJson);

      if (decoded is! Map) {
        return;
      }

      for (final entry
          in decoded.entries) {
        final status = statusFromStorage(
          entry.value.toString(),
        );

        if (status != null) {
          attendanceRecords[
              entry.key.toString()] = status;
        }
      }
    } catch (_) {
      // Corrupted local attendance data is ignored.
    }
  }

  Future<void>
      saveAttendanceRecords() async {
    final encoded = <String, String>{};

    for (final entry
        in attendanceRecords.entries) {
      encoded[entry.key] = entry.value.name;
    }

    await preferences.setString(
      recordsStorageKey,
      jsonEncode(encoded),
    );
  }

  Future<DateTime>
      getAttendanceStartDate() async {
    final storedStart =
        await preferences.getString(
      startDateStorageKey,
    );

    if (storedStart != null) {
      final parsed =
          parseDateKey(storedStart);

      if (parsed != null) {
        return dateOnly(parsed);
      }
    }

    /*
     * On first use, attendance tracking begins
     * from the first day of the current month.
     */
    final start = DateTime(
      today.year,
      today.month,
      1,
    );

    await preferences.setString(
      startDateStorageKey,
      dateKey(start),
    );

    return start;
  }

  Future<void>
      markMissedWorkingDaysAbsent() async {
    final startDate =
        await getAttendanceStartDate();

    var date = startDate;
    var recordsChanged = false;

    while (date.isBefore(today)) {
      /*
       * Sundays are weekly offs.
       * Every other unmarked previous date
       * becomes Absent automatically.
       */
      if (!isSunday(date) &&
          !isAlreadyMarked(date)) {
        attendanceRecords[dateKey(date)] =
            AttendanceStatus.absent;

        recordsChanged = true;
      }

      date = date.add(
        const Duration(days: 1),
      );
    }

    if (recordsChanged) {
      await saveAttendanceRecords();
    }
  }

  void refreshCurrentTime() {
    final now = DateTime.now();
    final newToday = dateOnly(now);

    if (!isSameDate(newToday, today)) {
      initializeAttendance();
      return;
    }

    if (!mounted) {
      return;
    }

    setState(() {
      currentTime = now;
    });
  }

  void changeMonth(int difference) {
    final proposedMonth = DateTime(
      displayedMonth.year,
      displayedMonth.month + difference,
    );

    final currentMonth = DateTime(
      today.year,
      today.month,
    );

    if (proposedMonth
        .isAfter(currentMonth)) {
      showMessage(
        'Future months cannot be opened.',
        isError: true,
      );

      return;
    }

    setState(() {
      displayedMonth = proposedMonth;
    });
  }

  void handleCalendarDateTap(
    DateTime date,
  ) {
    if (isSameDate(date, today)) {
      if (isSunday(date)) {
        showMessage(
          'Today is Sunday and is automatically treated as Weekly Off.',
          isError: true,
        );

        return;
      }

      if (isAlreadyMarked(date)) {
        showMessage(
          'Today’s attendance is already locked.',
          isError: true,
        );

        return;
      }

      if (!attendanceWindowIsOpen()) {
        showMessage(
          'Attendance can only be marked after 7:00 PM.',
          isError: true,
        );

        return;
      }

      showMessage(
        'Use Present, Half Day or Absent to mark today’s attendance.',
      );

      return;
    }

    if (isBeforeToday(date)) {
      showMessage(
        'Previous dates are locked. Any unmarked working day is automatically recorded as Absent.',
        isError: true,
      );

      return;
    }

    showMessage(
      'Future attendance cannot be marked.',
      isError: true,
    );
  }

  Future<void> markAttendance(
    AttendanceStatus status,
  ) async {
    final now = DateTime.now();

    today = dateOnly(now);
    currentTime = now;

    if (isSunday(today)) {
      showMessage(
        'Sunday is a weekly off. Attendance cannot be marked.',
        isError: true,
      );

      return;
    }

    if (!attendanceWindowIsOpen()) {
      showMessage(
        'Attendance can only be marked after 7:00 PM.',
        isError: true,
      );

      return;
    }

    if (isAlreadyMarked(today)) {
      showMessage(
        'Today’s attendance is already locked and cannot be changed.',
        isError: true,
      );

      return;
    }

    /*
     * Clicking a status does not immediately
     * lock attendance. The confirmation popup
     * appears first.
     */
    final confirmed =
        await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.white,
          shape: RoundedRectangleBorder(
            borderRadius:
                BorderRadius.circular(20),
          ),
          title: Row(
            children: [
              Icon(
                statusIcon(status),
                color: statusColor(status),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'Confirm and Lock Attendance',
                  style: TextStyle(
                    color:
                        AppColors.primaryBlue,
                    fontWeight:
                        FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          content: Text(
            'You selected '
            '${statusLabel(status)} for '
            '${formattedDate(today)}.\n\n'
            'Please verify your selection. '
            'It will be locked only after you press '
            'LOCK ATTENDANCE.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                  false,
                );
              },
              child: const Text('GO BACK'),
            ),
            FilledButton.icon(
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                  true,
                );
              },
              style:
                  FilledButton.styleFrom(
                backgroundColor:
                    statusColor(status),
                foregroundColor:
                    AppColors.white,
              ),
              icon: const Icon(
                Icons.lock_outline,
              ),
              label: const Text(
                'LOCK ATTENDANCE',
              ),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) {
      return;
    }

    setState(() {
      attendanceRecords[dateKey(today)] =
          status;
    });

    await saveAttendanceRecords();

    /*
     * Remove today's reminder because
     * attendance is now locked.
     */
    await AttendanceNotificationService
        .cancelReminder();

    /*
     * Prepare the next working day's reminder.
     */
    await AttendanceNotificationService
        .scheduleNextReminder(
      username: widget.username,
      todayAlreadyMarked: true,
    );

    if (!mounted) {
      return;
    }

    showMessage(
      '${statusLabel(status)} attendance has been locked successfully.',
    );
  }

  void showMessage(
    String message, {
    bool isError = false,
  }) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context)
        .hideCurrentSnackBar();

    ScaffoldMessenger.of(context)
        .showSnackBar(
      SnackBar(
        backgroundColor: isError
            ? AppColors.errorRed
            : AppColors.primaryGreen,
        behavior:
            SnackBarBehavior.floating,
        content: Row(
          children: [
            Icon(
              isError
                  ? Icons.error_outline
                  : Icons
                      .check_circle_outline,
              color: AppColors.white,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(message),
            ),
          ],
        ),
      ),
    );
  }

  int countStatusForDisplayedMonth(
    AttendanceStatus status,
  ) {
    var count = 0;

    for (final entry
        in attendanceRecords.entries) {
      final date =
          parseDateKey(entry.key);

      if (date == null) {
        continue;
      }

      if (date.year ==
              displayedMonth.year &&
          date.month ==
              displayedMonth.month &&
          entry.value == status) {
        count++;
      }
    }

    return count;
  }

  int sundayCountForDisplayedMonth() {
    final daysInMonth = DateTime(
      displayedMonth.year,
      displayedMonth.month + 1,
      0,
    ).day;

    var count = 0;

    for (var day = 1;
        day <= daysInMonth;
        day++) {
      final date = DateTime(
        displayedMonth.year,
        displayedMonth.month,
        day,
      );

      if (isSunday(date)) {
        count++;
      }
    }

    return count;
  }

  Widget buildLegendItem({
    required Color color,
    required String label,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 13,
          height: 13,
          decoration: BoxDecoration(
            color: color,
            borderRadius:
                BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textGrey,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget buildAttendanceButton({
    required AttendanceStatus status,
    required String label,
    required IconData icon,
  }) {
    final disabled = isLoading ||
        isSunday(today) ||
        !attendanceWindowIsOpen() ||
        isAlreadyMarked(today);

    return Expanded(
      child: SizedBox(
        height: 54,
        child: FilledButton.icon(
          onPressed: disabled
              ? null
              : () {
                  markAttendance(status);
                },
          style:
              FilledButton.styleFrom(
            backgroundColor:
                statusColor(status),
            foregroundColor:
                AppColors.white,
            disabledBackgroundColor:
                AppColors.border.withValues(
              alpha: 0.75,
            ),
            disabledForegroundColor:
                AppColors.textGrey,
            padding:
                const EdgeInsets.symmetric(
              horizontal: 7,
            ),
            shape: RoundedRectangleBorder(
              borderRadius:
                  BorderRadius.circular(14),
            ),
          ),
          icon: Icon(
            icon,
            size: 18,
          ),
          label: Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget buildCalendar() {
    final firstDay = DateTime(
      displayedMonth.year,
      displayedMonth.month,
      1,
    );

    final daysInMonth = DateTime(
      displayedMonth.year,
      displayedMonth.month + 1,
      0,
    ).day;

    final leadingEmptyCells =
        firstDay.weekday - 1;

    final totalCells =
        leadingEmptyCells + daysInMonth;

    final rowCount =
        (totalCells / 7).ceil();

    final cellCount = rowCount * 7;

    return Column(
      children: [
        Row(
          children: weekdayNames
              .map(
                (weekday) => Expanded(
                  child: Center(
                    child: Text(
                      weekday,
                      style: TextStyle(
                        color:
                            weekday == 'Sun'
                                ? AppColors
                                    .primaryBlue
                                : AppColors
                                    .textGrey,
                        fontSize: 12,
                        fontWeight:
                            FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 10),
        GridView.builder(
          shrinkWrap: true,
          physics:
              const NeverScrollableScrollPhysics(),
          itemCount: cellCount,
          gridDelegate:
              const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            crossAxisSpacing: 6,
            mainAxisSpacing: 7,
            childAspectRatio: 0.87,
          ),
          itemBuilder: (
            context,
            index,
          ) {
            final dayNumber =
                index -
                    leadingEmptyCells +
                    1;

            if (dayNumber < 1 ||
                dayNumber > daysInMonth) {
              return const SizedBox.shrink();
            }

            final date = DateTime(
              displayedMonth.year,
              displayedMonth.month,
              dayNumber,
            );

            final status =
                statusFor(date);

            final sunday =
                isSunday(date);

            final todayCell =
                isSameDate(date, today);

            final future =
                isAfterToday(date);

            Color backgroundColor =
                AppColors.white;

            Color foregroundColor =
                AppColors.textDark;

            Color borderColor =
                AppColors.border;

            IconData? smallIcon;

            if (sunday) {
              backgroundColor =
                  AppColors.primaryBlue;

              foregroundColor =
                  AppColors.white;

              borderColor =
                  AppColors.primaryBlue;

              smallIcon =
                  Icons.weekend_outlined;
            } else if (status != null) {
              backgroundColor =
                  statusColor(status);

              foregroundColor =
                  AppColors.white;

              borderColor =
                  statusColor(status);

              smallIcon =
                  statusIcon(status);
            } else if (future) {
              backgroundColor =
                  AppColors.background;

              foregroundColor =
                  AppColors.textGrey
                      .withValues(
                alpha: 0.55,
              );
            }

            if (todayCell) {
              borderColor =
                  AppColors.textDark;
            }

            return Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () {
                  handleCalendarDateTap(
                    date,
                  );
                },
                borderRadius:
                    BorderRadius.circular(12),
                child: AnimatedContainer(
                  duration: const Duration(
                    milliseconds: 180,
                  ),
                  decoration: BoxDecoration(
                    color: backgroundColor,
                    borderRadius:
                        BorderRadius.circular(
                      12,
                    ),
                    border: Border.all(
                      color: borderColor,
                      width:
                          todayCell ? 2.5 : 1,
                    ),
                    boxShadow: todayCell
                        ? const [
                            BoxShadow(
                              color: Color(
                                0x2212649A,
                              ),
                              blurRadius: 7,
                              offset:
                                  Offset(0, 3),
                            ),
                          ]
                        : null,
                  ),
                  child: Column(
                    mainAxisAlignment:
                        MainAxisAlignment
                            .center,
                    children: [
                      Text(
                        '$dayNumber',
                        style: TextStyle(
                          color:
                              foregroundColor,
                          fontSize: 14,
                          fontWeight:
                              FontWeight.bold,
                        ),
                      ),
                      if (smallIcon != null)
                        ...[
                          const SizedBox(
                            height: 2,
                          ),
                          Icon(
                            smallIcon,
                            size: 13,
                            color:
                                foregroundColor,
                          ),
                        ]
                      else if (todayCell)
                        ...[
                          const SizedBox(
                            height: 1,
                          ),
                          Text(
                            'TODAY',
                            style: TextStyle(
                              color:
                                  foregroundColor,
                              fontSize: 7,
                              fontWeight:
                                  FontWeight
                                      .bold,
                            ),
                          ),
                        ],
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget buildSummaryCard({
    required String label,
    required String value,
    required Color color,
    required IconData icon,
  }) {
    return Expanded(
      child: Container(
        padding:
            const EdgeInsets.symmetric(
          vertical: 14,
          horizontal: 8,
        ),
        decoration: BoxDecoration(
          color: color.withValues(
            alpha: 0.10,
          ),
          borderRadius:
              BorderRadius.circular(15),
          border: Border.all(
            color: color.withValues(
              alpha: 0.28,
            ),
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: color,
              size: 22,
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 19,
                fontWeight:
                    FontWeight.bold,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.textGrey,
                fontSize: 11.5,
                fontWeight:
                    FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildRule(
    int number,
    String rule,
  ) {
    return Padding(
      padding:
          const EdgeInsets.only(
        bottom: 13,
      ),
      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 13,
            backgroundColor:
                AppColors.lightBlue,
            child: Text(
              '$number',
              style: const TextStyle(
                color:
                    AppColors.primaryBlue,
                fontSize: 12,
                fontWeight:
                    FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Text(
              rule,
              style: const TextStyle(
                color: AppColors.textDark,
                fontSize: 13.5,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildNotice({
    required IconData icon,
    required String message,
    required Color color,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: color.withValues(
          alpha: 0.10,
        ),
        borderRadius:
            BorderRadius.circular(13),
        border: Border.all(
          color: color.withValues(
            alpha: 0.24,
          ),
        ),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: color,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: color,
                fontSize: 12.5,
                fontWeight:
                    FontWeight.w600,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildAvailabilityNotice() {
    if (isSunday(today)) {
      return buildNotice(
        icon: Icons.weekend_outlined,
        message:
            'Today is Sunday. It is automatically treated as Weekly Off.',
        color: AppColors.primaryBlue,
      );
    }

    final todayStatus =
        statusFor(today);

    if (todayStatus != null) {
      return buildNotice(
        icon: Icons.lock_outline,
        message:
            'Today’s attendance is locked as ${statusLabel(todayStatus)} and cannot be changed.',
        color:
            statusColor(todayStatus),
      );
    }

    if (!attendanceWindowIsOpen()) {
      return buildNotice(
        icon: Icons.schedule_outlined,
        message:
            'Attendance will open at 7:00 PM. Current time: ${formattedTime(currentTime)}.',
        color:
            const Color(0xFFF59E0B),
      );
    }

    return buildNotice(
      icon:
          Icons.notifications_active_outlined,
      message:
          'Attendance is open. Select a status and confirm it. A reminder is scheduled for 7:30 PM if it remains unmarked.',
      color: AppColors.primaryGreen,
    );
  }

  @override
  Widget build(BuildContext context) {
    final todayStatus =
        statusFor(today);

    String statusText = 'Not Marked';

    Color statusTextColor =
        AppColors.textGrey;

    if (isSunday(today)) {
      statusText = 'Weekly Off';
      statusTextColor =
          AppColors.primaryBlue;
    } else if (todayStatus != null) {
      statusText =
          statusLabel(todayStatus);

      statusTextColor =
          statusColor(todayStatus);
    } else if (!attendanceWindowIsOpen()) {
      statusText = 'Opens at 7:00 PM';

      statusTextColor =
          const Color(0xFFF59E0B);
    }

    return Scaffold(
      appBar: AppBar(
        title:
            const Text('Staff Attendance'),
      ),
      body: SafeArea(
        child: isLoading
            ? const Center(
                child:
                    CircularProgressIndicator(),
              )
            : SingleChildScrollView(
                padding:
                    const EdgeInsets.fromLTRB(
                  18,
                  20,
                  18,
                  34,
                ),
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      padding:
                          const EdgeInsets.all(
                        22,
                      ),
                      decoration:
                          BoxDecoration(
                        gradient:
                            const LinearGradient(
                          colors: [
                            AppColors.primaryBlue,
                            AppColors.darkBlue,
                          ],
                        ),
                        borderRadius:
                            BorderRadius.circular(
                          22,
                        ),
                      ),
                      child: Row(
                        children: [
                          const CircleAvatar(
                            radius: 31,
                            backgroundColor:
                                AppColors
                                    .primaryGreen,
                            child: Icon(
                              Icons
                                  .fact_check_outlined,
                              color:
                                  AppColors.white,
                              size: 32,
                            ),
                          ),
                          const SizedBox(
                            width: 15,
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment
                                      .start,
                              children: [
                                const Text(
                                  'Attendance Register',
                                  style:
                                      TextStyle(
                                    color:
                                        AppColors
                                            .white,
                                    fontSize: 21,
                                    fontWeight:
                                        FontWeight
                                            .bold,
                                  ),
                                ),
                                const SizedBox(
                                  height: 5,
                                ),
                                Text(
                                  'Staff: ${widget.username}',
                                  style:
                                      const TextStyle(
                                    color: Color(
                                      0xFFD8ECFA,
                                    ),
                                    fontSize: 14,
                                    fontWeight:
                                        FontWeight
                                            .w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    Container(
                      width: double.infinity,
                      padding:
                          const EdgeInsets.all(
                        18,
                      ),
                      decoration:
                          BoxDecoration(
                        color: AppColors.white,
                        borderRadius:
                            BorderRadius.circular(
                          19,
                        ),
                        border: Border.all(
                          color:
                              AppColors.border,
                        ),
                      ),
                      child: Column(
                        children: [
                          AttendanceInformationRow(
                            icon:
                                Icons.event_outlined,
                            label: 'Today',
                            value:
                                formattedDate(
                              today,
                            ),
                          ),
                          const Divider(
                            height: 26,
                          ),
                          AttendanceInformationRow(
                            icon:
                                Icons.access_time,
                            label: 'Current Time',
                            value:
                                formattedTime(
                              currentTime,
                            ),
                          ),
                          const Divider(
                            height: 26,
                          ),
                          AttendanceInformationRow(
                            icon:
                                Icons.info_outline,
                            label:
                                'Today’s Status',
                            value: statusText,
                            valueColor:
                                statusTextColor,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    const Text(
                      'Mark Today’s Attendance',
                      style: TextStyle(
                        color:
                            AppColors.textDark,
                        fontSize: 18,
                        fontWeight:
                            FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 11),

                    Row(
                      children: [
                        buildAttendanceButton(
                          status:
                              AttendanceStatus
                                  .present,
                          label: 'PRESENT',
                          icon: Icons
                              .check_circle_outline,
                        ),
                        const SizedBox(width: 8),
                        buildAttendanceButton(
                          status:
                              AttendanceStatus
                                  .halfDay,
                          label: 'HALF DAY',
                          icon: Icons
                              .timelapse_outlined,
                        ),
                        const SizedBox(width: 8),
                        buildAttendanceButton(
                          status:
                              AttendanceStatus
                                  .absent,
                          label: 'ABSENT',
                          icon: Icons
                              .cancel_outlined,
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    buildAvailabilityNotice(),

                    const SizedBox(height: 24),

                    Container(
                      width: double.infinity,
                      padding:
                          const EdgeInsets.all(
                        17,
                      ),
                      decoration:
                          BoxDecoration(
                        color: AppColors.white,
                        borderRadius:
                            BorderRadius.circular(
                          20,
                        ),
                        border: Border.all(
                          color:
                              AppColors.border,
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(
                              0x1012649A,
                            ),
                            blurRadius: 14,
                            offset:
                                Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              IconButton
                                  .filledTonal(
                                onPressed: () {
                                  changeMonth(-1);
                                },
                                icon: const Icon(
                                  Icons
                                      .chevron_left,
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  '${monthNames[displayedMonth.month - 1]} '
                                  '${displayedMonth.year}',
                                  textAlign:
                                      TextAlign
                                          .center,
                                  style:
                                      const TextStyle(
                                    color:
                                        AppColors
                                            .primaryBlue,
                                    fontSize: 18,
                                    fontWeight:
                                        FontWeight
                                            .bold,
                                  ),
                                ),
                              ),
                              IconButton
                                  .filledTonal(
                                onPressed:
                                    displayedMonth
                                            .isBefore(
                                  DateTime(
                                    today.year,
                                    today.month,
                                  ),
                                )
                                        ? () {
                                            changeMonth(
                                              1,
                                            );
                                          }
                                        : null,
                                icon: const Icon(
                                  Icons
                                      .chevron_right,
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 8),

                          Wrap(
                            alignment:
                                WrapAlignment.center,
                            spacing: 13,
                            runSpacing: 8,
                            children: [
                              buildLegendItem(
                                color: AppColors
                                    .primaryGreen,
                                label: 'Present',
                              ),
                              buildLegendItem(
                                color: AppColors
                                    .errorRed,
                                label: 'Absent',
                              ),
                              buildLegendItem(
                                color:
                                    const Color(
                                  0xFFF59E0B,
                                ),
                                label: 'Half Day',
                              ),
                              buildLegendItem(
                                color: AppColors
                                    .primaryBlue,
                                label:
                                    'Weekly Off',
                              ),
                              buildLegendItem(
                                color: AppColors
                                    .background,
                                label: 'Future',
                              ),
                            ],
                          ),

                          const SizedBox(
                            height: 18,
                          ),

                          buildCalendar(),
                        ],
                      ),
                    ),

                    const SizedBox(height: 22),

                    const Text(
                      'Monthly Summary',
                      style: TextStyle(
                        color:
                            AppColors.textDark,
                        fontSize: 18,
                        fontWeight:
                            FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 11),

                    Row(
                      children: [
                        buildSummaryCard(
                          label: 'Present',
                          value:
                              '${countStatusForDisplayedMonth(AttendanceStatus.present)}',
                          color: AppColors
                              .primaryGreen,
                          icon: Icons
                              .check_circle_outline,
                        ),
                        const SizedBox(width: 8),
                        buildSummaryCard(
                          label: 'Half Day',
                          value:
                              '${countStatusForDisplayedMonth(AttendanceStatus.halfDay)}',
                          color:
                              const Color(
                            0xFFF59E0B,
                          ),
                          icon: Icons
                              .timelapse_outlined,
                        ),
                        const SizedBox(width: 8),
                        buildSummaryCard(
                          label: 'Absent',
                          value:
                              '${countStatusForDisplayedMonth(AttendanceStatus.absent)}',
                          color:
                              AppColors.errorRed,
                          icon: Icons
                              .cancel_outlined,
                        ),
                        const SizedBox(width: 8),
                        buildSummaryCard(
                          label: 'Weekly Off',
                          value:
                              '${sundayCountForDisplayedMonth()}',
                          color: AppColors
                              .primaryBlue,
                          icon: Icons
                              .weekend_outlined,
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    Container(
                      width: double.infinity,
                      padding:
                          const EdgeInsets.all(
                        19,
                      ),
                      decoration:
                          BoxDecoration(
                        color: AppColors.white,
                        borderRadius:
                            BorderRadius.circular(
                          20,
                        ),
                        border: Border.all(
                          color:
                              AppColors.border,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment:
                            CrossAxisAlignment
                                .start,
                        children: [
                          const Row(
                            children: [
                              Icon(
                                Icons
                                    .rule_folder_outlined,
                                color: AppColors
                                    .primaryBlue,
                              ),
                              SizedBox(width: 9),
                              Text(
                                'Attendance Rules',
                                style:
                                    TextStyle(
                                  color: AppColors
                                      .primaryBlue,
                                  fontSize: 18,
                                  fontWeight:
                                      FontWeight
                                          .bold,
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(
                            height: 17,
                          ),

                          buildRule(
                            1,
                            'Two days of paid leave will be allowed every month, excluding weekly off. Paid leave must be approved by the administrator.',
                          ),
                          buildRule(
                            2,
                            'Staff can mark attendance only for the current day and only after 7:00 PM.',
                          ),
                          buildRule(
                            3,
                            'Previous and future dates cannot be marked or changed by staff.',
                          ),
                          buildRule(
                            4,
                            'If attendance is not marked on a working day, it is automatically recorded as Absent on the following day.',
                          ),
                          buildRule(
                            5,
                            'Every Sunday is automatically treated as Weekly Off and is shown in blue.',
                          ),
                          buildRule(
                            6,
                            'After selecting Present, Half Day or Absent, verify the selection in the confirmation popup. It is locked only after pressing LOCK ATTENDANCE.',
                          ),
                          buildRule(
                            7,
                            'Once locked, attendance cannot be modified by staff.',
                          ),
                          buildRule(
                            8,
                            'A notification is scheduled for 7:30 PM when attendance remains unmarked. Notification permission must be enabled on the phone.',
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 15),

                    const Center(
                      child: Text(
                        'Attendance is currently stored on this device. Connect it to Google Sheets for centralized company records.',
                        textAlign:
                            TextAlign.center,
                        style: TextStyle(
                          color:
                              AppColors.textGrey,
                          fontSize: 12.5,
                          height: 1.4,
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

// =====================================================
// ATTENDANCE INFORMATION ROW
// =====================================================

class AttendanceInformationRow
    extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const AttendanceInformationRow({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 45,
          height: 45,
          decoration: BoxDecoration(
            color: AppColors.lightBlue,
            borderRadius: BorderRadius.circular(13),
          ),
          child: Icon(
            icon,
            color: AppColors.primaryBlue,
          ),
        ),

        const SizedBox(width: 14),

        Expanded(
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.textGrey,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                value,
                style: TextStyle(
                  color:
                      valueColor ?? AppColors.textDark,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}


// =====================================================
// ORDERS MODULE
// =====================================================

const List<String> maxosmithProducts = <String>[
  "AMOXUNF-CV LB 625",
  "PanUNF-DSR",
  "Amter-UNF",
  "AceUNF-SP",
  "AceUNF-P",
  "LEVO-UNF M",
  "NIMESUL-UNF P",
  "OFLOX-UNF 200",
  "Croupncold-UNF",
  "Drycroup-UNF-DX Syrup",
  "Maxohomarich Syrup",
  "Maxo Digienzyme Syrup",
  "AstaMax-LS",
  "Lesmith-5",
  "Diclosmith-Plus",
  "Parasmith-MR",
  "Mefsmith-P Kid",
  "Montsmith-LC Kid",
  "SUMO Tablet",
  "FLEXON MR Tablet",
  "KETOROL-DT Tablet",
  "WYSOLONE 10mg Tablet",
  "WYSOLONE 5mg Tablet",
  "BETONOVATEN N Ointment",
  "DYNAPAR injection",
  "FOLVITE Tablet",
  "MEFTAL SPAS Tablet",
  "MEFTAL FORTE Tablet",
  "ZANOCIN OZ Tablet",
  "OXALGIN DP Tablet",
  "CIPLOX 500 Tablet",
  "CIPLOX TZ Tablet",
  "CIPLACTIN Tablet",
  "GELUSIN MPS SYRUP",
  "EVION-400 Capsule",
  "QUADRIDERM RF 5GM",
  "ZERODOL SPAS Tablet",
  "ZERODOL-P Tablet",
  "MONOCEF 1GM",
  "MONOCEF 500mg",
  "NEUROBION FORTE Tablet",
  "PANTOP IV",
  "DEXORANGE PLUS Syrup",
  "LIV 52 TABLET",
  "LIV 52 DS TABLET",
  "LIV 52 SYRUP 200",
  "LIV 52 SYRUP 100",
  "LIV 52 DS SYRUP100",
  "LIV 52 DS SYRUP200",
  "PANTOP 40MG TABLET",
  "ZIFI 200MG TABLET",
  "MOXIKIND CV 375 TABLET",
  "MOXIKIND CV 625 TABLET",
  "AMLOKIND-AT TABLET",
  "TELMIKIND-40 TABLET",
  "MOX 250 CAPSULE",
  "MOX 500 CAPSULE",
  "BECOSULES CAPSULE",
  "ZIFI-O 200 TABLET",
  "MEFTAL-P TABLET",
  "OMNACORTIL-10 TABLET",
  "OMNACORTIL-5 TABLET",
  "PANTOP-DSR",
  "DYTOR-10 TABLET",
  "ZERODOL-SP Tablet",
  "UNIENZYME TABLET",
  "COMBIFLAM TABLET",
  "IBUGESIC PLUS SUSPENSION",
  "DIGENE ORANGE TABLET",
  "DIGENE orange Syrup",
  "ACILOC 150 TABLET",
  "ACILOC 300 TABLET",
  "COMBIFLAM SUSPENSION",
  "AMLOPRES-AT TABLET",
  "DOLO 650 TABLET",
  "BETNESOL 0.5 MG TABLET",
  "GASOFAST AYURVEDIC",
  "CHESTON COLD TABLET",
  "INTAGESIC MR TABLET",
  "MONOCEF 250mg",
];

class OrderItemEntry {
  final String productName;
  final int amount;

  const OrderItemEntry({
    required this.productName,
    required this.amount,
  });

  factory OrderItemEntry.fromJson(
    Map<String, dynamic> json,
  ) {
    return OrderItemEntry(
      productName: json['productName']?.toString() ?? '',
      amount: int.tryParse(
            json['amount']?.toString() ?? '',
          ) ??
          0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productName': productName,
      'amount': amount,
    };
  }
}

class StaffOrder {
  final String datePlaced;
  final String staffName;
  final String partyName;
  final String orderId;
  final List<OrderItemEntry> items;
  String status;
  String deliveredDate;

  StaffOrder({
    required this.datePlaced,
    required this.staffName,
    required this.partyName,
    required this.orderId,
    required this.items,
    this.status = 'Pending',
    this.deliveredDate = '',
  });

  factory StaffOrder.fromJson(
    Map<String, dynamic> json,
  ) {
    final rawItems = json['items'];

    return StaffOrder(
      datePlaced: json['datePlaced']?.toString() ?? '',
      staffName: json['staffName']?.toString() ?? '',
      partyName: json['partyName']?.toString() ?? '',
      orderId: json['orderId']?.toString() ?? '',
      items: rawItems is List
          ? rawItems
              .whereType<Map>()
              .map(
                (item) => OrderItemEntry.fromJson(
                  Map<String, dynamic>.from(item),
                ),
              )
              .where(
                (item) =>
                    item.productName.isNotEmpty &&
                    item.amount > 0,
              )
              .toList()
          : <OrderItemEntry>[],
      status: json['status']?.toString() ?? 'Pending',
      deliveredDate:
          json['deliveredDate']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'datePlaced': datePlaced,
      'staffName': staffName,
      'partyName': partyName,
      'orderId': orderId,
      'items': items.map((item) => item.toJson()).toList(),
      'status': status,
      'deliveredDate': deliveredDate,
    };
  }
}

class OrdersScreen extends StatefulWidget {
  final String username;

  const OrdersScreen({
    super.key,
    required this.username,
  });

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final GlobalKey<FormState> orderFormKey =
      GlobalKey<FormState>();

  final TextEditingController staffNameController =
      TextEditingController();

  final TextEditingController partyNameController =
      TextEditingController();

  final TextEditingController amountController =
      TextEditingController(text: '1');

  final TextEditingController productSearchController =
      TextEditingController();

  String? selectedProduct;
  final List<OrderItemEntry> currentItems = [];
  final List<StaffOrder> orders = [];
  final List<String> availableProducts =
      List<String>.from(maxosmithProducts);

  StaffOrder? orderBeingEdited;

  bool isLoadingOrders = true;
  bool isSavingOrder = false;

  @override
  void initState() {
    super.initState();
    staffNameController.text = widget.username;
    loadOrdersAndProducts();
  }

  Future<void> loadOrdersAndProducts() async {
    setState(() {
      isLoadingOrders = true;
    });

    try {
      final results = await Future.wait<dynamic>([
        OrderApi.getOrders(),
        OrderApi.getProducts(),
      ]);

      if (!mounted) return;

      final serverOrders = results[0] as List<StaffOrder>;
      final serverProducts = results[1] as List<String>;

      setState(() {
        orders
          ..clear()
          ..addAll(serverOrders);

        if (serverProducts.isNotEmpty) {
          availableProducts
            ..clear()
            ..addAll(serverProducts);
        }

        isLoadingOrders = false;
      });
    } catch (error) {
      if (!mounted) return;

      setState(() {
        isLoadingOrders = false;
      });

      showMessage(
        cleanError(error),
        isError: true,
      );
    }
  }

  String cleanError(Object error) {
    return error
        .toString()
        .replaceFirst('Exception: ', '');
  }

  @override
  void dispose() {
    staffNameController.dispose();
    partyNameController.dispose();
    amountController.dispose();
    productSearchController.dispose();
    super.dispose();
  }

  String formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year}';
  }

  String generateOrderId() {
    final now = DateTime.now();
    return 'ORD-${now.year}'
        '${now.month.toString().padLeft(2, '0')}'
        '${now.day.toString().padLeft(2, '0')}-'
        '${now.hour.toString().padLeft(2, '0')}'
        '${now.minute.toString().padLeft(2, '0')}'
        '${now.second.toString().padLeft(2, '0')}';
  }

  void showMessage(
    String message, {
    bool isError = false,
  }) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: isError
            ? AppColors.errorRed
            : AppColors.primaryGreen,
        behavior: SnackBarBehavior.floating,
        content: Row(
          children: [
            Icon(
              isError
                  ? Icons.error_outline
                  : Icons.check_circle_outline,
              color: AppColors.white,
            ),
            const SizedBox(width: 10),
            Expanded(child: Text(message)),
          ],
        ),
      ),
    );
  }

  void addProduct() {
    FocusScope.of(context).unfocus();

    final product = selectedProduct;
    final amount = int.tryParse(
      amountController.text.trim(),
    );

    if (product == null || product.isEmpty) {
      showMessage(
        'Please select a product.',
        isError: true,
      );
      return;
    }

    if (amount == null || amount <= 0) {
      showMessage(
        'Please enter a valid amount.',
        isError: true,
      );
      return;
    }

    final duplicateIndex = currentItems.indexWhere(
      (item) => item.productName == product,
    );

    setState(() {
      if (duplicateIndex >= 0) {
        final existing = currentItems[duplicateIndex];
        currentItems[duplicateIndex] = OrderItemEntry(
          productName: existing.productName,
          amount: existing.amount + amount,
        );
      } else {
        currentItems.add(
          OrderItemEntry(
            productName: product,
            amount: amount,
          ),
        );
      }

      selectedProduct = null;
      amountController.text = '1';
    });

    showMessage('Product added to the order.');
  }

  void removeProduct(int index) {
    setState(() {
      currentItems.removeAt(index);
    });
  }

  void increaseProductAmount(int index) {
    final item = currentItems[index];

    setState(() {
      currentItems[index] = OrderItemEntry(
        productName: item.productName,
        amount: item.amount + 1,
      );
    });
  }

  void decreaseProductAmount(int index) {
    final item = currentItems[index];

    if (item.amount <= 1) {
      removeProduct(index);
      return;
    }

    setState(() {
      currentItems[index] = OrderItemEntry(
        productName: item.productName,
        amount: item.amount - 1,
      );
    });
  }

  void startEditingOrder(StaffOrder order) {
    setState(() {
      orderBeingEdited = order;
      staffNameController.text = widget.username;
      partyNameController.text = order.partyName;

      currentItems
        ..clear()
        ..addAll(
          order.items.map(
            (item) => OrderItemEntry(
              productName: item.productName,
              amount: item.amount,
            ),
          ),
        );

      selectedProduct = null;
      amountController.text = '1';
    });

    showMessage(
      'Editing ${order.orderId}. Make the changes and press Update Order.',
    );
  }

  void cancelEditingOrder() {
    setState(() {
      orderBeingEdited = null;
      currentItems.clear();
      partyNameController.clear();
      selectedProduct = null;
      amountController.text = '1';
    });

    showMessage('Order editing cancelled.');
  }

  Future<void> placeOrder() async {
    FocusScope.of(context).unfocus();

    final formValid =
        orderFormKey.currentState?.validate() ?? false;

    if (!formValid) {
      showMessage(
        'Please enter the party name.',
        isError: true,
      );
      return;
    }

    if (currentItems.isEmpty) {
      showMessage(
        'Please add at least one product.',
        isError: true,
      );
      return;
    }

    setState(() {
      isSavingOrder = true;
    });

    try {
      if (orderBeingEdited != null) {
        final original = orderBeingEdited!;
        final changedOrder = StaffOrder(
          datePlaced: original.datePlaced,
          staffName: widget.username,
          partyName: partyNameController.text.trim(),
          orderId: original.orderId,
          items: List<OrderItemEntry>.from(currentItems),
          status: original.status,
          deliveredDate: original.deliveredDate,
        );

        final savedOrder =
            await OrderApi.updateOrder(changedOrder);

        if (!mounted) return;

        setState(() {
          final index = orders.indexWhere(
            (order) =>
                order.orderId == savedOrder.orderId,
          );

          if (index >= 0) {
            orders[index] = savedOrder;
          }

          orderBeingEdited = null;
          currentItems.clear();
          partyNameController.clear();
          selectedProduct = null;
          amountController.text = '1';
          isSavingOrder = false;
        });

        showMessage(
          'Order ${savedOrder.orderId} updated successfully.',
        );
        return;
      }

      final orderToSave = StaffOrder(
        datePlaced: formatDate(DateTime.now()),
        staffName: widget.username,
        partyName: partyNameController.text.trim(),
        orderId: '',
        items: List<OrderItemEntry>.from(currentItems),
      );

      final savedOrder =
          await OrderApi.saveOrder(orderToSave);

      if (!mounted) return;

      setState(() {
        orders.insert(0, savedOrder);
        currentItems.clear();
        partyNameController.clear();
        selectedProduct = null;
        amountController.text = '1';
        isSavingOrder = false;
      });

      showMessage(
        'Order ${savedOrder.orderId} placed as Pending.',
      );
    } catch (error) {
      if (!mounted) return;

      setState(() {
        isSavingOrder = false;
      });

      showMessage(
        cleanError(error),
        isError: true,
      );
    }
  }

  Future<void> deleteOrder(
    StaffOrder order,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Row(
            children: [
              Icon(
                Icons.delete_forever_outlined,
                color: AppColors.errorRed,
              ),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Delete Order',
                  style: TextStyle(
                    color: AppColors.errorRed,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          content: Text(
            'Are you sure you want to permanently delete '
            '${order.orderId} for ${order.partyName}?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext, false);
              },
              child: const Text('Cancel'),
            ),
            FilledButton.icon(
              onPressed: () {
                Navigator.pop(dialogContext, true);
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.errorRed,
                foregroundColor: AppColors.white,
              ),
              icon: const Icon(Icons.delete_outline),
              label: const Text('DELETE ORDER'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) return;

    try {
      await OrderApi.deleteOrder(order.orderId);

      if (!mounted) return;

      setState(() {
        if (orderBeingEdited?.orderId == order.orderId) {
          orderBeingEdited = null;
          currentItems.clear();
          partyNameController.clear();
          selectedProduct = null;
          amountController.text = '1';
        }

        orders.removeWhere(
          (value) => value.orderId == order.orderId,
        );
      });

      showMessage(
        'Order ${order.orderId} deleted successfully.',
      );
    } catch (error) {
      if (!mounted) return;

      showMessage(
        cleanError(error),
        isError: true,
      );
    }
  }

  Future<void> markDelivered(
    StaffOrder order,
  ) async {
    if (order.status == 'Delivered') return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text(
            'Mark Order Delivered',
            style: TextStyle(
              color: AppColors.primaryBlue,
              fontWeight: FontWeight.bold,
            ),
          ),
          content: Text(
            'Confirm that order ${order.orderId} '
            'has been delivered to ${order.partyName}?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext, false);
              },
              child: const Text('Cancel'),
            ),
            FilledButton.icon(
              onPressed: () {
                Navigator.pop(dialogContext, true);
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: AppColors.white,
              ),
              icon: const Icon(Icons.local_shipping_outlined),
              label: const Text('DELIVERED'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) return;

    final deliveredDate = formatDate(DateTime.now());

    try {
      await OrderApi.markDelivered(
        order.orderId,
        deliveredDate,
      );

      if (!mounted) return;

      setState(() {
        order.status = 'Delivered';
        order.deliveredDate = deliveredDate;
      });

      showMessage(
        'Order ${order.orderId} marked as delivered.',
      );
    } catch (error) {
      if (!mounted) return;

      showMessage(
        cleanError(error),
        isError: true,
      );
    }
  }

  Future<void> selectProductDialog() async {
    productSearchController.clear();

    final chosenProduct = await showDialog<String>(
      context: context,
      builder: (dialogContext) {
        String searchText = '';

        return StatefulBuilder(
          builder: (context, setDialogState) {
            final filteredProducts = availableProducts
                .where(
                  (product) => product.toLowerCase().contains(
                        searchText.toLowerCase(),
                      ),
                )
                .toList();

            return AlertDialog(
              backgroundColor: AppColors.white,
              insetPadding: const EdgeInsets.symmetric(
                horizontal: 18,
                vertical: 24,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: const Text(
                'Select Product',
                style: TextStyle(
                  color: AppColors.primaryBlue,
                  fontWeight: FontWeight.bold,
                ),
              ),
              content: SizedBox(
                width: double.maxFinite,
                height: 480,
                child: Column(
                  children: [
                    TextField(
                      controller: productSearchController,
                      autofocus: true,
                      onChanged: (value) {
                        setDialogState(() {
                          searchText = value.trim();
                        });
                      },
                      decoration: const InputDecoration(
                        labelText: 'Search product',
                        prefixIcon: Icon(
                          Icons.search,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Expanded(
                      child: filteredProducts.isEmpty
                          ? const Center(
                              child: Text(
                                'No matching product found.',
                                style: TextStyle(
                                  color: AppColors.errorRed,
                                ),
                              ),
                            )
                          : ListView.separated(
                              itemCount:
                                  filteredProducts.length,
                              separatorBuilder:
                                  (context, index) =>
                                      const Divider(height: 1),
                              itemBuilder: (context, index) {
                                final product =
                                    filteredProducts[index];
                                return ListTile(
                                  contentPadding:
                                      const EdgeInsets.symmetric(
                                    horizontal: 4,
                                    vertical: 2,
                                  ),
                                  leading: const CircleAvatar(
                                    backgroundColor:
                                        AppColors.lightGreen,
                                    child: Icon(
                                      Icons.medication_outlined,
                                      color:
                                          AppColors.primaryGreen,
                                    ),
                                  ),
                                  title: Text(
                                    product,
                                    style: const TextStyle(
                                      color: AppColors.textDark,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  onTap: () {
                                    Navigator.pop(
                                      dialogContext,
                                      product,
                                    );
                                  },
                                );
                              },
                            ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(dialogContext);
                  },
                  child: const Text('Cancel'),
                ),
              ],
            );
          },
        );
      },
    );

    if (chosenProduct == null || !mounted) return;

    setState(() {
      selectedProduct = chosenProduct;
    });
  }

  @override
  Widget build(BuildContext context) {
    final today = formatDate(DateTime.now());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Orders'),
        actions: [
          IconButton(
            onPressed:
                isLoadingOrders ? null : loadOrdersAndProducts,
            tooltip: 'Refresh orders',
            icon: isLoadingOrders
                ? const SizedBox(
                    width: 21,
                    height: 21,
                    child: CircularProgressIndicator(
                      color: AppColors.white,
                      strokeWidth: 2.2,
                    ),
                  )
                : const Icon(Icons.refresh),
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior:
              ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.fromLTRB(
            18,
            20,
            18,
            30,
          ),
          child: Form(
            key: orderFormKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        AppColors.primaryBlue,
                        AppColors.darkBlue,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor:
                            AppColors.primaryGreen,
                        child: Icon(
                          Icons.shopping_cart_checkout,
                          color: AppColors.white,
                          size: 31,
                        ),
                      ),
                      SizedBox(width: 15),
                      Expanded(
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text(
                              orderBeingEdited == null
                                  ? 'Place New Order'
                                  : 'Edit Order',
                              style: TextStyle(
                                color: AppColors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 5),
                            Text(
                              orderBeingEdited == null
                                  ? 'All new orders start as Pending'
                                  : 'Add, remove or change product quantity',
                              style: TextStyle(
                                color: Color(0xFFD8ECFA),
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.border,
                    ),
                  ),
                  child: Column(
                    children: [
                      _OrderInfoLine(
                        icon: Icons.calendar_today_outlined,
                        label: 'Date (Order Placed)',
                        value: orderBeingEdited?.datePlaced ?? today,
                      ),
                      const Divider(height: 26),
                      _OrderInfoLine(
                        icon: Icons.pending_actions_outlined,
                        label: 'Status',
                        value: orderBeingEdited?.status ?? 'Pending',
                        valueColor: orderBeingEdited?.status == 'Delivered'
                            ? AppColors.primaryGreen
                            : AppColors.primaryBlue,
                      ),
                      const Divider(height: 26),
                      _OrderInfoLine(
                        icon: Icons.badge_outlined,
                        label: 'Order ID',
                        value: orderBeingEdited?.orderId ??
                            'Generated automatically',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                TextFormField(
                  controller: staffNameController,
                  readOnly: true,
                  enableInteractiveSelection: false,
                  decoration: const InputDecoration(
                    labelText: 'Staff Name',
                    hintText: 'Set automatically from login',
                    helperText: 'This name is locked to the logged-in user.',
                    prefixIcon: Icon(
                      Icons.verified_user_outlined,
                      color: AppColors.primaryBlue,
                    ),
                    suffixIcon: Icon(
                      Icons.lock_outline,
                      color: AppColors.textGrey,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: partyNameController,
                  textCapitalization: TextCapitalization.words,
                  validator: (value) {
                    if ((value ?? '').trim().isEmpty) {
                      return 'Please enter party name';
                    }
                    return null;
                  },
                  decoration: const InputDecoration(
                    labelText: 'Party Name',
                    hintText: 'Enter customer or party name',
                    prefixIcon: Icon(
                      Icons.storefront_outlined,
                      color: AppColors.primaryGreen,
                    ),
                  ),
                ),
                const SizedBox(height: 22),
                const Text(
                  'Order (List)',
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontSize: 19,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Select a product and enter its amount.',
                  style: TextStyle(
                    color: AppColors.textGrey,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 14),
                InkWell(
                  onTap: selectProductDialog,
                  borderRadius: BorderRadius.circular(16),
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Product',
                      prefixIcon: Icon(
                        Icons.medication_outlined,
                        color: AppColors.primaryBlue,
                      ),
                      suffixIcon: Icon(
                        Icons.arrow_drop_down,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                    child: Text(
                      selectedProduct ??
                          'Tap to select a product',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: selectedProduct == null
                            ? AppColors.textGrey
                            : AppColors.textDark,
                        fontWeight: selectedProduct == null
                            ? FontWeight.normal
                            : FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: amountController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Quantity',
                          hintText: 'e.g. 5',
                          suffixText: 'Strips/Bottles',
                          prefixIcon: Icon(
                            Icons.numbers,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(
                      height: 57,
                      child: FilledButton.icon(
                        onPressed: addProduct,
                        style: FilledButton.styleFrom(
                          backgroundColor:
                              AppColors.primaryGreen,
                          foregroundColor: AppColors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.circular(16),
                          ),
                        ),
                        icon: const Icon(Icons.add),
                        label: const Text(
                          'ADD',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                if (currentItems.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 24,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.lightBlue,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Column(
                      children: [
                        Icon(
                          Icons.playlist_add_outlined,
                          color: AppColors.primaryBlue,
                          size: 38,
                        ),
                        SizedBox(height: 8),
                        Text(
                          'No products added yet.',
                          style: TextStyle(
                            color: AppColors.textGrey,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics:
                        const NeverScrollableScrollPhysics(),
                    itemCount: currentItems.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = currentItems[index];
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius:
                              BorderRadius.circular(16),
                          border: Border.all(
                            color: AppColors.border,
                          ),
                        ),
                        child: Row(
                          children: [
                            const CircleAvatar(
                              backgroundColor:
                                  AppColors.lightGreen,
                              child: Icon(
                                Icons.medication,
                                color: AppColors.primaryGreen,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.productName,
                                    style: const TextStyle(
                                      color: AppColors.textDark,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${item.amount} Strips/Bottles',
                                    style: const TextStyle(
                                      color: AppColors.textGrey,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              onPressed: () {
                                decreaseProductAmount(index);
                              },
                              tooltip: 'Decrease quantity',
                              icon: const Icon(
                                Icons.remove_circle_outline,
                                color: AppColors.primaryBlue,
                              ),
                            ),
                            Container(
                              constraints:
                                  const BoxConstraints(minWidth: 35),
                              alignment: Alignment.center,
                              child: Text(
                                '${item.amount}',
                                style: const TextStyle(
                                  color: AppColors.textDark,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            IconButton(
                              onPressed: () {
                                increaseProductAmount(index);
                              },
                              tooltip: 'Increase quantity',
                              icon: const Icon(
                                Icons.add_circle_outline,
                                color: AppColors.primaryGreen,
                              ),
                            ),
                            IconButton(
                              onPressed: () {
                                removeProduct(index);
                              },
                              tooltip: 'Remove product',
                              icon: const Icon(
                                Icons.delete_outline,
                                color: AppColors.errorRed,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                const SizedBox(height: 22),
                SizedBox(
                  width: double.infinity,
                  height: 58,
                  child: FilledButton.icon(
                    onPressed: isSavingOrder ? null : placeOrder,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primaryBlue,
                      foregroundColor: AppColors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    icon: isSavingOrder
                        ? const SizedBox(
                            width: 21,
                            height: 21,
                            child: CircularProgressIndicator(
                              color: AppColors.white,
                              strokeWidth: 2.3,
                            ),
                          )
                        : Icon(
                            orderBeingEdited == null
                                ? Icons.send_outlined
                                : Icons.save_outlined,
                          ),
                    label: Text(
                      isSavingOrder
                          ? 'SAVING...'
                          : orderBeingEdited == null
                              ? 'PLACE ORDER'
                              : 'UPDATE ORDER',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
                if (orderBeingEdited != null) ...[
                  const SizedBox(height: 11),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: cancelEditingOrder,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.errorRed,
                        side: const BorderSide(
                          color: AppColors.errorRed,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      icon: const Icon(Icons.close),
                      label: const Text(
                        'CANCEL EDITING',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 28),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Orders Placed in This Session',
                        style: TextStyle(
                          color: AppColors.textDark,
                          fontSize: 19,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 11,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.lightGreen,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${orders.length}',
                        style: const TextStyle(
                          color: AppColors.darkGreen,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 13),
                if (orders.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: AppColors.border,
                      ),
                    ),
                    child: Text(
                      isLoadingOrders
                          ? 'Loading orders from Google Sheets...'
                          : 'No orders are currently available.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppColors.textGrey,
                        height: 1.4,
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics:
                        const NeverScrollableScrollPhysics(),
                    itemCount: orders.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 13),
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      final delivered =
                          order.status == 'Delivered';

                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius:
                              BorderRadius.circular(18),
                          border: Border.all(
                            color: delivered
                                ? AppColors.primaryGreen
                                : AppColors.border,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Text(
                                    order.orderId,
                                    style: const TextStyle(
                                      color:
                                          AppColors.primaryBlue,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding:
                                      const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 5,
                                  ),
                                  decoration: BoxDecoration(
                                    color: delivered
                                        ? AppColors.lightGreen
                                        : AppColors.lightBlue,
                                    borderRadius:
                                        BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    order.status,
                                    style: TextStyle(
                                      color: delivered
                                          ? AppColors.darkGreen
                                          : AppColors.primaryBlue,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              order.partyName,
                              style: const TextStyle(
                                color: AppColors.textDark,
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              'Staff: ${order.staffName}',
                              style: const TextStyle(
                                color: AppColors.textGrey,
                              ),
                            ),
                            Text(
                              'Order placed: ${order.datePlaced}',
                              style: const TextStyle(
                                color: AppColors.textGrey,
                              ),
                            ),
                            if (delivered)
                              Text(
                                'Delivered: '
                                '${order.deliveredDate}',
                                style: const TextStyle(
                                  color: AppColors.primaryGreen,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            const Divider(height: 24),
                            ...order.items.map(
                              (item) => Padding(
                                padding:
                                    const EdgeInsets.only(bottom: 5),
                                child: Row(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    const Text('• '),
                                    Expanded(
                                      child: Text(
                                        '${item.productName} '
                                        '— ${item.amount} Strips/Bottles',
                                        style: const TextStyle(
                                          color: AppColors.textDark,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton.icon(
                                onPressed: () {
                                  startEditingOrder(order);
                                },
                                style: FilledButton.styleFrom(
                                  backgroundColor:
                                      AppColors.primaryBlue,
                                  foregroundColor:
                                      AppColors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(14),
                                  ),
                                ),
                                icon: const Icon(Icons.edit_outlined),
                                label: const Text(
                                  'EDIT ORDER',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 9),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  deleteOrder(order);
                                },
                                style: OutlinedButton.styleFrom(
                                  foregroundColor:
                                      AppColors.errorRed,
                                  side: const BorderSide(
                                    color: AppColors.errorRed,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(14),
                                  ),
                                ),
                                icon: const Icon(
                                  Icons.delete_outline,
                                ),
                                label: const Text(
                                  'DELETE ORDER',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 9),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: delivered
                                    ? null
                                    : () {
                                        markDelivered(order);
                                      },
                                style: OutlinedButton.styleFrom(
                                  foregroundColor:
                                      AppColors.primaryGreen,
                                  side: const BorderSide(
                                    color:
                                        AppColors.primaryGreen,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(14),
                                  ),
                                ),
                                icon: Icon(
                                  delivered
                                      ? Icons.check_circle
                                      : Icons.local_shipping_outlined,
                                ),
                                label: Text(
                                  delivered
                                      ? 'ORDER DELIVERED'
                                      : 'MARK AS DELIVERED',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OrderInfoLine extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _OrderInfoLine({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 43,
          height: 43,
          decoration: BoxDecoration(
            color: AppColors.lightBlue,
            borderRadius: BorderRadius.circular(13),
          ),
          child: Icon(
            icon,
            color: AppColors.primaryBlue,
          ),
        ),
        const SizedBox(width: 13),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.textGrey,
                  fontSize: 12.5,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                value,
                style: TextStyle(
                  color: valueColor ?? AppColors.textDark,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// =====================================================
// TEMPORARY MODULE SCREEN
// =====================================================

class ModulePlaceholderScreen
    extends StatelessWidget {
  final String moduleName;

  const ModulePlaceholderScreen({
    super.key,
    required this.moduleName,
  });

  IconData get moduleIcon {
    switch (moduleName) {
      case 'Orders':
        return Icons
            .shopping_cart_checkout_outlined;

      case 'Ledger':
        return Icons
            .account_balance_wallet_outlined;

      case 'Customers':
        return Icons.people_alt_outlined;

      default:
        return Icons.dashboard_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(moduleName),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: 25,
              vertical: 38,
            ),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: AppColors.border,
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 85,
                  height: 85,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        AppColors.lightBlue,
                        AppColors.lightGreen,
                      ],
                    ),
                    borderRadius:
                        BorderRadius.circular(24),
                  ),
                  child: Icon(
                    moduleIcon,
                    color: AppColors.primaryBlue,
                    size: 44,
                  ),
                ),

                const SizedBox(height: 22),

                Text(
                  moduleName,
                  style: const TextStyle(
                    color: AppColors.primaryBlue,
                    fontSize: 25,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 10),

                Text(
                  '$moduleName functionality will be developed next.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.textGrey,
                    fontSize: 15,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 26),

                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    style: FilledButton.styleFrom(
                      backgroundColor:
                          AppColors.primaryBlue,
                      foregroundColor:
                          AppColors.white,
                    ),
                    icon: const Icon(
                      Icons.arrow_back,
                    ),
                    label: const Text(
                      'BACK TO DASHBOARD',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}