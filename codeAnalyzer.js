/*
Completed Features:
  Minimum requirements
    1. Support one programming language syntax (eg: Java, C, JavaScript, etc).
    2. Support reading one source file and printing results.
    3. Types of lines you should support: Blank, Comments, Code.
    4. Support single-line comments (// in C-like languages).
    5. A line counts as a comment only if it has no other code.
    6. Design for extensibility: you should be able to support new language syntaxes by extending your solution.
    7. One passing test

  Additional Features
    1. Supporting multiple files and giving totals for an entire source tree.
    2. Supporting multi-line comments.
    3. Ability to add more granular breakup (eg: classify lines as imports, variable declarations, etc).  

Missing Features:
  1. Supporting multiple syntaxes (Does this mean support for multiple languages? If yes, below program is built to support multiple languages as well.).
  2. File type validation not added as it was not requested.

Assumptions
  1. Declarations, loops and imports will also count as lines of code.
  2. In a comment block, empty lines will count as comment lines.    
*/

const fs = require("fs");
const language = 'javascript';

// Regular expression to match import statements
const importRegex = /^import|=require\(|= require\(/;
const declarationsRegEx = /^(const|let|var)/;
const loopRegEx = /^for|^while|\.forEach\(|\.forEach \(/;

const allRegEx = {
  javascript: {
    importRegex: /^import|=require\(|= require\(/,
    declarationsRegEx: /^(const|let|var)/,
    loopRegEx: /^for|^while|\.forEach\(|\.forEach \(/,
  },
  // other language regex can be added as required.
};

function formatFilePath(path) {
  const regex = /^\.\/\//;
  const replacement = "./";

  return path.replace(regex, replacement);
}

function doesLineStartsWithMultiLineComment(line, language) {
  switch (language) {
    case "javascript":
      return line.trim().startsWith("/*") && !line.trim().endsWith("*/");
    // Other cases can be added for other languages
  }
}

function doesLineEndsWithMultiLineComment(line, language) {
  switch (language) {
    case "javascript":
      return line.trim().endsWith("*/");
    // Other cases can be added for other languages
  }
}

function doesLineStartsWithSingleLineComment(line, language) {
  switch (language) {
    case "javascript":
      return line.trim().startsWith("//");
    // Other cases can be added for other languages
  }
}

function estimateLinesOfCode(filePath) {
  // Read the file
  const fileContent = fs.readFileSync(filePath, "utf-8");

  // Split the file into lines
  const lines = fileContent.split("\n");

  let blankLines = 0;
  let commentLines = 0;
  let codeLines = 0;
  let inCommentBlock = false;
  let importLines = 0;
  let declarationLines = 0;
  let loopLines = 0;

  // Iterate through each line
  lines.forEach((line) => {
    // Check if the line is blank. (Treat blank lines inside comment block as 'comment').
    if (line.trim() === "" && !inCommentBlock) {
      blankLines++;
      return;
    }

    // Check if the line starts a multi-line comment block
    if (doesLineStartsWithMultiLineComment(line, language)) {
      commentLines++;
      inCommentBlock = true;
      return;
    }

    // Check if the line ends a multi-line comment block
    if (doesLineEndsWithMultiLineComment(line, language)) {
      commentLines++;
      inCommentBlock = false;
      return;
    }

    // Check if the line is a single-line comment or inside a multi-line comment block
    if (doesLineStartsWithSingleLineComment(line, language) || inCommentBlock) {
      commentLines++;
      return;
    }

    // Check if the line is an import statement
    if (allRegEx[language]['importRegex'].test(line.trim())) {
      importLines++;
    }

    // Check if the line is an import statement
    if (allRegEx[language]['declarationsRegEx'].test(line.trim())) {
      declarationLines++;
    }

    // Check if the line is an import statement
    if (allRegEx[language]['loopRegEx'].test(line.trim())) {
      loopLines++;
    }

    // Otherwise, it is a line of code
    codeLines++;
  });

  // Calculate the total number of lines
  const totalLines = blankLines + commentLines + codeLines;

  const result = {
    Blank: blankLines,
    Comments: commentLines,
    Code: codeLines,
    Imports: importLines,
    Declarations: declarationLines,
    Loops: loopLines,
    Total: totalLines,
  };

  return result;
}

function estimateLinesOfCodeForDirectory(directoryPath) {
  // Read the contents of the directory
  const files = fs.readdirSync(directoryPath);

  let blankLines = 0;
  let commentLines = 0;
  let codeLines = 0;
  let importLines = 0;
  let totalLines = 0;
  let declarationLines = 0;
  let loopLines = 0;

  // Iterate through the files and directories in the directory
  files.forEach((file) => {
    // Construct the full path for the file or directory
    const filePath = `${directoryPath}/${file}`;

    // Check if the file is a directory
    if (fs.statSync(filePath).isDirectory()) {
      // Recursively estimate the lines of code for the directory
      const linesOfCode = estimateLinesOfCodeForDirectory(filePath);

      // Add the lines of code for the directory to the totals
      blankLines += linesOfCode.Blank;
      commentLines += linesOfCode.Comments;
      importLines += linesOfCode.Imports;
      codeLines += linesOfCode.Code;
      declarationLines += linesOfCode.Declarations;
      loopLines += linesOfCode.Loops;
      totalLines += linesOfCode.Total;
    } else {
      // Estimate the lines of code for the file
      const linesOfCode = estimateLinesOfCode(filePath);

      // Add the lines of code for the file to the totals
      blankLines += linesOfCode.Blank;
      commentLines += linesOfCode.Comments;
      importLines += linesOfCode.Imports;
      codeLines += linesOfCode.Code;
      declarationLines += linesOfCode.Declarations;
      loopLines += linesOfCode.Loops;
      totalLines += linesOfCode.Total;

      allData[formatFilePath(filePath)] = linesOfCode;
    }
  });

  // Return the totals
  return {
    Blank: blankLines,
    Comments: commentLines,
    Code: codeLines,
    Imports: importLines,
    Declarations: declarationLines,
    Loops: loopLines,
    Total: totalLines,
  };
}

const allData = {}; // This object will contain the stats of all the files separately. 
const result = estimateLinesOfCodeForDirectory("./");
allData["All Totals"] = result; // Total aggregation of all files added.
console.log(allData);
