import Node from './Node.js';

//? DEFAULT FOLDERS AND FILES
export const ROOT_FOLDER = new Node("root", true);

const folder1 = new Node("folder1", true);
let file = new Node("file.txt");
file.addContent("Hello, world!");
ROOT_FOLDER.addNode(folder1);
ROOT_FOLDER.addNode(file);
folder1.addNode(new Node("file2.txt"));
folder1.addNode(new Node("folder2", true));

class FileSystemError extends Error {
    constructor({ code, message }){
        super(message);
        this.name = "FileSystemError";
        this.code = code || 0;
    }
}

const FILE_SYSTEM_ERRORS = {
    INEXISTENT_NODE: (name) => new FileSystemError({ code: "file-system/inexistent-node", message: `No such file or directory: ${name}` }),
    NOT_DIRECTORY: (name) => new FileSystemError({ code: "file-system/not-directory", message: `Not a directory: ${name}` }),
}

export const FILE_TYPES = {
    ALL: "all",
    FILE: "file",
    DIRECTORY: "directory",
}

export function getNodeFromPath(path, {
    type=FILE_TYPES.ALL,
    currentDirectory=ROOT_FOLDER,
}={}){
    const segments = path.split("/");
    let aux = path.startsWith("/") ? ROOT_FOLDER : currentDirectory;

    segments.forEach(segment => {
        if(!segment || segment === ".") return;
        if(segment === "..") {
            // If there is a parent, navigate to it
            // Otherwise, stay in the same directory
            if (aux.parent) aux = aux.parent;
        } else {
            // Search a node with the name of the segment
            let node;
            if(type === FILE_TYPES.ALL ) node = aux.findNode(segment);
            else if(type === FILE_TYPES.FILE) node = aux.findFile(segment);
            else if(type === FILE_TYPES.DIRECTORY) node = aux.findDirectory(segment);

            // If the node does not exist, throw an error
            if (!node) throw FILE_SYSTEM_ERRORS.INEXISTENT_NODE(segment);

            aux = node;
        }
    })

    return aux;
}

export function getFileFromPath(path, { currentDirectory }={}){
    // We need to pass the currentDirectory if the path is relative
    // Otherwise, the function will use the ROOT_FOLDER as the currentDirectory
    return getNodeFromPath(path, {
        type: FILE_TYPES.FILE,
        currentDirectory
    });
}

export function getDirectoryFromPath(path, { currentDirectory }={}){
    // We need to pass the currentDirectory if the path is relative
    // Otherwise, the function will use the ROOT_FOLDER as the currentDirectory
    return getNodeFromPath(path, {
        type: FILE_TYPES.DIRECTORY,
        currentDirectory
    });
}