# Go Test Tree Toggle

[![CI](https://github.com/Maylisten/go-test-tree-toggle/actions/workflows/ci.yml/badge.svg)](https://github.com/Maylisten/go-test-tree-toggle/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Maylisten/go-test-tree-toggle)](https://github.com/Maylisten/go-test-tree-toggle/releases/latest)
[![License](https://img.shields.io/github/license/Maylisten/go-test-tree-toggle)](LICENSE)

在 VS Code 的 Explorer（资源管理器）标题栏增加一个开关，用来隐藏或显示所有 `*_test.go` 文件。

## 特性

- 在原生 Explorer 标题栏提供闭眼/睁眼开关。
- 只管理当前工作区的 `files.exclude["**/*_test.go"]`。
- 保留其他 `files.exclude` 规则，并在关闭开关时恢复原值。
- 开关状态可跨 VS Code 窗口重启保持。
- 不删除、移动或修改任何 Go 文件。

## 使用方式

1. 从 [Releases](https://github.com/Maylisten/go-test-tree-toggle/releases/latest) 下载最新的 `.vsix`。
2. 在 Extensions 面板右上角点击 `...`，选择 `Install from VSIX...`。
3. 打开一个目录或工作区。
4. 在 Explorer 标题栏点击闭眼图标，隐藏 `*_test.go` 文件。
5. 点击睁眼图标，恢复显示。

也可以从命令面板运行：

- `Go Test Tree Toggle: Hide *_test.go Files`
- `Go Test Tree Toggle: Show *_test.go Files`

## 影响范围

- 插件只修改当前工作区的 `files.exclude["**/*_test.go"]`。
- 不修改全局设置，不删除或覆盖 `files.exclude` 中的其他规则。
- 关闭开关时，会恢复启用前该键是否存在以及原来的值。
- 文件只是不在 Explorer 中展示，不会被删除、改名，也不会影响 Go 测试命令和编译。

VS Code 目前没有“只过滤原生 Explorer”的公开扩展 API，因此必须使用官方的 `files.exclude` 设置。VS Code 中其他主动遵循 `files.exclude` 的界面（例如启用了排除规则的搜索）也可能不展示这些文件；关闭开关后会恢复。

也可以使用命令行安装下载好的 VSIX：

```bash
code --install-extension go-test-tree-toggle-v0.1.0.vsix
```

## 开发

```bash
npm install
npm test
npm run package
```

`npm run package` 会在项目目录生成版本化的 VSIX。CI 会对每次提交运行测试和打包，并把 VSIX 保存为 Actions artifact。

## 发布

发布前更新 `package.json` 和 `CHANGELOG.md` 中的版本，然后创建并推送同版本标签：

```bash
git tag -a v0.2.0 -m "v0.2.0"
git push origin v0.2.0
```

Release 工作流会校验标签与 `package.json` 版本一致，运行测试、打包 VSIX、生成 SHA-256 校验文件，并自动创建 GitHub Release。

## 参与贡献与安全问题

- 贡献方式见 [CONTRIBUTING.md](CONTRIBUTING.md)。
- 使用问题见 [SUPPORT.md](SUPPORT.md)。
- 安全问题请按 [SECURITY.md](SECURITY.md) 私下报告。

本项目采用 [MIT License](LICENSE)。
