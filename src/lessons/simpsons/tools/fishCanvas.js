import { clamp } from "../math.js";

export function createFishCanvas() {
  const frame = document.createElement("div");
  frame.className = "fish-frame";

  const canvas = document.createElement("canvas");
  canvas.className = "fish-canvas";
  canvas.setAttribute("aria-label", "A small water scene with two draggable fish");
  canvas.tabIndex = 0;
  frame.append(canvas);

  const context = canvas.getContext("2d");
  const images = {
    red: new Image(),
    blue: new Image()
  };

  const fish = [
    { color: "red", image: images.red, x: 118, y: 154, width: 150, height: 76 },
    { color: "blue", image: images.blue, x: 330, y: 110, width: 180, height: 72 }
  ];

  let activeFish = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let width = 0;
  let height = 0;
  let pixelRatio = window.devicePixelRatio || 1;

  images.red.src = "img/fish_red.png";
  images.blue.src = "img/fish_blue.png";
  images.red.addEventListener("load", draw);
  images.blue.addEventListener("load", draw);

  function resize() {
    const rect = frame.getBoundingClientRect();
    width = Math.max(320, Math.round(rect.width));
    height = Math.round(width * 0.56);
    pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    keepFishInBounds();
    draw();
  }

  function draw() {
    drawWater(context, width, height);

    fish.forEach((item) => {
      drawFishImage(context, item, item.x, item.y, item.width, item.height);
    });
  }

  function keepFishInBounds() {
    fish.forEach((item) => {
      item.x = clamp(item.x, 0, width - item.width);
      item.y = clamp(item.y, 0, height - item.height);
    });
  }

  function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function getFishAt(x, y) {
    return [...fish].reverse().find((item) => {
      return x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height;
    });
  }

  canvas.addEventListener("pointerdown", (event) => {
    const point = getPointerPosition(event);
    const target = getFishAt(point.x, point.y);
    if (!target) return;

    activeFish = target;
    dragOffsetX = point.x - activeFish.x;
    dragOffsetY = point.y - activeFish.y;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
  });

  canvas.addEventListener("pointermove", (event) => {
    const point = getPointerPosition(event);

    if (!activeFish) {
      canvas.classList.toggle("can-drag", Boolean(getFishAt(point.x, point.y)));
      return;
    }

    activeFish.x = clamp(point.x - dragOffsetX, 0, width - activeFish.width);
    activeFish.y = clamp(point.y - dragOffsetY, 0, height - activeFish.height);
    draw();
  });

  canvas.addEventListener("pointerup", releaseFish);
  canvas.addEventListener("pointercancel", releaseFish);
  canvas.addEventListener("pointerleave", () => {
    if (!activeFish) canvas.classList.remove("can-drag");
  });

  function releaseFish(event) {
    if (event.pointerId !== undefined && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    activeFish = null;
    canvas.classList.remove("is-dragging");
  }

  const observer = new ResizeObserver(resize);
  observer.observe(frame);
  window.requestAnimationFrame(resize);

  return frame;
}

function drawWater(context, width, height) {
  context.clearRect(0, 0, width, height);

  const water = context.createLinearGradient(0, 0, 0, height);
  water.addColorStop(0, "#cfeeea");
  water.addColorStop(1, "#80bfc5");
  context.fillStyle = water;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(255, 255, 255, 0.3)";
  for (let i = 0; i < 8; i += 1) {
    const x = ((i * 97) + 22) % Math.max(width, 1);
    const y = 34 + ((i * 43) % Math.max(height - 70, 1));
    context.beginPath();
    context.arc(x, y, 4 + (i % 3) * 3, 0, Math.PI * 2);
    context.fill();
  }
}

function drawFishImage(context, fish, x, y, width, height) {
  if (fish.image.complete && fish.image.naturalWidth > 0) {
    context.drawImage(fish.image, x, y, width, height);
    return;
  }

  context.fillStyle = fish.color;
  context.fillRect(x, y, width, height);
}
