class Node {
    constructor(name, isDir=false) {
        this.parent = null;
        this.path = "/" + name;
        this.name = name;
        this.isDir = isDir;
        this.content = null;
        this.children = [];
    }

    addContent(content){
        if (!this.isDir) this.content = content;
        else throw new Error("Cannot add content to a directory");
    }

    getContent(){
        return this.content;
    }

    addNode(node) {
        this.children.push(node);
        node.parent = this;
        node.path = this.path + "/" + node.name;
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