import {workspace, window} from 'vscode';

//UTILITIES
export function getDecorationTypeFromConfig() {
  const config = workspace.getConfiguration("maxLine");
  const borderColor = (config.get("borderColor") as string) || 'red';
  const borderWidth = config.get("borderWidth") || '1px';
  const borderStyle = config.get("borderStyle") || 'solid';
  const decorationType = window.createTextEditorDecorationType({
      isWholeLine: true,
      borderWidth: `0 0 ${borderWidth} 0`,
      borderStyle: `${borderStyle}`, //TODO: file bug, this shouldn't throw a lint error.
      borderColor
  });
  return decorationType;
}
