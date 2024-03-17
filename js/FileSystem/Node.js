class Node {
    constructor(name, isDir=false) {
        this.parent = null;
        this.path = name == "root" ? "/" : `/${name}`;
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
        if(this.parent && this.name != "root") this.path = this.parent.path + "/" + this.name;
        // If the parent is the root, remove the first "/"
        this.path = this.path.replaceAll("//", "/");
    }

    getPath(){
        return this.path;
    }

    getTree(level=0){
        let result = "";
        let spaces = "|---".repeat(level);
        result += `${spaces} ${(this.isDir ? "📁 " : "📄 ")} ${this.name}<br>`;

        // Repeat the process for all the children
        let sortedChildren = this.children.toSorted((a,b) => {
            // Sort directories first (only if they are different types)
            if(a.isDir && !b.isDir) return -1;
            if(!a.isDir && b.isDir) return 1;

            // Sort by name if the types are the same
            return a.name.localeCompare(b.name);
        });
        sortedChildren.forEach((child) => result += child.getTree(level + 1));

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