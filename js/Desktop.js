import * as FileSystem from './FileSystem/script.js';
import { DESKTOP_FOLDER } from './FileSystem/script.js';

export function generateDesktop(){
    let elements = "";

    let files = FileSystem.getNodeFromPath(DESKTOP_FOLDER.path).children;
    let sortedFiles = files.sort((a,b) => {
        // Sort directories first (only if they are different types)
        if(a.isDir && !b.isDir) return -1;
        if(!a.isDir && b.isDir) return 1;

        // Sort by name if the types are the same
        return a.name.localeCompare(b.name);
    });

    sortedFiles.forEach((child) => {
        let srcIcon = child.isDir ? "https://cdn1.iconfinder.com/data/icons/fs-icons-ubuntu-by-franksouza-light/512/folder.png" : "https://cdn2.iconfinder.com/data/icons/line-files-type/129/TXT_File-512.png"
        elements += `
            <div class="element ${!child.isDir ? "file" : ""}" data-path="${child.path}">
                <img src=${srcIcon} class=${child.isDir ? "" : "color-reverse"}>
                <span>${child.name}</span>
            </div>
        `;
    });

    return elements;
}