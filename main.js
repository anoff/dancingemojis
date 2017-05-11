// get audio context and set up analyser
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.fftSize;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

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

// draw line to canvas
//  points should be arrays of [x, y]
function drawLine(ctx, points) {
  const WIDTH = ctx.width;
  ctx.beginPath();
  ctx.strokeStyle = 'rgb(69, 69, 69)';
  ctx.lineWidth = 2;
  ctx.moveTo(0, points[0][1]);
  for (let i = 1; i < points.length; i += 2) {
    const bezP = points[i - 1];
    const endP = points[i];
    ctx.quadraticCurveTo(bezP[0], bezP[1], endP[0], endP[1]);
  }
  ctx.stroke();
}

// filter points array
//  moving average of _width_
function initFilter(pointsCount, width) {
  const values = new Array(pointsCount);
  for (let i = 0; i < pointsCount; i++) {
    values[i] = new Array(width);
  }

  function mean(vals) {
    let cnt = 0;
    let sum = 0;
    for (const v of vals) {
      if (typeof v === 'number') {
        sum += v;
        cnt++;
      }
    }
    if (cnt === 0) {
      return 0;
    }
    return sum / cnt;
  }
  return points => {
    const means = [];
    // shift stuff around in the cached array
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      v.shift();
      v.push(points[i]);
      means.push(mean(v));
    }
    return means;
  }
}

// generate a rainbow color in a range of 0..1
function generateColor(pct) {
  if (pct > 1) {
    pct = 1;
  } else if (pct < 0) {
    pct = 0;
  }
  const r = Math.sin(pct * 4 * Math.PI + 0) * 127 + 128;
  const g = Math.sin(pct * 4 * Math.PI + 2 * Math.PI / 3) * 127 + 128;
  const b = Math.sin(pct * 4 * Math.PI + 4 * Math.PI / 3) * 127 + 128;
  return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
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

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // filter each bar with moving average on 23 values
  const filterPoints = initFilter(bufferLength, 23);
  const emojis = getEmoji(bufferLength);

  function draw() {
    const [WIDTH, HEIGHT] = fitScreen();
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const barWidth = (WIDTH / bufferLength) * 2.5;
    const points = [];
    for(let i = 0; i < bufferLength; i++) {
      const barX = i * (barWidth + 1);
      const barHeight = dataArray[i] / 255 * HEIGHT;

      canvasCtx.fillStyle = generateColor(i / bufferLength);
      canvasCtx.fillRect(barX, HEIGHT, barWidth, -barHeight);
      points.push([barX + barWidth / 2, HEIGHT - barHeight]);
    }
    let filtered = points
      .map(e => e[1]);
    filtered = filterPoints(filtered);
    filtered = filtered.map((e, i) => {
        return [points[i][0], e];
      });
    // drawLine(canvasCtx, filtered); // uncomment this one to draw a bezier line of median
    for (let i = 0; i < filtered.length; i++) {
      const p = filtered[i];
      // put dancing emoji
      if (p[1] < HEIGHT) { // only show if there is a bar
        canvasCtx.font = `${barWidth}px Arial`;
        canvasCtx.fillText(emojis[i], p[0] - barWidth / 2, p[1] + barWidth / 2);
      }
    }
  }

  setInterval(() => requestAnimationFrame(draw), 10);

}
