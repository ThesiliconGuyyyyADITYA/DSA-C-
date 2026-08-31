plugins {
    id("com.android.application")

    // The Flutter Gradle Plugin must be applied
    // after the Android application plugin.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.example.maxosmith_staff_app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        // Required by flutter_local_notifications.
        isCoreLibraryDesugaringEnabled = true

        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        applicationId = "com.example.maxosmith_staff_app"

        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion

        versionCode = flutter.versionCode
        versionName = flutter.versionName

        // Helps support larger dependency sets on older Android versions.
        multiDexEnabled = true
    }

    buildTypes {
        release {
            // Debug signing is acceptable for testing only.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget =
            org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

dependencies {
    // Required for Java 8+ API desugaring used by
    // flutter_local_notifications.
    coreLibraryDesugaring(
        "com.android.tools:desugar_jdk_libs:2.1.5"
    )
}

flutter {
    source = "../.."
}