var fs = require('fs');
var { add } = require('date-fns');


var M = 4294967296,
    A = 1664525,
    C = 1;

function PSNG(){
  this.Z = Math.floor(Math.random() * M);
  this.next = function(){
    this.Z = (A * this.Z + C) % M;
    return this.Z / M - 0.5;
  }
}

function Interpolate(pa, pb, px){
  var ft = px * Math.PI,
    f = (1 - Math.cos(ft)) * 0.5;
  return pa * (1 - f) + pb * f;
}


function Perlin(amp, wl, width){
  this.x = 0;
  this.amp = amp;
  this.wl = wl;
  this.fq = 1 / wl;
  this.psng = new PSNG();
  this.a = this.psng.next();
  this.b = this.psng.next();
  this.pos = [];
  while(this.x < width){
    if(this.x % this.wl === 0){
      this.a = this.b;
      this.b = this.psng.next();
      this.pos.push(this.a * this.amp);
    }else{
      this.pos.push(Interpolate(this.a, this.b, (this.x % this.wl) / this.wl) * this.amp);
    }
    this.x++;
  }
}

//octave generator
function GenerateNoise(amp, wl, octaves, divisor, width){
  var result = [];
  for(var i = 0; i < octaves; i++){
    result.push(new Perlin(amp, wl, width));
    amp /= divisor;
    wl /= divisor;
  }
  return result;
}

//combines octaves together
function CombineNoise(pl){
  var result = {pos: []};
  for(var i = 0, total = 0, j = 0; i < pl[0].pos.length; i++){
    total = 0;
    for(j = 0; j < pl.length; j++){
      total += pl[j].pos[i];
    }
    result.pos.push(total);
  }
  return result;
}

let noise = CombineNoise(GenerateNoise(128, 128, 8, 2, 361)).pos

// someObject = someObject.slice(0, 361);

const refDate = new Date(2024, 0, 1, 0, 0);

noise = noise.map((val, index) => {
  return {
    val: Math.max(0, val),
    time: add(refDate, {minutes: 2*index}),
  }
});

const stringData =  JSON.stringify(noise, undefined, 2);
// console.log(stringData);

fs.writeFile('data_pm.json', stringData, 'utf8', () => {});