## Features

-   Generate schema and model file in default location for any selected sql text.
-   Show selected lines and code in status bar for any language.
-   Debug current file or project in editor context menu or in editor title menu.
-   Show default opened document when there has no document opened in workspace, like README.md, CHANGELOG.md, etc.
-   Refactor function parameters to use object parameter.
-   Auto refactor type name of function options parameter when ts document saved.
-   Generate enum assertion functions.
-   Add typescript code refactor panel actions, you can use it to refactor function parameters or generate/update assert enum functions.
-   Introduce new git enhancement commands: skipWorkTree, noSkipWorkTree, and listFiles.
-   Add the new commands "Update Model" in context menu and in code action panel to update model file after you modified type declaration "TDefinitions" in opened file.

## Usage

To use this extension, follow these steps:

1. Install the extension.
2. Open a project or empty directory in Visual Studio Code.
3. If you open a file and selected some texts, you will see the text "Selected Lines: x, Code: x" in the status bar.
4. You can open "settings -> Sower Tools -> Sower-tools.Show Default Opened Document" to update the show default opened documents name or adjust the orders.
5. Open a .ts file and you will see the icons of commands **"Debug Current File"** and **"Debug Project"** in the right top corner of the editor (which will execute the debug command if you have wrote the debug configuration in the file "./.vscode/launch.json", you can also open "settings -> Sower Tools -> Sower-tools.Debug Enhancement" to append the customized debug configuration name), you can click them to execute the debug command.
6. Open a file in editor and right-click to open the context menu, you will see the options:
    - **Debug Current File** (which will execute the debug current file command if you have wrote the debug configuration in the file "./.vscode/launch.json", you can also open "settings -> Sower Tools -> Sower-tools.Debug Enhancement" to append the customized debug configuration name)
    - **Debug Project** (which will execute the debug project command if you have wrote the debug configuration in the file "./.vscode/launch.json", you can also open "settings -> Sower Tools -> Sower-tools.Debug Enhancement" to append the customized debug configuration name)
    - **Refactor Parameters Style** (which will refactor the function parameters to object style)
    - **Generate/Update Enum Assertion** (which will generate or update enum assertion functions if your cursor is on a enum type declaration)
    - **Update Model** (which will update the current file items if you remove, update or delete fields in the type declaration "TDefinitions", you can also open "settings -> Sower Tools -> Sower-tools.Database Model" to update the model configuration)
7. Select a file in the workspace, and right-click to open the context menu, you will see the options:
    - **Skip Work Tree** (which is the same as git command `git update-index --skip-worktree`)
    - **No Skip Work Tree** (which is the same as git command `git update-index --no-skip-worktree`)
    - **List Files** (which is the same as git command `git ls-files`)
8. Select some texts in the editor, and right-click to open the context menu, you will see the options:
    - **Generate Model** (which will generate the model files in the workspace if you selected a sql text. You can also open "settings -> Sower Tools -> Sower-tools.Database Model" to update the model configuration)
9. Use the features provided by the extension.
