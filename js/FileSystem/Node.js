class Node {
    constructor(name, isDir=false) {
        this.parent = null;
        this.path = "/" + name;
        this.name = name;
        this.isDir = isDir;
        this.content = null;
        this.children = [];
    }

    setName(name){
        this.name = name;
        this.updatePath();
    }

    addContent(content){
        if (!this.isDir) this.content = content;
        else throw new Error("Cannot add content to a directory");
    }

    getContent(){
        return this.content;
    }

    findNode(name){
        return this.children.find((child) => child.name === name);
    }

    addNode(node) {
        this.children.push(node);
        node.setParent(this);
    }

    removeNodeByName(name) {
        this.children = this.children.filter((child) => child.name !== name);
    }

    removeNode(node) {
        this.children = this.children.filter((child) => child !== node);
    }

    setParent(parent){
        this.parent = parent;
        this.updatePath();
    }

    updatePath(){
        if(this.parent) this.path = this.parent.path + "/" + this.name;
    }

    getPath(){
        return this.path;
    }

    getTree(level=0){
        let result = "";
        let spaces = "|---".repeat(level);
        result += `${spaces} ${(this.isDir ? "📁 " : "📄 ")} ${this.name}<br>`;

        // Repeat the process for all the children
        this.children.forEach((child) => result += child.getTree(level + 1));

        return result;
    }

    printTree(level=0){
        let spaces = "|---".repeat(level);
        console.log(spaces + (this.isDir ? "📁 " : "📄 ") + this.name);

        // Repeat the process for all the children
        this.children.forEach((child) => child.printTree(level + 1));
    }
}

export default Node;