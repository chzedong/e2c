# e2c 中英文互译命令行工具

[![npm version](https://badge.fury.io/js/ch-e2c.svg)](https://badge.fury.io/js/ch-e2c)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

一个简单易用的中英文互译命令行工具，支持快速查询单词和短语的翻译。

## 特性

- 🚀 快速翻译：支持中文到英文、英文到中文的双向翻译
- 📱 智能识别：自动识别输入语言类型
- 🎨 美观输出：使用彩色文字和加载动画提升用户体验
- 💻 全局安装：安装后可在任意目录使用

## 安装

使用 npm 全局安装：

```bash
npm install ch-e2c -g
```

## 使用方法

### 基本用法

```bash
# 直接输入要翻译的内容（自动识别语言）
e2c hello
e2c 你好

# 使用参数指定翻译方向
e2c -e "hello world"     # 英文翻译为中文
e2c -c "你好世界"        # 中文翻译为英文
```

### 命令选项

| 选项 | 描述 | 示例 |
|------|------|------|
| `-e, --english <text>` | 翻译英文到中文 | `e2c -e "apple"` |
| `-c, --chinese <text>` | 翻译中文到英文 | `e2c -c "苹果"` |
| `-h, --help` | 显示帮助信息 | `e2c -h` |
| `-V, --version` | 显示版本信息 | `e2c -V` |

### 使用示例

```bash
# 翻译英文单词
$ e2c apple
中文翻译：苹果

# 翻译中文词汇
$ e2c 苹果
英文翻译：
apple
Apple Inc.

# 使用参数形式
$ e2c -e "computer"
中文翻译：计算机；电脑

$ e2c -c "计算机"
英文翻译：
computer
calculator
```

## 技术栈

- [Node.js](https://nodejs.org/) - 运行环境
- [Commander.js](https://github.com/tj/commander.js/) - 命令行参数解析
- [Axios](https://github.com/axios/axios) - HTTP 请求库
- [Cheerio](https://github.com/cheeriojs/cheerio) - 服务端 jQuery 实现
- [Chalk](https://github.com/chalk/chalk) - 终端字符串样式
- [Ora](https://github.com/sindresorhus/ora) - 优雅的终端加载动画

## 开发

```bash
# 克隆项目
git clone https://github.com/chenzedong5/e2z.git
cd e2z

# 安装依赖
npm install

# 本地测试
node index.js hello
```

## 许可证

[ISC](LICENSE)

## 作者

**chenzedong** - [chzedong@foxmail.com](mailto:chzedong@foxmail.com)

## 贡献

欢迎提交 Issue 和 Pull Request！

---

如果这个工具对你有帮助，请给个 ⭐️ 支持一下！

  

  



