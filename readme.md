# P5 -> Ollama

A p5.js sketch in which two AI personas talk to each other endlessly via a
local Ollama server. Each answer is streamed and becomes the prompt for the
other side; the dialogue (in German) is drawn as a scrolling chat with left
and right speech boxes.

## How to Use

1. Install [Ollama](https://ollama.com) and pull the model the sketch
   expects: `ollama pull gpt-oss`.
2. Set `ollama_host` at the top of `sketch.js` to the address of your Ollama
   server (e.g. `http://127.0.0.1:11434` for a local install). If the server
   runs on another machine, it must listen on the network
   (`OLLAMA_HOST=0.0.0.0`).
3. Start Live Server (click **Go Live** in the VS Code status bar).
4. If the browser blocks the requests (CORS), allow the origin on the server
   (`OLLAMA_ORIGINS`) or start the debugger configuration
   **Launch Chrome (no Security)** (Run and Debug panel).
5. The conversation starts automatically with "Wie denkst du über den Mars?".

## How it Works

Two `Ollama` clients call `generate()` with different system prompts:
"DR" asks short, critical questions, "EM" answers provocatively. Sampling
parameters (`top_k`, `top_p`, `repetition_penalty`) are slightly randomised
on every call. When a streamed answer is complete, `chat()` calls itself with
the other persona.

## Libraries

- p5.js 1.10.0
- p5.sound 1.0.1
- ollama-js 0.5.17 (browser build, `libraries/ollama_browser.mjs`)
