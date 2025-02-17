# Sower Tools

## Features

-   Generate schema and model file in a default location for selected sql text.
-   Show selected lines and code details in status bar.
-   Debug current file or project by clicking the editor context menu or in editor title menu.
-   Show readme document when there has no document opened in workspace, like README.md, CHANGELOG.md, etc.
-   Refactor function parameters to use object parameter, also support convert unstructured function parameters to object parameters.
-   Auto sync type name of the function parameter which is named ends with 'Options' when the opened typescript document saved.
-   Generate enum assertion functions.
-   Add typescript code refactor panel actions, you can use it to refactor function parameters or generate/update assert enum functions.
-   Introduce new git enhancement commands: skipWorkTree, noSkipWorkTree, and listFiles.
-   Add the new commands "Update Model" in context menu and in code action panel to update model file after you modified type declaration 'TDefinitions' in opened file.
-   Add timestamp conversion and insertion commands and view the timestamp corresponding to the unix timestamp.
-   Refactor class method parameters to object.
-   Auto-update imports statements with prefix 'node:' for Node.js built-in modules.
-   Base64 string encoding/decoding.
-   Generate type declaration of zod schema.
-   Sync type member names used in current file when any member of the type is changed.
-   Add command 'updateTypeMemberNames' to update type member names.
-   Show timestamp text from selected word or from ranged word.
-   Add command 'syncChangelog' and associated code actions when the changelog.md file is opened, which will sync the changelog content with README.md or package.json file.
-   Add command 'sortEnums' and associated code actions to sort the enum declarations when there only contains enum declarations in the opened file.
-   Show now timestamp in status bar.
-   Add configuration for supporting if enable show now timestamp in status bar.
-   Enhanced pg sql parser for parsing primary key and field type 'smallint' and 'bytea'.
-   Add encrypt/decrypt text.
-   Add configuration for encrypted/decrypted text.
-   Add 'Open Files' functionality for opening files in selected directory.
-   Add generating API resources functionality for generating api CRUD codes.
-   Add support convert arrow function parameters when converting function parameter into object structure parameters.
-   Add countdown timer functionality for showing the remaining time in status bar and update configuration.
-   Add markdown image diagnostics, including:.
    -   `no-invalid-local-image-file-path`.
    -   `no-local-image-link`.
-   Add upload local image to minio storage functionality.
-   Add module `returnStmtStyleDiagnostic` and fix code actions pre-condition.
-   Add module `styleCheck` and add a sub module `comment` for comment style check.
-   Add class, function, interface and type declarations style diagnostics and code actions.
-   Add import statement style diagnostics and code actions.
-   Add log printing completion item enhancement, support print log to the console and update configuration dynamically.

## Usage

To use this extension, follow these steps:

1. Install the extension.
2. Open a project in Visual Studio Code.
3. Use the features provided by the extension.
