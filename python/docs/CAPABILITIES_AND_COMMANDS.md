# 🦦 RubberOtter — Complete Capabilities & Command Reference Guide

This comprehensive reference document details every feature, hardware capability, command syntax, Python SDK method, CLI command, and Web App REST API endpoint available in the **Rubber Otter** ecosystem.

---

## 📌 Table of Contents

- [1. Donanım & İletişim Katmanları (Hardware & Transport)](#1-donanım--iletişim-katmanları-hardware--transport)
- [2. Haptik Titreşim Motoru (Haptics & Vibration)](#2-haptik-titreşim-motoru-haptics--vibration)
- [3. USB HID Klavye & Metin Yazma (Keyboard & Typing)](#3-usb-hid-klavye--metin-yazma-keyboard--typing)
- [4. Sanal Fare & Kaydırma (Virtual Mouse & Scroll Wheel)](#4-sanal-fare--kaydırma-virtual-mouse--scroll-wheel)
- [5. Arka Plan Mouse Jiggler (Anti-Sleep Mode)](#5-arka-plan-mouse-jiggler-anti-sleep-mode)
- [6. Medya & Müzik Kumandası (Media & Volume Control)](#6-medya--müzik-kumandası-media--volume-control)
- [7. Sunum Kumandası (Presenter Clicker Deck)](#7-sunum-kumandası-presenter-clicker-deck)
- [8. EEPROM Kalıcı Makro Yöneticisi (Persistent EEPROM Macros)](#8-eeprom-kalıcı-makro-yöneticisi-persistent-eeprom-macros)
- [9. Komut Zincirleme & Gecikme (Chaining & Delays)](#9-komut-zincirleme--gecikme-chaining--delays)
- [10. Bluetooth İsmi Değiştirme (BLE Name Configuration)](#10-bluetooth-ismi-değiştirme-ble-name-configuration)
- [11. Tüm Arayüzler İçin Örnekler Matrisi (Comprehensive Examples Matrix)](#11-tüm-arayüzler-için-örnekler-matrisi-comprehensive-examples-matrix)

---

## 1. Donanım & İletişim Katmanları (Hardware & Transport)

Rubber Otter, ATmega32U4 mikrodenetleyicisi (SparkFun Pro Micro / Arduino Leonardo) üzerinde çalışan gelişmiş bir HID & Donanım denetleyicisidir. İki ana taşıma katmanını destekler:

1. **Bluetooth Low Energy (BLE HM-10 / BT05)**:
   - Kablosuz GATT Seri servisi üzerinden doğrudan bilgisayar, telefon veya tablet ile haberleşir.
   - Varsayılan bağlantı yöntemi BLE'dir. Cihaz USB'ye takılı olmasa dahi kablosuz komut kabul eder.
2. **USB CDC Serial**:
   - USB kablosu takıldığında Sanal Seri Port (`/dev/cu.usbmodem*` veya `COM*`) üzerinden yüksek hızlı haberleşme sağlar.

---

## 2. Haptik Titreşim Motoru (Haptics & Vibration)

Pin 2 (`VIB_PIN`) üzerindeki transistör/MOSFET sürücüsüne bağlı olan haptik titreşim motorunu milisaniye hassasiyetinde çalıştırır.

### Komut Sözdizimi
```text
vibrate <duration_ms>
```

### Örnekler
- **Ham Komut**: `vibrate 150` (150 milisaniye kısa titreşim)
- **Ham Komut**: `vibrate 500` (Yarım saniyelik uzun titreşim)
- **Python SDK**: `otter.vibrate(150)`
- **CLI**: `rubberotter vibrate 150`
- **REST API**: `POST /api/vibrate` ile `{"duration": 150}`

---

## 3. USB HID Klavye & Metin Yazma (Keyboard & Typing)

Target bilgisayarda standart USB HID Klavyeyi taklit eder.

### A. Metin Yazma (`type`)
Kaçış karakterlerini (`\n`, `\t`, `\"`, `\\`) otomatik çözerek insan yazma hızında ekrana metin yazar.

```text
type "<text_payload>"
```

**Örnekler**:
- `type "Hello Rubber Otter!\n"`
- `type "whoami && uname -a\n"`
- `type "curl -s https://example.com | bash\n"`

### B. Tekli Tuş Basma (`press`)
Belirtilen özel tuşa basıp bırakır.

```text
press <key_name>
```

**Desteklenen Tuşlar**:
- **Gezinti & Kontrol**: `enter`, `tab`, `backspace`, `escape`, `space`, `delete`, `up`, `down`, `left`, `right`, `home`, `end`, `pageup`, `pagedown`, `capslock`
- **Fonksiyon Tuşları**: `f1`, `f2`, `f3`, `f4`, `f5`, `f6`, `f7`, `f8`, `f9`, `f10`, `f11`, `f12`
- **Değiştirici (Modifier) Tuşlar**: `gui` / `cmd` / `win`, `ctrl`, `alt`, `shift`

### C. Tuş Kombinasyonu (`combo` / `press <keys>`)
Aynı anda birden fazla tuşa basıp serbest bırakır.

**Örnekler**:
- `press GUI space` → macOS Spotlight Arama Pencerisini açar.
- `press GUI l` → Ekranı kilitler (Mac / Windows).
- `press ALT TAB` → Açık pencereler arasında geçiş yapar.
- `press CTRL c` → Terminaldeki işlemi sonlandırır.
- `press GUI c` → Seçili metni kopyalar.
- `press GUI v` → Panodaki metni yapıştırır.

---

## 4. Sanal Fare & Kaydırma (Virtual Mouse & Scroll Wheel)

Fiziksel fareyi taklit ederek sol/sağ tıklama, bağıl fare imleç hareketi ve kaydırma tekerleğini kontrol eder.

### Komut Sözdizimi
- **Tıklama**: `mouse left`, `mouse right`, `mouse middle`
- **İmleç Hareketi**: `mouse move <dx> <dy>` (Piksel cinsinden bağıl hareket)
- **Kaydırma Tekerleği**: `mouse wheel <val>` (`1` yukarı, `-1` aşağı)

### Örnekler
- `mouse left` → Ekranda sol tık yapar.
- `mouse right` → Ekranda sağ tık yapar.
- `mouse move 50 -20` → İmleci 50px sağa, 20px yukarı kaydırır.
- `mouse wheel 1` → Sayfayı yukarı kaydırır.
- `mouse wheel -2` → Sayfayı aşağı kaydırır.

---

## 5. Arka Plan Mouse Jiggler (Anti-Sleep Mode)

Bilgisayarın kilitlenmesini, ekran koruyucunun açılmasını veya Slack/Teams durumunun "Dışarıda" görünmesini önlemek için mikrodenetleyici arka planda imleci hafifçe hareket ettirir.

### Komut Sözdizimi
- `jiggler start` → Mouse Jiggler modunu başlatır.
- `jiggler stop` → Mouse Jiggler modunu durdurur.
- `jiggler toggle` → Açık/Kapalı durumunu tersine çevirir.

---

## 6. Medya & Müzik Kumandası (Media & Volume Control)

Bilgisayardaki veya tabletteki medya yürütücüsünü ve ses seviyesini doğrudan kontrol eder.

### Komutlar & Kısayollar
- **Oynat / Duraklat**: `press MEDIA_PLAY_PAUSE`
- **Sonraki Şarkı**: `press MEDIA_NEXT_TRACK`
- **Önceki Şarkı**: `press MEDIA_PREV_TRACK`
- **Sesi Artır**: `press VOLUME_UP`
- **Sesi Azalt**: `press VOLUME_DOWN`
- **Sesi Sessize Al (Mute)**: `press VOLUME_MUTE`

---

## 7. Sunum Kumandası (Presenter Clicker Deck)

PowerPoint, Keynote, Google Slides ve PDF sunumlarında kablosuz sunum kumandası olarak çalışır.

### Sunum Komutları
- **Sunumu Başlat (F5)**: `press f5`
- **Sonraki Slayt**: `press right` veya `press space` veya `mouse left`
- **Önceki Slayt**: `press left` veya `press backspace`
- **Siyah Ekran (Black Screen)**: `type "b"`
- **Beyaz Ekran (White Screen)**: `type "w"`
- **Sunumdan Çık (Esc)**: `press escape`

---

## 8. EEPROM Kalıcı Makro Yöneticisi (Persistent EEPROM Macros)

Otter üzerindeki ATmega32U4 mikrodenetleyicisinin kalıcı EEPROM hafızasında 6 adet makro slotu (`m0`..`m5`) saklanır. Cihazın gücü kesilse dahi bu makrolar silinmez.

### Komut Sözdizimi
- **Makroları Listele**: `macro list`
- **Makro Kaydet**: `macro save <slot> "<commands>"`
- **Makro Çalıştır**: `macro run <slot>`

### Örnekler
- `macro save m0 "vibrate 150 && type \"Otter123\n\""` → `m0` slotuna titreşim + şifre yazma kaydeder.
- `macro save m1 "press GUI space && delay 150 && type \"terminal\n\""` → `m1` slotuna terminal açma dizisi kaydeder.
- `macro run m0` → `m0` slotundaki komutu çalıştırır.

---

## 9. Komut Zincirleme & Gecikme (Chaining & Delays)

Birden fazla donanım aksiyonu `&&` veya `;` ayraçları ile tek satırda sırayla çalıştırılabilir.

### Gecikme Komutu (`delay`)
Mikrodenetleyiciye belirtilen milisaniye kadar beklemesini söyler.

```text
delay <ms>
```

### Karmaşık Zincirleme Örnekleri
- `vibrate 100 && delay 200 && vibrate 100` (Çift tık haptik titreşimi)
- `press GUI space && delay 200 && type "Google Chrome\n"` (Spotlight ile Chrome açma)
- `jiggler start; vibrate 300` (Jiggler başlatıp uzun haptik uyarı verme)

---

## 10. Bluetooth İsmi Değiştirme (BLE Name Configuration)

HM-10 / BT05 Bluetooth LE modülünün yayınladığı cihaz adını değiştirir.

```text
ble name "<new_name>"
```

### Örnek
- `ble name "Otter_Pro"` → BLE modülüne `AT+NAMEAuto_Pro` gönderir ve yayın adını günceller.

---

## 11. Tüm Arayüzler İçin Örnekler Matrisi (Comprehensive Examples Matrix)

| Yetenek / Aksiyon | Ham Donanım Komutu | Python SDK (`rubberotter`) | CLI Komutu (`rubberotter`) | Web Dashboard REST API |
| :--- | :--- | :--- | :--- | :--- |
| **Metin Yazma** | `type "Hello\n"` | `otter.type("Hello\n")` | `rubberotter type "Hello\n"` | `POST /api/type` `{"text": "Hello\n"}` |
| **Titreşim Motoru** | `vibrate 200` | `otter.vibrate(200)` | `rubberotter vibrate 200` | `POST /api/vibrate` `{"duration": 200}` |
| **Mouse Jiggler** | `jiggler toggle` | `otter.jiggler_toggle()` | `rubberotter jiggler toggle` | `POST /api/jiggler` `{"action": "toggle"}` |
| **Sol Tıklama** | `mouse left` | `otter.mouse_click("left")` | `rubberotter send "mouse left"` | `POST /api/mouse` `{"action": "click", "button": "left"}` |
| **Fare Kaydırma** | `mouse wheel 1` | `otter.mouse_move(wheel=1)` | `rubberotter send "mouse wheel 1"` | `POST /api/mouse` `{"action": "wheel", "wheel": 1}` |
| **Spotlight Açma** | `press GUI space` | `otter.combo("press GUI space")` | `rubberotter send "press GUI space"` | `POST /api/combo` `{"keys": ["GUI", "space"]}` |
| **Ekran Kilitleme** | `press GUI l` | `otter.combo("press GUI l")` | `rubberotter send "press GUI l"` | `POST /api/combo` `{"keys": ["GUI", "l"]}` |
| **Oynat / Duraklat** | `press MEDIA_PLAY_PAUSE` | `otter.press("MEDIA_PLAY_PAUSE")` | `rubberotter send "press MEDIA_PLAY_PAUSE"` | `POST /api/press` `{"key": "MEDIA_PLAY_PAUSE"}` |
| **Slayt Başlat (F5)**| `press f5` | `otter.press("f5")` | `rubberotter send "press f5"` | `POST /api/press` `{"key": "f5"}` |
| **Makro Çalıştır** | `macro run m0` | `otter.macro_run("m0")` | `rubberotter macro run m0` | `POST /api/macro/run` `{"slot": "m0"}` |
| **Makro Kaydet** | `macro save m0 "..."` | `otter.macro_save("m0", "...")` | `rubberotter macro save m0 "..."` | `POST /api/macro/save` `{"slot": "m0", "body": "..."}` |
