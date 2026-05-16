const API_URL = "https://jarvis-cloud-vpmh.onrender.com";
const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d");

const ui = document.querySelector(".interface");
const core = document.getElementById("core");
const input = document.getElementById("commandInput");
const button = document.getElementById("sendCommand");
const voiceButton = document.getElementById("voiceCommand");
const log = document.getElementById("log");
const mode = document.getElementById("mode");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const lines = [];

for (let i = 0; i < 320; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    size: Math.random() * 2 + 0.4,
    alpha: Math.random() * 0.8 + 0.15
  });
}

function drawSpace() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 247, 255, ${p.alpha})`;
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 95) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0, 247, 255, ${0.08 * (1 - dist / 95)})`;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawSpace);
}

drawSpace();

let logs = [
  "[SYSTEM] AI Core initialized.",
  "[CORE] Waiting for command."
];

function addLog(text) {
  logs.push(text);
  logs = logs.slice(-4);
  log.innerHTML = logs.map(l => `<p>${l}</p>`).join("");
}

async function sendCommand() {

    const input = document.getElementById("commandInput");
    const text = input.value.trim();

    if (!text) return;

    addLog("[USER] " + text);

    input.value = "";

    try {

        const response = await fetch("/command", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                command: text
            })

        });

        const data = await response.json();

        addLog("[JARVIS] " + data.response);

        speak(data.response);

    } catch (err) {

        addLog("[ERROR] No se pudo conectar con Jarvis Cloud");

    }

}
function speak(text){

    const voice = new SpeechSynthesisUtterance(text);

    voice.lang = "es-ES";

    voice.rate = 1;

    speechSynthesis.speak(voice);

}

function speakOnPhone(text) {
  if (!("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
button.addEventListener("click", processCommand);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") processCommand();
});

document.addEventListener("mousemove", e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 28;
  const y = (e.clientY / window.innerHeight - 0.5) * 28;

  core.style.transform = `translate(-50%, -50%) rotateX(${-y}deg) rotateY(${x}deg)`;
});

setInterval(() => {
  const random = [
    "[SCAN] Neural field stable.",
    "[VOICE] Passive listening active.",
    "[MEMORY] Context synchronized.",
    "[CORE] Energy pulse normalized.",
    "[LINK] Local Jarvis bridge ready."
  ];
  addLog(random[Math.floor(Math.random() * random.length)]);
}, 4000);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "es-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceButton.addEventListener("click", () => {
    voiceButton.classList.add("listening");
    mode.textContent = "AI CORE // LISTENING";
    addLog("[VOICE] Escuchando desde teléfono...");
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    voiceButton.classList.remove("listening");
    processCommand(transcript);
  };

  recognition.onerror = () => {
    voiceButton.classList.remove("listening");
    mode.textContent = "AI CORE // IDLE";
    addLog("[ERROR] No pude escuchar bien.");
  };

  recognition.onend = () => {
    voiceButton.classList.remove("listening");
  };
} else {
  voiceButton.addEventListener("click", () => {
    addLog("[ERROR] Este navegador no soporta reconocimiento de voz.");
  });
}
