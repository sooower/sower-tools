# Changelog

All notable changes to "sower-tools" will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2024-06-16

### Changed

-   Streamline commands and update messaging
-   Show hover timestamp only when some texts selected

## [0.3.1] - 2024-06-15

### Changed

-   Add unix to human-readable when timestamp hover

## [0.3.0] - 2024-06-15

### Added

-   Add timestamp conversion and insertion commands and view the timestamp corresponding to the unix timestamp.

### Changed

-   Update usage instructions and context menu options.

## [0.2.1] - 2024-06-15

### Changed

-   Update usage instructions and context menu options

## [0.2.0] - 2024-06-14

### Added

-   Introduce new git enhancement commands: skipWorkTree, noSkipWorkTree, and listFiles.
-   Add the new commands "Update Model" in context menu and in code action to update model file after updated the type declaration "TDefinitions".

### Changed

-   Refactor context menu item.
-   Introduce new editor title actions for quick access to these debugging commands.
-   Update default configuration settings for debugging to accept arrays of configuration names. This change allows users to specify multiple configuration names for both project-level and file-level debugging, enhancing the flexibility of the debugging experience within VS Code.
-   Improve error messages for command execution failures.

### Fixed

-   Avoid type declaration duplication in refactoring
-   Window can not show information message

### Breaking Change

-   Configuration names now expect arrays instead of single strings. Users must update their configuration settings accordingly.

## [0.1.0] - 2024-06-12

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

## [0.0.6] - 2024-06-04

### Added

-   Add typescript code refactor panel actions, you can use it to refactor function parameters or generate assert enum functions.

### Fixed

-   File path error when generate schema file.
-   May generate enum assertion function duplicated.
-   May refactor function parameter to object duplicated.

## [0.0.5] - 2024-06-02

### Added

-   Generate enum assertion functions.

## [0.0.4] - 2024-06-02

### Changed

-   Auto refactor type name of function options parameter when ts document saved.

## [0.0.3] - 2024-06-01

### Added

-   Validate type name of function options parameter when ts document saved.
-   Refactor function parameters to use object parameter.

## [0.0.2] - 2024-05-31

### Added

-   Debug current file or project in editor context enum.
-   Show default opened document when there has no document opened in workspace, like README.md, CHANGELOG.md, etc.

## [0.0.1] - 2024-05-30

### Added

-   Generate schema and model file in default location for any selected sql text.
-   Show selected lines and code in status bar for any language.
