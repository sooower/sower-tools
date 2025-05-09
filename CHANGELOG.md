# Changelog

All notable changes to "sower-tools" will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.23.0] - 2025-04-24

### Fixed

-   Skip listen env variables reference when opened project is not in supported projects.
-   Fix type name error when refactor function parameter.

### Added

-   Add configuration for parameter type name synchronization.

### Changed

-   Implement debouncing on text document changes to optimize performance.
-   Add ANSI color support for logging.

## [0.22.0] - 2025-03-28

### Added

-   Add command to generate runbook info for selected projects.
-   Enhance project configuration with new settings for runbook generation.
-   Introduce global and project-specific ignored insertion columns in package.json for better control over database model generation.
-   Implement new command, code action providers, code lens providers to add or remove columns from insert and update options dynamically.

### Changed

-   Enhance blank lines removal with range-based filtering.
-   Update package.json to include new configuration for opened projects file paths.
-   Change skipCheckCharacter to skipCheckCharacters in package.json and related files and update type from string to array for multiple skip check characters.
-   Update templates to enhance database model generation (accept optional returns parameter for specifying columns to return when query or update record).
-   Refactor existing code to utilize the new getPossibleWorkspaceRelativePath function for improved path handling.
-   Consolidate and streamline the database model generation process with new utility functions and templates for insert and update operations.
-   Update logging and documentation to reflect changes in functionality and configuration options.
-   Enhance error handling and logging in uploadImageConfigFilePath to create a default config file if it doesn't exist.
-   Ensure directory creation for opened projects file path in projectsOpen module.
-   Improve branch handling and logging in command execution when generating runbook info.

### Fixed

-   Change method for retrieving parameter type from getText() to getSymbol()?.getEscapedName() to fix type name error.

## [0.21.0] - 2025-03-08

### Added

-   Add new `runProject` command to run TypeScript projects using tsx.
-   Add configuration options for run enhancement and AST project source file caching.
-   Implement new API document reference module with configuration options.
-   Add command and menu entries to refer to API documents for TypeScript files.
-   Enhance API request assistant with dynamic project name support and user prompts.
-   Create dark and light SVG icons for the new feature.
-   Add Handlebars dependency to support template rendering.
-   Add "Sower Tools" category to all commands in package.json.
-   Add new configuration option `openFileDelay` to control file opening speed.
-   Implement smooth file opening with configurable delay.

### Changed

-   Rename `debuggingEnhancement` module to `runEnhancement`.
-   Implement debounce utility function for performance optimization.
-   Update package.json configuration and command names.
-   Improve context setting and workspace folder detection.
-   Update package.json with new configuration settings for API document reference.
-   Simplify template rendering in various modules using the new utility function.
-   Update refer to env variable command icon.
-   Add detailed function descriptions and parameter explanations.
-   Improve type overload documentation for utility functions.
-   Modify API document reference to open in a side-by-side view column.
-   Enhance project open feature to indicate already opened projects in the description.
-   Update template utility types with more detailed documentation.
-   Improve home directory path formatting in project selection.
-   Rename module and configuration from `expandFolder` to `folderExpansion`.
-   Update package.json configuration keys and module structure.

## [0.20.0] - 2025-03-02

### Added

-   Enhance git force push with select remote repositories.
-   Add option item Add group for configuring project groups.
-   Loading ignore pattern for style check module dynamically.
-   Add configuration item timestampFormat for configure timestamp convert/insert format.
-   Improve git force push command with progress indication.
-   Add new code actions for removing blank lines and copying to clipboard.
-   Implement command to upload local images to Minio storage.
-   Add new configuration option sower-tools.projectsOpen.style to control project view style.
-   Implement two display modes: groups and flat list with group separators.
-   Support path alias "~" for project paths configuration.
-   Add quick pick buttons to switch between display styles and add groups.
-   Add cursor profile sync configuration and commands.
-   Add user confirmation for cursor profile sync actions.
-   Add project snapshot feature with configuration and file watching.
-   Add API request assistant with env variables reference and fix save file snapshots.

