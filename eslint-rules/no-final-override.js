/**
 * @fileoverview Disallow overriding classes or methods marked with @final
 */

"use strict";

const finalClasses = new Set()
const finalMethods = {}

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow overriding classes/methods marked with @final",
      category: "Best Practices",
      recommended: false
    },
    schema: [] // no options
  },


  create(context) {
    // Store map of final classes/methods
    const srcCode = context.sourceCode

    function hasFinalTag(node) {
      try{
        const commentsArr = srcCode.getCommentsBefore(node); //array
        if(!commentsArr[0]) return false;

        const comments = commentsArr[0].value
        const res = comments.includes("@final")
        // console.log(comments, res)
        

        return res
      }catch(e){}
      return false;
    }

    return {

      ClassDeclaration(node) {
        if (hasFinalTag(node)) {
          finalClasses.add(node.id.name);
        } else {
          // console.log(`${node.id.name} is no longer final`)
          finalClasses.delete(node.id.name)
        }
      },

      MethodDefinition(node) {
        const classNode = node.parent.parent;
        if (classNode && classNode.type === "ClassDeclaration" && classNode.id) {
          const className = classNode.id.name;
          if(hasFinalTag(node)){
            if (!finalMethods[className]) finalMethods[className] = new Set();
            finalMethods[className].add(node.key.name);
          } else if(finalMethods[className]) {
            // console.log(`${node.key.name} is no longer final`)
            finalMethods[className].delete(node.key.name)
          }
        }
      },
      ClassBody(node) {
        // Check for overrides in subclasses
        const classNode = node.parent;
        if (
          classNode.type === "ClassDeclaration" &&
          classNode.superClass &&
          classNode.superClass.type === "Identifier"
        ) {
          const superClassName = classNode.superClass.name;
          // Check if superclass is final
          if (finalClasses && finalClasses.has(superClassName)) {
            context.report({
              node: classNode,
              message: `Cannot extend final class '${superClassName}'.`
            });
          }
          // Check for final method overrides
          console.log(finalMethods)
          if (finalMethods && finalMethods[superClassName]) {
            for (const method of node.body) {
              if (
                method.type === "MethodDefinition" &&
                finalMethods[superClassName].has(method.key.name)
              ) {
                context.report({
                  node: method,
                  message: `Cannot override final method '${method.key.name}' from class '${superClassName}, Marked final'.`
                });
              }
            }
          }
        }
      },
    };
  }
};
