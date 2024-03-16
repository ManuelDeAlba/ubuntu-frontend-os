import Node from "./FileSystem/Node.js";
import { ROOT_FOLDER } from "./FileSystem/script.js";

class TerminalError extends Error {
    constructor({ code, message }){
        super(message);
        this.name = "TerminalError";
        this.code = code || 0;
    }
}

let user = "user";
export let currentDirectory = ROOT_FOLDER;

let commands = {
    "help": () => {
        text.push(`
            Commands:<br>
            - pwd: Print the current working directory<br>
            - ls: List the contents of the current directory<br>
            - clear: Clear the terminal<br>
            - cd [path]: Change the current directory to the specified path<br>
            - cat [file]: Print the contents of the specified file<br>
            - write [file] [content]: Write the specified content to the specified file<br>
            - touch [file]: Create a new file with the specified name<br>
            - mkdir [name]: Create a new directory with the specified name<br>
            - rm [file]: Remove the specified file or directory<br>
            - history: Print the command history<br>
            - user [name]: Change the current user to the specified name<br>
        `);
    },
    "pwd": () => {
        text.push(`${pwd()}`);
    },
    "ls": (commandArguments) => {
        text.push(ls(commandArguments));
    },
    "cd": (commandArguments) => {
        const res = cd(commandArguments[0]);
        if(res) text.push(res);
    },
    "cat": (commandArguments) => {
        text.push(cat(commandArguments));
    },
    "write": (commandArguments) => {
        text.push(write(commandArguments));
    },
    "touch": (commandArguments) => {
        text.push(touch(commandArguments));
    },
    "mkdir": (commandArguments) => {
        text.push(mkdir(commandArguments));
    },
    "rm": (commandArguments) => {
        text.push(rm(commandArguments));
    },
    "mv": (commandArguments) => {
        text.push(mv(commandArguments));
    },
    "clear": () => {
        text = [];
    },
    "history": () => {
        text.push(history());
    },
    "user": (commandArguments) => {
        text.push(changeUser(commandArguments));
    },
    "exit": () => {
        throw new TerminalError({
            code: 0,
            message: "Process finished with exit code 0"
        });
    },
}

export const defaultText = [
    "Welcome to Ubuntu",
    "Type 'help' to see a list of commands",
    "Type 'clear' to clear the terminal"
];
let text = [...defaultText];
let commandHistory = [];
let commandIndex = 0;

export function pwd() {
    return currentDirectory.getPath();
}

export function ls(paths){
    if(!paths.length) return currentDirectory.getTree();

    try{
        const results = paths.map(path => {
            const dir = getDirectoryFromRelativePath(path);

            if(paths.length == 1){
                return dir.getTree();
            } else {
                return `${path}:<br>${dir.getTree()}`;
            }
        });

        return results.join("<br>");
    } catch(e){
        return e.message;
    }

}

export function cd(path) {
    if(!path){
        currentDirectory = ROOT_FOLDER;
        return "";
    }

    try {
        const dir = getDirectoryFromRelativePath(path);
        currentDirectory = dir;
    } catch(e){
        return e.message;
    }
}

export function cat(paths){
    if(!paths.length) return "No specified file";

    try{
        const results = paths.map(path => {
            // Get the file and the directory
            const segments = path.split("/");
            const file = segments.pop();
            const dir = segments.length ? getDirectoryFromRelativePath(segments.join("/")) : currentDirectory;
        
            // Read the content of the file
            const node = dir.children.find(node => node.name === file);
            if(node && !node.isDir){
                return node.getContent();
            } else {
                return `No such file: ${file || ""}`;
            }
        });

        return results.join("<br>");
    } catch(e){
        return e.message;
    }
}

export function write(commandArguments){
    let [ path, content ] = commandArguments;
    
    if(!path) return "No specified file";

    try{
        const segments = path.split("/");
        const file = segments.pop();
        const dir = segments.length ? getDirectoryFromRelativePath(segments.join("/")) : currentDirectory;

        const node = dir.children.find(node => node.name === file);
        if(node && !node.isDir){
            node.addContent(content);
            return `Content written to ${file}`;
        } else {
            return `No such file: ${file || ""}`;
        }
    } catch(e){
        return e.message;
    }
}

export function touch(files){
    if(!files.length) return "No specified file";

    try{
        const results = files.map(file => {
            const segments = file.split("/");
            const name = segments.pop();
            const dir = segments.length ? getDirectoryFromRelativePath(segments.join("/")) : currentDirectory;

            if(dir.children.find(node => node.name === name)) return `File ${name} already exists`;

            const node = new Node(name);
            dir.addNode(node);
            return `File ${name} created`;
        });

        return results.join("<br>");
    } catch(e){
        return e.message;
    }
}

export function mkdir(paths){
    if(!paths.length) return "No specified name";

    try{
        const results = paths.map(path => {
            const segments = path.split("/");
            const name = segments.pop();
            const dir = segments.length ? getDirectoryFromRelativePath(segments.join("/")) : currentDirectory;

            if(dir.children.find(node => node.name === name)) return `Directory ${name} already exists`;

            const node = new Node(name, true);
            dir.addNode(node);
            return `Directory ${name} created`;
        });

        return results.join("<br>");
    } catch(e){
        return e.message;
    }
}

