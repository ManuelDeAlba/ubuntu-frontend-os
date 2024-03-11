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

export function pwd() {
    return currentDirectory.getPath();
}

export function cd(ruta) {
    if(!ruta){
        currentDirectory = rootFolder;
        return "";
    }

    ruta.split("/").forEach(segment => {
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
    const node = new Node(file);
    currentDirectory.addNode(node);
    return `File ${file} created`;
}

export function write(file, content){
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