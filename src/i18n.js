import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "Admin Dashboard": "Admin Dashboard",
          "Hello": "Hello",
          "Total Users": "Total Users",
          "Total Lessons": "Total Lessons",
          "Total Songs": "Total Songs",
          "Total Donations": "Total Donations",
          "Cumulative Metrics Over Time": "Cumulative Metrics Over Time",
          "Dashboard Metrics (Donut)": "Dashboard Metrics (Donut)",
          "No data available for line chart": "No data available for line chart",
          "Loading": "Loading...",
          "Rs": "Rs.",
          "Error": "Error",
          "Change Language": "Change Language",
          "User": "User",
          "Have not tried the lessons yet?": "Have not tried the lessons yet?",
          "Dive into the world of music": "Dive into the world of music for free, learn different instruments at your own pace.",
          "Get Started": "Get Started",
          "Play along song with chords": "Play along song with chords",
          "Tune your instruments easily": "Tune your instruments easily",
          "Please log in to continue": "Please log in to continue",
          "Cancel": "Cancel",
          "Sign Up": "Sign Up",
          "Home": "Home",
          "Lessons": "Lessons",
          "Practice Sessions": "Practice Sessions",
          "Chords & Lyrics": "Chords & Lyrics",
          "Tuner": "Tuner",
          "Liked Songs": "Liked Songs",
          "Support Us": "Support Us",
          "Dark Mode": "Dark Mode",
          "Light Mode": "Light Mode",
          "Admin": "Admin",
          "Logout": "Logout",
          "Are you sure you want to logout?": "Are you sure you want to logout?",
          "Logged out successfully": "Logged out successfully!",
          "Failed to logout": "Failed to logout. Please try again.",
          "Add Chord": "Add Chord",
          "Add Quiz": "Add Quiz",
          "Add Practice Session": "Add Practice Session",
          "View Chords": "View Chords",
          "View Quiz": "View Quiz",
          "View Practice Sessions": "View Practice Sessions",
          "Dashboard": "Dashboard",
          "About": "About",
          "Privacy Policy": "Privacy Policy",
          "Licensing": "Licensing",
          "Contact": "Contact",
          "Footer Copyright": "© 2025 Anna™. All Rights Reserved.",
          "Kirtan Shrestha": "Kirtan Shrestha"
        }
      },
      ne: {
        translation: {
          "Admin Dashboard": "प्रशासक ड्यासबोर्ड",
          "Hello": "नमस्ते",
          "Total Users": "कुल प्रयोगकर्ताहरू",
          "Total Lessons": "कुल पाठहरू",
          "Total Songs": "कुल गीतहरू",
          "Total Donations": "कुल दान",
          "Cumulative Metrics Over Time": "समयसँगै संचित मेट्रिक्स",
          "Dashboard Metrics (Donut)": "ड्यासबोर्ड मेट्रिक्स (डोनट)",
          "No data available for line chart": "लाइन चार्टको लागि डाटा उपलब्ध छैन",
          "Loading": "लोड हुँदै...",
          "Rs": "रु.",
          "Error": "त्रुटि",
          "Change Language": "भाषा परिवर्तन गर्नुहोस्",
          "User": "प्रयोगकर्ता",
          "Have not tried the lessons yet?": "के तपाईंले पाठहरू प्रयास गर्नुभएको छैन?",
          "Dive into the world of music": "संगीतको संसारमा निःशुल्क डुब्नुहोस्, आफ्नै गतिमा विभिन्न वाद्ययन्त्रहरू सिक्नुहोस्।",
          "Get Started": "सुरु गर्नुहोस्",
          "Play along song with chords": "कर्डहरूसँग गीत बजाउनुहोस्",
          "Tune your instruments easily": "आफ्नो वाद्ययन्त्रहरू सजिलै ट्युन गर्नुहोस्",
          "Please log in to continue": "कृपया जारी राख्न लगइन गर्नुहोस्",
          "Cancel": "रद्द गर्नुहोस्",
          "Sign Up": "साइन अप गर्नुहोस्",
          "Home": "गृहपृष्ठ",
          "Lessons": "पाठहरू",
          "Practice Sessions": "अभ्यास सत्रहरू",
          "Chords & Lyrics": "कर्डहरू र गीतहरू",
          "Tuner": "ट्युनर",
          "Liked Songs": "मनपरेका गीतहरू",
          "Support Us": "हामीलाई समर्थन गर्नुहोस्",
          "Dark Mode": "डार्क मोड",
          "Light Mode": "लाइट मोड",
          "Admin": "प्रशासक",
          "Logout": "लगआउट",
          "Are you sure you want to logout?": "के तपाईं निश्चित रूपमा लगआउट गर्न चाहनुहुन्छ?",
          "Logged out successfully": "सफलतापूर्वक लगआउट भयो!",
          "Failed to logout": "लगआउट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।",
          "Add Chord": "कर्ड थप्नुहोस्",
          "Add Quiz": "क्विज थप्नुहोस्",
          "Add Practice Session": "अभ्यास सत्र थप्नुहोस्",
          "View Chords": "कर्डहरू हेर्नुहोस्",
          "View Quiz": "क्विज हेर्नुहोस्",
          "View Practice Sessions": "अभ्यास सत्रहरू हेर्नुहोस्",
          "Dashboard": "ड्यासबोर्ड",
          "About": "बारेमा",
          "Privacy Policy": "गोपनीयता नीति",
          "Licensing": "इजाजतपत्र",
          "Contact": "सम्पर्क",
          "Footer Copyright": "© २०२५ Anna™। सबै अधिकार सुरक्षित।",
          "Kirtan Shrestha": "कीर्तन श्रेष्ठ"
        }
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;