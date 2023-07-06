const fs = require("fs");
const path = require("path");
// const Promise = require("./Promise.js");

// function readFile(url) {
//   let dfd = Promise.deferred();

//   fs.readFile(url, "utf-8", function (err, data) {
//     if (err) return dfd.reject(err);
//     dfd.resolve(data);
//   });

//   return dfd.promise;
// }

// readFile(path.resolve(__dirname, "name.txt")).then((data) => {
//   console.log(data);
// });

Promise.resolve("abc").then((data) => {
  console.log(data);
});