export function rm(paths){
    if(!paths.length) return "No specified file or directory";

    try{
        const results = paths.map(path => {
            const node = getNodeFromPath(path);
            const dir = node.parent;

            if(dir){
                dir.removeNode(node);
                return `${!node.isDir ? 'File' : 'Directory'} ${node.name} removed`;
            } else {
                return `Cannot remove root directory`;
            }
        });

        return results.join("<br>");
    } catch(e){
        return e.message;
    }
}

export function mv(commandArguments){
    // Relative paths
    const [ source, destination ] = commandArguments;

    if(!source || !destination) return "No specified source or destination";

    // Get the nodes to move
    let sourceNode;
    let destinationNode;

    try{
        sourceNode = getNodeFromPath(source);
    } catch(e){
        return e.message;
    }

    // Try to get the destination node if it exists
    // This is useful to check if we need to rename the node
    try{
        destinationNode = getNodeFromPath(destination);
    } catch(e){}

    if(!sourceNode) return "No such file or directory";
    if(sourceNode === destinationNode) return "Source and destination are the same";
    if(destinationNode && sourceNode.name === destinationNode.name) return "Source and destination have the same name";
    if(destinationNode && !destinationNode.isDir) return "Destination is not a directory and cannot replace the file";

    // Paths to show in the output
    let prevPath = sourceNode?.path;
    let newPath = destinationNode?.path;

    // node -> folder
    if(destinationNode && destinationNode.isDir){
        // First remove the node from the parent
        let parent = sourceNode.parent || sourceNode;
        parent.removeNode(sourceNode);

        // Then add the node to the destination
        destinationNode.addNode(sourceNode);
    }

    // note -> renamedNode
    if(!destinationNode){
        prevPath = sourceNode.path;

        // Get the new name
        const destinationSegments = destination.split("/");
        let newName = destinationSegments.pop();

        // Get the directory
        const destinationDir = destinationSegments.length ? getDirectoryFromRelativePath(destinationSegments.join("/")) : currentDirectory;

        // Change name
        sourceNode.setName(newName);

        // First remove the node from the parent
        let parent = sourceNode.parent || sourceNode;
        parent.removeNode(sourceNode);
        
        // Add the node to the destination
        // And update the path
        destinationDir.addNode(sourceNode);

        newPath = sourceNode.path;
    }
    
    return `Moved ${prevPath} to ${newPath}`;
}

export function history(){
    return commandHistory.map((command, index) => `${index + 1} ${command}`).join("<br>");
}

export function changeUser(commandArguments){
    const newUser = commandArguments[0] || "user";
    user = newUser;
    return `User changed to ${user}`;
}

export function execute(command){
    let [ executedCommand, ...commandArguments ] = parseCommand(command);

    // Save the command in the history
    commandHistory.push(command);
    commandIndex = commandHistory.length;

    if(commands[executedCommand]){
        // Show the command in the terminal
        text.push(`${getPreInput()}: ${command}`);

        // Execute the command
        commands[executedCommand](commandArguments);

        return text;
    } else {
        text.push(`${getPreInput()}: ${command} <br> Command not found: ${command}`);

        return text;
    }
}

export function reset(){
    text = [...defaultText];
    return text;
}

export function getPreInput(){
    return `<span style="color: lightgreen;">${user}@ubuntu</span>:<span style="color: lightblue;">${pwd()}</span>`;
}

export function getDirectoryFromRelativePath(path){
    return getNodeFromPath(path, {
        onlyDirectory: true,
        absolute: false
    });
}

export function getDirectoryFromPath(path){
    return getNodeFromPath(path, {
        onlyDirectory: true,
        absolute: true
    });
}

export function getNodeFromPath(path, { onlyDirectory=false, absolute=false }={}){
    const segments = path.split("/");
    let aux = absolute ? ROOT_FOLDER : currentDirectory;

    segments.forEach(segment => {
        if(!segment) return;
        if(segment === ".") return;
        if(segment === "..") {
            // If there is a parent, navigate to it
            // Otherwise, stay in the same directory
            if (aux.parent) aux = aux.parent;
        } else {
            // Search a node with the name of the segment
            const node = aux.findNode(segment);

            // If the node does not exist, throw an error
            if (!node) throw new Error(`No such file or directory: ${segment}`);

            // If the node is not a directory and onlyDirectory is true, throw an error
            if(onlyDirectory && !node.isDir) throw new Error(`Not a directory: ${segment}`);

            aux = node;
        }
    })

    return aux;
}

export function parseCommand(command){
    const regex = /"([^"]+)"|\S+/g;
    const matches = [];
    const words = command.matchAll(regex);

    words.forEach(word => {
        // If exists a capture group (the match is between quotes)
        if(word[1] != undefined){
            matches.push(word[1].toLowerCase());
        } else {
            matches.push(word[0].toLowerCase());
        }
    })

    return matches;
}

export function handleKeyDown(e){
    if(commandHistory.length <= 0) return;
    
    const input = document.querySelector(".input");
    
    if(document.activeElement == input){
        if(e.key === "ArrowUp"){
            e.preventDefault();
            if(commandIndex >= 0){
                commandIndex = Math.max(0, commandIndex - 1);
                input.value = commandHistory[commandIndex];
            }
        } else if (e.key === "ArrowDown"){
            e.preventDefault();
            if(commandIndex < commandHistory.length - 1){
                commandIndex = Math.min(commandHistory.length - 1, commandIndex + 1);
                input.value = commandHistory[commandIndex];
            }
        }
    }
}