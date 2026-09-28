// Host-Adresse des Ollama-Servers (lokal im Netzwerk laufend)
const ollama_host = 'http://192.168.2.8:11434'

// Zwei Ollama-Instanzen werden erstellt, mit leicht unterschiedlichen Optionen.
// ollama → hat eigene Header, ollama2 → Standardkonfiguration.
const ollama = new window.ollama({ host: ollama_host, headers: { 'User-Agent': 'MyApp/1.0' }})
const ollama2 = new window.ollama({ host: ollama_host })

// Start-Satz für die Konversation (von "DR")
const defaultSentence = "DR: Wie denkst du über den Mars?"

// Variablen für das Layout und die Textanzeige
let padding, chatbox_width, right_offset, boxpadding;
let scroll_offset = 0    // Scroll-Verschiebung für den Chatverlauf
let temperature = 1      // Temperatur für die Generierung (Kreativität)
const stack = [{
  align: 0,              // 0 = links (DR), 1 = rechts (EM)
  content: defaultSentence
}]
let initialized = false  // Wurde die Unterhaltung gestartet?

// Asynchrone Chatfunktion zwischen zwei "Sprechern"
async function chat(actor, lastSentence) {
  // Falls kein letzter Satz übergeben → Standardsatz verwenden
  lastSentence = lastSentence || defaultSentence

  // Anfrage an Ollama → Generierung starten (Streaming aktiviert)
  const response = await actor.generate({
    model: 'gpt-oss',
    prompt: lastSentence,
    stream: true,
    // Unterschiedliche Rollen je nach Instanz (ollama vs. ollama2)
    system: actor === ollama
      ? `Stelle eine Frage passend zur Eingabe in reinem Deutsch. Stil: politisch bewusster linker Philosoph à la Douglas Rushkoff. 
        Sei scharfzüngig, kritisch, reflektiert, maximal 128 Zeichen, keine Zeilenumbrüche, keine Leerzeilen.`
      : `Antwort nur in reinem Deutsch . Stil: rechter CEO à la Elon Musk. 
        Sei provokant, unter 512 Zeichen, keine Zeilenumbrüche, keine Leerzeilen. 
        Beantworte die Frage.`,
    think: 'low',
    options: {
      // Sampling-Optionen mit leichter Variation für Diversität
      temperature: temperature,
      top_k: Math.floor(50 + Math.random() * 100), // variiert zwischen 50–150
      top_p: 0.85 + Math.random() * 0.1,           // leichte Abweichung bei nucleus sampling
      repeat_penalty: 1.05 + Math.random() * 0.1
    }
  });

  initialized = true
  let localAnswer = ""   // Zwischenspeicher für Antwort
  const currentStack  = {
    align: actor === ollama ? 0 : 1,             // Sprecher-Position (links oder rechts)
    content: actor === ollama ? "DR: " : "EM: " // Vorsilbe für Sprecher
  }
  stack.push(currentStack)

  // Streaming → Antwortteile werden nacheinander empfangen
  for await (const part of response) {
    currentStack.content += part.response
    localAnswer += part.response
  }

  console.log(stack)

  // Rollenwechsel: wenn ollama antwortet → ollama2 antwortet zurück, und umgekehrt
  chat(actor === ollama ? ollama2 : ollama, localAnswer)
}

// Hilfsfunktion zur Berechnung der Textbox-Höhe für Umbrüche
function textHeight(text, maxWidth) {
  var words = text.split(' ');
  var line = '';
  var h = textLeading() - textDescent();
  for (var i = 0; i < words.length; i++) {
    var testLine = line + words[i] + ' ';
    var testWidth = textWidth(testLine);
    if (testWidth > maxWidth && i > 0) {
      // Umbruch nötig → neue Zeile beginnen
      line = words[i] + ' ';
      h += textLeading();
    } else {
      line = testLine;
    }
  }
  return h;
}

// p5.js Setup-Funktion
function setup() {
  createCanvas(windowWidth, windowHeight);
  padding = 20
  chatbox_width = width / 2 - (padding * 1.5)
  right_offset = chatbox_width + padding
  boxpadding = padding / 4
  background(0);
  fill(255);
  textSize(16);
  textWrap(WORD)

  // Start der Unterhaltung (ollama2 beginnt)
  chat(ollama2);
}

// p5.js Draw-Funktion (wird wiederholt aufgerufen)
function draw() {
  background(0);

  if (!initialized) {
    // Solange noch keine Antwort da ist → Wartehinweis
    text(`Waiting for first response from ${ollama_host}`, 20,40);
  }
  else {
    // Chatverlauf zeichnen
    translate(0, -scroll_offset)
    let vertical_offset = 0;
    stack.forEach((block) => {
      const boxheight =  textHeight(block.content, chatbox_width)
      push()
        noFill()
        stroke(255)
        // Zeichne Rahmen um Textblock
        rect(
          padding + (block.align * right_offset) - boxpadding,
          padding + vertical_offset - boxpadding,
          chatbox_width + (2*boxpadding),
          boxheight + (2*boxpadding),
          boxpadding
        )
      pop()
      // Zeichne den Text (links oder rechts ausgerichtet)
      text(block.content, padding + (block.align * right_offset), padding + vertical_offset, chatbox_width);
      vertical_offset += boxheight + padding
    })

    // Automatisches Scrollen nach unten, falls Chat zu lang wird
    if (vertical_offset + padding > height + scroll_offset) {
      scroll_offset = vertical_offset + padding - height
    }
  }
}