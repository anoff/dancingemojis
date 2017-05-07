// https://github.com/mdn/web-speech-api/blob/master/speech-color-changer/script.js, CC0
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var colors = [ 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
//recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 3;

const wordSpan = document.querySelector('.words');

['onaudiostart', 'onaudioend', 'onstart', 'onend', 'onresult', 'onsoundstart', 'onsoundend', 'onspeechstart', 'onspeechend'].forEach(elm => {
  recognition[elm] = evt => console.log(elm + ' fired');
});

recognition.onresult = function(event) {
  const latest = event.results[event.results.length - 1];
  const results = Array.from(latest).map(e => e.transcript);

  console.log(results.join(', '));
  wordSpan.innerHTML = results.join(', ');
}

recognition.onnomatch = function(event) {
  console.log("I didn't recognise that color.");
}

recognition.onerror = function(event) {
  console.log('Error occurred in recognition: ' + event.error);
}

recognition.start();


