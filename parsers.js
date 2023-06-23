const fs = require("fs");
const mime = require("mime-types");

function parseSgEmailAddr(value) {
  if (!value) {
    return undefined;
  }
  if (typeof (value) === "object") {
    if (!value.email) {
      throw new Error("Bad SendGrid Email Address Format");
    }
    return value;
  }
  if (typeof (value) === "string") {
    return value.trim();
  }
  throw new Error(`Value ${value} is not a valid SendGrip Email Address`);
}

module.exports = {
  boolean: (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    return !!(value && value !== "false");
  },
  number: (value) => {
    if (!value) {
      return undefined;
    }
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Value ${value} is not a valid number`);
    }
    return parsed;
  },
  autocomplete: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "object") {
      return value.id || value;
    }
    return value;
  },
  object: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "object") {
      return value;
    }
    if (typeof (value) === "string") {
      const obj = {};
      [...value.matchAll(/^([^=]+)=(.+)$/gm)].forEach(([, key, val]) => {
        obj[key] = val;
      });
      return obj;
    }
    throw new Error(`Value ${value} is not an object`);
  },
  string: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "string") {
      return value.trim();
    }
    throw new Error(`Value ${value} is not a valid string`);
  },
  sgEmailAddr: parseSgEmailAddr,
  sgEmailAddrMulti: (value) => {
    if (!value) {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value.map(parseSgEmailAddr);
    }
    if (typeof (value) === "string") {
      const arr = value.split("\n").map((line) => line.trim());
      return arr.length === 1 ? arr[0] : arr;
    }
    if (typeof (value) === "object") {
      if (!value.email) {
        throw new Error("Bad SendGrid Email Address Format");
      }
      return value;
    }
    throw new Error(`Value ${value} is not a valid SendGrip Email Address`);
  },
  array: (value) => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof (value) === "string") {
      return value.split("\n").map((line) => line.trim()).filter((line) => line);
    }
    throw new Error("Unsupprted array format");
  },
  sgAttachment: (filePath) => {
    if (!filePath) {
      return undefined;
    }
    let ext = filePath.match(/\.[a-zA-Z]+$/);
    if (ext.length > 0) {
      [ext] = ext;
    }
    let fileName = filePath.match(/[^\\^/]+\.[a-zA-Z]+$/);
    if (fileName.length === 0) {
      throw new Error("Can't provide a file with no name as an attachment");
    }
    [fileName] = fileName;
    if (fs.lstatSync(filePath).isDirectory()) {
      throw new Error("Can't upload a directory as an attachment");
    }
    return {
      content: fs.readFileSync(filePath).toString("base64"),
      filename: fileName,
      type: ext ? mime.lookup(ext) || "application/octet-stream" : "application/octet-stream",
    };
  },
};
