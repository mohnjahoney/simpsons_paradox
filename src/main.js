import { createApp } from "./app.js";
import { simpsonsLesson } from "./lessons/simpsons/index.js";

createApp(document.querySelector("#app"), simpsonsLesson);
