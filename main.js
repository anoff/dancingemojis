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
  }

  setInterval(() => requestAnimationFrame(draw), 10);
}
