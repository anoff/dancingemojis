// set up fps
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//document.body.appendChild( stats.domElement );

// get audio context and set up analyser
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();

// init the audio source
if (navigator.getUserMedia) {
  console.log('getUserMedia supported.');
  navigator.getUserMedia ({ audio: true }, stream => {
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    visualize();
  }, err => {
    console.log('The following error occured: ' + err);
  });
} else {
   console.log('getUserMedia not supported on your browser!');
}

// set up canvas context for visualizer
const canvas = document.querySelector('.visualizer');
const canvasCtx = canvas.getContext('2d');

// resize
function fitScreen() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return [canvas.width, canvas.height]
}

// filter points array
//  moving average of _width_
function initFilter(pointsCount, width) {
  let values = new Array(pointsCount).fill(0);
  let lastUpdate = Date.now();
  return points => {
    const now = Date.now();
    const elapsedTime = now - lastUpdate;
    // smooth each element
    values = values.map((e, i) => {
      e += elapsedTime * ( points[i] - e ) / 123;
      return e;
    });
    lastUpdate = now;
    return values;
  }
}

// random emojis
//  return an array of emojis
function getEmoji(count = 1) {
  const list = ['👹', '😱', '👨‍👩‍👦‍👦', '👾', '🦄', '👨‍🎓', '🔥', '🤖', '👯', '💖', '🍻', '🤔', '👀', '🎨', '😄', '😊', '😋', '😌', '😂', '💩', '👽', '👻', '😻', '😅', '👽', '🔥', '🚀', '👻', '⛄', '👾', '🍔', '😄', '🍰', '🐑', '💩', '👺', '🐢', '🙈', '🙉', '🙊', '🍣', '🍕', '🍒', '🍺', '⛩', '🌊', '🍜', '🍱'];
  return new Array(count)
  .fill(0)
  .map(e => {
    return list[Math.floor(Math.random() * list.length)];
  });
}

// start visualizing
function visualize() {

  analyser.fftSize = 128;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // filter each bar with moving average on 23 values
  const filterPoints = initFilter(bufferLength, 17);
  const emojis = getEmoji(bufferLength);

  function draw() {
    canvas.style = "display: none";
    stats.begin();
    const [WIDTH, HEIGHT] = fitScreen();
    analyser.getByteFrequencyData(dataArray);

    // clear canvas
    canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const barWidth = (WIDTH / bufferLength) * 2.5;
    const points = [];
    for(let i = 0; i < bufferLength; i++) {
      const barX = i * (barWidth + 1);
      const barHeight = dataArray[i] / 255 * HEIGHT;
      points.push([barX + barWidth / 2, HEIGHT - barHeight]);
    }
    let filtered = points
      .map(e => e[1]);
    filtered = filterPoints(filtered);
    filtered = filtered.map((e, i) => {
        return [points[i][0], e];
      });
    
    for (let i = 0; i < filtered.length; i++) {
      const p = filtered[i];
      // put dancing emoji
      for (let height = p[1] + barWidth / 2; height < HEIGHT * 1.1 /* give a little extra for bottom emojis*/; height += barWidth) {
        canvasCtx.font = `${barWidth}px Arial`;
        canvasCtx.fillText(emojis[i], p[0] - barWidth / 2, height);
      }
    }
    requestAnimationFrame(draw);
    stats.end();
    canvas.style = "display: block";
  }
  draw();
}

/*
var app = new PIXI.Application(800, 600, {backgroundColor: 0x1099bb});
document.body.appendChild(app.view);

var basicText = new PIXI.Text('Basic text in pixi');
basicText.x = 30;
basicText.y = 90;

app.stage.addChild(basicText);

var style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440
});

var richText = new PIXI.Text('Rich text with a lot of options and across multiple lines', style);
richText.x = 30;
richText.y = 180;

app.stage.addChild(richText);
*/