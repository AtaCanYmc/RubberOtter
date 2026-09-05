# Changelog

## [2.4.0](https://github.com/AtaCanYmc/RubberOtter/compare/web-v2.3.0...web-v2.4.0) (2026-09-05)


### Features

* **web:** add desktop-exclusive hardware flasher tab with Web Serial API support ([3460bbd](https://github.com/AtaCanYmc/RubberOtter/commit/3460bbdbcec016abb83687cb69e951b02b84fa0e))


### Code Refactoring

* **web:** move hardware flasher access to settings and remove from header ([4bab30d](https://github.com/AtaCanYmc/RubberOtter/commit/4bab30d2b63b009a2e4a2a0be8750994f7fcad9a))

## [2.3.0](https://github.com/AtaCanYmc/RubberOtter/compare/web-v2.2.0...web-v2.3.0) (2026-09-02)


### Features

* **capacitor:** integrate Ionic Capacitor with native iOS and Android packaging, CoreBluetooth and Haptics bridge ([4f2d65e](https://github.com/AtaCanYmc/RubberOtter/commit/4f2d65eb3df8aaca1add3c14b8073fa6817e92ea))


### Bug Fixes

* **ble:** guard iOS simulator BLE unsupported state and prevent CBCentralManager API MISUSE ([78501ca](https://github.com/AtaCanYmc/RubberOtter/commit/78501ca8cfa225fca198b198844d05824e856847))
* **ble:** resolve iOS Web Bluetooth compatibility with native CoreBluetooth fallback & Bluefy browser assistant ([254faea](https://github.com/AtaCanYmc/RubberOtter/commit/254faeac40524d60bea7ba71fd49acf8e1b23d4d))
* **theme:** resolve iOS dark mode specificity, safe area background bounce, and WebKit form styles ([ad7898a](https://github.com/AtaCanYmc/RubberOtter/commit/ad7898a199442ffc5ee3db8ae18dbed702f82e7e))


### Documentation

* update root and web READMEs with Capacitor native packaging and precision workstation features ([f3a54ad](https://github.com/AtaCanYmc/RubberOtter/commit/f3a54ada41f951320c361a10925e86a96bd9266b))

## [2.2.0](https://github.com/AtaCanYmc/RubberOtter/compare/web-v2.1.0...web-v2.2.0) (2026-09-02)


### Features

* **brand:** add custom vector Rubber Otter logo and favicon SVG ([0757cc0](https://github.com/AtaCanYmc/RubberOtter/commit/0757cc0363df6fe8012f02c75b133118eed29a86))
* **favicon:** install RealFaviconGenerator icons and webmanifest ([c839bb5](https://github.com/AtaCanYmc/RubberOtter/commit/c839bb53ae8a038d471cf71d28bbb60686a61fec))
* **header:** embed desktop navigation tabs directly into header ([bcb1dfa](https://github.com/AtaCanYmc/RubberOtter/commit/bcb1dfae8f9162c0d0fc24443a8fa4c32f2c7413))
* **header:** move connect button from header into BLE scanner card in settings ([c2c2115](https://github.com/AtaCanYmc/RubberOtter/commit/c2c211517263ffd374cb4cda390081916042e439))
* **i18n:** add English, Turkish, German, French, and Spanish localization support ([20ec14c](https://github.com/AtaCanYmc/RubberOtter/commit/20ec14c04f1d92d8a3222db43fe9e0a6861d17e8))
* **settings:** add dark mode, light mode, and system theme switcher ([d48dc71](https://github.com/AtaCanYmc/RubberOtter/commit/d48dc71e0e94c832712a4b7b7b54b8275cc2e7ae))
* **settings:** move BLE device scanner into settings panel and streamline navbar ([9876432](https://github.com/AtaCanYmc/RubberOtter/commit/98764326585091d8b9a5ce6e4a26058e46fab6ee))
* **web:** complete redesign with Hallmark Dark Precision instrument theme and full responsive layout ([7ba23da](https://github.com/AtaCanYmc/RubberOtter/commit/7ba23dac09ea64ef7bbf14f6de66f0742281366a))
* **web:** import RubberOtterWeb repository as web package ([d1efe63](https://github.com/AtaCanYmc/RubberOtter/commit/d1efe630a0d974a5bcb203bd5f9ff7594e68fdeb))


### Bug Fixes

* **contrast:** resolve white-on-white active selection and icon contrast in dark mode ([5922a3f](https://github.com/AtaCanYmc/RubberOtter/commit/5922a3f4eb9b50d211bf54a3dd62f9b78b0230f5))
* resolve code scanning alerts [#1](https://github.com/AtaCanYmc/RubberOtter/issues/1)-[#8](https://github.com/AtaCanYmc/RubberOtter/issues/8) in web APIs and text escaping ([3544809](https://github.com/AtaCanYmc/RubberOtter/commit/3544809e46ff81b127a8f77b7ce302dc33d31cd5))
* **ui:** enhance dark mode logo visibility and icon contrast across panels ([d0409bb](https://github.com/AtaCanYmc/RubberOtter/commit/d0409bb1300d70ca600f5606daaf75884bd68082))


### Code Refactoring

* **header:** remove theme toggle button from header ([9b2fef4](https://github.com/AtaCanYmc/RubberOtter/commit/9b2fef4a9170ab038b2fcf8919c64ae882b118f1))


### Documentation

* **assets:** add custom cyberpunk AI banners to all READMEs ([3f6e039](https://github.com/AtaCanYmc/RubberOtter/commit/3f6e039e868f13348246e4f8d2a8e524ea559d54))

## [2.1.0](https://github.com/AtaCanYmc/RubberOtterWeb/compare/rubber-otter-web-v2.0.0...rubber-otter-web-v2.1.0) (2026-08-19)


### Features

* add Scanner and Text panels for enhanced BLE device interaction ([17c9d42](https://github.com/AtaCanYmc/RubberOtterWeb/commit/17c9d42b2d5a75cb50e5d664bca8616dec9d343d))
* add target OS selection and update Bluetooth settings interface ([d750966](https://github.com/AtaCanYmc/RubberOtterWeb/commit/d7509661845bb4da1fb002919c2567e4bda4375a))
* add vibration haptic trigger and update BLE device scanning interface ([e16ecb9](https://github.com/AtaCanYmc/RubberOtterWeb/commit/e16ecb98456ce57105d8401f228b81820b0eb559))
* **ci:** add GitHub Actions workflow for Node.js setup and dependency installation ([5929ec1](https://github.com/AtaCanYmc/RubberOtterWeb/commit/5929ec13731c56d1f99d4bc162ff615828d0141a))
* enhance SecurityPanel with jiggler toggle and test pulse functionality ([deec0d5](https://github.com/AtaCanYmc/RubberOtterWeb/commit/deec0d5258d1e92266b1e4edb1f0e34ed6e89393))
* **protocol:** add support for framed ASCII protocol and update settings ([798ea1b](https://github.com/AtaCanYmc/RubberOtterWeb/commit/798ea1bfb80278ce9d98c983875bea44fd5291ac))
* remove deprecated 'ffe0' service UUID from BLE connection settings ([6c4db2f](https://github.com/AtaCanYmc/RubberOtterWeb/commit/6c4db2f4cb7b827e5edb1d7d6f06277e364ff8e5))
