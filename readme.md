# P5.js: Ollama

[Deutsch](README_DE.md)

Two AI personas talk to each other endlessly via an Ollama server. Each
answer is streamed and becomes the prompt for the other side; the dialogue
(in German) is drawn as a scrolling chat with left and right speech boxes.
A starting point for using a local language model in a sketch.

## Installation

Requirements: [Ollama](https://ollama.com) running on your computer or on
the local network, with the model `gpt-oss` (`ollama pull gpt-oss`).

Set `ollama_host` at the top of `sketch.js` to the address of your Ollama
server (default `http://192.168.2.8:11434`, e.g. `http://127.0.0.1:11434`
for a local install). If the server runs on another machine, it must listen
on the network (`OLLAMA_HOST=0.0.0.0`).

Libraries (in `libraries/`): p5.js 1.10.0, p5.sound 1.0.1 (included, not
used), ollama-js 0.5.17 (browser build, `ollama_browser.mjs`).

## How to Run

1. Open the folder in Visual Studio Code and start Live Server (click
   **Go Live** in the status bar).
2. If the browser blocks the requests (CORS), allow the origin on the server
   (`OLLAMA_ORIGINS`) or start the debugger configuration
   **Launch Chrome (no Security)** (Run and Debug panel).
3. The conversation starts automatically with "Wie denkst du über den Mars?".

## Coding Help

- **`index.html`**: imports `Ollama` from `libraries/ollama_browser.mjs` as
  an ES module, stores it in `window.ollama` and only then loads
  `sketch.js`.
- **Config at the top of `sketch.js`**: `ollama_host`, `defaultSentence`
  (first line of the dialogue) and `temperature`. Two clients are created:
  `ollama` ("DR", left) and `ollama2` ("EM", right).
- **`chat(actor, lastSentence)`**: calls `actor.generate()` with the model
  `gpt-oss`, `stream: true` and a system prompt depending on the persona:
  DR asks short, critical questions, EM answers provocatively. Change model
  and system prompts here. Sampling options (`top_k`, `top_p`,
  `repeat_penalty`) are slightly randomised on each call. The streamed
  parts are appended to a new entry in `stack`; when the answer is complete,
  `chat()` calls itself with the other persona.
- **`setup()`**: sets up the layout values and starts the conversation with
  `chat(ollama2)`.
- **`draw()`**: shows a waiting message until the first answer arrives,
  then draws every entry of `stack` as a box (left or right by `align`) and
  scrolls down automatically. `textHeight()` computes the box height for
  wrapped text.
