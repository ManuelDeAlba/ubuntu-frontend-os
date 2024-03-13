import Node from "./Node.js";

let user = "user";
const rootFolder = new Node("root", true);
export let currentDirectory = rootFolder;

let commands = {
    "help": () => {
        text.push(`
            ${getPreInput()}: help<br>
            Commands:<br>
            - pwd: Print the current working directory<br>
            - ls: List the contents of the current directory<br>
            - clear: Clear the terminal<br>
            - cd [path]: Change the current directory to the specified path<br>
            - cat [file]: Print the contents of the specified file<br>
            - write [file] [content]: Write the specified content to the specified file<br>
            - touch [file]: Create a new file with the specified name<br>
            - user [name]: Change the current user to the specified name<br>
        `);
        return text;
    },
    "pwd": () => {
        text.push(`${getPreInput()}: pwd`);
        text.push(`${pwd()}`);
        return text;
    },
    "ls": (commandArguments) => {
        text.push(`${getPreInput()}: ls ${commandArguments[0] || ""}`);
        text.push(ls(commandArguments[0]));
        return text;
    },
    "cd": (commandArguments) => {
        text.push(`${getPreInput()}: cd ${commandArguments[0] || ""}`);
        const res = cd(commandArguments[0]);
        if(res) text.push(res);
        return text;
    },
    "cat": (commandArguments) => {
        text.push(`${getPreInput()}: cat ${commandArguments[0] || ""}`);
        text.push(cat(commandArguments[0]));
        return text;
    },
    "write": (commandArguments) => {
        text.push(`${getPreInput()}: write ${commandArguments[0] || ""} ${commandArguments[1] || ""}`);
        text.push(write(commandArguments[0], commandArguments[1]));
        return text;
    },
    "touch": (commandArguments) => {
        text.push(`${getPreInput()}: touch ${commandArguments[0] || ""}`);
        text.push(touch(commandArguments[0]));
        return text;
    },
    "mkdir": (commandArguments) => {
        text.push(`${getPreInput()}: mkdir ${commandArguments[0] || ""}`);
        text.push(mkdir(commandArguments[0]));
        return text;
    },
    "clear": () => {
        text = [];
        return text;
    },
    "user": (commandArguments) => {
        text.push(`${getPreInput()}: user ${commandArguments[0] || ""}`);
        text.push(changeUser(commandArguments[0]));
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

export function ls(path){
    if(!path) return currentDirectory.getTree();

    try{
        const dir = getDirectoryFromPath(path);

        return dir.getTree();
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

export function cat(path){
    if(!path) return "No specified file";

    try{
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
    } catch(e){
        return e.message;
    }
}

export function write(path, content){
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

export function touch(file){
    if(!file) return "No specified file";

    try{
        const segments = file.split("/");
        const name = segments.pop();
        const dir = segments.length ? getDirectoryFromPath(segments.join("/")) : currentDirectory;

        if(dir.children.find(node => node.name === name)) return `File ${name} already exists`;

        const node = new Node(name);
        dir.addNode(node);
        return `File ${name} created`;
    } catch(e){
        return e.message;
    }
}

export function mkdir(path){
    if(!path) return "No specified name";

    try{
        const segments = path.split("/");
        const name = segments.pop();
        const dir = segments.length ? getDirectoryFromPath(segments.join("/")) : currentDirectory;

        if(dir.children.find(node => node.name === name)) return `Directory ${name} already exists`;

        const node = new Node(name, true);
        dir.addNode(node);
        return `Directory ${name} created`;
    } catch(e){
        return e.message;
    }
}

export function execute(command){
    //TODO: Implement a function to parse the command and its arguments considering quotes
    let [ executedCommand, ...commandArguments ] = command.split(" ");

    // Save the command in the history
    commandHistory.push(command);
    commandIndex = commandHistory.length;

    if(commands[executedCommand]){
        const result = commands[executedCommand](commandArguments);

        return result;
    } else {
        text.push(`${getPreInput()}: ${command} <br> Command not found: ${command}`);

        return text;
    }
}

export function changeUser(newUser="user"){
    user = newUser;
    return `User changed to ${user}`;
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