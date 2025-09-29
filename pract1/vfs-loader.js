const fs = require("fs");
const xml2js = require("xml2js");

function parseXmlFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`VFS file not found: ${filePath}`);
    }

    const xmlData = fs.readFileSync(filePath, "utf-8");

    let vfsTree = null;
    xml2js.parseString(xmlData, { explicitArray: false }, (err, result) => {
        if (err) {
            throw new Error(`Invalid XML format: ${err.message}`);
        }
        vfsTree = convertToTree(result.vfs || {});
    });

    return vfsTree;
}

function convertToTree(node) {
    const tree = {
        type: node.$?.type || "dir",
        name: node.$?.name || "/",
        children: []
    };

    if (node.dir) {
        const dirs = Array.isArray(node.dir) ? node.dir : [node.dir];
        for (const d of dirs) {
            tree.children.push(convertToTree(d));
        }
    }

    if (node.file) {
        const files = Array.isArray(node.file) ? node.file : [node.file];
        for (const f of files) {
            tree.children.push({
                type: "file",
                name: f.$?.name,
                content: f._
                    ? Buffer.from(f._, "utf-8").toString("utf-8")
                    : ""
            });
        }
    }

    return tree;
}

module.exports = { parseXmlFile };
