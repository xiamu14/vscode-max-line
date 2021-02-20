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
let maxLines = config.get('max') as number;
let myStatusBarItem: StatusBarItem;
let decorationType = getDecorationTypeFromConfig();
let language = window.activeTextEditor?.document.languageId as string;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  let { subscriptions } = context;
  // console.log("查看下配置啊", maxLines);
  // Marked: create a statusBarItem
  myStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);
  subscriptions.push(myStatusBarItem);

  subscriptions.push(
    workspace.onDidSaveTextDocument((doc: TextDocument) => {
      if (doc.languageId !== language) {
        language = doc.languageId;
        execute(subscriptions, "changeLanguage");
      }
    })
  );

  execute(subscriptions, "init");
}

// this method is called when your extension is deactivated
export function deactivate() {}

function execute(subscriptions: any, tag: "init" | "changeLanguage") {
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
 maxLines = config.get('max') as number;
        updateStatusBarItem();
        updateDecorations();
      })
    );
  }
}

function updateDecorations() {
  const n = window.activeTextEditor?.document.lineCount;
  // console.log('查看下代码行数', maxLines, n);
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
  } else {
    myStatusBarItem.hide();
  }
}
