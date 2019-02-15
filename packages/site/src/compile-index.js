const fs = require("fs");

const index = fs.readFileSync("./index.md", "utf-8");

const indexWithExternalLinks = index
  .replace(
    "../../../",
    "https://gitlab.com/clusterplatform/clusterplatform/raw/master/"
  ) // This is the logo
  .replace(
    /\.\.\/\.\.\/\.\.\//g,
    "https://gitlab.com/clusterplatform/clusterplatform/tree/master/"
  ); // These are the links

console.log(indexWithExternalLinks);
return indexWithExternalLinks;
