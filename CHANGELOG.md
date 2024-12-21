# Changelog

All notable changes to "sower-tools" will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.15.3] - 2024-12-21

### Changed

-   Update ESLint configuration and dependencies.

## [0.15.2] - 2024-12-20

### Changed

-   Remove unused import sorting command.

## [0.15.1] - 2024-12-11

### Added

-   Add support convert arrow function params when convert function parameter into object structure.

## [0.15.0] - 2024-11-22

### Added

-   Add generating API resources functionality.

## [0.14.1] - 2024-11-21

### Fixed

-   Show opened files count.

## [0.14.0] - 2024-11-21

### Added

-   Add 'Open All Files' functionality.

## [0.13.0] - 2024-11-21

### Added

-   Add encrypt/decrypt text.
-   Add configuration for encrypted/decrypted text.

## [0.12.14] - 2024-11-18

### Fixed

-   Updating function 'update' content when update model.

## [0.12.13] - 2024-11-13

### Fixed

-   Add prettier to format code.
-   Fill function 'update' content when generate model.

## [0.12.12] - 2024-11-13

### Added

-   Add prettier to format code.

## [0.12.11] - 2024-11-08

### Fixed

-   Reload configuration when 'settings.json' file updated.

## [0.12.10] - 2024-11-07

### Added

-   Enhanced pg sql parser for parsing primary key and field type 'smallint' and 'bytea'.

## [0.12.9] - 2024-10-31

### Fixed

-   Add eslint disable for model file.

## [0.12.8] - 2024-10-18

### Changed

-   Update README file and package info.

## [0.12.7] - 2024-09-18

### Fixed

-   Fix generate model.

### Changed

-   Remove remove deprecated function.

## [0.12.6] - 2024-09-16

### Fixed

-   Support refactor parameters with default values to a named type parameter.

## [0.12.5] - 2024-09-16

### Changed

-   Add sync changelog to pm2 config file.

## [0.12.4] - 2024-09-16

### Changed

-   Update text of selected lines and codes.

## [0.12.3] - 2024-09-16

### Fixed

-   Fix type name of function parameter object.

## [0.12.2] - 2024-09-15

### Changed

-   Update dependencies.

## [0.12.1] - 2024-09-10

### Fixed

-   Add refactor constructor params to options object.

## [0.12.0] - 2024-08-30

### Added

-   Add support config enable showNowTimestamp.

## [0.11.2] - 2024-08-15

### Fixed

-   Removing convert parsed table name to lower-case.
-   Add support parse part of sql statement 'alter table'.

## [0.11.1] - 2024-07-31

### Fixed

-   Show default opened document only when no visibleTextEditors.
-   Add configuration item of whether enable show default opened document.

## [0.11.0] - 2024-07-29

### Added

-   Show now timestamp in status bar.

## [0.10.4] - 2024-07-18

### Fixed

-   Save file before sort enums for resolving conflicts between current file and memory.

## [0.10.3] - 2024-07-15

### Fixed

-   Remove incorrect comment of index when query record exists.

## [0.10.2] - 2024-07-13

### Fixed

-   Append next empty line at the end of package file when sync changelog.

## [0.10.1] - 2024-07-11

### Fixed

-   Ensure sorted enums are appended with a newline.
-   Find version mismatch last version.

## [0.10.0] - 2024-07-11

### Added

-   Add command 'sortEnums' and associated code actions.

## [0.9.1] - 2024-07-11

### Changed

-   Update context menus.

## [0.9.0] - 2024-07-10

### Added

-   Add command `updateTypeMemberNames`.
-   Show timestamp from selected word or from ranged word.
-   Add command 'syncChangelog' and associated code actions.

### Fixed

-   Save document after update node builtin imports.
-   Fix debug error.
-   Remove unused project dependency.
-   Remove unnecessary line break in command `insertTimestamp`.

## [0.8.0] - 2024-06-19

### Added

-   Refactor class method parameters to object.
-   Auto-update feature for Node.js built-in modules.
-   Base64 string encoding/decoding.
-   Generating type of zod schema.
-   Update type member names when any member of type in current file is changed.

### Changed

-   Change code action kind from QuickFix to Empty.
-   Configuration option for text replacement behavior.
-   Convert anonymous type to options object.

### Fixed

-   Multi edit update in one time.

## [0.7.2] - 2024-06-16

### Changed

-   Streamline commands and update messaging.
-   Show hover timestamp only when some texts selected.

## [0.7.1] - 2024-06-15

### Changed

-   Add unix to human-readable when timestamp hover.

## [0.7.0] - 2024-06-15

### Added

-   Add timestamp conversion and insertion commands and view the timestamp corresponding to the unix timestamp.

### Changed

-   Update usage instructions and context menu options.

## [0.6.1] - 2024-06-15

### Changed

-   Update usage instructions and context menu options.

## [0.6.0] - 2024-06-14

### Added

-   Introduce new git enhancement commands: skipWorkTree, noSkipWorkTree, and listFiles.
-   Add the new commands "Update Model" in context menu and in code action to update model file after updated the type declaration "TDefinitions".

### Changed

-   Refactor context menu item.
-   Introduce new editor title actions for quick access to these debugging commands.
-   Update default configuration settings for debugging to accept arrays of configuration names. This change allows users to specify multiple configuration names for both project-level and file-level debugging, enhancing the flexibility of the debugging experience within VS Code.
-   Improve error messages for command execution failures.

### Fixed

-   Avoid type declaration duplication in refactoring.
-   Window can not show information message.

### Breaking Change

-   Configuration names now expect arrays instead of single strings. Users must update their configuration settings accordingly.

## [0.5.1] - 2024-06-12

### Fixed

-   Find node logic fix.
-   Config ignored insertion columns.
-   EColumn uppercase error.
-   Schema template file.

### Changed

-   Update parseCreateStmt to V2( parse SQL AST).
-   Update node contains node rule.
-   Update path alias.
-   Update assertFunction if it exists.

## [0.5.0] - 2024-06-04

### Added

-   Add typescript code refactor panel actions, you can use it to refactor function parameters or generate assert enum functions.

### Fixed

-   File path error when generate schema file.
-   May generate enum assertion function duplicated.
-   May refactor function parameter to object duplicated.

## [0.4.0] - 2024-06-02

### Added

-   Generate enum assertion functions.

## [0.3.1] - 2024-06-02

### Changed

-   Auto refactor type name of function options parameter when ts document saved.

## [0.3.0] - 2024-06-01

### Added

-   Validate type name of function options parameter when ts document saved.
-   Refactor function parameters to use object parameter.

## [0.2.0] - 2024-05-31

### Added

-   Debug current file or project in editor context enum.
-   Show default opened document when there has no document opened in workspace, like README.md, CHANGELOG.md, etc.

## [0.1.0] - 2024-05-30

### Added

-   Generate schema and model file in default location for any selected sql text.
-   Show selected lines and code in status bar for any language.
