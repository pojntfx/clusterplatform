const fs = require("fs");

const index = fs.readFileSync("./index--chat.html", "utf-8");

const indexWithExternalLinks = index.replace(
  "./index.md",
  "http://txti.es/clusterplatform"
);

console.log(indexWithExternalLinks);
return indexWithExternalLinks;
