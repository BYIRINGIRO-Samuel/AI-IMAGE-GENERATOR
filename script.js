const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const galleryGrid = document.querySelector(".gallery-grid");

// Example prompts
const examplePrompts = [
  "A futuristic city skyline at sunset, with flying cars and neon lights reflecting off glass skyscrapers",
  "A peaceful Japanese village during cherry blossom season, with Mt. Fuji in the background and a river flowing through",
  "A magical forest with glowing mushrooms, floating lanterns, and a small wooden cottage in the middle",
  "Cyberpunk girl with purple hair and a robotic arm, standing in a rainy street lit by holographic ads",
  "A surreal desert landscape with floating islands, giant hourglasses, and a lone traveler on a camel",
  "An astronaut exploring an alien planet with blue vegetation, three moons in the sky, and crystal-like mountains",
  "An ancient library filled with floating books, spiral staircases, and golden glowing runes on the walls",
  "Cute cat wearing a wizard hat, casting spells in a cozy potion lab surrounded by candles and scrolls",
  "A steampunk-style airship flying over a Victorian-era city, with smoke rising from chimneys and clock towers",
  "A dramatic ocean wave frozen in time, with a surfer mid-air, and glowing jellyfish swimming inside the wave",
];


const API_KEY = process.env.HF_TOKEN || "YOUR_API_KEY_HERE";

// Utility: get image dimensions
const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scale = baseSize / Math.sqrt(width * height);
  const calculatedWidth = Math.floor((width * scale) / 16) * 16;
  const calculatedHeight = Math.floor((height * scale) / 16) * 16;
  return { width: calculatedWidth, height: calculatedHeight };
};

// Update image card in the gallery
const updateImageCard = (index, base64Image) => {
  const card = document.getElementById(`img-card-${index}`);
  if (!card) return;
  card.classList.remove("loading");
  card.innerHTML = `
    <img src="data:image/png;base64,${base64Image}" class="result-img" alt="Generated Image">
    <div class="img-overlay">
      <a href="data:image/png;base64,${base64Image}" class="img-download-button" download="${Date.now()}.png">
        <i class="fa-solid fa-download"></i>
      </a>
    </div>`;
};

// Generate images (uses Craiyon API as fallback)
const generateImages = async (count, aspectRatio, promptText) => {
  generateBtn.setAttribute("disabled", true);

  const imagePromises = Array.from({ length: count }, async (_, i) => {
    try {
      const response = await fetch("https://backend.craiyon.com/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(`HTTP ${response.status}: ${errMsg}`);
      }

      const result = await response.json();
      const base64Image = result.images[i];
      updateImageCard(i, base64Image);
    } catch (err) {
      console.error(`Error generating image ${i}:`, err.message);
      const card = document.getElementById(`img-card-${i}`);
      if (card) {
        card.classList.replace("loading", "error");
        card.querySelector(".status-text").textContent = "Generation failed!";
      }
    }
  });

  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
};

// Create image cards in the gallery
const createImageCards = (count, aspectRatio, promptText) => {
  galleryGrid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    galleryGrid.innerHTML += `
      <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
        <div class="status-container">
          <div class="spinner"></div>
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p class="status-text">Generating...</p>
        </div>
      </div>`;
  }
  generateImages(count, aspectRatio, promptText);
};

// Handle form submission
const handleFormSubmit = (e) => {
  e.preventDefault();

  const promptText = promptInput.value.trim();
  const count = parseInt(countSelect.value, 10);
  const aspectRatio = ratioSelect.value;

  if (!promptText || !count || !aspectRatio) {
    alert("Please fill out all fields!");
    return;
  }

  createImageCards(count, aspectRatio, promptText);
};

// Theme toggle
const toggleTheme = () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

// Initialize theme
(() => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

// Event listeners
themeToggle.addEventListener("click", toggleTheme);
promptForm.addEventListener("submit", handleFormSubmit);
promptBtn.addEventListener("click", () => {
  promptInput.value = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
});
