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
        let srcIcon = child.isDir ? "/img/folder.webp" : "/img/file.webp";
        elements += `
            <div class="element ${!child.isDir ? "file" : ""}" data-path="${child.path}" title='${child.name}'>
                <img src=${srcIcon} class=${child.isDir ? "" : "color-reverse"}>
                <span>${child.name}</span>
            </div>
        `;
    });

    return elements;
}