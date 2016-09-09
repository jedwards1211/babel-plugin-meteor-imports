/* @flow */

export default ({ types: t }) => {
  function isMeteorModuleArg(moduleArg) {
    return moduleArg && moduleArg.type === 'StringLiteral' && /^meteor\/[-a-zA-Z0-9_]+/.test(moduleArg.value)
  }

  function memberExpressionForMeteorModuleArg(moduleArg) {
    return ['Package', ...moduleArg.value.split(/\//g).slice(1)].map(part => t.identifier(part)).reduce(
      (object, property) => t.memberExpression(object, property)
    )
  }

  function transformRequireCall(nodePath, state) {
    if (
      !t.isIdentifier(nodePath.node.callee, { name: 'require' }) &&
      !(
        t.isMemberExpression(nodePath.node.callee) &&
        t.isIdentifier(nodePath.node.callee.object, { name: 'require' })
      )
    ) {
      return
    }

    const moduleArg = nodePath.node.arguments[0]
    if (isMeteorModuleArg(moduleArg)) {
      nodePath.replaceWith(memberExpressionForMeteorModuleArg(moduleArg))
    }
  }

  function transformImportCall(nodePath, state) {
    const moduleArg = nodePath.node.source
    if (isMeteorModuleArg(moduleArg)) {
      nodePath.node.specifiers.forEach(specifier => {
        if (specifier.type === 'ImportDefaultSpecifier') {
          throw new Error("invalid default import from a meteor package")
        }
      })
      nodePath.replaceWith(
        t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.objectPattern(
                nodePath.node.specifiers.map(specifier => t.objectProperty(specifier.imported, specifier.local))
              ),
              memberExpressionForMeteorModuleArg(moduleArg)
            )
          ]
        )
      )
    }
  }

  return {
    visitor: {
      CallExpression: {
        exit(nodePath, state) {
          return transformRequireCall(nodePath, state)
        }
      },
      ImportDeclaration: {
        exit(nodePath, state) {
          return transformImportCall(nodePath, state)
        }
      }
    }
  }
}
