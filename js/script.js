import * as Terminal from "./FileSystem/Terminal.js";

const explorer = document.querySelector(".explorer");
const terminal = document.querySelector(".terminal");

let dragInfo = {
    element: null,
    isDragging: false,
    x: undefined,
    y: undefined,
    relativeX: undefined,
    relativeY: undefined
}

//! ACTIONS
let clickActions = [];
let submitActions = [];

function actionOnClick(selector, callback) {
    clickActions.push({ selector, callback });
}

function actionOnSubmit(selector, callback) {
    submitActions.push({ selector, callback });
}

// Window actions
actionOnClick(".bar-icon", (e, target) => {
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
})

actionOnClick(".window", (e) => {
    const clickedWindow = e.target.closest(".window");

    // Bring the window to the front
    const windows = document.querySelectorAll(".window");
    windows.forEach(w => w.classList.remove("active"));
    clickedWindow.classList.add("active");
})

actionOnClick(".top-bar", (e) => {
    dragInfo.x = e.clientX;
    dragInfo.y = e.clientY;
    dragInfo.isDragging = true;
    dragInfo.element = e.target;
    dragInfo.relativeX = e.clientX - e.target.parentElement.offsetLeft;
    dragInfo.relativeY = e.clientY - e.target.parentElement.offsetTop;
});

actionOnClick(".minimize", (e) => {
    const clickedWindow = e.target.closest(".window");
    clickedWindow.classList.add("hidden");
})

actionOnClick(".maximize", (e) => {
    const clickedWindow = e.target.closest(".window");
    clickedWindow.classList.toggle("maximized");
    clickedWindow.style.top = "";
    clickedWindow.style.left = "";
})

actionOnClick(".close", (e) => {
    const clickedWindow = e.target.closest(".window");
    clickedWindow.classList.add("hidden");
})

// Terminal actions
actionOnClick(".terminal", e => {
    const currentWindow = e.target.closest(".window");
    const input = currentWindow.querySelector("input.input");
    setTimeout(() => input.focus(), 0);
})

actionOnSubmit(".input-bar", e => {
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
            console.error(error.message);
        }
    }

    input.value = "";
    currentWindow.querySelector(".content").scrollTo(0, currentWindow.querySelector(".content").scrollHeight);
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
    clickActions.forEach(({ selector, callback }) => {
        let target = e.target.closest(selector);
        if (target) {
            callback(e, target);
        }
    })
})

window.addEventListener("mousemove", e => {
    const x = e.clientX;
    const y = e.clientY;

    if (dragInfo.isDragging && dragInfo.element) {
        dragInfo.element.parentElement.style.left = `${x - dragInfo.relativeX}px`;
        dragInfo.element.parentElement.style.top = `${y - dragInfo.relativeY}px`;
    }
})

window.addEventListener('mouseup', e => {
    dragInfo = {
        element: null,
        isDragging: false,
        x: undefined,
        y: undefined,
        relativeX: undefined,
        relativeY: undefined
    }
})

window.addEventListener("keydown", e => {
    Terminal.handleKeyDown(e);
})

window.addEventListener("load", () => {
    const terminalWindow = document.querySelector(".terminal");
    terminalWindow.querySelector(".input-bar .pre-input").innerHTML = Terminal.getPreInput() + "$";
})