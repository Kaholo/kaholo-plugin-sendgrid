const fs = require("fs");
const mime = require('mime-types');
function parseSgEmailAddr(value){
    if (!value) return undefined;
    if (typeof(value) === "object"){
        if (!value.email) throw "Bad SendGrid Email Address Format";
        return value;
    }
    if (typeof(value) === "string"){
        return value.trim();
    }
    throw `Value ${value} is not a valid SendGrip Email Address`;
}

module.exports = {
    boolean : (value) =>{
        if (value === undefined || value === null || value === '') return undefined;
        return !!(value && value !=="false")
    },
    number: (value)=>{
        if (!value) return undefined;
        const parsed = parseInt(value);
        if (parsed === NaN) {
            throw `Value ${value} is not a valid number`
        }
        return parsed;
    },
    autocomplete: (value)=>{
        if (!value) return undefined;
        if (typeof(value) === "object") return value.id || value;
        return value;
    },
    object: (value)=>{
        if (!value) return undefined;
        if (typeof(value) === "object") return value; ;
        if (typeof(value) === "string") {
            const obj = {};
            Array.from(value.matchAll(/^([^=]+)=(.+)$/gm), ([match, key, val]) => {
                obj[key] = val;
            })
            return obj;
        }
        throw `Value ${value} is not an object`;
    },
    string: (value)=>{
        if (!value) return undefined;
        if (typeof(value) === "string") return value.trim();
        throw `Value ${value} is not a valid string`;
    },
    sgEmailAddr: parseSgEmailAddr,
    sgEmailAddrMulti: (value)=>{
        if (!value) return undefined;
        if (Array.isArray(value)) return value.map(parseSgEmailAddr);
        if (typeof(value) === "string"){
            const arr = value.split("\n").map(line => line.trim());
            return arr.length == 1 ? arr[0] : arr;
        }
        if (typeof(value) === "object"){
            if (!value.email) throw "Bad SendGrid Email Address Format";
            return value;
        }
        throw `Value ${value} is not a valid SendGrip Email Address`;
    },
    array: (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof(value) === "string") return value.split("\n").map(line=>line.trim()).filter(line=>line);
        throw "Unsupprted array format";
    },
    sgAttachment: (filePath) => {
        if (!filePath) return undefined;
        let ext = filePath.match(/\.[a-zA-Z]+$/);
        if (ext.length > 0) ext = ext[0];
        let fileName = filePath.match(/[^\\^/]+\.[a-zA-Z]+$/);
        if (fileName.length == 0) throw "Can't provide a file with no name as an attachment";
        fileName = fileName[0];
        if (fs.lstatSync(filePath).isDirectory()) throw "Can't upload a directory as an attachment";
        return {
            content: fs.readFileSync(filePath).toString("base64"), 
            filename: fileName,
            type: ext ? mime.lookup(ext) || "application/octet-stream" : "application/octet-stream"
        };
    }
}