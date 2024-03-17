import Node from './Node.js';

//? DEFAULT FOLDERS AND FILES
export const ROOT_FOLDER = new Node("root", true);

export const HOME_FOLDER = new Node("home", true);
export const DESKTOP_FOLDER = new Node("desktop", true);
export const DOCUMENTS_FOLDER = new Node("documents", true);
export const DOWNLOADS_FOLDER = new Node("downloads", true);
ROOT_FOLDER.addNode(HOME_FOLDER);
ROOT_FOLDER.addNode(DESKTOP_FOLDER);
ROOT_FOLDER.addNode(DOCUMENTS_FOLDER);
ROOT_FOLDER.addNode(DOWNLOADS_FOLDER);

// /desktop/texts -> "texts"
let texts = new Node("texts", true);
DESKTOP_FOLDER.addNode(texts);

// /desktop/texts/text1.txt -> "Text 1!"
let text1 = new Node("text1.txt");
text1.addContent("Text 1!");
texts.addNode(text1);

// /desktop/credits.txt -> "https://github.com/manueldealba"
let file = new Node("credits.txt");
file.addContent("https://github.com/manueldealba");
DESKTOP_FOLDER.addNode(file);

// /documents/file2.txt -> "File 2!"
let file2 = new Node("file2.txt");
file2.addContent("File 2!");
DOCUMENTS_FOLDER.addNode(file2);

// /downloads/download.txt -> "Super secret text :o"
let downloadedFile = new Node("download.txt");
downloadedFile.addContent("Super secret text :o");
DOWNLOADS_FOLDER.addNode(downloadedFile);

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

    segments.forEach((segment, index) => {
        if(!segment || segment === ".") return;
        if(segment === "..") {
            // If there is a parent, navigate to it
            // Otherwise, stay in the same directory
            if (aux.parent) aux = aux.parent;
        } else {
            // Search a node with the name of the segment
            let node;
            if(index !== segments.length - 1){
                // If it's not the last segment, we only need to find a directory to continue navigating
                node = aux.findDirectory(segment);
            } else {
                // If it's the last segment, we need to check the type
                if(type === FILE_TYPES.ALL ) node = aux.findNode(segment);
                else if(type === FILE_TYPES.FILE) node = aux.findFile(segment);
                else if(type === FILE_TYPES.DIRECTORY) node = aux.findDirectory(segment);
            }

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