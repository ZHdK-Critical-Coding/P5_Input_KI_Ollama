# P5.js: Ollama

[English](readme.md)

Zwei KI-Personas unterhalten sich endlos über einen Ollama-Server. Jede
Antwort wird gestreamt und wird zum Prompt für die andere Seite; der Dialog
(auf Deutsch) wird als scrollender Chat mit Sprechboxen links und rechts
gezeichnet. Ein Ausgangspunkt, um ein lokales Sprachmodell in einem Sketch
zu verwenden.

## Installation

Voraussetzungen: ein laufender Ollama-Server (siehe Server).

Bibliotheken (in `libraries/`): p5.js 1.10.0, p5.sound 1.0.1 (eingebunden,
nicht verwendet), ollama-js 0.5.17 (Browser-Build, `ollama_browser.mjs`).

## Server

Braucht einen [Ollama](https://ollama.com)-Server auf Port 11434 mit dem
Modell `gpt-oss` (`ollama pull gpt-oss`), auf demselben Computer oder auf
einem anderen Rechner im Netzwerk. Vor dem Sketch starten (Ollama-App
oder `ollama serve`). Auf einem anderen Rechner muss er im Netzwerk
erreichbar sein (`OLLAMA_HOST=0.0.0.0 ollama serve`); `OLLAMA_ORIGINS`
(z. B. `"*"`) erlaubt Browser-Anfragen von anderen Origins. `ollama_host`
oben in `sketch.js` auf die Adresse des Servers setzen (Standard
`http://192.168.2.8:11434`, z. B. `http://127.0.0.1:11434` bei einer
lokalen Installation).

## Ausführen

1. Den Ordner in Visual Studio Code öffnen und Live Server starten (in der
   Statusleiste auf **Go Live** klicken).
2. Blockiert der Browser die Anfragen (CORS), den Origin auf dem Server
   erlauben (`OLLAMA_ORIGINS`, siehe Server) oder die Debugger-Konfiguration
   **Launch Chrome (no Security)** starten (Panel Run and Debug).
3. Die Unterhaltung startet automatisch mit "Wie denkst du über den Mars?".

## Coding-Hilfe

- **`index.html`**: importiert `Ollama` aus `libraries/ollama_browser.mjs`
  als ES-Modul, legt es in `window.ollama` ab und lädt erst dann
  `sketch.js`.
- **Konfiguration oben in `sketch.js`**: `ollama_host`, `defaultSentence`
  (erste Zeile des Dialogs) und `temperature`. Es werden zwei Clients
  erstellt: `ollama` ("DR", links) und `ollama2` ("EM", rechts).
- **`chat(actor, lastSentence)`**: ruft `actor.generate()` mit dem Modell
  `gpt-oss`, `stream: true` und einem System-Prompt je nach Persona auf: DR
  stellt kurze, kritische Fragen, EM antwortet provokant. Modell und
  System-Prompts hier ändern. Die Sampling-Optionen (`top_k`, `top_p`,
  `repeat_penalty`) werden bei jedem Aufruf leicht zufällig variiert.
  Die gestreamten Teile werden an einen neuen Eintrag in `stack` angehängt;
  ist die Antwort fertig, ruft sich `chat()` mit der anderen Persona selbst
  auf.
- **`setup()`**: setzt die Layout-Werte und startet die Unterhaltung mit
  `chat(ollama2)`.
- **`draw()`**: zeigt einen Wartehinweis, bis die erste Antwort da ist, und
  zeichnet dann jeden Eintrag von `stack` als Box (links oder rechts je nach
  `align`) und scrollt automatisch nach unten. `textHeight()` berechnet die
  Boxhöhe für umbrochenen Text.
