// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import {
  workspace,
  window,
  ExtensionContext,
  StatusBarItem,
  StatusBarAlignment,
  Range,
  Position,
  TextDocument,
} from "vscode";
import { getDecorationTypeFromConfig } from "./util";

let config = workspace.getConfiguration("maxLine");
let maxLines = config.get("max") as number;
let myStatusBarItem: StatusBarItem;
let decorationType = getDecorationTypeFromConfig();
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("== 插件初始化 ==");
  let { subscriptions } = context;
  // console.log("查看下配置啊", maxLines);
  // Marked: create a statusBarItem
  myStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);

  subscriptions.push(myStatusBarItem);

  // Marked: register events.

  subscriptions.push(
    workspace.onDidSaveTextDocument((doc: TextDocument) => {
      execute(doc.languageId);
    })
  );

  subscriptions.push(
    workspace.onDidOpenTextDocument((doc: TextDocument) => {
      console.log("== 打开新文件 ==");
      execute();
    })
  );

  // register some listener that make sure the status bar
  // item always up-to-date
  subscriptions.push(
    window.onDidChangeActiveTextEditor(() => {
      console.log("== 切换激活编辑窗口 ==");

      execute();
    })
  );

  subscriptions.push(
    workspace.onDidChangeTextDocument(() => {
      console.log(" == 文件修改 ==");
      execute();
    })
  );

  subscriptions.push(
    workspace.onDidChangeConfiguration(() => {
      // TODO: 获取全部的配置
      config = workspace.getConfiguration("maxLine");
      maxLines = config.get("max") as number;
      console.log("== 修改配置 ==");
      execute();
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}

function execute(languageId?: string) {
  const language =
    languageId ?? (window.activeTextEditor?.document.languageId as string); // TODO: 这里vscode 刚启动还没有激活编辑文件时，activeTextEditor 是 undefined

  console.log("文件类型", language);
  if (!(config.get("language") as string[]).includes(language)) {
    myStatusBarItem.hide();
    decorationType.dispose();
  } else {
    // update status bar item once at start
    updateStatusBarItem();
    updateDecorations();
  }
}

function updateDecorations() {
  const n = window.activeTextEditor?.document.lineCount;
  console.log("代码行数:", maxLines, n);
  decorationType.dispose();
  if (n && n > maxLines) {
    decorationType = getDecorationTypeFromConfig();
    const maxLinesPosition = new Position(maxLines - 1, 0);
    const newDecoration = {
      range: new Range(maxLinesPosition, maxLinesPosition),
    };
    window.visibleTextEditors.forEach((editor) => {
      editor.setDecorations(decorationType, [newDecoration]);
    });
  }
}

function updateStatusBarItem(): void {
  const n = window.activeTextEditor?.document.lineCount;
  if (n && n > maxLines) {
    myStatusBarItem.text = `$(warning) Lines: ${n}`;
    myStatusBarItem.color = "#e28085";
    myStatusBarItem.show();
  } else if (n && n <= maxLines) {
    myStatusBarItem.text = `Lines: ${n}`;
    myStatusBarItem.color = undefined; // 清除自定义颜色，undefined 使用主题配色
    myStatusBarItem.show();
  } else {
    myStatusBarItem.hide();
  }
}
