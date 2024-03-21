import Node from "./FileSystem/Node.js";
import * as FileSystem from "./FileSystem/script.js";
import { ROOT_FOLDER } from "./FileSystem/script.js";

class TerminalError extends Error {
    constructor({ code, message }){
        super(message);
        this.name = "TerminalError";
        this.code = code || 0;
    }
}

const TERMINAL_ERRORS = {
    PROCESS_FINISHED: new TerminalError({ code: 0, message: "Process finished with exit code 0" }),
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
            - echo [text]: Print the specified text<br>
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
    "echo": (commandArguments) => {
        text.push(echo(commandArguments));
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
        throw TERMINAL_ERRORS.PROCESS_FINISHED;
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

    const results = paths.map(path => {
        try{
            const dir = getDirectoryFromPath(path);

            if(paths.length == 1){
                return dir.getTree();
            } else {
                return `${path}:<br>${dir.getTree()}`;
            }
        } catch(e){
            return e.message;
        }
    });

    return results.join("<br>");

}

export function cd(path) {
    if(!path){
        currentDirectory = ROOT_FOLDER;
        return "";
    }

    try {
        const dir = getDirectoryFromPath(path);
        currentDirectory = dir;
    } catch(e){
        return e.message;
    }
}

export function echo(commandArguments){
    return commandArguments.join(" ");
}

export function cat(paths){
    if(!paths.length) return "No specified file";

    const results = paths.map(path => {
        try{
            const node = getNodeFromPath(path);
        
            // Read the content of the file
            if(!node.isDir){
                return node.getContent();
            } else {
                return `Cannot read a directory: ${node.name}`;
            }
        } catch(e){
            return e.message;
        }
    });

    return results.join("<br>");
}

export function write(commandArguments){
    let [ path, content ] = commandArguments;
    
    if(!path) return "No specified file";

    try{
        const node = getNodeFromPath(path);

        // Write the content to the file
        if(!node.isDir){
            node.addContent(content);
            return `Content written to ${node.name}`;
        } else {
            return `Cannot write to directory: ${node.name || ""}`;
        }
    } catch(e){
        return e.message;
    }
}

export function touch(files){
    if(!files.length) return "No specified file";

    const results = files.map(file => {
        try{
            const { isAbsolute, dirname, basename: name } = parsePath(file);

            // If the path is absolute, the segments must start with "/" even if there are no more segments to start on the root directory
            // Otherwise, the segments start on the current directory
            const dir = getDirectoryFromPath(isAbsolute ? `/${dirname}` : dirname);

            if(dir.findNode(name)) return `File or directory ${name} is already in use`;

            const node = new Node(name);
            dir.addNode(node);
            return `File ${name} created`;
        } catch(e){
            console.log(e.code);
            return e.message;
        }
    });

    return results.join("<br>");
}

export function mkdir(paths){
    if(!paths.length) return "No specified name";
    
    const results = paths.map(path => {
        try{
            const { isAbsolute, dirname, basename: name } = parsePath(path);

            // If the path is absolute, the segments must start with "/" even if there are no more segments to start on the root directory
            // Otherwise, the segments start on the current directory
            const dir = getDirectoryFromPath(isAbsolute ? `/${dirname}` : dirname);

            if(dir.findNode(name)) return `File or directory ${name} is already in use`;

            const node = new Node(name, true);
            dir.addNode(node);
            return `Directory ${name} created`;
        } catch(e){
            return e.message;
        }
    });

    return results.join("<br>");
}

export function rm(paths){
    if(!paths.length) return "No specified file or directory";

    const results = paths.map(path => {
        try{
            const node = getNodeFromPath(path);
            const dir = node.parent;

            if(dir){
                dir.removeNode(node);
                return `${!node.isDir ? 'File' : 'Directory'} ${node.name} removed`;
            } else {
                return `Cannot remove root directory`;
            }
        } catch(e){
            return e.message;
        }
    });

    return results.join("<br>");
}

export function mv(commandArguments){
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

    // node -> renamedNode
    if(!destinationNode){
        if(sourceNode.name === "root") return "Cannot rename root directory";

        prevPath = sourceNode.path;

        const { isAbsolute, dirname, basename: newName } = parsePath(destination);

        // If the path is absolute, the segments must start with "/" even if there are no more segments to start on the root directory
        // Otherwise, the segments start on the current directory
        const destinationDir = getDirectoryFromPath(isAbsolute ? `/${dirname}` : dirname);

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

export function getNodeFromPath(path){
    return FileSystem.getNodeFromPath(path, { currentDirectory });
}

export function getFileFromPath(path){
    return FileSystem.getFileFromPath(path, { currentDirectory });
}

export function getDirectoryFromPath(path){
    return FileSystem.getDirectoryFromPath(path, { currentDirectory });
}

export function parseCommand(command){
    const regex = /"([^"]+)"|\S+/g;
    const matches = [];
    const words = command.matchAll(regex);

    words.forEach((word, index) => {
        // If exists a capture group (the match is between quotes)
        if(word[1] != undefined){
            matches.push(word[1].trim());
        } else {
            // Convert the command to lowercase
            if(index == 0) matches.push(word[0].toLowerCase().trim());
            else matches.push(word[0].trim());
        }
    })

    return matches;
}

export function parsePath(path){
    const isAbsolute = path.startsWith("/");
    const segments = path.split("/");
    const basename = segments.pop();

    return {
        isAbsolute,
        segments,
        dirname: segments.join("/"),
        basename
    }
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