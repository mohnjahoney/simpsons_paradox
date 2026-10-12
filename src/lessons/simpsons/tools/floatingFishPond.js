export function createFloatingFishPond() {
  const pond = document.createElement("div");
  pond.className = "fish-frame fish-pond";
  pond.setAttribute("aria-label", "A water scene with red and blue fish slowly floating in place");

  const fish = [
    { color: "red", x: 11, y: 18, width: 14, height: 28, delay: -0.2, reverse: false },
    { color: "red", x: 33, y: 35, width: 18, height: 31, delay: -1.8, reverse: true },
    { color: "red", x: 15, y: 61, width: 22, height: 34, delay: -3.1, reverse: false },
    { color: "blue", x: 51, y: 19, width: 34, height: 13, delay: -2.4, reverse: true },
    { color: "blue", x: 47, y: 50, width: 43, height: 16, delay: -4.2, reverse: false },
    { color: "blue", x: 28, y: 77, width: 38, height: 14, delay: -5.3, reverse: true }
  ];

  fish.forEach((item) => {
    const image = document.createElement("img");
    image.className = "floating-fish";
    image.src = `img/fish_${item.color}.png`;
    image.alt = `${item.color} fish`;
    image.style.left = `${item.x}%`;
    image.style.top = `${item.y}%`;
    image.style.width = `${item.width}%`;
    image.style.height = `${item.height}%`;
    image.style.animationDelay = `${item.delay}s`;
    if (item.reverse) image.classList.add("reverse");
    pond.append(image);
  });

  return pond;
}
