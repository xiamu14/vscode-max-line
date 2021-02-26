# vscode-max-line
限制文件代码行数，默认最大不能超过 180 行。

可以根据编程语言配置文件最大行数。

## 参数

- maxline.language: string[]

- maxline.max： number

- maxline.borderColor: string

## 计划

*0.0.4*
[x] 显示文件实际总行数

    当文件行数未超过最大限制行数时显示当前总行数
    当文件行数超过最大限制行数，显示提示信息

*0.0.5*
[x] 修复文件切换时状态栏字体颜色


*0.0.6*
[] 修复 .md 的判断错误的问题
[] 修复文件关闭后状态栏没有消失的问题

## 开发

1. 修改插件 src 目录的代码
2. 以无插件模式重新加载 vscode（command + shift + p 快捷键打开指令,选择“developer:reload with extensions disabled”）
3. 启动调试模式 (菜单栏： run -> start debugging)
4. 选择底部状态栏的 “Run extension（vscode-max-line）”，在弹出的指令中选择“Run extension”
5. 在弹出的新界面里已加载了本地开发中的 vscode-max-line 插件

## 发布
1. 在命令行界面运行“vsce package”，生成新的 .vsix 插件压缩文件[注意压缩文件命名里的版本号和 package.json 的 version 属性一致，在构建新包前要修改 package.json 的 version 值]
2. 在 [marketplace](https://marketplace.visualstudio.com/manage/publishers/ben14?noPrompt=true) publisher 列表中的 "ben14" 中选择 'update'(... 菜单)
3. 上传新的 .vsix 以后，等待 marketplace 自动更新。