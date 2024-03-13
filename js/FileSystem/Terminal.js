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
    "ls": () => {
        text.push(`${getPreInput()}: ls`);
        text.push(currentDirectory.getTree());
        return text;
    },
    "cd": (commandArguments) => {       
        text.push(`${getPreInput()}: cd ${commandArguments[0] || ""}`);
        cd(commandArguments[0]);
        return text;
    },
    "cat": (commandArguments) => {
        text.push(`${getPreInput()}: cat ${commandArguments[0] || ""}`);
        text.push(cat(commandArguments[0]));
        return text;
    },
    "touch": (commandArguments) => {
        text.push(`${getPreInput()}: touch ${commandArguments[0] || ""}`);
        text.push(touch(commandArguments[0]));
        return text;
    },
    "write": (commandArguments) => {
        text.push(`${getPreInput()}: write ${commandArguments[0] || ""} ${commandArguments[1] || ""}`);
        text.push(write(commandArguments[0], commandArguments[1]));
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

export function cd(path) {
    if(!path){
        currentDirectory = rootFolder;
        return "";
    }

    path.split("/").forEach(segment => {
        if (segment === ".") return;
        if (segment === "..") {
            // If there is a parent, go to it
            // Otherwise, stay in the same directory
            if (currentDirectory.parent) {
                currentDirectory = currentDirectory.parent;
            }
        } else{
            // Search a node with the name of the segment
            const node = currentDirectory.children.find(node => node.name === segment);
            if (node && node.isDir) currentDirectory = node;
            else {
                text.push(`No such file or directory: ${segment}`);
            }
        }
    })

}

export function cat(path){
    if(!path){
        text.push("No specified file");
        return "";
    }

    const segments = path.split("/");
    const file = segments.pop();
    let aux = currentDirectory;

    // Navigate to the directory
    segments.forEach(segment => {
        if (segment === ".") return;
        if (segment === "..") {
            // If there is a parent, navigate to it
            // Otherwise, stay in the same directory
            if (aux.parent) aux = aux.parent;
        } else{
            // Search a node with the name of the segment
            const node = aux.children.find(node => node.name === segment);
            if (node && node.isDir) aux = node;
            else {
                text.push(`No such file or directory: ${segment}`);
            }
        }
    })

    // Read the content of the file
    const node = aux.children.find(node => node.name === file);
    if(node && !node.isDir) return node.getContent();
    else {
        text.push(`No such file: ${file || ""}`);
        return "";
    }
}

export function touch(file){
    if(!file){
        text.push("No specified file");
        return "";
    }

    const node = new Node(file);
    currentDirectory.addNode(node);
    return `File ${file} created`;
}

export function write(file, content){
    if(!file){
        text.push("No specified file");
        return "";
    }

    const node = currentDirectory.children.find(node => node.name === file);
    if(node && !node.isDir){
        node.addContent(content);
        return `Content written to ${file}`;
    } else {
        text.push(`No such file: ${file || ""}`);
        return "";
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

export function getPreInput(){
    return `<span style="color: lightgreen;">${user}@ubuntu</span>:<span style="color: lightblue;">${pwd()}</span>`;
}

export function changeUser(newUser="user"){
    user = newUser;
    text.push(`User changed to ${user}`);
    return "";
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

//! TESTS
// console.log("\n\n" + pwd());
// currentDirectory.printTree();
// cd("folder1");

// console.log("\n\n" + pwd());
// currentDirectory.printTree();
// cd("folder2");

// console.log("\n\n" + pwd());
// currentDirectory.printTree();
// cd("../..");

// console.log("\n\n" + pwd());
// currentDirectory.printTree();
// cd("..");

// console.log("\n\n" + pwd());
// currentDirectory.printTree();
// console.log('file.txt:\n' + cat("file.txt"));
// cd("folder1/folder2");

// console.log("\n\n" + pwd());
// currentDirectory.printTree();