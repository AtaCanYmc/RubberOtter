# Changelog

## [1.4.0](https://github.com/AtaCanYmc/RubberOtter/compare/rubber-otter-v1.3.0...rubber-otter-v1.4.0) (2026-11-22)


### Features

* add robots.txt, sitemap.xml, and llms.txt for improved SEO and documentation ([5bc8471](https://github.com/AtaCanYmc/RubberOtter/commit/5bc84711a9eaad7a98fc9732a649ce47a65b2dff))
* add Scanner and Text panels for enhanced BLE device interaction ([17c9d42](https://github.com/AtaCanYmc/RubberOtter/commit/17c9d42b2d5a75cb50e5d664bca8616dec9d343d))
* add target OS selection and update Bluetooth settings interface ([d750966](https://github.com/AtaCanYmc/RubberOtter/commit/d7509661845bb4da1fb002919c2567e4bda4375a))
* add vibration haptic trigger and update BLE device scanning interface ([e16ecb9](https://github.com/AtaCanYmc/RubberOtter/commit/e16ecb98456ce57105d8401f228b81820b0eb559))
* **brand:** add custom vector Rubber Otter logo and favicon SVG ([0757cc0](https://github.com/AtaCanYmc/RubberOtter/commit/0757cc0363df6fe8012f02c75b133118eed29a86))
* **capacitor:** integrate Ionic Capacitor with native iOS and Android packaging, CoreBluetooth and Haptics bridge ([4f2d65e](https://github.com/AtaCanYmc/RubberOtter/commit/4f2d65eb3df8aaca1add3c14b8073fa6817e92ea))
* **ci:** add GitHub Actions workflow for Node.js setup and dependency installation ([5929ec1](https://github.com/AtaCanYmc/RubberOtter/commit/5929ec13731c56d1f99d4bc162ff615828d0141a))
* **cli:** add unified Rubber Otter CLI tool, unit tests, and reference docs ([412956d](https://github.com/AtaCanYmc/RubberOtter/commit/412956df0e681b2e83e1f211b95cf5203c3d9ff6))
* enhance SecurityPanel with jiggler toggle and test pulse functionality ([deec0d5](https://github.com/AtaCanYmc/RubberOtter/commit/deec0d5258d1e92266b1e4edb1f0e34ed6e89393))
* enhance user interface with new controls for BLE name configuration, mouse actions, and macro management ([1afddde](https://github.com/AtaCanYmc/RubberOtter/commit/1afddde872845f10de2e94c72bcf4a9df60884cf))
* **favicon:** install RealFaviconGenerator icons and webmanifest ([c839bb5](https://github.com/AtaCanYmc/RubberOtter/commit/c839bb53ae8a038d471cf71d28bbb60686a61fec))
* **header:** embed desktop navigation tabs directly into header ([bcb1dfa](https://github.com/AtaCanYmc/RubberOtter/commit/bcb1dfae8f9162c0d0fc24443a8fa4c32f2c7413))
* **header:** move connect button from header into BLE scanner card in settings ([c2c2115](https://github.com/AtaCanYmc/RubberOtter/commit/c2c211517263ffd374cb4cda390081916042e439))
* **i18n:** add English, Turkish, German, French, and Spanish localization support ([20ec14c](https://github.com/AtaCanYmc/RubberOtter/commit/20ec14c04f1d92d8a3222db43fe9e0a6861d17e8))
* implement BLE support and enhance device connection handling in RubberOtter ([e338959](https://github.com/AtaCanYmc/RubberOtter/commit/e338959a1d788d892607d62fcef125a6b436ffc6))
* initial commit of RubberOtterPy package, Python SDK, CLI, Web Dashboard, and test suite ([78d758d](https://github.com/AtaCanYmc/RubberOtter/commit/78d758d231accb71fef5ccfd27440393812cf404))
* **mcp:** add Model Context Protocol server, AI agent tool registry, and CLI integration ([3009d7f](https://github.com/AtaCanYmc/RubberOtter/commit/3009d7ffadf39e1c18a16b884fb9619bf8a57bf1))
* **protocol:** add support for framed ASCII protocol and update settings ([798ea1b](https://github.com/AtaCanYmc/RubberOtter/commit/798ea1bfb80278ce9d98c983875bea44fd5291ac))
* **python:** import RubberOtterPy repository as python package ([c8dac0e](https://github.com/AtaCanYmc/RubberOtter/commit/c8dac0ece105bdb6699705d35235fb32407b8fa1))
* remove deprecated 'ffe0' service UUID from BLE connection settings ([6c4db2f](https://github.com/AtaCanYmc/RubberOtter/commit/6c4db2f4cb7b827e5edb1d7d6f06277e364ff8e5))
* **settings:** add dark mode, light mode, and system theme switcher ([d48dc71](https://github.com/AtaCanYmc/RubberOtter/commit/d48dc71e0e94c832712a4b7b7b54b8275cc2e7ae))
* **settings:** move BLE device scanner into settings panel and streamline navbar ([9876432](https://github.com/AtaCanYmc/RubberOtter/commit/98764326585091d8b9a5ce6e4a26058e46fab6ee))
* **web:** add desktop-exclusive hardware flasher tab with Web Serial API support ([3460bbd](https://github.com/AtaCanYmc/RubberOtter/commit/3460bbdbcec016abb83687cb69e951b02b84fa0e))
* **web:** complete redesign with Hallmark Dark Precision instrument theme and full responsive layout ([7ba23da](https://github.com/AtaCanYmc/RubberOtter/commit/7ba23dac09ea64ef7bbf14f6de66f0742281366a))
* **web:** import RubberOtterWeb repository as web package ([d1efe63](https://github.com/AtaCanYmc/RubberOtter/commit/d1efe630a0d974a5bcb203bd5f9ff7594e68fdeb))


### Bug Fixes

* **ble:** guard iOS simulator BLE unsupported state and prevent CBCentralManager API MISUSE ([78501ca](https://github.com/AtaCanYmc/RubberOtter/commit/78501ca8cfa225fca198b198844d05824e856847))
* **ble:** resolve iOS Web Bluetooth compatibility with native CoreBluetooth fallback & Bluefy browser assistant ([254faea](https://github.com/AtaCanYmc/RubberOtter/commit/254faeac40524d60bea7ba71fd49acf8e1b23d4d))
* **ci:** update project.license to syntax compliant with older PEP 621 setuptools schema ([a475265](https://github.com/AtaCanYmc/RubberOtter/commit/a4752650032abe48b93b608ae0b253d7520c0b26))
* **contrast:** resolve white-on-white active selection and icon contrast in dark mode ([5922a3f](https://github.com/AtaCanYmc/RubberOtter/commit/5922a3f4eb9b50d211bf54a3dd62f9b78b0230f5))
* **deps:** add Mouse library dependency to platformio.ini ([7182cad](https://github.com/AtaCanYmc/RubberOtter/commit/7182cad7e5764e7b107dbeb50f6ab9ea69e9bc19))
* **firmware:** enable USB Serial input processing and dual-ACK transmission ([a01c2d5](https://github.com/AtaCanYmc/RubberOtter/commit/a01c2d557974c97e40a2ee0ecbfd8fd51c43af35))
* **make:** add automatic venv provisioning and PEP 668 safe python dependency management ([5ccf110](https://github.com/AtaCanYmc/RubberOtter/commit/5ccf110722cdf296d10b56d54215ff802dcfec3b))
* **parser:** enable USB Serial polling in src/PacketParser.cpp and add CDC open delay in send_packet.py ([cfd4df6](https://github.com/AtaCanYmc/RubberOtter/commit/cfd4df68dcd0158c580a88ecd7b959beb8a46e9b))
* resolve code scanning alerts [#1](https://github.com/AtaCanYmc/RubberOtter/issues/1)-[#8](https://github.com/AtaCanYmc/RubberOtter/issues/8) in web APIs and text escaping ([3544809](https://github.com/AtaCanYmc/RubberOtter/commit/3544809e46ff81b127a8f77b7ce302dc33d31cd5))
* **scanner:** add SparkFun Pro Micro VID 1b4f:9206, BT05 match, and BLE deduplication ([3c6028c](https://github.com/AtaCanYmc/RubberOtter/commit/3c6028c9d28f99e1c9d4b7bf2427a49fd6331205))
* **security:** resolve CodeQL alerts for exception exposure and workflow permissions ([ac339f1](https://github.com/AtaCanYmc/RubberOtter/commit/ac339f1367c641f014e9f6b5c3d2c864690a8676))
* **theme:** resolve iOS dark mode specificity, safe area background bounce, and WebKit form styles ([ad7898a](https://github.com/AtaCanYmc/RubberOtter/commit/ad7898a199442ffc5ee3db8ae18dbed702f82e7e))
* **ui:** enhance dark mode logo visibility and icon contrast across panels ([d0409bb](https://github.com/AtaCanYmc/RubberOtter/commit/d0409bb1300d70ca600f5606daaf75884bd68082))


### Code Refactoring

* **firmware:** move firmware files into firmware/ directory ([ca968a5](https://github.com/AtaCanYmc/RubberOtter/commit/ca968a57dc1410a06d18441ff69652a1790cb163))
* **header:** remove theme toggle button from header ([9b2fef4](https://github.com/AtaCanYmc/RubberOtter/commit/9b2fef4a9170ab038b2fcf8919c64ae882b118f1))
* **monorepo:** separate web, ios, and android directories with dedicated build outputs ([65ee67f](https://github.com/AtaCanYmc/RubberOtter/commit/65ee67f68a862c0e5af4bd63c888a1a65819e2c5))
* update jiggler functionality and enhance command handling ([3ec0aaa](https://github.com/AtaCanYmc/RubberOtter/commit/3ec0aaaa20932ada350938d7a02d862df4527dd8))
* **web:** move hardware flasher access to settings and remove from header ([4bab30d](https://github.com/AtaCanYmc/RubberOtter/commit/4bab30d2b63b009a2e4a2a0be8750994f7fcad9a))


### Documentation

* add CI/CD pipeline overview to README.md ([13ee6a5](https://github.com/AtaCanYmc/RubberOtter/commit/13ee6a554c4c84ac24d8b9550e278a8d1115755a))
* add Code of Conduct, Contributing guidelines, License, README, and Security Policy ([d25619e](https://github.com/AtaCanYmc/RubberOtter/commit/d25619ef0797755290574c8b0520108041e70828))
* add comprehensive CAPABILITIES_AND_COMMANDS reference guide and update all SDK, CLI, Web App docs ([1af0665](https://github.com/AtaCanYmc/RubberOtter/commit/1af0665cccf8248b8bf02dbd26680f918e628efd))
* add comprehensive COMMANDS_AND_CAPABILITIES guide and link in README ([adc340e](https://github.com/AtaCanYmc/RubberOtter/commit/adc340e53b533f30e71db33730ab622adf6c9954))
* add comprehensive documentation for helper scripts and device scanner ([48398a4](https://github.com/AtaCanYmc/RubberOtter/commit/48398a4cc0e98646bfc0275077f313760d24c587))
* add PyPI badge to README ([57d55db](https://github.com/AtaCanYmc/RubberOtter/commit/57d55db848da6e252f3d3d676772f4199a748838))
* **assets:** add custom cyberpunk AI banners to all READMEs ([3f6e039](https://github.com/AtaCanYmc/RubberOtter/commit/3f6e039e868f13348246e4f8d2a8e524ea559d54))
* **governance:** professionalize repository documentation with well-document ([fa616fa](https://github.com/AtaCanYmc/RubberOtter/commit/fa616fa1cf9b330d4e649fa9d2ab83376576aaff))
* **readme:** add zero-install Web Flasher guide and architecture mapping ([157ef73](https://github.com/AtaCanYmc/RubberOtter/commit/157ef739d3acddcbb65601660aefefb39fb35440))
* update hardware wiring diagram and pin layout table for SoftwareSerial (Pin 8/9) ([594998a](https://github.com/AtaCanYmc/RubberOtter/commit/594998a1fee3d6d11955354e4997bd96c5c243b7))
* update logo in README and change banner to logo format ([e2b60f5](https://github.com/AtaCanYmc/RubberOtter/commit/e2b60f5fafc634b120ea2a2f0123896bfb177d66))
* update README with CI/CD release workflow details ([cf424a8](https://github.com/AtaCanYmc/RubberOtter/commit/cf424a882d1b3782aefe4cbb89c0af5d89356c0a))
* update README with mermaid diagrams for control flow and hardware wiring ([2131d55](https://github.com/AtaCanYmc/RubberOtter/commit/2131d55054a0b4a9c4ed6bc84b993a614aed17a9))
* update root and web READMEs with Capacitor native packaging and precision workstation features ([f3a54ad](https://github.com/AtaCanYmc/RubberOtter/commit/f3a54ada41f951320c361a10925e86a96bd9266b))
