//Parameter

// osc
let osc1_wave = "sawtooth"; // sin squ saw tri
let osc1_pitch = 0; // -1~+1 octave
let osc1_vol = 1; // 0~1

let osc2_wave, osc2_pitch, osc2_detune, osc2_vol;

let noise_vol;

let master_vol;

// bpf
const bpf_freq = [150, 220, 350, 500, 760, 1100, 1600, 2200, 3600, 5200]

const bpf_q = 7;

let carBpfInput;
const carBpf = [];

let modBpfInput;
const modBpf =[];

let mic;


let activeVoices = new Map();

function noteOn(note) {
  
  if(activeVoices.has(note)) return;
  
  const osc1_freq = midiToFreq(note) * 2**osc1_pitch ;
  const osc2_freq = midiToFreq(note) * 2**osc2_pitch * 2**(osc2_detune/1200);
  
  const osc1 = new p5.Oscillator(osc1_freq, osc1_wave);
  const osc2 = new p5.Oscillator(osc2_freq, osc2_wave);
  const noise = new p5.Noise();

  
  osc1.amp(osc1_vol);
  osc2.amp(osc2_vol);
  noise.amp(noise_vol);

  
  osc1.disconnect();
  osc2.disconnect();
  noise.disconnect();
  
  osc1.connect(carBpfInput);
  osc2.connect(carBpfInput);
  noise.connect(carBpfInput);
  
  osc1.start();
  osc2.start();
  noise.start()
  
  activeVoices.set(note, { osc1, osc2, noise });
  
}

function noteOff(note) {
  const voice = activeVoices.get(note);
  if (voice) {
    voice.osc1.stop();
    voice.osc2.stop();
    voice.noise.stop();
    activeVoices.delete(note);
  }
}

function applyEnvelope(){
  for(let i = 0; i < bpf_freq.length; i++) {
    const level = modBpf[i].follower.getLevel();
    carBpf[i].bandGain.amp(level);
  }
}

function initVoc() {
  userStartAudio();
  
  carBpfInput = new p5.Gain();
  carBpfInput.disconnect();
  for (let i = 0; i < bpf_freq.length; i++) {
    let bandGain = new p5.Gain()
    bandGain.connect()
    
    let ftr = new p5.Filter("bandpass");
    ftr.set(bpf_freq[i], bpf_q);
    
    ftr.disconnect();
    ftr.connect(bandGain);
  
    
    carBpfInput.connect(ftr);
    
    carBpf.push({ftr, bandGain});
  }
  
  modBpfInput = new p5.Gain();
  modBpfInput.disconnect()
  modBpfInput.amp(master_vol);
  
  mic = new p5.AudioIn();
  mic.connect(modBpfInput);
  mic.start();
   
  for (let i = 0; i < bpf_freq.length; i++) {


    let follower = new p5.Amplitude();
    let ftr = new p5.Filter("bandpass");
    ftr.set(bpf_freq[i], bpf_q);
    
    ftr.disconnect()
    ftr.connect(follower)
    
    modBpfInput.connect(ftr);
  
    modBpf.push({ftr, follower});
  }
}

function applyParam() {
  if(osc1_wave_slider.value() == 0) osc1_wave = "sine" 
  if(osc1_wave_slider.value() == 1) osc1_wave = "square" 
  if(osc1_wave_slider.value() == 2) osc1_wave = "sawtooth" 
  if(osc1_wave_slider.value() == 3) osc1_wave = "triangle" 
  osc1_pitch = osc1_pitch_slider.value();
  osc1_vol = osc1_vol_slider.value();

  if(osc2_wave_slider.value() == 0) osc2_wave = "sine" 
  if(osc2_wave_slider.value() == 1) osc2_wave = "square" 
  if(osc2_wave_slider.value() == 2) osc2_wave = "sawtooth" 
  if(osc2_wave_slider.value() == 3) osc2_wave = "triangle" 
  osc2_pitch = osc2_pitch_slider.value();
  osc2_detune = osc2_detune_slider.value();
  osc2_vol = osc2_vol_slider.value();

  noise_vol = noise_slider.value();
  master_vol = amp_slider.value();
}

function setup() {

  createCanvas(400, 300);
  background(220);
  line(200, 0, 200, 200)
  line(0, 200, 400, 200)
  textSize(20);
  text("OSC1", 10, 20)
  text("OSC2", 210, 20)
  textSize(12)
  osc1_wave_slider = createSlider(0, 3, 2, 1);
  osc1_wave_slider.position(10, 40);
  osc1_wave_slider.size(80);
  text("sin squ saw tri", 10, 70);
  text("wave", 100, 55);
  
  osc1_pitch_slider = createSlider(-1, 1, 0, 1);
  osc1_pitch_slider.position(10, 80);
  osc1_pitch_slider.size(80);
  text("-1          0         +1", 10, 110);
  text("octave", 100, 95);
  
  osc1_vol_slider = createSlider(0, 1, 1, 0.05);
  osc1_vol_slider.position(10, 120);
  osc1_vol_slider.size(80);
  text(" 0                         1", 10, 150);
  text("volume", 100, 135);  
  
  noise_slider = createSlider(0, 1, 0, 0.05);
  noise_slider.position(10, 160);
  noise_slider.size(80);
  text(" 0                         1", 10, 190);
  text("noise", 100, 175);
  
  
  
  osc2_wave_slider = createSlider(0, 3, 2, 1);
  osc2_wave_slider.position(210, 40);
  osc2_wave_slider.size(80);
  text("sin squ saw tri", 210, 70);
  text("wave", 300, 55);
  
  osc2_pitch_slider = createSlider(-1, 1, 0, 1);
  osc2_pitch_slider.position(210, 80);
  osc2_pitch_slider.size(80);
  text("-1          0         +1", 210, 110);
  text("octave", 300, 95);
  
  osc2_detune_slider = createSlider(-50, 50, 0, 1);
  osc2_detune_slider.position(210, 120);
  osc2_detune_slider.size(80);
  text(" 0                         1", 210, 150);
  text("detune", 300, 135);  
  
  osc2_vol_slider = createSlider(0, 1, 0, 0.05);
  osc2_vol_slider.position(210, 160);
  osc2_vol_slider.size(80);
  text(" 0                         1", 210, 190);
  text("volume", 300, 175);
  
  
  
  amp_slider = createSlider(0, 100, 50, 1);
  amp_slider.position(10,210);
  amp_slider.size(280);
  text("master volume", 300, 225);
  frameRate(30);
  
  applyParam();
  initVoc();

  readMidi();
}

function draw() {
  applyEnvelope();
  applyParam();
}

function readMidi(){
  navigator.requestMIDIAccess().then(midiAccess => {
  for (let input of midiAccess.inputs.values()) {
    input.onmidimessage = (msg) => {
      const [status, note, velocity] = msg.data;
      if (status === 0x90 && velocity > 0) noteOn(note);
      else if (status === 0x80 || (status === 0x90 && velocity === 0)) noteOff(note);
    }
  }
});
}



