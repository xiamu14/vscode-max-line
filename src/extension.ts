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
let language = window.activeTextEditor?.document.languageId as string; // TODO: 这里vscode 刚启动还没有激活编辑文件时，activeTextEditor 是 undefined
console.log('这里不一定？？', window.activeTextEditor)
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("检查插件是否已启动");
  let { subscriptions } = context;
  // console.log("查看下配置啊", maxLines);
  // Marked: create a statusBarItem
  myStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
console.log('这里不一定？？', window.activeTextEditor)

  subscriptions.push(myStatusBarItem);

  subscriptions.push(
    workspace.onDidSaveTextDocument((doc: TextDocument) => {
      if (doc.languageId !== language) {
        language = doc.languageId;
        execute(subscriptions, "changeLanguage");
      }
    })
  );

  subscriptions.push(
    workspace.onDidOpenTextDocument(() => {
      console.log('检查看看啊,onDidOpenTextDocument');
      if (!language) {
        language = window.activeTextEditor?.document.languageId as string;
      }
      updateStatusBarItem();
      updateDecorations();
    })
  )

  execute(subscriptions, "init");
}

// this method is called when your extension is deactivated
export function deactivate() {}

function execute(subscriptions: any, tag: "init" | "changeLanguage") {
  console.log("检查文件类型", language);
  if (!(config.get("language") as string[]).includes(language)) {
    if (tag === "changeLanguage") {
      myStatusBarItem.hide();
      decorationType.dispose();
    }
  } else {
    // update status bar item once at start
    updateStatusBarItem();
    updateDecorations();

    // register some listener that make sure the status bar
    // item always up-to-date
    subscriptions.push(
      window.onDidChangeActiveTextEditor(() => {
console.log('这里不一定？？', window.activeTextEditor)

        updateStatusBarItem();
        updateDecorations();
      })
    );

    // Marked: check the lines of file when will save the file
    subscriptions.push(
      workspace.onDidChangeTextDocument(() => {
        updateStatusBarItem();
        updateDecorations();
      })
    );
    
    subscriptions.push(
      workspace.onDidChangeConfiguration(() => {
        config = workspace.getConfiguration("maxLine");
        maxLines = config.get("max") as number;
        updateStatusBarItem();
        updateDecorations();
      })
    );
  }
}

function updateDecorations() {
  const n = window.activeTextEditor?.document.lineCount;
  console.log("查看下代码行数", maxLines, n);
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
    myStatusBarItem.text = `$(warning) Exceeds the maximum limit of ${maxLines} lines`;
    myStatusBarItem.color = "#e28085";
    myStatusBarItem.show();
    // console.log('奇怪，这里怎么不显示了', myStatusBarItem)
  } else if (n && n <= maxLines) {
    myStatusBarItem.text = `Lines: ${n}`;
    myStatusBarItem.color = undefined;
    myStatusBarItem.show();
    console.log('奇怪，这里怎么不显示了', myStatusBarItem);
  } else {
    myStatusBarItem.hide();
  }
}
