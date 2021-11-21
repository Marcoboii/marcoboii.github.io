
let allDefText = [];
let defTexts1 = [];
let defTexts0 = [];
let wordInfo = [{}, {}];
let defCount, relatedCount, exampleCount;
let rgRules1 = {
  "start": "The $adj.nr() $noun $verb.nr() $noun.nr().",
}
let rgRules2 = {
  "start": "It is a $simNoun0, a $simNoun1 and a $simNoun0.nr.It is a $simNoun1.nr, a $simNoun0.nr and a $simNoun1.nr.",
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
  maxLengthMatch: 6,
};
let markovGenOpts = {
  minLength: 8,
  allowDuplicates: false,
};
let rm1 = RiTa.markov(3, markovObjOpts);

function containQuo(inputTxt) {
  const regex = new RegExp('\\\"', 'gm');
  return regex.test(inputTxt);
}

function gen() {
  background(255);
  if (inp1.value() == wordInfo[0].input && inp2.value() == wordInfo[1].input) {
    displayResult();
  } else {
    rm1 = RiTa.markov(3, markovObjOpts);
    rg1.removeRule("adj");
    rg1.removeRule("adverb");
    rg1.removeRule("noun");
    rg1.removeRule("verb");
    allDefText = []
    defTexts1 = [];
    defTexts0 = [];
    background(255);
    defCount = 0;
    relatedCount = 0;
    exampleCount = 0;
    //***put input into variable and get their definition

    wordInfo[0].input = inp1.value();
    wordInfo[1].input = inp2.value();
    newWord = wordInfo[0].input + " " + wordInfo[1].input;
    getFromWordnik();
  }
}

function getFromWordnik() {
  for (let i = 0; i < 2; i++) {
    wordnikDef(wordInfo[i].input, i);
    wordnikRelated(wordInfo[i].input, i);
    wordnikExample(wordInfo[i].input, i);
  }
  console.log(wordInfo);
}

//***get definition
function wordnikDef(inputWord, seq) {
  var wordnikDefURL = "https://api.wordnik.com/v4/word.json/" +
    inputWord +
    "/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=" +
    wordnikKey
  loadJSON(wordnikDefURL, defLoaded);

  function defLoaded(data) {
    wordInfo[seq].def = [];


    for (let i = 0; i < data.length; i++) {
      if (data[i].text)(wordInfo[seq].def.push(data[i].text));
    }
    defCount++;
    afterLoad();

  }

}

function wordnikRelated(inputWord, seq) {
  wordInfo[seq].noun = [];
  var wordnikRelatedURL =
    "https://api.wordnik.com/v4/word.json/" + inputWord + "/relatedWords?useCanonical=true&limitPerRelationshipType=20&api_key=" + wordnikKey
  loadJSON(wordnikRelatedURL, relatedLoaded);

  function relatedLoaded(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].relationshipType == "synonym") {
        wordInfo[seq].synonym = data[i].words;
      }
      if (data[i].relationshipType == "same-context") {
        wordInfo[seq].sameContext = data[i].words;
      }
    }
    relatedCount++;
    afterLoad();
  }
}

function wordnikExample(inputWord, seq) {
  wordInfo[seq].example = [];

  var wordnikExampleURL =
    "https://api.wordnik.com/v4/word.json/" + inputWord + "/examples?includeDuplicates=false&useCanonical=true&limit=50&api_key=" + wordnikKey
  loadJSON(wordnikExampleURL, exampleLoaded);

  function exampleLoaded(data) {
    for (let i = 0; i < data.examples.length; i++) {
      if (!containQuo(data.examples[i].text)) {
        wordInfo[seq].example.push(data.examples[i].text);
      }
    }
    wordInfo[seq].example = _.uniq(wordInfo[seq].example);
    exampleCount++;
    afterLoad();
  }
}


function afterLoad() {
  console.log(defCount, relatedCount, exampleCount);
  if (defCount == 2 && relatedCount == 2 && exampleCount == 2) {
    setGen();
    displayResult();
  }
}

function setGen() {
  let defTextGrammar = [];
  let words = [];
  let adj = [];
  let adverb = [];
  let verb = [];
  let noun = [];
  let simNoun0 = [];
  let simNoun1 = [];
  let pushAmt = 20;
  for (let i = 0; i < 2; i++) {
    if (wordInfo[i].def.length < pushAmt)(pushAmt = wordInfo[i].def.length);
  }

  for (let i = 0; i < pushAmt; i++) {
    for (let j = 0; j < 2; j++) {
      console.log(wordInfo[j].def[i]);
      defTextGrammar.push(wordInfo[j].def[i]);
    }
  }



  let grammarOpts = {
    tense: RiTa.PRESENT,
    number: RiTa.PLURAL,
    person: RiTa.THIRD,
  };

  for (let j = 0; j < defTextGrammar.length; j++) {
    //***get rid of html codes and proposition
    defTextGrammar[j] = defTextGrammar[j].replace(propoRegex, ',');
    //***sort def to different part of speeches
    words.push(RiTa.tokens(defTextGrammar[j]));
    words = _.flatten(words);
  }
  for (let i = 0; i < words.length; i++) {
    if (RiTa.isAdverb(words[i])) {
      adverb.push(words[i]);
    } else if (RiTa.isAdjective(words[i])) {
      adj.push(words[i]);
    } else if (RiTa.isNoun(words[i])) {
      noun.push(RiTa.pluralize(words[i]));
    } else if (RiTa.isVerb(words[i])) {
      verb.push(RiTa.conjugate(words[i], grammarOpts));
    }
  }
  rg1.addRule("noun", noun.join('|'));
  rg1.addRule("verb", verb.join('|'));
  rg1.addRule("adj", adj.join('|'));
  rg1.addRule("adv", adverb.join('|'));


  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < wordInfo[j].sameContext.length; i++) {
      if (RiTa.isNoun(wordInfo[j].sameContext[i])) {
        wordInfo[j].noun.push(wordInfo[j].sameContext[i]);
      }
    }
  }

  rg2.addRule("simNoun0", wordInfo[0].noun.join('|'));
  rg2.addRule("simNoun1", wordInfo[1].noun.join('|'));

  rm1.addText(wordInfo[0].example);
  rm1.addText(wordInfo[1].example);
  rm1.addText(wordInfo[0].def);
  rm1.addText(wordInfo[1].def);
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < wordInfo[0].def.length; i++) {
      if(!wordInfo[j].def[i].match(/\(|\</gm)){
        rm1.addText(wordInfo[j].def[i]);
      }
    }

  }
}
