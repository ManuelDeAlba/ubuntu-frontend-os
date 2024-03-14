import Node from './Node.js';

export const ROOT_FOLDER = new Node("root", true);

//? DEFAULT FOLDERS AND FILES
const folder1 = new Node("folder1", true);

let file = new Node("file.txt");
file.addContent("Hello, world!");

ROOT_FOLDER.addNode(folder1);
ROOT_FOLDER.addNode(file);

folder1.addNode(new Node("file2.txt"));
folder1.addNode(new Node("folder2", true));