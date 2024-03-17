import * as Explorer from "./Explorer.js";
import * as Terminal from "./Terminal.js";
import { clamp } from "./utils.js";

const explorer = document.querySelector(".explorer");
const folders = explorer.querySelector(".folders");

const terminal = document.querySelector(".terminal");

let dragInfo = {
    element: null,
    isDragging: false,
    edge: null,
    isResizing: false,
    x: undefined,
    y: undefined,
    w: undefined,
    h: undefined,
    relativeX: undefined,
    relativeY: undefined
}

//! ACTIONS
let clickActions = [];
let submitActions = [];

function actionOnClick({ selector, strict=false, callback }) {
    // The strict parameter is used to determine if the selector should be exact or not
    clickActions.push({ selector, strict, callback });
}

function actionOnSubmit({ selector, callback }) {
    submitActions.push({ selector, callback });
}

// Task bar actions
actionOnClick({
    selector: ".bar-icon",
    callback: (e, target) => {
        const currentWindow = document.querySelector(target.dataset.window);

        if(currentWindow.matches(".hidden")){
            // If the window is hidden, show it
            currentWindow.classList.remove("hidden");
        } else if(currentWindow.matches(".active")){
            // If the window is visible and active, hide it
            currentWindow.classList.add("hidden");
        }

        // Bring the window to the front
        const windows = document.querySelectorAll(".window");
        windows.forEach(w => w.classList.remove("active"));
        if(!currentWindow.matches(".hidden")) currentWindow.classList.add("active");
    }
})

// Window actions
actionOnClick({
    selector: ".window",
    callback: (e) => {
        // Check the edges
        const edge = e.target;
        const clickedWindow = e.target.closest(".window");

        // Bring the window to the front
        const windows = document.querySelectorAll(".window");
        windows.forEach(w => w.classList.remove("active"));
        clickedWindow.classList.add("active");

        dragInfo.x = e.clientX;
        dragInfo.y = e.clientY;
        dragInfo.w = clickedWindow.offsetWidth;
        dragInfo.h = clickedWindow.offsetHeight;
        dragInfo.isResizing = true;
        dragInfo.edge = edge;
    }
})

actionOnClick({
    selector: ".top-bar",
    strict: true,
    callback: (e, target) => {
        dragInfo.x = e.clientX;
        dragInfo.y = e.clientY;
        dragInfo.isDragging = true;
        dragInfo.element = target;
        dragInfo.relativeX = e.clientX - target.parentElement.offsetLeft;
        dragInfo.relativeY = e.clientY - target.parentElement.offsetTop;
    }
});

actionOnClick({
    selector: ".minimize",
    callback: (e) => {
        const clickedWindow = e.target.closest(".window");
        clickedWindow.classList.add("hidden");
    }
})

actionOnClick({
    selector: ".maximize",
    callback: (e) => {
        const clickedWindow = e.target.closest(".window");
        clickedWindow.classList.toggle("maximized");

        if(clickedWindow.matches(".maximized")){
            clickedWindow.style.top = "";
            clickedWindow.style.left = "";
            clickedWindow.style.width = "";
            clickedWindow.style.height = "";
        }
    }
})

actionOnClick({
    selector: ".close",
    callback: (e) => {
        const clickedWindow = e.target.closest(".window");
        clickedWindow.classList.add("hidden");

        // When the terminal is closed, reset it
        if(clickedWindow.matches(".terminal")){
            const result = Terminal.reset();
            clickedWindow.querySelector(".text").innerHTML = result.map(line => `<p>${line}</p>`).join("");
        }
    }
})

// Explorer actions
actionOnClick({
    selector: ".folder",
    callback: (e, target) => {
        const path = target.dataset.path;
        
        // If the target is a file, don't do anything
        if(target.matches(".file")){
            const { name, path:filePath, content } = Explorer.readFile(path);
            alert(`Name: ${name}\nPath: ${filePath}\nContent: ${content}`);
        } else {
            Explorer.changeDirectory(path);
            folders.innerHTML = Explorer.generateExplorer();
        }
    }
})

actionOnClick({
    selector: ".back",
    callback: () => {
        Explorer.goBack();
        folders.innerHTML = Explorer.generateExplorer();
    }
})

actionOnClick({
    selector: ".forward",
    callback: () => {
        Explorer.goForward();
        folders.innerHTML = Explorer.generateExplorer();
    }
})

const backBtn = document.querySelector(".back");
const forwardBtn = document.querySelector(".forward");

// Terminal actions
actionOnClick({
    selector: ".terminal",
    callback: e => {
        const currentWindow = e.target.closest(".window");
        const input = currentWindow.querySelector("input.input");
        setTimeout(() => input.focus(), 0);
    }
})

