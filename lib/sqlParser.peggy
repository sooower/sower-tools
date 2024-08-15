{
  // Define context varibales here

  function textWithoutBlankSpace() {
    return text().toLowerCase().replace(/\s/g, "")
  }
}

Start
  = Stmts

Stmts
  = first:Stmt _ rest:Stmts { return [first, ...rest] }
  / first:Stmt { return [first] }

Stmt
  = CommentStmt
  / CreateTableStmt
  / AlterTableStmt

CreateTableStmt
  ="CREATE TABLE"i _ "IF NOT EXISTS"i? _ table:Table _ "(" _ columnOrConstraints:ColumnOrConstraints _ ")" _ ("TABLESPACE"i _ Identifier _ )? _ ";" {
      return {
        type: "CreateTableStmt",
        table,
        columnOrConstraints,
      }
    }

Table
  = schemaName:SchemaIdentifier '."' tableName:Identifier '"' { return { schemaName, tableName } }
  / '"' schemaName:SchemaIdentifier '".' tableName:Identifier { return { schemaName, tableName } }
  / '"' schemaName:SchemaIdentifier '"."' tableName:Identifier '"' { return { schemaName, tableName } }
  / schemaName:SchemaIdentifier '.' tableName:Identifier { return { schemaName, tableName } }

SchemaIdentifier
  = [a-zA-Z_0-9]+ { return text() }

ColumnOrConstraints
  = first:ColumnOrConstraint _ "," _ rest:ColumnOrConstraints { return [first, ...rest] }
  / first:ColumnOrConstraint { return [first] }

ColumnOrConstraint
  = column:ColumnNameIdentifier _ type:DataType _ constraints:Constraints? {
      return {
        column,
        type,
        columnConstraints: constraints || [],
      }
    }
  / "CONSTRAINT"i _ '"'? Identifier '"'? _ type:ConstraintType  _ "(" _ constraintColumns:ConstraintColumns _ ")" {
    return {
      tableConstraint: {
        [type]: constraintColumns,
      }
    }
  }

ConstraintType
  = "PRIMARY KEY"i { return  "primaryKey" }
  / "UNIQUE"i { return "unique" }

ConstraintColumns
  = '"'? first:ConstraintColumn '"'? _ "," _ rest:ConstraintColumns { return [first, ...rest] }
  / '"'? first:ConstraintColumn '"'? { return [first] }

ConstraintColumn
  = Identifier { return text() }

ColumnNameIdentifier
  = '"' Identifier '"' { return text().replace(/"/g, "") }
  / "`" Identifier "`" { return text().replace(/`/g, "") }
  / Identifier { return text() }

Constraints
  = first:Constraint _ rest:Constraints { return [first, ...rest] }
  / first:Constraint { return [first] }

Constraint
  = "NOT NULL"i { return { notNull: true } }
  / "PRIMARY KEY"i { return { primaryKey: true } }
  / "DEFAULT"i _ defaultVal: DefaultVal { return { default: defaultVal }}
  / "COLLATE"i _  rule:CollateRule { return { collate: rule } }

DefaultVal
  = "nextval("i _ ( "'" IdentifierExt "'" _ "::" _  Identifier _ )? ")" { return text() }
  / "'"? Identifier "'"? _ "::" _  Identifier ( _  "[]" )? { return text() }
  / Identifier { return text() }

CollateRule
  = Identifier '"' Identifier '"' { return text() }

DataType
  = "integer"i ( _ "[]" )? { return textWithoutBlankSpace() }
  / "bigint"i ( _ "[]" )? { return textWithoutBlankSpace() }
  / "text"i ( _ "[]" )? { return textWithoutBlankSpace() }
  / "serial"i { return "serial" }
  / "bigserial"i { return "bigserial" }
  / "boolean"i { return "boolean" }
  / "timestamp"i ( _ "with time zone"i _ )? { return "timestamp" }

Identifier
  = [a-zA-Z_][a-zA-Z0-9_\.]* { return text() }

IdentifierExt
  = [a-zA-Z_"][a-zA-Z0-9_\."]* { return text() }

_ "whitespace"
  = [ \t\r\n\$]*

CommentStmt
  = "--" (![\n] .)* "\n" { return { type: "CommentStmt" } }
  / "/*" (!("*/") .)* "*/" { return { type: "CommentStmt" } }

AlterTableStmt
  = "ALTER TABLE"i _ "IF EXISTS"i? _ table:Table _  "OWNER to"i _ user:Identifier _ ";"  { return { type: "AlterTableStmt" } }