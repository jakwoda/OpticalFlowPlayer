var capture;
var previousPixels;
var flow;
var w = 640,
    h = 480;
var step = 10;
let polySynth;
let delay;
let flowZones=[];
let numZonesX;
let numZonesY;

var uMotionGraph, vMotionGraph;
const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;

const modelParams = {
    // flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 10,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.5,    // confidence threshold for predictions.
}


function runDetection() {
    model.detect(video).then(predictions => {
        // console.log("Predictions: ", predictions);
        model.renderPredictions(predictions, canvas, context, video);
      if (isVideo) {
            requestAnimationFrame(runDetection);
           for (i=1; i<predictions.length; i++ ){
                   if(predictions[i].label=="closed"){
                     playClosed();
     }
             if(predictions[i].label=="point"){
               // playPoint();
     }
              if(predictions[i].label=="open"){
           
            boxX=predictions[i].bbox[0];
            boxY=predictions[i].bbox[1];
            boxW=predictions[i].bbox[2];
            boxH=predictions[i].bbox[3];
            console.log(boxX,boxY,boxW,boxH);
            // rect(boxX,boxY,boxW,boxH);
            ellipse(boxX+boxW/2,boxY+boxH/2,30);
             playOpen(boxX,boxY,boxW,boxH);
     }
              if(predictions[i].label=="face"){
               // playFace();
     }
             if(predictions[i].label=="pinch"){
               // playPinch();
     }
           }
        }
     });    

}
   
// Load the model
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    // updateNote.innerText = "Loaded Model!"
    // trackButton.disabled = false
});

function setup() {
    createCanvas(w, h);
    numZonesX=floor(w/(step*2));
  numZonesY=floor(h/(step*2));
  //canvas for flow
    capture = createCapture({
        audio: false,
        video: {
            width: w,
            height: h
          
        }
     
    })
   userStartAudio();
    capture.hide();
    flow = new FlowCalculator(step);
  //video for handtracking
    startVideo();
  
    polySynth = new p5.PolySynth();
    delay = new p5.Delay();
}



function draw() {
    capture.loadPixels();
  calculateFlow();
    
}
function calculateFlow(){
  if (capture.pixels.length > 0) {
        if (previousPixels) {

            // cheap way to ignore duplicate frames
            if (same(previousPixels, capture.pixels, 4, width)) {
                return;
            }

            flow.calculate(previousPixels, capture.pixels, capture.width, capture.height);
        }
        previousPixels = copyImage(capture.pixels, previousPixels);
      
        image(capture, 0, 0, w, h);
 
        if (flow.flow && flow.flow.u != 0 && flow.flow.v != 0) {
 flowZones=flow.flow.zones;
            strokeWeight(2);
         stroke(0,0,255);
            flow.flow.zones.forEach(function(zone) {
            line(zone.x, zone.y, zone.x + zone.u, zone.y + zone.v);
            
            })
             
        }

    }
   

}


//play sound mappings
function playSynth(dur, vel, time, pitch) {


  // notes can overlap with each other
polySynth.play(pitch, vel, time, dur);

}

function noteValue(flow){
  let noteValue = midiDic[floor(map(flow,-10,10,mouseX/10+1,mouseY/10+1))];
  return noteValue; 
}
  // delay.process() accepts 4 parameters:
  // source, delayTime (in seconds), feedback, filter frequency

function playClosed(){
    pitch = noteValue(flow.flow.u);
  playSynth(abs(flow.flow.u)/2, abs(flow.flow.v)/20, 0.01, pitch);
  // delay.process(playSynth, 0.12, 0.7, 2300);
  
  console.log(pitch)
}

function playOpen(boxX,boxY,boxW,boxH){

  zoneX=floor(boxX/(step*2));
  zoneY=floor(boxY/(step*2));
  zoneNr=zoneY*numZonesX+zoneX;
currentFlowZone=flowZones[zoneNr];
console.log(currentFlowZone);
    pitch = noteValue(flow.flow.v);
  playSynth(abs(currentFlowZone.u)/2, abs(currentFlowZone.v)/20 , 0.01, pitch);

  console.log(pitch)
}
function mouseDragged(){
  pitch = noteValue(flow.flow.u);
  playSynth(abs(flow.flow.u)/2, abs(flow.flow.v)/20, 0.01, pitch);
  
  console.log(pitch)
}

//Utilities
//note dictionarrry
const midiDic = {0: "C0", 1: "C#0", 2: "D0", 3: "D#0", 4: "E0", 5: "F0", 6: "F#0", 7: "G0", 8: "G#0", 9: "A0", 10: "A#0", 11: "B0", 
12: "C1", 13: "C#1", 14: "D1", 15: "D#1", 16: "E1", 17: "F1", 18: "F#1", 19: "G1", 20: "G#1", 21: "A1", 22: "A#1", 23: "B1",
24: "C2", 25: "C#2", 26: "D2", 27: "D#2", 28: "E2", 29: "F2", 30: "F#2", 31: "G2", 32: "G#2", 33: "A2", 34: "A#2", 35: "B2",
36: "C3", 37: "C#3", 38: "D3", 39: "D#3", 40: "E3", 41: "F3", 42: "F#3", 43: "G3", 44: "G#3", 45: "A3", 46: "A#3", 47: "B3",
48: "C4", 49: "C#4", 50: "D4", 51: "D#4", 52: "E4", 53: "F4", 54: "F#4", 55: "G4", 56: "G#4", 57: "A4", 58: "A#4", 59: "B4",
60: "C5", 61: "C#5", 62: "D5", 63: "D#5", 64: "E5", 65: "F5", 66: "F#5", 67: "G5", 68: "G#5", 69: "A5", 70: "A#5", 71: "B5",
72: "C6", 73: "C#6", 74: "D6", 75: "D#6", 76: "E6", 77: "F6", 78: "F#6", 79: "G6", 80: "G#6", 81: "A6", 82: "A#6", 83: "B6",
84: "C7", 85: "C#7", 86: "D7", 87: "D#7", 88: "E7", 89: "F7", 90: "F#7", 91: "G7", 92: "G#7", 93: "A7", 94: "A#7", 95: "B7",
96: "C8", 97: "C#8", 98: "D8", 99: "D#8", 100: "E8", 101: "F8", 102: "F#9", 103: "G9", 104: "G#9", 105: "A9", 106: "A#9", 107: "B9",
108: "C9", 109: "C#9", 110: "D9", 111: "D#9", 112: "E9", 113: "F9", 114: "F#9", 115: "G9", 116: "G#9", 117: "A9", 118: "A#9", 119: "B9",
120: "C10", 121: "C#10", 122: "D10", 123: "D#10", 124: "E10", 125: "F10", 126: "F#10", 127: "G10"};




function copyImage(src, dst) {
    var n = src.length;
    if (!dst || dst.length != n) dst = new src.constructor(n);
    while (n--) dst[n] = src[n];
    return dst;
}

function same(a1, a2, stride, n) {
    for (var i = 0; i < n; i += stride) {
        if (a1[i] != a2[i]) {
            return false;
        }
    }
    return true;
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}