import Node from "./Node.js";

let user = "user";
const rootFolder = new Node("root", true);
export let currentDirectory = rootFolder;

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
        return text;
    },
    "pwd": () => {
        text.push(`${pwd()}`);
        return text;
    },
    "ls": (commandArguments) => {
        text.push(ls(commandArguments));
        return text;
    },
    "cd": (commandArguments) => {
        const res = cd(commandArguments[0]);
        if(res) text.push(res);
        return text;
    },
    "cat": (commandArguments) => {
        text.push(cat(commandArguments));
        return text;
    },
    "write": (commandArguments) => {
        text.push(write(commandArguments));
        return text;
    },
    "touch": (commandArguments) => {
        text.push(touch(commandArguments));
        return text;
    },
    "mkdir": (commandArguments) => {
        text.push(mkdir(commandArguments));
        return text;
    },
    "rm": (commandArguments) => {
        text.push(rm(commandArguments));
        return text;
    },
    "clear": () => {
        text = [];
        return text;
    },
    "history": () => {
        text.push(history());
        return text;
    },
    "user": (commandArguments) => {
        text.push(changeUser(commandArguments));
        return text;
    }
}

let text = [
    "Welcome to Ubuntu",
    "Type 'help' to see a list of commands",
    "Type 'clear' to clear the terminal"
];

let commandHistory = [];
let commandIndex = 0;

export function pwd() {
    return currentDirectory.getPath();
}

export function ls(paths){
    if(!paths.length) return currentDirectory.getTree();

    try{
        const results = paths.map(path => {
            const dir = getDirectoryFromPath(path);

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
        currentDirectory = rootFolder;
        return "";
    }

    try {
        const dir = getDirectoryFromPath(path);
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
            const dir = segments.length ? getDirectoryFromPath(segments.join("/")) : currentDirectory;
        
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
        const dir = segments.length ? getDirectoryFromPath(segments.join("/")) : currentDirectory;

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
            const dir = segments.length ? getDirectoryFromPath(segments.join("/")) : currentDirectory;

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
            const dir = segments.length ? getDirectoryFromPath(segments.join("/")) : currentDirectory;

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
            const segments = path.split("/");
            const name = segments.pop();
            const dir = segments.length ? getDirectoryFromPath(segments.join("/")) : currentDirectory;

            const node = dir.children.find(node => node.name === name);
            if(node){
                dir.children = dir.children.filter(node => node.name !== name);
                return `${!node.isDir ? 'File' : 'Directory'} ${name} removed`;
            } else {
                return `No such file or directory: ${name}`;
            }
        });

        return results.join("<br>");
    } catch(e){
        return e.message;
    }
}

export function history(){
    return commandHistory.map((command, index) => `${index + 1} ${command}`).join("<br>");
}

export function changeUser(newUser="user"){
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
        const result = commands[executedCommand](commandArguments);

        return result;
    } else {
        text.push(`${getPreInput()}: ${command} <br> Command not found: ${command}`);

        return text;
    }
}

export function getPreInput(){
    return `<span style="color: lightgreen;">${user}@ubuntu</span>:<span style="color: lightblue;">${pwd()}</span>`;
}

export function getDirectoryFromPath(path){
    const segments = path.split("/");
    let aux = currentDirectory;

    segments.forEach(segment => {
        if (segment === ".") return;
        if (segment === "..") {
            // If there is a parent, navigate to it
            // Otherwise, stay in the same directory
            if (aux.parent) aux = aux.parent;
        } else {
            // Search a node with the name of the segment
            const node = aux.children.find(node => node.name === segment);
            if (node && node.isDir) aux = node;
            else {
                throw new Error(`No such file or directory: ${segment}`);
            }
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
            matches.push(word[1]);
        } else {
            matches.push(word[0]);
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

//? DEFAULT FOLDERS AND FILES
const folder1 = new Node("folder1", true);
rootFolder.addNode(folder1);
let file = new Node("file.txt");
file.addContent("Hello, world!");
rootFolder.addNode(file);

folder1.addNode(new Node("file2.txt"));
folder1.addNode(new Node("folder2", true));