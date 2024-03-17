import * as FileSystem from "./FileSystem/script.js"
import { ROOT_FOLDER } from "./FileSystem/script.js";

export let currentDirectory = ROOT_FOLDER;

let navigationHistory = [ROOT_FOLDER];
let navigationIndex = 0;

export function changeDirectory(path){
    const newDirectory = FileSystem.getDirectoryFromPath(path, { currentDirectory })
    currentDirectory = newDirectory;

    // If the new directory is the same as the current one, don't add it to the history
    // But still update the index to go back to it
    if(navigationHistory[navigationIndex+1]?.path == path){
        navigationIndex++;
        return;
    }

    // Save the previous directories
    navigationHistory.push(newDirectory);
    navigationIndex = navigationHistory.length - 1;
}

export function goBack(){
    if(navigationIndex > 0){
        navigationIndex--;
        currentDirectory = navigationHistory[navigationIndex];
    }
}

export function goForward(){
    if(navigationIndex < navigationHistory.length - 1){
        navigationIndex++;
        currentDirectory = navigationHistory[navigationIndex];
    }
}

export function generateExplorer(path=currentDirectory.path){
    let folders = "";

    let files = getNodeFromPath(path).children;
    let sortedFiles = files.sort((a,b) => {
        // Sort directories first (only if they are different types)
        if(a.isDir && !b.isDir) return -1;
        if(!a.isDir && b.isDir) return 1;

        // Sort by name if the types are the same
        return a.name.localeCompare(b.name);
    });

    sortedFiles.forEach((child) => {
        let srcIcon = child.isDir ? "https://cdn1.iconfinder.com/data/icons/fs-icons-ubuntu-by-franksouza-light/512/folder.png" : "https://cdn2.iconfinder.com/data/icons/line-files-type/129/TXT_File-512.png"
        folders += `
            <div class="folder ${!child.isDir && "file"}" data-path="${child.path}">
                <img src=${srcIcon}>
                <span>${child.name}</span>
            </div>
        `;
    });

    return folders;
}

export function getNodeFromPath(path){
    return FileSystem.getNodeFromPath(path, { currentDirectory });
}

export function readFile(path){
    const file = FileSystem.getFileFromPath(path, { currentDirectory: ROOT_FOLDER });
    return file;
}