import { Language } from '../@types/bluetooth';

export interface Translations {
  // Navigation tabs
  'nav.scanner': string;
  'nav.text': string;
  'nav.media': string;
  'nav.presenter': string;
  'nav.security': string;
  'nav.macros': string;
  'nav.trackpad': string;
  'nav.console': string;
  'nav.settings': string;

  // Header
  'header.bleBridge': string;
  'header.connected': string;
  'header.connecting': string;
  'header.error': string;
  'header.ready': string;
  'header.connect': string;
  'header.disconnect': string;
  'header.switchLight': string;
  'header.switchDark': string;

  // Scanner
  'scanner.title': string;
  'scanner.description': string;
  'scanner.startScan': string;
  'scanner.scanning': string;
  'scanner.advertisementSupport': string;
  'scanner.discovered': string;
  'scanner.clearList': string;
  'scanner.noDevices': string;
  'scanner.noDevicesDesc': string;
  'scanner.connectedBadge': string;
  'scanner.seen': string;
  'scanner.connectBtn': string;
  'scanner.disconnectBtn': string;
  'scanner.iosNoticeTitle': string;
  'scanner.iosNoticeDesc': string;
  'scanner.iosOpenBluefy': string;

  // Text
  'text.title': string;
  'text.description': string;
  'text.clear': string;
  'text.payloadContent': string;
  'text.chars': string;
  'text.duration': string;
  'text.placeholder': string;
  'text.copy': string;
  'text.copied': string;
  'text.autoEnter': string;
  'text.clearOnSend': string;
  'text.quickSnippets': string;
  'text.transmitting': string;
  'text.success': string;
  'text.failed': string;
  'text.connectToTransmit': string;
  'text.transmitBtn': string;
  'text.transmittingBtn': string;

  // Media
  'media.title': string;
  'media.description': string;
  'media.prev': string;
  'media.play': string;
  'media.pause': string;
  'media.next': string;
  'media.volDown': string;
  'media.mute': string;
  'media.volUp': string;

  // Presenter
  'presentation.timer': string;
  'presentation.start': string;
  'presentation.pause': string;
  'presentation.reset': string;
  'presentation.prevSlide': string;
  'presentation.prevDesc': string;
  'presentation.nextSlide': string;
  'presentation.nextDesc': string;
  'presentation.fullscreen': string;
  'presentation.blackScreen': string;

  // Security
  'security.lockTitle': string;
  'security.lockDesc': string;
  'security.hapticsTitle': string;
  'security.hapticsDesc': string;
  'security.pulse100': string;
  'security.pulse300': string;
  'security.pulse500': string;
  'security.shortPulse': string;
  'security.mediumPulse': string;
  'security.longBurst': string;
  'security.jigglerTitle': string;
  'security.jigglerDesc': string;
  'security.testPulse': string;
  'security.status': string;
  'security.active': string;
  'security.disabled': string;
  'security.taskMgr': string;
  'security.forceQuit': string;
  'security.showDesktop': string;

  // Gaming
  'gaming.title': string;
  'gaming.description': string;
  'gaming.newMacro': string;
  'gaming.close': string;
  'gaming.csBuyTitle': string;
  'gaming.csBuyDesc': string;
  'gaming.csBuyBtn': string;
  'gaming.createMacroTitle': string;
  'gaming.macroNameLabel': string;
  'gaming.macroNamePlaceholder': string;
  'gaming.hexLabel': string;
  'gaming.delayLabel': string;
  'gaming.cancel': string;
  'gaming.saveMacro': string;
  'gaming.savedMacros': string;
  'gaming.run': string;

  // Trackpad
  'trackpad.dragPrompt': string;
  'trackpad.gestureHint': string;
  'trackpad.sensitivity': string;
  'trackpad.leftClick': string;
  'trackpad.rightClick': string;

  // Console
  'console.title': string;
  'console.packets': string;
  'console.bytes': string;
  'console.copyLogs': string;
  'console.clearLogs': string;
  'console.noLogs': string;

  // Settings
  'settings.title': string;
  'settings.description': string;
  'settings.resetDefaults': string;
  'settings.themeTitle': string;
  'settings.dark': string;
  'settings.light': string;
  'settings.system': string;
  'settings.darkDesc': string;
  'settings.lightDesc': string;
  'settings.systemDesc': string;
  'settings.languageTitle': string;
  'settings.targetOsTitle': string;
  'settings.protocolTitle': string;
  'settings.singleByteTitle': string;
  'settings.singleByteDesc': string;
  'settings.framedAsciiTitle': string;
  'settings.framedAsciiDesc': string;
  'settings.feedbackTitle': string;
  'settings.soundEffects': string;
  'settings.soundDesc': string;
  'settings.mobileHaptics': string;
  'settings.hapticsDesc': string;
  'settings.gattTitle': string;
  'settings.serviceUuid': string;
  'settings.charUuid': string;
}

