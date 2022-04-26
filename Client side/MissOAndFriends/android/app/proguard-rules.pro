# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Disabling obfuscation is useful if you collect stack traces from production crashes
# (unless you are using a system that supports de-obfuscate the stack traces).
-dontobfuscate

# React Native

# Keep our interfaces so they can be used by other ProGuard rules.
# See http://sourceforge.net/p/proguard/bugs/466/
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip

# Do not strip any method/class that is annotated with @DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}
-keep class com.google.android.exoplayer2.trackselection.AdaptiveVideoTrackSelection
-keep class com.google.android.exoplayer2.trackselection.** {
    *;
}

-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.UIProp <fields>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

-dontwarn com.facebook.react.**

# okhttp

-keepattributes Signature
-keepattributes *Annotation*
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**

# okio

-keep class sun.misc.Unsafe { *; }
-dontwarn java.nio.file.*
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement
-dontwarn okio.**

# NOTE start: added proguard rules, per pinsight sdk doc
# AdMarvel 
-dontwarn com.google.android.gms.** 
-dontwarn com.admarvel.android.ads.** 
-keep class com.admarvel.** { *; } 
# Google 
-keep public class com.google.android.gms.ads.** { 
   public *; 
} 
-keep public class com.google.ads.** { 
   public *; 
} 
# InMobi 
-keepattributes SourceFile,LineNumberTable 
-keep class com.inmobi.** { *; } 
-dontwarn com.inmobi.** 
-keep public class com.google.android.gms.** 
-dontwarn com.google.android.gms.** 
-dontwarn com.squareup.picasso.** 
-keep class com.google.android.gms.ads.identifier.AdvertisingIdClient{ 
     public *; 
} 
-keep class com.google.android.gms.ads.identifier.AdvertisingIdClient$Info{ 
     public *; 
} 
# skip the Picasso library classes 
-keep class com.squareup.picasso.** {*;} 
-dontwarn com.squareup.picasso.** 
-dontwarn com.squareup.okhttp.** 
# skip Moat classes 
-keep class com.moat.** {*;} 
-dontwarn com.moat.** 
# skip AVID classes 
-keep class com.integralads.avid.library.* {*;} 
# Millennial 
-keepclassmembers class com.millennialmedia** { 
    public *; 
} 
-keep class com.millennialmedia** 
# Amazon 
-keep class com.amazon.device.ads.** 
-keepclassmembers class com.amazon.device.ads.** { 
   public *; 
} 
# AerServ 
-keep class com.aerserv.** { *; } 
-keepclassmembers class com.aerserv.** { *; } 
-dontwarn com.moat.** 
-dontwarn com.adcolony.** 
-dontwarn com.applovin.** 
-dontwarn com.appnext.** 
-dontwarn com.chartboost.** 
-dontwarn com.mopub.mobileads.** 
-dontwarn com.my.target.ads.** 
-dontwarn com.rhythmone.ad.sdk.** 
-dontwarn com.tremorvideo.sdk.android.** 
-dontwarn com.unity3d.ads.** 
-dontwarn com.vungle.publisher.** 
-dontwarn com.facebook.ads.**


# skip the Picasso library classes
-keep class com.squareup.picasso.** {
    *;
}
-dontwarn com.squareup.picasso.**
-dontwarn com.squareup.okhttp.** 

# skip Moat classes
-keep class com.moat.** {
    *;
}
-dontwarn com.moat.** 

# skip AVID classes
-keep class com.integralads.avid.library.* {
    *;
} 
# NOTE end: added proguard rules, per pinsight sdk doc

# SEE https://github.com/luggit/react-native-config#problems-with-proguard
-keep class com.missoandfriends.BuildConfig { *; }

# SEE https://github.com/ReactiveX/RxJava/issues/1415
-dontwarn rx.internal.util.unsafe.**

# SEE https://github.com/facebook/react-native/issues/11891#issuecomment-279677647
-dontwarn android.text.StaticLayout

# Android-23 pulling in optional Apache HTTP jar
# ...
# Reading library jar [/usr/local/var/lib/android-sdk/platforms/android-23/android.jar]
# Reading library jar [/usr/local/var/lib/android-sdk/platforms/android-23/optional/org.apache.http.legacy.jar]
# ...
# SEE http://stackoverflow.com/questions/33047806/proguard-duplicate-definition-of-library-class
# SEE https://issuetracker.google.com/issues/37070898
-dontnote android.net.http.*
-dontnote org.apache.http.**
