Rubber Otter — Arduino tarafı

Bu dosya projedeki Arduino tarafı (ATmega32U4 tabanlı kartlar — Pro Micro / Leonardo + HM-10 + vibrasyon motoru) için hızlı kılavuz ve referans içerir.

Önemli not (board/env):
- Bu repo artık PlatformIO için varsayılan environment olarak `leonardo` (Arduino Leonardo) kullanacak şekilde yapılandırılmıştır (platformio.ini içinde `default_envs = leonardo`).
- Neden? Bazı PlatformIO kurulumlarında ATmega32U4 tabanlı kartlar `leonardo` olarak tanımlanır; eğer sizde Pro Micro tanınıyorsa `pro_micro` envini kullanabilirsiniz.
- Eğer fiziksel kartınız Pro Micro ise ve PlatformIO sizin sistemde `pro_micro` olarak tanıyorsa, `platformio.ini` içindeki `default_envs` değerini `pro_micro` olarak değiştirebilir veya doğrudan şu komutla build/upload yapabilirsiniz:

  - Derleme (leonardo env ile):

```bash
platformio run -e leonardo
```

  - Derleme (pro_micro env ile):

```bash
platformio run -e pro_micro
```

  - Yükleme:

```bash
platformio run -e leonardo -t upload
# veya
platformio run -e pro_micro -t upload
```

- Arduino IDE kullanıyorsanız: `RubberOtter.ino` dosyasını açıp hedef kartı (Pro Micro / Leonardo) seçin. USB HID (Keyboard) özellikleri için kartın ATmega32U4 tabanlı olması gerekir.

Özet
- Rubber Otter: BLE (HM-10) üzerinden gelen komutları USB HID (Keyboard + optionally Consumer) olarak gönderir.
- Donanım: Arduino Pro Micro veya Leonardo (ATmega32U4), HM-10 (BLE), vibrasyon motoru sürücüsü (MOSFET).

Hızlı başlangıç
1. `RubberOtter.ino` dosyasını Arduino IDE veya PlatformIO ile açın.
2. Gerekli kütüphaneler:
   - `Keyboard` (Arduino çekirdeği ile gelir)
   - (Opsiyonel) `HID-Project` — multimedia tuşları için (kurulum Arduino Library Manager üzerinden)

Bağlantı notları (kritik)
- HM-10 VCC -> 3.3V (eşik: HM-10 3.3V ile çalışır). HM-10'e kesinlikle 5V vermeyin.
- HM-10 GND -> Pro Micro GND
- HM-10 TX -> Pro Micro RX (Serial1 RX pin) — eğer `USE_SOFTSERIAL` kullanıyorsanız sketch'teki pinleri kullanın (ör. 8)
- HM-10 RX <- Pro Micro TX (SERIAL TX). Eğer Pro Micro 5V ise HM-10 RX'e sinyal gönderirken seviye dönüştürücü veya direnç bölücü kullanın.
- Vibrasyon motoru -> MOSFET (ör. N‑channel) -> VIB_PIN (varsayılan pin 2). MCU pininden motor akımı çekmeyin; MOSFET kullanın. Motor için geri akım/süpürme diyotu veya TVS önerilir.

Derleme seçenekleri (compile flags)
- `USE_SOFTSERIAL` — HM-10 için SoftwareSerial kullanır (varsayılan: `Serial1` önerilir).
- `USE_HID_PROJECT` — multimedia/consumer tuşlarını etkinleştirir (HID-Project kütüphanesi gerekir).
- `USE_USB_DEBUG` — USB CDC (Serial) üzerinden çerçeveli paketleri kabul eder; masaüstü testleri için faydalıdır.

Protokol (host <-> device)
- Paket çerçevesi:
  - STX (0x02)
  - VERSION (0x01)
  - SEQ (1 byte)
  - LEN (2 byte, big-endian)
  - PAYLOAD (ASCII komut dizisi)
  - CHECKSUM (payload byte'larının XOR'u)
  - ETX (0x03)
- Cihazdan ACK: STX, VERSION, SEQ, STATUS (1=OK, 0=ERR), CODE, ETX
- BLE MTU sınırı nedeniyle host, tam çerçeveyi MTU uyumlu parçalara bölmelidir (tipik güvenli veri boyutu 20 byte). Cihaz iç ring buffer ile birleştirir.

Desteklenen komut örnekleri
- type "Hello\n"        — Girilen metni yazdırır (basit escape: \n, \t, \")
- delay 200              — 200 ms bekler
- enter / tab / backspace
- press shift 50         — modifier'ı 50ms boyunca basılı tutar (shift, ctrl, alt, gui)
- hold ctrl / release ctrl
- vibrate 100            — Vibrasyon motorunu 100 ms çalıştırır
- media play_pause       — Multimedia tuşları (HID-Project ile)
- macro define m0 { type "hi" && enter } — m0 slotuna makro kaydeder
- macro run m0           — m0 makrosunu çalıştırır

Zincirleme ve gruplama
- Komutlar `&&` veya `;` ile zincirlenebilir: örn. `type "notepad" && enter && delay 200 && type "hi"`

Yardım sistemi
- `help` veya `?` — tüm komut listesini gösterir (hem USB hem BLE üzerinden gönderilir)
- `help <command>` — örn. `help type` ile o komutun ayrıntılı kullanımını alabilirsiniz

EEPROM ve makrolar
- Küçük sabit sayıda makro slotu (ör. m0..m5) EEPROM'a kaydedilir. Slot başına sınır vardır (ör. 256 byte). EEPROM yazma sınırlamalarına dikkat edin.

Test (USB üzerinden hızlı testi):
1. `RubberOtter.ino` içinde `USE_USB_DEBUG` define edin ve cihazı yükleyin.
2. Sisteminizde Python ve `pyserial` varsa `send_packet.py` script'i ile paket gönderebilirsiniz.

Örnek kullanım:
```bash
pip3 install pyserial
python3 send_packet.py /dev/tty.usbmodemXXXX 'type "Hello from PC" && enter'
```
Not: `send_packet.py` ACK bekler; eğer ACK gelmezse cihaz tarafında paketin alınamadığı/işlenemediği anlamına gelir.

Güvenlik ve dayanıklılık
- Host tarafında ACK/timeout/retry mekanizması kullanın.
- Uzun metinler ve sık EEPROM yazma işlemlerinden kaçının (aşınma).
- HM-10 ile iletişimde 3.3V-5V seviye farklılıklarını düzeltin.

.gitignore
- Proje köküne bir `.gitignore` eklendi (IDE, platformio, derleme artefaktları, node_modules vb. hariç tutuldu).

Dosyalar
- `RubberOtter.ino` — ana sketch (comms, parser, executor, EEPROM makroları)
- `send_packet.py` — USB seri üzerinden test aracı
- `.gitignore` — repoda tutulmaması gereken dosyalar

İleri adımlar / öneriler
- Host (Electron/TypeScript) tarafında MTU chunking + ACK/retry örneğini ekleyebilirim.
- BLE üzerinde satır satır help göndermeyi MTU’ya uygun paketlere bölmek isterseniz, `sendHelp()` fonksiyonunu buna göre güncelleyebilirim.

Sorunuz veya eklemek istediğiniz başka bilgiler varsa söyleyin; README'i buna göre güncellerim.
