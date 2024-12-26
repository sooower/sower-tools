## Features

-   Generate schema and model file in default location for selected sql text.
-   Show selected lines and code in status bar.
-   Debug current file or project in editor context menu or in editor title menu.
-   Show default opened document when there has no document opened in workspace, like README.md, CHANGELOG.md, etc.
-   Refactor function parameters to use object parameter.
-   Auto refactor type name of function options parameter when ts document saved.
-   Generate enum assertion functions.
-   Add typescript code refactor panel actions, you can use it to refactor function parameters or generate/update assert enum functions.
-   Introduce new git enhancement commands: skipWorkTree, noSkipWorkTree, and listFiles.
-   Add the new commands "Update Model" in context menu and in code action panel to update model file after you modified type declaration 'TDefinitions' in opened file.
-   Add timestamp conversion and insertion commands and view the timestamp corresponding to the unix timestamp.
-   Refactor class method parameters to object.
-   Auto-update feature for Node.js built-in modules.
-   Base64 string encoding/decoding.
-   Generating type of zod schema.
-   Update type member names when any member of type in current file is changed.
-   Configuration option for text replacement behavior.
-   Convert anonymous type to options object.
-   Add command 'updateTypeMemberNames' to update type member names.
-   Show timestamp from selected word or from ranged word.
-   Add command 'syncChangelog' and associated code actions.
-   Add command 'sortEnums' and associated code actions.
-   Show now timestamp in status bar.
-   Add support config enable showNowTimestamp.
-   Enhanced pg sql parser for parsing primary key and field type 'smallint' and 'bytea'.
-   Add prettier to format code.
-   Add encrypt/decrypt text.
-   Add configuration for encrypted/decrypted text.
-   Add 'Open All Files' functionality.
-   Add generating API resources functionality.
-   Add support convert arrow function params when convert function parameter into object structure.
-   Add countdown timer functionality and update configuration.

## Usage

To use this extension, follow these steps:

1. Install the extension.
2. Open a project or empty directory in Visual Studio Code.
3. Use the features provided by the extension follow the instructions below.

**Show Selected Lines**

-   If you open a file and selected some texts, you will see the text "Sel. Ln. x, Co. x" in the status bar.

**Setting Default Opened Document**

-   You can open "settings -> Sower Tools -> Sower-tools.Show Default Opened Document" to update the show default opened documents name or adjust the orders.

**Debugging Enhancement**

-   Open a .ts file and you will see the icons of commands "Debug Current File" and "Debug Project" in the right top corner of the editor.
-   Click the icon and it will execute the debug command if you have wrote the debug configuration in the file "./.vscode/launch.json", you can also open "settings -> Sower Tools -> Sower-tools.Debug Enhancement" to append the customized debug configuration name.
-   You can click them to execute the debug command. Also you can open a file in editor and right-click to open the context menu, you will see the debug commands in the context menu.

**Refactor Parameters Style**

-   Open a file in the activated editor and show the code action panel to refactor the function's parameters of current position, which will reform the parameters to object style

**Generate/Update Enum Assertion**

-   Open a file in the activated editor and show the code action panel to generate or update the enum assertion for the current enum type. if the assert function is not exists in current file , it will generate, otherwise it will update the assert function.

**Generate Model**

-   It will generate the model files in the workspace if you selected a sql text.
-   You can also open "settings -> Sower Tools -> Sower-tools.Database Model" to update the model configuration

**Update Model**

-   Open a file in the activated editor and show the code action panel to update the model for the current file, and which will update the current file items if you remove, update or delete fields in the type declaration `TDefinitions`.
-   You can also open "settings -> Sower Tools -> Sower-tools.Database Model" to update the model configuration

**Skip Work Tree**

-   This command is the same as git command `git update-index --skip-worktree`, which is used to skip the file from being committed.
-   Select a file in the workspace, and right-click to open the context menu, you can execute the command.

**No Skip Work Tree**

-   This command is the same as git command `git update-index --no-skip-worktree`, which is used to cancel the skip of the file.
-   Select a file in the workspace, and right-click to open the context menu, you can execute the command.

**List Files**

-   This command is the same as git command `git ls-files --exclude-standard --others`, which is used to list all files in the workspace.
-   Select a file in the workspace, and right-click to open the context menu, you can execute the command, and it will open a temporary terminal to execute the command.

**Timestamp Tool**

-   Hover mouse about a word and you can view the timestamp corresponding to the unix timestamp if the word is a valid unix timestamp.
-   Open a file in the activated editor and select a text and show the code action panel to convert timestamp format.
-   Open a file in the activated editor and show the code panel to inserts a timestamp at the current cursor position.