### Changed

-   Enhance type of zod schema for checking if the direct symbol source is from zod and remove redundant commands.
-   Improve package.json configuration descriptions and structure.
-   Update code actions providers for local image diagnostics.
-   Improve diagnostic triggers for markdown modules.
-   Enhance project opening command with more flexible selection and error handling.
-   Prevents style check diagnostics from being generated in git, git-index, and SCM views.
-   Remove "See Details" option from information message.
-   Update package.json descriptions to use consistent comma-separated formatting.
-   Update configuration to make project name optional.
-   Rename `dirEnhancement` to `folderEnhancement` and optimized performance of command 'expandFolder'.

### Fixed

-   Fix override function in function declaration style check.
-   Update constant with using dynamic command registration(causing the 'extensionName' is undefined).
-   Correct upstream branch detection in git force push command.
-   Loading project AST and remove redundant 'sourceFileCache'.
-   Add GitLens diff view support to style check detection.
-   Fix force push command with improved remote branch selection and confirmation.

## [0.19.0] - 2025-02-23

### Added

-   Add configuration options for style check modules.
-   Add enum declaration style check module.
-   Add skip check character option for comment style check.
-   Add style check `import-statements-top-of-file` and consolidate module index files and simplify import statements.
-   Add module `blankLinesRemoval` for formatting markdown document.
-   Enhance comment style check with new diagnostics and code actions.
-   Add file ignore configuration for style check module.
-   Add module `tryStatement` for try statement style check.
-   Add logger for enhancing log printing and removed redundant commands in package.json.
-   Add module `projectsOpen` for project enhancement with project group configuration and add command `openProjects` to batch open projects.

### Fixed

-   Fix some problems of style check in module `functionDeclaration` and `comment`.
-   Update style check of module `comment` and `functionStatement` and fix code with new style check.
-   Update debugging configuration schema validation for fixing debug current file not work.
-   Error parsing configuration item `uploadImageConfigFilePath` when configuration item `parseUploadImageConfigFilePath` is disabled.

### Changed

-   Rename `enumsSort` module to `enumsDeclarationSort`.

## [0.18.0] - 2025-02-17

### Added

-   Add module `returnStmtStyleDiagnostic` and fix code actions pre-condition.
-   Add module `styleCheck` and add a sub module `comment` for comment style check.
-   Add class, function, interface and type declarations style diagnostics and code actions.
-   Add import statement style diagnostics and code actions.
-   Add log printing completion item enhancement, support print log to the console and update configuration dynamically.

### Changed

-   Update moduleManager for support register multiple or nest sub modules and update project README document.

## [0.17.1] - 2025-02-15

### Changed

-   Refactoring code for multi-module architecture.

## [0.17.0] - 2025-02-13

### Added

-   Add markdown image diagnostics, including:
    -   `no-invalid-local-image-file-path`
    -   `no-local-image-link`
-   Add upload local image to minio storage functionality.

## [0.16.3] - 2025-01-24

### Changed

-   Update countdown timer functionality.

## [0.16.2] - 2024-12-26

### Changed

-   Update repository URL and adjust status bar item positions.

## [0.16.1] - 2024-12-26

### Changed

-   Update project configuration and refactor code style.

## [0.16.0] - 2024-12-26

### Added

-   Add countdown timer functionality and update configuration.

## [0.15.3] - 2024-12-21

### Changed

-   Update ESLint configuration and dependencies.

## [0.15.2] - 2024-12-20

### Changed

-   Remove unused import sorting command.

## [0.15.1] - 2024-12-11

### Changed

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

### Changed

-   Add prettier to format code.

## [0.12.11] - 2024-11-08

### Fixed

-   Reload configuration when 'settings.json' file updated.

## [0.12.10] - 2024-11-07

### Changed

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

-   File path error while generating schema file.
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
