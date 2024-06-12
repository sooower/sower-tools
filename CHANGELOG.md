# Changelog

All notable changes to "sower-tools" will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2024-05-30

### Added

-   Generate schema and model file in default location for any selected sql text.
-   Show selected lines and code in status bar for any language.

## [0.0.2] - 2024-05-31

### Added

-   Debug current file or project in editor context enum.
-   Show default opened document when there has no document opened in workspace, like README.md, CHANGELOG.md, etc.

## [0.0.3] - 2024-06-01

### Added

-   Validate type name of function options parameter when ts document saved.
-   Refactor function parameters to use object parameter.

## [0.0.4] - 2024-06-02

### Updated

-   Auto refactor type name of function options parameter when ts document saved.

## [0.0.5] - 2024-06-02

### Added

-   Generate enum assertion functions.

## [0.0.6] - 2024-06-04

### Added

-   Add typescript code refactor panel actions, you can use it to refactor function parameters or generate assert enum functions.

### Fixed

-   File path error when generate schema file.
-   May generate enum assertion function duplicated.
-   May refactor function parameter to object duplicated.

## [0.1.0] - 2024-06-12

### Fixed

-   Find node logic fix.
-   Config ignored insertion columns.
-   EColumn uppercase error.
-   Schema template file.

### Updated

-   Update parseCreateStmt to V2( parse SQL AST).
-   Update node contains node rule.
-   Update path alias.
-   Update assertFunction if it exists.
