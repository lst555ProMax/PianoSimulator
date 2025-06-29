# 钢琴模拟器 (Piano Simulator)


一个功能丰富、界面美观的桌面虚拟钢琴应用。它不仅提供了逼真的钢琴键布局和音效，还内置了多种自定义选项，让您无论是练习、创作还是娱乐，都能获得绝佳的体验。

---

## ✨ 功能亮点 (Features)

### 🎹 核心演奏功能
*   **多模式输入**: 支持 **鼠标点击** 和 **物理键盘** 两种方式进行演奏，无缝切换。
*   **宽广音域**: 覆盖从 C2 到 C7 的完整88键音域，满足专业演奏需求。
*   **逼真布局**: 精确计算并模拟了真实钢琴的黑白键布局和尺寸比例。

### 🎵 MIDI支持 (V1.1.0新增)
*   **MIDI文件播放**: 支持导入和播放标准MIDI文件(.mid/.midi格式)。
*   **智能解析**: 内置MIDI解析器，兼容多种MIDI文件格式和编码。
*   **播放控制**: 完整的播放/暂停/停止控制，支持断点续播。
*   **实时速度调节**: 播放过程中可实时调整速度(0.5x-2.0x)，立即生效。
*   **节奏准确**: 正确解析MIDI时间信息，保持原始节奏和速度变化。
### 🎨 视觉效果
*   **多彩按键**: 每次按下琴键，都会以随机的鲜艳颜色高亮，并有平滑的渐变消失效果。
*   **音符飘落动画**: 伴随着琴键的按下，会有对应颜色的音符符号 `♪` 从琴键上方优雅地飘出，增强了演奏的沉浸感。
*   **可调节键盘尺寸**: 支持0.5x-2.0x的键盘缩放，适应不同屏幕尺寸。
### ⚙️ 高度可定制化
*   **琴键效果**: 您可以自由选择 `颜色+动画`、`只有颜色` 或 `默认` 三种按键效果。
*   **音高显示**: 提供 `完整音高` (如 C4)、`只显示音名` (如 C) 和 `不显示` 三种模式。
*   **音量调节**: 通过滑动条实时调整全局音量，支持智能音量平衡。
*   **滚动灵敏度**: 自定义鼠标滚轮在钢琴上的水平滚动速度。
*   **键盘映射显示**: 可选择显示或隐藏物理键盘映射提示。
### 🔧 技术优化
*   **智能快捷键**: 预设了合理的键盘快捷键映射，支持 `Shift` 组合键，让双手演奏成为可能。
*   **持久化设置**: 您的所有自定义设置都会自动保存在本地，下次打开时无需重新配置。
*   **音频优化**: 智能音量调节防止多音符同时播放时的杂音，优化音频实例管理。
*   **流畅体验**: 使用 `Howler.js` 进行音频管理，确保低延迟和高性能的声音播放。

## 🛠️ 技术栈 (Technology Stack)

*   **前端**: HTML5, CSS3, JavaScript (ES6+)
*   **音频库**: [Howler.js](https://howlerjs.com/) - 用于高效、跨平台的音频播放。
*   **运行环境**: 本项目设计为在 [uTools](https://u.tools/) 或类似的基于 Electron 的桌面应用环境中作为插件运行，利用 `preload.js` 与主进程进行通信（例如加载本地音频文件）。

## 🚀 如何开始 (Getting Started)

### 1. 作为 uTools 插件运行 (推荐)

本项目是为 uTools 插件生态系统量身定做的。

1.  将整个 `PianoSimulator` 文件夹打包成一个 `.zip` 文件。
2.  将 `.zip` 后缀名修改为 `.upx`。
3.  打开 uTools，进入开发者工具，选择“离线安装”，然后选中您刚刚创建的 `.upx` 文件即可。

### 2. 在浏览器中本地测试

虽然项目为桌面插件设计，但您也可以在现代浏览器中进行本地测试。

1.  克隆或下载此仓库。
2.  由于安全策略（CORS），浏览器无法直接加载本地音频文件。您需要一个本地服务器来运行项目。
    *   **方法一：使用 VS Code 的 Live Server 插件**
        *   在 VS Code 中打开项目文件夹。
        *   右键点击 `index.html` 文件，选择 `Open with Live Server`。
    *   **方法二：使用 Python 的简易服务器**
        *   在项目根目录下打开终端。
        *   运行命令：`python -m http.server` (Python 3) 或 `python -m SimpleHTTPServer` (Python 2)。
        *   在浏览器中访问 `http://localhost:8000`。

> **注意**: 在浏览器中测试时，`preload.js` 的功能将不可用，可能需要修改代码以适应纯浏览器环境（例如，将音频文件路径直接写在 `index.html` 中）。

## 📁 项目结构 (Project Structure)

```
PianoSimulator/
├── index.html            # 主页面，包含所有 HTML, CSS 和 JavaScript 代码
├── logo.png              # 应用 Logo
├── node_modules/         # 项目依赖
│   └── howler/           # Howler.js 音频库
├── package.json          # 项目元数据和依赖信息
├── package-lock.json     # 锁定依赖版本
├── plugin.json           # uTools 插件配置文件
├── preload.js            # uTools 预加载脚本，用于桥接主进程和渲染进程
└── samples/              # 音频资源
    └── piano/            # 存放所有钢琴音源文件 (.mp3)
```

## 📝 代码说明 (Code Insights)

*   **`generatePianoKeys()`**: 这是钢琴渲染的核心函数。它采用两遍式渲染：
    1.  **第一遍**: 渲染所有白键，并记录下它们的位置信息。
    2.  **第二遍**: 根据白键的位置信息，精确地计算并渲染黑键，确保布局的真实性。
*   **`createFlyingNote()`**: 当启用动画效果时，此函数负责在被按下的琴键上方创建一个 `♪` 元素。它会获取琴键的颜色和位置，并使用 CSS 关键帧动画 (`@keyframes fly-up`) 实现音符向上飘散并淡出的效果。
*   **事件处理**: 项目对鼠标 (`mousedown`, `mouseup`) 和键盘 (`keydown`, `keyup`) 事件进行了精细的处理，包括防止长按重复触发、处理 `Shift` 组合键，以及在鼠标移出琴键区域后松开也能正确取消激活状态。

## 📋 版本历史 (Version History)

### V1.1.0 (当前版本)
- ✅ 完整MIDI文件支持功能
- ✅ 实时播放速度调节(0.5x-2.0x)
- ✅ 音频播放质量优化，解决杂音问题
- ✅ 界面布局优化，MIDI控制移至左上角
- ✅ 统一图标设计风格

### V1.0.x 系列
- ✅ 基础钢琴演奏功能
- ✅ 多种视觉效果和自定义选项
- ✅ 键盘映射和尺寸调节
- ✅ 音量和滚动灵敏度控制

## 💡 未来计划 (Future Ideas)

*   [ ] 增加物理MIDI键盘支持
*   [ ] 实现MIDI录制和导出功能
*   [ ] 添加更多乐器音色选择（电钢、风琴、弦乐等）
*   [ ] 开发节拍器功能
*   [ ] 用户自定义键盘映射
*   [ ] 教学模式，高亮提示演奏音符

---

希望您喜欢这个项目！欢迎提出 Issue 或 Pull Request。