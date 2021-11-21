// some of the code is copied from Daniel Shiffman
// Def of rainbow
const propoRegex = /[^a-zA-z](<.+>|An|an|aboard|about|above|across|after|against|along|amid|among|anti|around|as|at|before|behind|below|beneath|beside|besides|between|beyond|but|by|concerning|considering|despite|down|during|except|excepting|excluding|following|for|from|in|inside|into|like|minus|near|of|off|on|onto|opposite|outside|over|past|per|plus|regarding|round|save|since|than|through|to|toward|towards|under|underneath|unlike|until|up|upon|versus|via|with|within|without)/g;
const htmlRegex = /<[a-zA-Z]*>|<\/[a-zA-Z]*>/g
let inp1, inp2;
let okButton, regenButton;
let newWord;
let userword = [];
let allDefText = [];
let defTexts1 = [];
let defTexts0 = [];
let wordInfo = [{}, {}];
let defCount, relatedCount, exampleCount;
let rgRules1 = {
  "start": "The $adj.nr() $noun $verb.nr() $noun.nr().",
}
let rgRules2 = {
  "start": "It is $simNoun0, $simNoun1 and $simNoun0.nr.It is $simNoun1.nr, $simNoun0.nr and $simNoun1.nr.",
}
let rgRules3 = {
  "start": "It is a work of art, a mystery, a sensation and a lifestyle.",
}
let wordnikKey = "13sbuiermi5tg6yuci6gdrza80r8bzr1kndgf29b142efkril"

// load our grammar
let rg1 = new RiTa.grammar(rgRules1);
let rg2 = new RiTa.grammar(rgRules2);
let rg3 = new RiTa.grammar(rgRules3);

let markovObjOpts = {
  maxLengthMatch: 5,
};
let markovGenOpts = {
  minLength: 6,
};
let rm1 = RiTa.markov(3, markovObjOpts);
let result;
let generated;
let drawSeq = 0;
let currentMillis = 0;
//rules: A
//A theoretical economic system characterized by the collective ownership of property and by the organization of labor for the common advantage of all members.
//A ADJ CLUSTER          NOUN   VERB             ADJ CLUSTER    NOUN
//The conscious use of the imagination in the production of objects intended to be contemplated or appreciated as beautiful, as in the arrangement of forms, sounds, or words.
//An economic system in which the means of production and distribution are privately or corporately owned and development occurs through the accumulation and reinvestment of profits gained in a free market.
//A domesticated carnivorous mammal <em>(Canis familiaris</em> syn. <em>Canis lupus</em> subsp. <em>familiaris)</em> occurring as a wide variety of breeds, many of which are traditionally used for hunting, herding, drawing sleds, and other tasks, and are kept as pets.


function setup() {
  //***canvas and configs
  createCanvas(windowWidth, windowHeight);

  background(255);
  stroke(255);
  //***make the inputs
  let inputWidth = 150;
  let inputDistance = 25;
  inp1 = createInput("");
  inp2 = createInput("");
  inp1.position(width / 2 - inputWidth - inputDistance - 8, 20);
  inp2.position(width / 2 + inputDistance, 20);
  inp1.size(inputWidth);
  inp2.size(inputWidth);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("+", width / 2, 70);
  //***make the buttons
  //***ok button to get def
  okButton = createButton("Write a poem for me");
  okButton.style('width', '150px');
  okButton.position(width / 2 - 75, 100);
  okButton.mousePressed(gen);
  //regenButton.position(60, 60);
  //regenButton.mousePressed(displayResult);
}

function draw() {
  background(255);
  noStroke();
  textSize(15);
  fill(0);
  if (generated == true) {
    for (let i = 0; i < drawSeq; i++) {
      text(result[i], width / 2, 200 + i * 20);
    }
    drawSeq = constrain(int((millis() - currentMillis) / 1000), 0, result.length);
  }


}

function displayResult() {

  result = [];

  for (let i = 0; i < 9; i++) {
    if (i < 3) {
      result.push(rg1.expand());
    } else if (i < 4) {
      result.push(" ");
    } else if (i < 5) {
      result.push(rm1.generate(3, markovGenOpts));
    } else if (i < 6) {
      result.push(" ");
    } else if (i < 7) {
      console.log(rg2.expand().match(/[^\.!\?]+[\.!\?]+/g));
      result.push(rg2.expand().match(/[^\.!\?]+[\.!\?]+/g));
    } else if (i < 8) {
      result.push(" ");
    } else {
      result.push(rg3.expand());
    }
  }
  result = _.flatten(result);
  for (let i = 0; i < result.length; i++) {}
  generated = true;
  drawSeq = 0;
  currentMillis = millis();
}