actionOnSubmit({
    selector: ".input-bar",
    callback: e => {
        const currentWindow = e.target.closest(".window");
        const text = currentWindow.querySelector(".text");
        const preInput = e.target.querySelector(".pre-input");
        const input = e.target.querySelector("input");
        const command = input.value;

        try {
            const result = Terminal.execute(command);

            if (result) text.innerHTML = result.map(line => `<p>${line}</p>`).join("");
            preInput.innerHTML = Terminal.getPreInput() + "$";
        } catch (error) {
            if(error.code == 0){
                // Close the terminal due to the exit command
                terminal.classList.add("hidden");
                const result = Terminal.reset();
                text.innerHTML = result.map(line => `<p>${line}</p>`).join("");
            } else {
                console.error(error.stack);
            }
        }

        input.value = "";
        currentWindow.querySelector(".content").scrollTo(0, currentWindow.querySelector(".content").scrollHeight);
    }
})

//! EVENTS
window.addEventListener("submit", e => {
    e.preventDefault();
    submitActions.forEach(({ selector, callback }) => {
        let target = e.target.closest(selector);
        if (target) {
            callback(e, target);
        }
    })
})

window.addEventListener('mousedown', e => {
    clickActions.forEach(({ selector, strict, callback }) => {
        let target;
        if(strict) target = e.target.matches(selector) ? e.target : null;
        else target = e.target.closest(selector);

        if (target) callback(e, target);
    })
})

window.addEventListener("mousemove", e => {
    const x = e.clientX;
    const y = e.clientY;

    // Draw the window
    if (dragInfo.isDragging && dragInfo.element) {
        const currentWindow = dragInfo.element.closest(".window");
        currentWindow.style.left = `${clamp(x - dragInfo.relativeX, -currentWindow.scrollWidth/2, innerWidth-currentWindow.scrollWidth/2)}px`;
        currentWindow.style.top = `${clamp(y - dragInfo.relativeY, 0, window.innerHeight-currentWindow.scrollHeight/2)}px`;
    }

    // Resize the window
    if(dragInfo.isResizing && dragInfo.edge){
        const currentWindow = dragInfo.edge.closest(".window");
        
        const minWidth = 250;
        const minHeight = 250;

        if(dragInfo.edge.matches(".left")){
            let dx = -(x - dragInfo.x); // Difference between the start x and the current x
            if(dragInfo.w + dx < minWidth) return; // If the new width is less than the minimum, don't move the window

            const newWidth = clamp(dragInfo.w + dx, minWidth, window.innerWidth - currentWindow.offsetLeft);
            const newLeft = clamp(x, 0, window.innerWidth - currentWindow.offsetWidth);

            currentWindow.style.width = `${newWidth}px`;
            currentWindow.style.left = `${newLeft}px`;
        }
        if(dragInfo.edge.matches(".right")){
            const newWidth = clamp(x - currentWindow.offsetLeft, minWidth, window.innerWidth);
            currentWindow.style.width = `${newWidth}px`;
        }
        if(dragInfo.edge.matches(".top")){
            let dy = -(y - dragInfo.y); // Difference between the start x and the current x
            if(dragInfo.h + dy < minHeight) return; // If the new height is less than the minimum, don't move the window

            const newHeight = clamp(dragInfo.h + dy, minWidth, window.innerHeight - currentWindow.offsetTop);
            const newTop = clamp(y, 0, window.innerHeight - currentWindow.offsetHeight);

            currentWindow.style.height = `${newHeight}px`;
            currentWindow.style.top = `${newTop}px`;
        }
        if(dragInfo.edge.matches(".bottom")){
            const newHeight = clamp(y - currentWindow.offsetTop, minHeight, window.innerHeight);
            currentWindow.style.height = `${newHeight}px`;
        }
    
    }
})

window.addEventListener('mouseup', e => {
    dragInfo = {
        element: null,
        isDragging: false,
        edge: null,
        isResizing: false,
        x: undefined,
        y: undefined,
        w: undefined,
        h: undefined,
        relativeX: undefined,
        relativeY: undefined
    }
})

window.addEventListener("keydown", e => {
    Terminal.handleKeyDown(e);
})

window.addEventListener("load", () => {
    folders.innerHTML = Explorer.generateExplorer();
    terminal.querySelector(".input-bar .pre-input").innerHTML = Terminal.getPreInput() + "$";
})

function loop(){
    folders.innerHTML = Explorer.generateExplorer();
    requestAnimationFrame(loop);
}
loop();