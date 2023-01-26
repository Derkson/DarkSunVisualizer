//Constants
const FREQBYTEMAX = 255;

//program params
const visualValueCount = 256;
const svg_size_multiple = 20;
const svg_y_multiple = svg_size_multiple*1;
const svg_freq_offset = 1;

class AudioVisualizer {
    constructor(audioContext, processFrame, processError) {
      this.audioContext = audioContext;
      this.processFrame = processFrame;
      this.connectStream = this.connectStream.bind(this);
      navigator.mediaDevices.getUserMedia({ audio: true, video: false }).
      then(this.connectStream).
      catch(error => {
        if (processError) {
          processError(error);
        }
      });
    }
  
    connectStream(stream) {
      //Analyser is the main source of audio data
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      this.analyser.smoothingTimeConstant = 0.9;

      //Freq bins: pow of 2 from 32 up to 32768
      this.analyser.fftSize = visualValueCount *2;  
      
      this.initRenderLoop(this.analyser);
    }
  
    initRenderLoop() {
      //num of "bars": half of fftSize
      const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      const timeData = new Uint8Array(this.analyser.frequencyBinCount);
      const freqMin = this.analyser.minDecibels;
      const freqMax = this.analyser.maxDecibals;
      const processFrame = this.processFrame || (() => {});
  
      const renderFrame = () => {
        this.analyser.getByteFrequencyData(frequencyData);
        this.analyser.getByteTimeDomainData(timeData);
        processFrame(frequencyData,timeData,freqMin,freqMax);
  
        requestAnimationFrame(renderFrame);
      };
      requestAnimationFrame(renderFrame);
    }}
  
  
  const visualMainElement = document.querySelector('main');
  let visualElements;
  
  const init = (param) => {
    var button = document.getElementById('button');
    button.parentNode.removeChild(button);

    const audioContext = new AudioContext();

    const container = document.getElementById('container');
    const canvas = document.getElementById('canvas1');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const barWidth = canvas.width/visualValueCount;
    const ctx = canvas.getContext('2d');

    const svg = param;
    const ER = {11:'black0',10:'white0',9:'black1',8:'white1',7:'black2',6:'white2',5:'black3',4:'white3',3:'black4',2:'white4',1:'black5',0:'white5'};
    const posOffset = {11:72,10:35,9:29,8:21,7:16,6:12,5:9,4:7,3:5,2:3,1:2,0:1};
    let OGSVGSize = {};
    let OGSVGY = {};
    for( const key of Object.keys(ER)){
      OGSVGSize[key] = svg.getElementById(ER[key]).getAttributeNS(null,'r');
      OGSVGY[key] = svg.getElementById(ER[key]).getAttributeNS(null,'cy');
    }


    const processFrame = (freqData,timeData,freqMin,freqMax) => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      let freqBarHeight;
      let timeBarHeight;
      let i;
      const freqBarDisplay = () => {
        for (i = 0; i < visualValueCount; ++i) {
          freqBarHeight = freqData[i]*1.5;
          ctx.fillStyle = 'white';
          ctx.fillRect(i*barWidth,0,barWidth,freqBarHeight);

          //timeBarHeight = timeData[i]*1.5;
          //ctx.fillStyle = 'white';
          //ctx.fillRect(i*barWidth,canvas.height - timeBarHeight,barWidth,timeBarHeight);
        }
      };
      //freqBarDisplay();

      //svg adjustment
      let key;
      for(key=0; key < Object.keys(ER).length; key++){
        if((ER[key].match('black0')) || (ER[key].match('white0'))){
          var circle = svg.getElementById(ER[key]);
          var newSize = +((+freqData[+key+ +svg_freq_offset]/FREQBYTEMAX)*+svg_size_multiple) + +OGSVGSize[key];
          var newy = +OGSVGY[key] - +((+freqData[+key+ +svg_freq_offset]/FREQBYTEMAX)*+svg_y_multiple);
          circle.setAttributeNS(null,'r',newSize);
          circle.setAttributeNS(null,'cy',newy);
          continue;
        }
        if((ER[key].match('black1')) || (ER[key].match('white1'))){
          var circle = svg.getElementById(ER[key]);
          var newSize = +((+freqData[+key+ +svg_freq_offset]/FREQBYTEMAX)*+svg_size_multiple) + +OGSVGSize[key];
          var newy = +OGSVGY[key] - +((+freqData[+key+ +svg_freq_offset]/FREQBYTEMAX)*+svg_y_multiple);
          circle.setAttributeNS(null,'r',newSize);
          circle.setAttributeNS(null,'cy',newy);
          continue;
        }
        if(key > visualValueCount){
          console.log('svg greater than visualValueCount');
          break;
        }
        var circle = svg.getElementById(ER[key]);
        var newSize = +((+freqData[+key+ +svg_freq_offset]/+FREQBYTEMAX)*+svg_size_multiple) + +OGSVGSize[key];
        circle.setAttributeNS(null,'r',newSize);
      }

    };
  
    const processError = () => {
      visualMainElement.classList.add('error');
      visualMainElement.innerText = 'Allow access to your microphone';
    };
  
    const a = new AudioVisualizer(audioContext, processFrame, processError);
  };

document.getElementById('svg1').addEventListener("load", () => {
          var svgObject = document.getElementById('svg1').contentDocument;
          console.log(svgObject);
          var svg = svgObject.getElementById('external-svg');
          init(svg);
        });