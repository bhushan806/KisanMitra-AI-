export const translations = {
  en: {
    nav_command_center: "Command Center",
    nav_forecast: "Forecasting",
    nav_health: "Crop Health",
    nav_weather: "Weather",
    nav_advisor: "AI Advisor",
    nav_alerts: "Alerts",
    
    // Farmer-friendly nav
    nav_farmer_dashboard: "My Farm",
    nav_farmer_prices: "Future Prices",
    nav_farmer_health: "Check Crop",
    nav_farmer_weather: "Weather",
    nav_farmer_help: "Ask AI Help",
    nav_farmer_warnings: "Warnings",

    mode_pro: "Professional",
    mode_farmer: "Farmer Mode",
    
    lang_en: "English",
    lang_hi: "हिंदी",
    lang_mr: "मराठी",
    lang_gu: "ગુજરાતી",
    lang_pa: "ਪੰਜਾਬੀ",
    lang_ta: "தமிழ்",
    lang_te: "తెలుగు",
    lang_kn: "ಕನ್ನಡ",

    voice_prompt: "Ask in Your Language",
    listening: "Listening...",
    processing: "Processing...",
    
    // Dashboard
    target_commodity: "Target Commodity",
    primary_market: "Primary Market",
    horizon: "Predictive Horizon",
    live_feed: "Live Feed",
  },
  hi: {
    nav_command_center: "नियंत्रण केंद्र",
    nav_forecast: "बाजार भाव अनुमान",
    nav_health: "फसल स्वास्थ्य",
    nav_weather: "मौसम",
    nav_advisor: "कृषि सलाहकार",
    nav_alerts: "चेतावनी",
    
    nav_farmer_dashboard: "मेरा खेत",
    nav_farmer_prices: "भविष्य के भाव",
    nav_farmer_health: "फसल जांचें",
    nav_farmer_weather: "मौसम",
    nav_farmer_help: "AI से पूछें",
    nav_farmer_warnings: "खतरे की सूचना",

    mode_pro: "प्रोफेशनल",
    mode_farmer: "किसान मोड",

    lang_en: "English",
    lang_hi: "हिंदी",
    lang_mr: "मराठी",
    lang_gu: "ગુજરાતી",
    lang_pa: "ਪੰਜਾਬੀ",
    lang_ta: "தமிழ்",
    lang_te: "తెలుగు",
    lang_kn: "ಕನ್ನಡ",

    voice_prompt: "अपनी भाषा में बोलें",
    listening: "सुन रहा हूँ...",
    processing: "समझ रहा हूँ...",

    target_commodity: "फसल चुनें",
    primary_market: "मंडी चुनें",
    horizon: "कितने दिन का अनुमान",
    live_feed: "लाइव",
  },
  mr: {
    nav_command_center: "नियंत्रण कक्ष",
    nav_forecast: "बाजारभाव अंदाज",
    nav_health: "पीक आरोग्य",
    nav_weather: "हवामान",
    nav_advisor: "कृषी सल्लागार",
    nav_alerts: "सतर्कता",
    
    nav_farmer_dashboard: "माझे शेत",
    nav_farmer_prices: "भविष्यातील दर",
    nav_farmer_health: "पीक तपासा",
    nav_farmer_weather: "हवामान",
    nav_farmer_help: "मदत मागा",
    nav_farmer_warnings: "धोक्याची सूचना",

    mode_pro: "व्यावसायिक",
    mode_farmer: "शेतकरी मोड",

    lang_en: "English",
    lang_hi: "हिंदी",
    lang_mr: "मराठी",
    lang_gu: "ગુજરાતી",
    lang_pa: "ਪੰਜਾਬੀ",
    lang_ta: "தமிழ்",
    lang_te: "తెలుగు",
    lang_kn: "ಕನ್ನಡ",

    voice_prompt: "तुमच्या भाषेत विचारा",
    listening: "ऐकत आहे...",
    processing: "प्रक्रिया करत आहे...",

    target_commodity: "पीक निवडा",
    primary_market: "बाजार समिती",
    horizon: "किती दिवसांचा अंदाज",
    live_feed: "थेट",
  },
  // Add fallback definitions for other languages to default to Hindi to save space in the demo
  gu: { nav_farmer_dashboard: "મારું ખેતર", nav_farmer_prices: "ભવિષ્યના ભાવો", mode_farmer: "ખેડૂત મોડ" },
  pa: { nav_farmer_dashboard: "ਮੇਰਾ ਖੇਤ", nav_farmer_prices: "ਭਵਿੱਖ ਦੀਆਂ ਕੀਮਤਾਂ", mode_farmer: "ਕਿਸਾਨ ਮੋਡ" },
  ta: { nav_farmer_dashboard: "என் பண்ணை", nav_farmer_prices: "எதிர்கால விலைகள்", mode_farmer: "விவசாயி முறை" },
  te: { nav_farmer_dashboard: "నా పొలం", nav_farmer_prices: "భవిష్యత్ ధరలు", mode_farmer: "రైతు మోడ్" },
  kn: { nav_farmer_dashboard: "ನನ್ನ ಜಮೀನು", nav_farmer_prices: "ಭವಿಷ್ಯದ ಬೆಲೆಗಳು", mode_farmer: "ರೈತ ಮೋಡ್" },
};

export const useTranslation = (lang) => {
  const t = (key) => {
    if (translations[lang] && translations[lang][key]) return translations[lang][key];
    if (translations['hi'] && translations['hi'][key]) return translations['hi'][key]; // Fallback to Hindi if not English
    return translations['en'][key] || key;
  };
  return { t };
};