export const translations: Record<Language, Translations> = {
  en: {
    'nav.scanner': 'Scanner',
    'nav.text': 'Text',
    'nav.media': 'Media',
    'nav.presenter': 'Presenter',
    'nav.security': 'Security',
    'nav.macros': 'Macros',
    'nav.trackpad': 'Trackpad',
    'nav.console': 'Console',
    'nav.settings': 'Settings',

    'header.bleBridge': 'BLE HID Bridge',
    'header.connected': 'Connected',
    'header.connecting': 'Connecting...',
    'header.error': 'Error',
    'header.ready': 'Ready',
    'header.connect': 'Connect',
    'header.disconnect': 'Disconnect',
    'header.switchLight': 'Switch to Light Theme',
    'header.switchDark': 'Switch to Dark Theme',

    'scanner.title': 'BLE Device Scanner',
    'scanner.description': 'Discover and pair with HM-10, BT05, or ESP32 Bluetooth Low Energy modules',
    'scanner.startScan': 'Start Scan',
    'scanner.scanning': 'Scanning...',
    'scanner.advertisementSupport': 'Web Bluetooth LE Advertisement Scanning API is supported in your browser.',
    'scanner.discovered': 'Discovered Hardware',
    'scanner.clearList': 'Clear List',
    'scanner.noDevices': 'No BLE Devices Found Yet',
    'scanner.noDevicesDesc': 'Click Start Scan above to open the native Web Bluetooth picker and connect to your Rubber Otter microcontroller.',
    'scanner.connectedBadge': 'Connected',
    'scanner.seen': 'Seen',
    'scanner.connectBtn': 'Connect',
    'scanner.disconnectBtn': 'Disconnect',
    'scanner.iosNoticeTitle': 'iOS Bluetooth Compatibility',
    'scanner.iosNoticeDesc': 'Apple iOS Safari does not support the Web Bluetooth API. To connect on iPhone or iPad, use the Rubber Otter Native iOS App or open this page inside the Bluefy Web Bluetooth Browser.',
    'scanner.iosOpenBluefy': 'Open in Bluefy Browser',

    'text.title': 'Keystroke Injector',
    'text.description': 'Transmit text, macros, and command strings directly via USB HID',
    'text.clear': 'Clear',
    'text.payloadContent': 'Payload Content',
    'text.chars': 'chars',
    'text.duration': 'duration',
    'text.placeholder': 'Type or paste automated keystroke payloads, code, or terminal commands...',
    'text.copy': 'Copy',
    'text.copied': 'Copied',
    'text.autoEnter': '+Enter',
    'text.clearOnSend': 'Clear on send',
    'text.quickSnippets': 'Quick Snippets',
    'text.transmitting': 'Transmitting text payload...',
    'text.success': 'Transmitted successfully',
    'text.failed': 'Transmission failed',
    'text.connectToTransmit': 'Connect BLE Device to Transmit',
    'text.transmitBtn': 'Transmit Keystrokes',
    'text.transmittingBtn': 'Transmitting Keystrokes...',

    'media.title': 'Media & Volume Deck',
    'media.description': 'Control host OS audio playback, tracks, and sound levels',
    'media.prev': 'Previous',
    'media.play': 'Play',
    'media.pause': 'Pause',
    'media.next': 'Next',
    'media.volDown': 'Vol Down',
    'media.mute': 'Mute Toggle',
    'media.volUp': 'Vol Up',

    'presentation.timer': 'Presentation Timer',
    'presentation.start': 'Start',
    'presentation.pause': 'Pause',
    'presentation.reset': 'Reset Timer',
    'presentation.prevSlide': 'Previous Slide',
    'presentation.prevDesc': 'Left Arrow (←) keystroke',
    'presentation.nextSlide': 'Next Slide',
    'presentation.nextDesc': 'Right Arrow (→) keystroke',
    'presentation.fullscreen': 'Fullscreen (F5)',
    'presentation.blackScreen': 'Black Screen (B)',

    'security.lockTitle': 'Lock Workstation',
    'security.lockDesc': 'Sends instant lock shortcut',
    'security.hapticsTitle': 'Vibration Haptics',
    'security.hapticsDesc': 'Triggers mobile vibration & MCU hardware vibration motor',
    'security.pulse100': '100ms',
    'security.pulse300': '300ms',
    'security.pulse500': '500ms',
    'security.shortPulse': 'Short Pulse',
    'security.mediumPulse': 'Medium',
    'security.longBurst': 'Long Burst',
    'security.jigglerTitle': 'Mouse Jiggler Mode',
    'security.jigglerDesc': 'Non-blocking periodic micro-movements to prevent OS sleep',
    'security.testPulse': 'Test Pulse',
    'security.status': 'Status:',
    'security.active': 'ACTIVE (Periodic Micro-Jiggle)',
    'security.disabled': 'DISABLED',
    'security.taskMgr': 'Task Manager',
    'security.forceQuit': 'Force Quit',
    'security.showDesktop': 'Show Desktop',

    'gaming.title': 'Gaming & Macro Sequences',
    'gaming.description': 'Automated key combo chains and game buy sequences',
    'gaming.newMacro': 'New Macro',
    'gaming.close': 'Close',
    'gaming.csBuyTitle': 'CS Armor & Helmet Buy Macro',
    'gaming.csBuyDesc': "Buy ('b') → Armor (4) → Helmet (2)",
    'gaming.csBuyBtn': 'Execute CS Buy Sequence',
    'gaming.createMacroTitle': 'Create Custom Macro',
    'gaming.macroNameLabel': 'Macro Name',
    'gaming.macroNamePlaceholder': 'e.g. Quick Heal Macro',
    'gaming.hexLabel': 'Hex Byte Code',
    'gaming.delayLabel': 'Delay (ms)',
    'gaming.cancel': 'Cancel',
    'gaming.saveMacro': 'Save Macro',
    'gaming.savedMacros': 'Saved Macros',
    'gaming.run': 'Run',

    'trackpad.dragPrompt': 'Touch & Drag to Navigate Host Cursor',
    'trackpad.gestureHint': 'Tap = Left Click • 2-Finger Tap = Right Click',
    'trackpad.sensitivity': 'Sensitivity:',
    'trackpad.leftClick': 'Left Click',
    'trackpad.rightClick': 'Right Click',

    'console.title': 'GATT Packet Terminal',
    'console.packets': 'Packets:',
    'console.bytes': 'Bytes:',
    'console.copyLogs': 'Copy',
    'console.clearLogs': 'Clear Logs',
    'console.noLogs': 'No BLE packet activity recorded yet',

    'settings.title': 'Application Configuration',
    'settings.description': 'Appearance theme, language, target OS, protocol engine & GATT parameters',
    'settings.resetDefaults': 'Reset to Factory Defaults',
    'settings.themeTitle': 'Appearance Theme',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.system': 'System',
    'settings.darkDesc': 'Obsidian Dark',
    'settings.lightDesc': 'Clean White',
    'settings.systemDesc': 'OS Sync',
    'settings.languageTitle': 'Interface Language',
    'settings.targetOsTitle': 'Target Host PC Operating System',
    'settings.protocolTitle': 'Bluetooth Protocol Engine',
    'settings.singleByteTitle': 'Single-Byte Protocol',
    'settings.singleByteDesc': 'Direct HEX Codes (0x11 - 0x85)',
    'settings.framedAsciiTitle': 'Framed ASCII Protocol',
    'settings.framedAsciiDesc': 'STX/ETX Framed + XOR Checksum',
    'settings.feedbackTitle': 'Feedback & Sound Effects',
    'settings.soundEffects': 'Audio Clicks',
    'settings.soundDesc': 'Synthesizes Web Audio click sounds on interaction',
    'settings.mobileHaptics': 'Mobile Haptics',
    'settings.hapticsDesc': 'Triggers vibration pulses on mobile devices',
    'settings.gattTitle': 'HM-10 GATT UUID Parameters',
    'settings.serviceUuid': 'GATT Service UUID',
    'settings.charUuid': 'Characteristic UUID',
  },

  tr: {
    'nav.scanner': 'Tarayıcı',
    'nav.text': 'Metin',
    'nav.media': 'Medya',
    'nav.presenter': 'Sunum',
    'nav.security': 'Güvenlik',
    'nav.macros': 'Makrolar',
    'nav.trackpad': 'İzleme Dörtgeni',
    'nav.console': 'Konsol',
    'nav.settings': 'Ayarlar',

    'header.bleBridge': 'BLE HID Köprüsü',
    'header.connected': 'Bağlandı',
    'header.connecting': 'Bağlanıyor...',
    'header.error': 'Hata',
    'header.ready': 'Hazır',
    'header.connect': 'Bağlan',
    'header.disconnect': 'Bağlantıyı Kes',
    'header.switchLight': 'Açık Temaya Geç',
    'header.switchDark': 'Koyu Temaya Geç',

    'scanner.title': 'BLE Cihaz Tarayıcısı',
    'scanner.description': 'HM-10, BT05 veya ESP32 Bluetooth Low Energy modüllerini keşfedip eşleştirin',
    'scanner.startScan': 'Taramayı Başlat',
    'scanner.scanning': 'Taranıyor...',
    'scanner.advertisementSupport': 'Web Bluetooth LE Yayın Tarama API’si tarayıcınızda desteklenmektedir.',
    'scanner.discovered': 'Bulunan Donanımlar',
    'scanner.clearList': 'Listeyi Temizle',
    'scanner.noDevices': 'Henüz BLE Cihazı Bulunamadı',
    'scanner.noDevicesDesc': 'Rubber Otter mikrodenetleyicinize bağlanmak için yukarıdaki Taramayı Başlat butonuna tıklayın.',
    'scanner.connectedBadge': 'Bağlı',
    'scanner.seen': 'Görülme',
    'scanner.connectBtn': 'Bağlan',
    'scanner.disconnectBtn': 'Bağlantıyı Kes',
    'scanner.iosNoticeTitle': 'iOS Bluetooth Uyumluluğu',
    'scanner.iosNoticeDesc': "Apple iOS Safari, Web Bluetooth API'sini standart tarayıcıda desteklememektedir. iPhone veya iPad'de bağlanmak için Rubber Otter Native iOS Uygulamasını kullanabilir veya bu sayfayı Bluefy Web Bluetooth Tarayıcısında açabilirsiniz.",
    'scanner.iosOpenBluefy': 'Bluefy Tarayıcısında Aç',

    'text.title': 'Tuş Enjektörü',
    'text.description': 'USB HID üzerinden doğrudan metin, makro ve terminal komutları gönderin',
    'text.clear': 'Temizle',
    'text.payloadContent': 'Gönderilecek İçerik',
    'text.chars': 'karakter',
    'text.duration': 'süre',
    'text.placeholder': 'Otomatik tuş vuruşları, kod veya terminal komutları yazın ya da yapıştırın...',
    'text.copy': 'Kopyala',
    'text.copied': 'Kopyalandı',
    'text.autoEnter': '+Enter',
    'text.clearOnSend': 'Gönderince Temizle',
    'text.quickSnippets': 'Hızlı Hazır Kodlar',
    'text.transmitting': 'Metin paketi gönderiliyor...',
    'text.success': 'Başarıyla iletildi',
    'text.failed': 'İletim başarısız oldu',
    'text.connectToTransmit': 'Göndermek için BLE Cihazı Bağlayın',
    'text.transmitBtn': 'Tuş Vuruşlarını İlet',
    'text.transmittingBtn': 'Tuşlar İletiliyor...',

    'media.title': 'Medya & Ses Kontrol Paneli',
    'media.description': 'Hedef işletim sistemi müzik çalma, parça geçişi ve ses seviyesini yönetin',
    'media.prev': 'Önceki',
    'media.play': 'Oynat',
    'media.pause': 'Duraklat',
    'media.next': 'Sonraki',
    'media.volDown': 'Sesi Azalt',
    'media.mute': 'Sessize Al',
    'media.volUp': 'Sesi Artır',

    'presentation.timer': 'Sunum Kronometresi',
    'presentation.start': 'Başlat',
    'presentation.pause': 'Duraklat',
    'presentation.reset': 'Kronometreyi Sıfırla',
    'presentation.prevSlide': 'Önceki Slayt',
    'presentation.prevDesc': 'Sol Ok (←) tuş vuruşu',
    'presentation.nextSlide': 'Sonraki Slayt',
    'presentation.nextDesc': 'Sağ Ok (→) tuş vuruşu',
    'presentation.fullscreen': 'Tam Ekran (F5)',
    'presentation.blackScreen': 'Siyah Ekran (B)',

    'security.lockTitle': 'İş İstasyonunu Kilitle',
    'security.lockDesc': 'Anında ekran kilitleme kısayolu gönderir',
    'security.hapticsTitle': 'Titreşimli Geri Bildirim',
    'security.hapticsDesc': 'Mobil titreşim motorunu ve mikrodenetleyici donanımını tetikler',
    'security.pulse100': '100ms',
    'security.pulse300': '300ms',
    'security.pulse500': '500ms',
    'security.shortPulse': 'Kısa Darbe',
    'security.mediumPulse': 'Orta',
    'security.longBurst': 'Uzun Darbe',
    'security.jigglerTitle': 'Mouse Jiggler Modu',
    'security.jigglerDesc': 'İşletim sisteminin uyumasını engelleyen periyodik mikro hareketler',
    'security.testPulse': 'Darbe Testi',
    'security.status': 'Durum:',
    'security.active': 'AKTİF (Periyodik Mikro-Hareket)',
    'security.disabled': 'DEVRE DIŞI',
    'security.taskMgr': 'Görev Yöneticisi',
    'security.forceQuit': 'Zorla Kapat',
    'security.showDesktop': 'Masaüstünü Göster',

    'gaming.title': 'Oyun & Makro Dizileri',
    'gaming.description': 'Otomatik tuş kombinasyonları ve oyun hızlı satın alma dizileri',
    'gaming.newMacro': 'Yeni Makro',
    'gaming.close': 'Kapat',
    'gaming.csBuyTitle': 'CS Zırh & Kask Satın Alma Makrosu',
    'gaming.csBuyDesc': "Satın Al ('b') → Zırh Menüsü (4) → Kask (2)",
    'gaming.csBuyBtn': 'CS Satın Alma Dizisini Çalıştır',
    'gaming.createMacroTitle': 'Özel Makro Oluştur',
    'gaming.macroNameLabel': 'Makro Adı',
    'gaming.macroNamePlaceholder': 'Örn: Hızlı Can Doldurma',
    'gaming.hexLabel': 'Hex Bayt Kodu',
    'gaming.delayLabel': 'Gecikme (ms)',
    'gaming.cancel': 'İptal',
    'gaming.saveMacro': 'Makroyu Kaydet',
    'gaming.savedMacros': 'Kayıtlı Makrolar',
    'gaming.run': 'Çalıştır',

    'trackpad.dragPrompt': 'İmleci Yönetmek İçin Dokunun ve Sürükleyin',
    'trackpad.gestureHint': 'Dokunma = Sol Tık • 2 Parmak = Sağ Tık',
    'trackpad.sensitivity': 'Hassasiyet:',
    'trackpad.leftClick': 'Sol Tık',
    'trackpad.rightClick': 'Sağ Tık',

    'console.title': 'GATT Paket Terminali',
    'console.packets': 'Paketler:',
    'console.bytes': 'Baytlar:',
    'console.copyLogs': 'Kopyala',
    'console.clearLogs': 'Kayıtları Temizle',
    'console.noLogs': 'Henüz BLE paket etkinliği kaydedilmedi',

    'settings.title': 'Uygulama Yapılandırması',
    'settings.description': 'Görünüm teması, dil, hedef işletim sistemi, protokol motoru ve GATT ayarları',
    'settings.resetDefaults': 'Fabrika Ayarlarına Dön',
    'settings.themeTitle': 'Görünüm Teması',
    'settings.dark': 'Koyu',
    'settings.light': 'Açık',
    'settings.system': 'Sistem',
    'settings.darkDesc': 'Obsidyen Koyu',
    'settings.lightDesc': 'Temiz Beyaz',
    'settings.systemDesc': 'İşletim Sistemiyle Eşzamanlı',
    'settings.languageTitle': 'Arayüz Dili',
    'settings.targetOsTitle': 'Hedef Bilgisayar İşletim Sistemi',
    'settings.protocolTitle': 'Bluetooth Protokol Motoru',
    'settings.singleByteTitle': 'Tek Baytlık Protokol',
    'settings.singleByteDesc': 'Doğrudan HEX Kodları (0x11 - 0x85)',
    'settings.framedAsciiTitle': 'Framed ASCII Protokolü',
    'settings.framedAsciiDesc': 'STX/ETX Çerçeveli + XOR Sağlama Toplamı',
    'settings.feedbackTitle': 'Geri Bildirim & Ses Efektleri',
    'settings.soundEffects': 'Ses Efektleri',
    'settings.soundDesc': 'Etkileşimlerde Web Audio tıklama sesleri çalar',
    'settings.mobileHaptics': 'Mobil Titreşim',
    'settings.hapticsDesc': 'Mobil cihazlarda dokunmatik titreşim üretir',
    'settings.gattTitle': 'HM-10 GATT UUID Parametreleri',
    'settings.serviceUuid': 'GATT Servis UUID',
    'settings.charUuid': 'Karakteristik UUID',
  },

  de: {
    'nav.scanner': 'Scanner',
    'nav.text': 'Text',
    'nav.media': 'Medien',
    'nav.presenter': 'Präsentation',
    'nav.security': 'Sicherheit',
    'nav.macros': 'Makros',
    'nav.trackpad': 'Trackpad',
    'nav.console': 'Konsole',
    'nav.settings': 'Einstellungen',

    'header.bleBridge': 'BLE HID-Brücke',
    'header.connected': 'Verbunden',
    'header.connecting': 'Verbinde...',
    'header.error': 'Fehler',
    'header.ready': 'Bereit',
    'header.connect': 'Verbinden',
    'header.disconnect': 'Trennen',
    'header.switchLight': 'Zu hellem Design wechseln',
    'header.switchDark': 'Zu dunklem Design wechseln',

    'scanner.title': 'BLE-Gerätescanner',
    'scanner.description': 'HM-10, BT05 oder ESP32 Bluetooth Low Energy Module suchen und koppeln',
    'scanner.startScan': 'Scan starten',
    'scanner.scanning': 'Scanne...',
    'scanner.advertisementSupport': 'Web Bluetooth LE Scan-API wird von Ihrem Browser unterstützt.',
    'scanner.discovered': 'Gefundene Geräte',
    'scanner.clearList': 'Liste leeren',
    'scanner.noDevices': 'Noch keine BLE-Geräte gefunden',
    'scanner.noDevicesDesc': 'Klicken Sie oben auf Scan starten, um Ihren Rubber Otter Controller zu verbinden.',
    'scanner.connectedBadge': 'Verbunden',
    'scanner.seen': 'Gesehen',
    'scanner.connectBtn': 'Verbinden',
    'scanner.disconnectBtn': 'Trennen',
    'scanner.iosNoticeTitle': 'iOS Bluetooth-Kompatibilität',
    'scanner.iosNoticeDesc': 'Apple iOS Safari unterstützt die Web-Bluetooth-API nicht direkt. Nutzen Sie die native iOS-App oder öffnen Sie diese Seite im Bluefy Web-Bluetooth-Browser.',
    'scanner.iosOpenBluefy': 'In Bluefy öffnen',

    'text.title': 'Tasten-Injektor',
    'text.description': 'Text, Makros und Befehle direkt über USB HID übertragen',
    'text.clear': 'Löschen',
    'text.payloadContent': 'Nutzlast-Inhalt',
    'text.chars': 'Zeichen',
    'text.duration': 'Dauer',
    'text.placeholder': 'Geben Sie automatische Tastenbefehle, Code oder Terminalbefehle ein...',
    'text.copy': 'Kopieren',
    'text.copied': 'Kopiert',
    'text.autoEnter': '+Eingabe',
    'text.clearOnSend': 'Beim Senden leeren',
    'text.quickSnippets': 'Schnell-Vorlagen',
    'text.transmitting': 'Textübertragung läuft...',
    'text.success': 'Erfolgreich übertragen',
    'text.failed': 'Übertragung fehlgeschlagen',
    'text.connectToTransmit': 'BLE-Gerät zum Übertragen verbinden',
    'text.transmitBtn': 'Tastenanschläge übertragen',
    'text.transmittingBtn': 'Übertrage Anschläge...',

    'media.title': 'Medien & Lautstärke',
    'media.description': 'Audiowiedergabe, Titel und Lautstärke des Host-Systems steuern',
    'media.prev': 'Zurück',
    'media.play': 'Wiedergabe',
    'media.pause': 'Pause',
    'media.next': 'Weiter',
    'media.volDown': 'Leiser',
    'media.mute': 'Stummschalten',
    'media.volUp': 'Lauter',

    'presentation.timer': 'Präsentations-Timer',
    'presentation.start': 'Start',
    'presentation.pause': 'Pause',
    'presentation.reset': 'Timer zurücksetzen',
    'presentation.prevSlide': 'Vorherige Folie',
    'presentation.prevDesc': 'Linke Pfeiltaste (←)',
    'presentation.nextSlide': 'Nächste Folie',
    'presentation.nextDesc': 'Rechte Pfeiltaste (→)',
    'presentation.fullscreen': 'Vollbild (F5)',
    'presentation.blackScreen': 'Schwarzer Bildschirm (B)',

    'security.lockTitle': 'Workstation sperren',
    'security.lockDesc': 'Sendet sofortigen Sperr-Kurzbefehl',
    'security.hapticsTitle': 'Vibrations-Haptik',
    'security.hapticsDesc': 'Löst mobile Vibration und MCU-Hardwaremotor aus',
    'security.pulse100': '100ms',
    'security.pulse300': '300ms',
    'security.pulse500': '500ms',
    'security.shortPulse': 'Kurzer Impuls',
    'security.mediumPulse': 'Mittel',
    'security.longBurst': 'Langer Impuls',
    'security.jigglerTitle': 'Maus-Jiggler-Modus',
    'security.jigglerDesc': 'Periodische Mikrobewegungen gegen System-Ruhezustand',
    'security.testPulse': 'Test-Impuls',
    'security.status': 'Status:',
    'security.active': 'AKTIV (Mikro-Jiggle)',
    'security.disabled': 'DEAKTIVIERT',
    'security.taskMgr': 'Taskmanager',
    'security.forceQuit': 'Sofort beenden',
    'security.showDesktop': 'Schreibtisch anzeigen',

    'gaming.title': 'Gaming & Makro-Sequenzen',
    'gaming.description': 'Automatisierte Tastenkombinationen und Kauf-Sequenzen',
    'gaming.newMacro': 'Neues Makro',
    'gaming.close': 'Schließen',
    'gaming.csBuyTitle': 'CS Rüstung & Helm Kauf-Makro',
    'gaming.csBuyDesc': "Kaufen ('b') → Rüstung (4) → Helm (2)",
    'gaming.csBuyBtn': 'CS Kauf-Sequenz ausführen',
    'gaming.createMacroTitle': 'Benutzerdefiniertes Makro erstellen',
    'gaming.macroNameLabel': 'Makroname',
    'gaming.macroNamePlaceholder': 'z.B. Schnellheilung',
    'gaming.hexLabel': 'Hex-Byte-Code',
    'gaming.delayLabel': 'Verzögerung (ms)',
    'gaming.cancel': 'Abbrechen',
    'gaming.saveMacro': 'Makro speichern',
    'gaming.savedMacros': 'Gespeicherte Makros',
    'gaming.run': 'Ausführen',

    'trackpad.dragPrompt': 'Berühren & Ziehen zur Maussteuerung',
    'trackpad.gestureHint': 'Tippen = Linksklick • 2-Finger-Tipp = Rechtsklick',
    'trackpad.sensitivity': 'Empfindlichkeit:',
    'trackpad.leftClick': 'Linksklick',
    'trackpad.rightClick': 'Rechtsklick',

    'console.title': 'GATT-Paketterminal',
    'console.packets': 'Pakete:',
    'console.bytes': 'Bytes:',
    'console.copyLogs': 'Kopieren',
    'console.clearLogs': 'Protokolle leeren',
    'console.noLogs': 'Noch keine BLE-Paketaktivität aufgezeichnet',

    'settings.title': 'Anwendungskonfiguration',
    'settings.description': 'Design, Sprache, Host-Betriebssystem, Protokoll und GATT-Parameter',
    'settings.resetDefaults': 'Auf Werkseinstellungen zurücksetzen',
    'settings.themeTitle': 'Erscheinungsbild',
    'settings.dark': 'Dunkel',
    'settings.light': 'Hell',
    'settings.system': 'System',
    'settings.darkDesc': 'Obsidian Dunkel',
    'settings.lightDesc': 'Klares Weiß',
    'settings.systemDesc': 'Betriebssystem-Sync',
    'settings.languageTitle': 'Oberflächensprache',
    'settings.targetOsTitle': 'Ziel-Betriebssystem',
    'settings.protocolTitle': 'Bluetooth-Protokoll-Engine',
    'settings.singleByteTitle': 'Single-Byte-Protokoll',
    'settings.singleByteDesc': 'Direkte HEX-Befehle (0x11 - 0x85)',
    'settings.framedAsciiTitle': 'Framed-ASCII-Protokoll',
    'settings.framedAsciiDesc': 'STX/ETX Rahmen + XOR-Prüfsumme',
    'settings.feedbackTitle': 'Feedback & Soundeffekte',
    'settings.soundEffects': 'Klickgeräusche',
    'settings.soundDesc': 'Web-Audio Klickgeräusche bei Interaktionen',
    'settings.mobileHaptics': 'Mobile Haptik',
    'settings.hapticsDesc': 'Vibrationsimpulse auf Mobilgeräten',
    'settings.gattTitle': 'HM-10 GATT UUID-Parameter',
    'settings.serviceUuid': 'GATT Service UUID',
    'settings.charUuid': 'Characteristic UUID',
  },

  fr: {
    'nav.scanner': 'Scanner',
    'nav.text': 'Texte',
    'nav.media': 'Médias',
    'nav.presenter': 'Présentation',
    'nav.security': 'Sécurité',
    'nav.macros': 'Macros',
    'nav.trackpad': 'Pavé tactile',
    'nav.console': 'Console',
    'nav.settings': 'Paramètres',

    'header.bleBridge': 'Pont BLE HID',
    'header.connected': 'Connecté',
    'header.connecting': 'Connexion...',
    'header.error': 'Erreur',
    'header.ready': 'Prêt',
    'header.connect': 'Connecter',
    'header.disconnect': 'Déconnecter',
    'header.switchLight': 'Passer au thème clair',
    'header.switchDark': 'Passer au thème sombre',

    'scanner.title': 'Scanner de périphériques BLE',
    'scanner.description': 'Découvrez et associez des modules HM-10, BT05 ou ESP32 Bluetooth Low Energy',
    'scanner.startScan': 'Démarrer le scan',
    'scanner.scanning': 'Recherche en cours...',
    'scanner.advertisementSupport': 'L’API de scan publicitaire Web Bluetooth LE est prise en charge par votre navigateur.',
    'scanner.discovered': 'Matériel découvert',
    'scanner.clearList': 'Effacer la liste',
    'scanner.noDevices': 'Aucun périphérique BLE trouvé',
    'scanner.noDevicesDesc': 'Cliquez sur Démarrer le scan pour connecter votre contrôleur Rubber Otter.',
    'scanner.connectedBadge': 'Connecté',
    'scanner.seen': 'Vu',
    'scanner.connectBtn': 'Connecter',
    'scanner.disconnectBtn': 'Déconnecter',
    'scanner.iosNoticeTitle': 'Compatibilité Bluetooth iOS',
    'scanner.iosNoticeDesc': "Apple iOS Safari ne prend pas en charge l'API Web Bluetooth. Utilisez l'application iOS native ou ouvrez cette page dans le navigateur Bluefy.",
    'scanner.iosOpenBluefy': 'Ouvrir dans Bluefy',

    'text.title': 'Injecteur de frappes',
    'text.description': 'Transmettez du texte, des macros et des commandes directement via USB HID',
    'text.clear': 'Effacer',
    'text.payloadContent': 'Contenu à transmettre',
    'text.chars': 'caractères',
    'text.duration': 'durée',
    'text.placeholder': 'Tapez ou collez des frappes de touches automatisées, du code ou des commandes...',
    'text.copy': 'Copier',
    'text.copied': 'Copié',
    'text.autoEnter': '+Entrée',
    'text.clearOnSend': 'Effacer à l’envoi',
    'text.quickSnippets': 'Extraits rapides',
    'text.transmitting': 'Transmission en cours...',
    'text.success': 'Transmis avec succès',
    'text.failed': 'Échec de la transmission',
    'text.connectToTransmit': 'Connectez un appareil BLE pour transmettre',
    'text.transmitBtn': 'Transmettre les frappes',
    'text.transmittingBtn': 'Transmission des frappes...',

    'media.title': 'Contrôle Médias & Volume',
    'media.description': 'Contrôlez la lecture audio, les pistes et le volume de l’ordinateur cible',
    'media.prev': 'Précédent',
    'media.play': 'Lecture',
    'media.pause': 'Pause',
    'media.next': 'Suivant',
    'media.volDown': 'Volume -',
    'media.mute': 'Muet',
    'media.volUp': 'Volume +',

    'presentation.timer': 'Chronomètre de présentation',
    'presentation.start': 'Démarrer',
    'presentation.pause': 'Pause',
    'presentation.reset': 'Réinitialiser le chrono',
    'presentation.prevSlide': 'Diapositive précédente',
    'presentation.prevDesc': 'Touche flèche gauche (←)',
    'presentation.nextSlide': 'Diapositive suivante',
    'presentation.nextDesc': 'Touche flèche droite (→)',
    'presentation.fullscreen': 'Plein écran (F5)',
    'presentation.blackScreen': 'Écran noir (B)',

    'security.lockTitle': 'Verrouiller la session',
    'security.lockDesc': 'Envoie le raccourci de verrouillage instantané',
    'security.hapticsTitle': 'Retour haptique',
    'security.hapticsDesc': 'Déclenche la vibration mobile et le moteur matériel du microcontrôleur',
    'security.pulse100': '100ms',
    'security.pulse300': '300ms',
    'security.pulse500': '500ms',
    'security.shortPulse': 'Impulsion courte',
    'security.mediumPulse': 'Moyenne',
    'security.longBurst': 'Impulsion longue',
    'security.jigglerTitle': 'Mode Mouse Jiggler',
    'security.jigglerDesc': 'Micro-mouvements périodiques pour empêcher la mise en veille',
    'security.testPulse': 'Tester l’impulsion',
    'security.status': 'Statut :',
    'security.active': 'ACTIF (Micro-mouvements)',
    'security.disabled': 'DÉSACTIVÉ',
    'security.taskMgr': 'Gestionnaire des tâches',
    'security.forceQuit': 'Forcer à quitter',
    'security.showDesktop': 'Afficher le bureau',

    'gaming.title': 'Jeux & Séquences de macros',
    'gaming.description': 'Combinaisons de touches automatiques et séquences d’achat',
    'gaming.newMacro': 'Nouvelle macro',
    'gaming.close': 'Fermer',
    'gaming.csBuyTitle': 'Macro d’achat Armure & Casque CS',
    'gaming.csBuyDesc': "Achat ('b') → Menu Armure (4) → Casque (2)",
    'gaming.csBuyBtn': 'Exécuter la séquence d’achat CS',
    'gaming.createMacroTitle': 'Créer une macro personnalisée',
    'gaming.macroNameLabel': 'Nom de la macro',
    'gaming.macroNamePlaceholder': 'Ex: Soin rapide',
    'gaming.hexLabel': 'Code octet Hex',
    'gaming.delayLabel': 'Délai (ms)',
    'gaming.cancel': 'Annuler',
    'gaming.saveMacro': 'Enregistrer la macro',
    'gaming.savedMacros': 'Macros enregistrées',
    'gaming.run': 'Exécuter',

    'trackpad.dragPrompt': 'Touchez et glissez pour contrôler le curseur',
    'trackpad.gestureHint': 'Appui = Clic gauche • 2 doigts = Clic droit',
    'trackpad.sensitivity': 'Sensibilité :',
    'trackpad.leftClick': 'Clic gauche',
    'trackpad.rightClick': 'Clic droit',

    'console.title': 'Terminal de paquets GATT',
    'console.packets': 'Paquets :',
    'console.bytes': 'Octets :',
    'console.copyLogs': 'Copier',
    'console.clearLogs': 'Effacer les journaux',
    'console.noLogs': 'Aucune activité de paquet BLE enregistrée',

    'settings.title': 'Configuration de l’application',
    'settings.description': 'Thème d’affichage, langue, système d’exploitation cible, moteur de protocole et GATT',
    'settings.resetDefaults': 'Rétablir les valeurs par défaut',
    'settings.themeTitle': 'Thème d’affichage',
    'settings.dark': 'Sombre',
    'settings.light': 'Clair',
    'settings.system': 'Système',
    'settings.darkDesc': 'Noir Obsidienne',
    'settings.lightDesc': 'Blanc Épuré',
    'settings.systemDesc': 'Synchronisé avec l’OS',
    'settings.languageTitle': 'Langue de l’interface',
    'settings.targetOsTitle': 'Système d’exploitation cible',
    'settings.protocolTitle': 'Moteur de protocole Bluetooth',
    'settings.singleByteTitle': 'Protocole octet unique',
    'settings.singleByteDesc': 'Codes HEX directs (0x11 - 0x85)',
    'settings.framedAsciiTitle': 'Protocole ASCII Encadré',
    'settings.framedAsciiDesc': 'Trame STX/ETX + Somme de contrôle XOR',
    'settings.feedbackTitle': 'Retour & Effets sonores',
    'settings.soundEffects': 'Clics sonores',
    'settings.soundDesc': 'Synthétise des clics audio Web lors des interactions',
    'settings.mobileHaptics': 'Haptique mobile',
    'settings.hapticsDesc': 'Déclenche des vibrations sur les appareils mobiles',
    'settings.gattTitle': 'Paramètres UUID GATT HM-10',
    'settings.serviceUuid': 'UUID de service GATT',
    'settings.charUuid': 'UUID de caractéristique',
  },

  es: {
    'nav.scanner': 'Escáner',
    'nav.text': 'Texto',
    'nav.media': 'Medios',
    'nav.presenter': 'Presentador',
    'nav.security': 'Seguridad',
    'nav.macros': 'Macros',
    'nav.trackpad': 'Panel táctil',
    'nav.console': 'Consola',
    'nav.settings': 'Ajustes',

    'header.bleBridge': 'Puente BLE HID',
    'header.connected': 'Conectado',
    'header.connecting': 'Conectando...',
    'header.error': 'Error',
    'header.ready': 'Listo',
    'header.connect': 'Conectar',
    'header.disconnect': 'Desconectar',
    'header.switchLight': 'Cambiar a tema claro',
    'header.switchDark': 'Cambiar a tema oscuro',

    'scanner.title': 'Escáner de dispositivos BLE',
    'scanner.description': 'Descubra y vincule módulos Bluetooth Low Energy HM-10, BT05 o ESP32',
    'scanner.startScan': 'Iniciar escaneo',
    'scanner.scanning': 'Escaneando...',
    'scanner.advertisementSupport': 'La API de escaneo de anuncios Web Bluetooth LE es compatible con su navegador.',
    'scanner.discovered': 'Hardware descubierto',
    'scanner.clearList': 'Limpiar lista',
    'scanner.noDevices': 'No se encontraron dispositivos BLE',
    'scanner.noDevicesDesc': 'Haga clic en Iniciar escaneo arriba para conectar su microcontrolador Rubber Otter.',
    'scanner.connectedBadge': 'Conectado',
    'scanner.seen': 'Visto',
    'scanner.connectBtn': 'Conectar',
    'scanner.disconnectBtn': 'Desconectar',
    'scanner.iosNoticeTitle': 'Compatibilidad Bluetooth iOS',
    'scanner.iosNoticeDesc': 'Apple iOS Safari no es compatible con Web Bluetooth API. Usa la app nativa de iOS o abre esta página en el navegador Bluefy.',
    'scanner.iosOpenBluefy': 'Abrir en Bluefy',

    'text.title': 'Inyector de pulsaciones',
    'text.description': 'Transmita texto, macros y comandos directamente a través de USB HID',
    'text.clear': 'Limpiar',
    'text.payloadContent': 'Contenido del mensaje',
    'text.chars': 'caracteres',
    'text.duration': 'duración',
    'text.placeholder': 'Escriba o pegue comandos automatizados, código o secuencias de terminal...',
    'text.copy': 'Copiar',
    'text.copied': 'Copiado',
    'text.autoEnter': '+Enter',
    'text.clearOnSend': 'Borrar al enviar',
    'text.quickSnippets': 'Plantillas rápidas',
    'text.transmitting': 'Transmitiendo texto...',
    'text.success': 'Transmitido con éxito',
    'text.failed': 'Fallo en la transmisión',
    'text.connectToTransmit': 'Conecte un dispositivo BLE para transmitir',
    'text.transmitBtn': 'Transmitir pulsaciones',
    'text.transmittingBtn': 'Transmitiendo pulsaciones...',

    'media.title': 'Panel de medios y volumen',
    'media.description': 'Controle la reproducción de audio, pistas y volumen del equipo anfitrión',
    'media.prev': 'Anterior',
    'media.play': 'Reproducir',
    'media.pause': 'Pausar',
    'media.next': 'Siguiente',
    'media.volDown': 'Bajar volumen',
    'media.mute': 'Silenciar',
    'media.volUp': 'Subir volumen',

    'presentation.timer': 'Temporizador de presentación',
    'presentation.start': 'Iniciar',
    'presentation.pause': 'Pausar',
    'presentation.reset': 'Reiniciar reloj',
    'presentation.prevSlide': 'Diapositiva anterior',
    'presentation.prevDesc': 'Tecla flecha izquierda (←)',
    'presentation.nextSlide': 'Diapositiva siguiente',
    'presentation.nextDesc': 'Tecla flecha derecha (→)',
    'presentation.fullscreen': 'Pantalla completa (F5)',
    'presentation.blackScreen': 'Pantalla negra (B)',

    'security.lockTitle': 'Bloquear equipo',
    'security.lockDesc': 'Envía el atajo de bloqueo instantáneo',
    'security.hapticsTitle': 'Vibración háptica',
    'security.hapticsDesc': 'Activa la vibración móvil y el motor de hardware del microcontrolador',
    'security.pulse100': '100ms',
    'security.pulse300': '300ms',
    'security.pulse500': '500ms',
    'security.shortPulse': 'Pulso corto',
    'security.mediumPulse': 'Medio',
    'security.longBurst': 'Pulso largo',
    'security.jigglerTitle': 'Modo Mouse Jiggler',
    'security.jigglerDesc': 'Micro-movimientos periódicos para evitar la suspensión del sistema',
    'security.testPulse': 'Probar pulso',
    'security.status': 'Estado:',
    'security.active': 'ACTIVO (Micro-movimientos)',
    'security.disabled': 'DESACTIVADO',
    'security.taskMgr': 'Administrador de tareas',
    'security.forceQuit': 'Forzar salida',
    'security.showDesktop': 'Mostrar escritorio',

    'gaming.title': 'Juegos y secuencias de macros',
    'gaming.description': 'Combinaciones automáticas de teclas y secuencias de compra',
    'gaming.newMacro': 'Nueva macro',
    'gaming.close': 'Cerrar',
    'gaming.csBuyTitle': 'Macro de compra de chaleco y casco CS',
    'gaming.csBuyDesc': "Comprar ('b') → Menú armadura (4) → Casco (2)",
    'gaming.csBuyBtn': 'Ejecutar secuencia de compra CS',
    'gaming.createMacroTitle': 'Crear macro personalizada',
    'gaming.macroNameLabel': 'Nombre de la macro',
    'gaming.macroNamePlaceholder': 'Ej: Curación rápida',
    'gaming.hexLabel': 'Código byte Hex',
    'gaming.delayLabel': 'Retardo (ms)',
    'gaming.cancel': 'Cancelar',
    'gaming.saveMacro': 'Guardar macro',
    'gaming.savedMacros': 'Macros guardadas',
    'gaming.run': 'Ejecutar',

    'trackpad.dragPrompt': 'Toque y arrastre para mover el cursor',
    'trackpad.gestureHint': 'Toque = Clic izquierdo • 2 dedos = Clic derecho',
    'trackpad.sensitivity': 'Sensibilidad:',
    'trackpad.leftClick': 'Clic izquierdo',
    'trackpad.rightClick': 'Clic derecho',

    'console.title': 'Terminal de paquetes GATT',
    'console.packets': 'Paquetes:',
    'console.bytes': 'Bytes:',
    'console.copyLogs': 'Copiar',
    'console.clearLogs': 'Limpiar registros',
    'console.noLogs': 'No hay actividad de paquetes BLE registrada',

    'settings.title': 'Configuración de la aplicación',
    'settings.description': 'Tema visual, idioma, sistema anfitrión, motor de protocolo y parámetros GATT',
    'settings.resetDefaults': 'Restablecer valores predeterminados',
    'settings.themeTitle': 'Tema visual',
    'settings.dark': 'Oscuro',
    'settings.light': 'Claro',
    'settings.system': 'Sistema',
    'settings.darkDesc': 'Obsidiana Oscuro',
    'settings.lightDesc': 'Blanco Limpio',
    'settings.systemDesc': 'Sincronizado con el SO',
    'settings.languageTitle': 'Idioma de la interfaz',
    'settings.targetOsTitle': 'Sistema operativo anfitrión',
    'settings.protocolTitle': 'Motor de protocolo Bluetooth',
    'settings.singleByteTitle': 'Protocolo de un solo byte',
    'settings.singleByteDesc': 'Códigos HEX directos (0x11 - 0x85)',
    'settings.framedAsciiTitle': 'Protocolo ASCII enmarcado',
    'settings.framedAsciiDesc': 'Trama STX/ETX + Suma de comprobación XOR',
    'settings.feedbackTitle': 'Respuesta y efectos de sonido',
    'settings.soundEffects': 'Clics de audio',
    'settings.soundDesc': 'Sintetiza clics Web Audio en interacciones',
    'settings.mobileHaptics': 'Háptica móvil',
    'settings.hapticsDesc': 'Genera pulsos de vibración en dispositivos móviles',
    'settings.gattTitle': 'Parámetros UUID GATT HM-10',
    'settings.serviceUuid': 'UUID de servicio GATT',
    'settings.charUuid': 'UUID de característica',
  }
};
