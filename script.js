(function () {
  var sendBtn = document.getElementById('send-btn');
  var startScreen = document.getElementById('start-screen');
  var loadingScreen = document.getElementById('loading-screen');
  var resultScreen = document.getElementById('result-screen');
  var loadingStatus = document.getElementById('loading-status');
  var inputEl = document.querySelector('.text-input');
  var notesContent = document.querySelector('.notes-content');
  var modelSelect = document.getElementById('model-select');
  var aiOutputContentEl = document.querySelector('.ai-output-content');

  function showLoadingScreen() {
    startScreen.classList.remove('screen--active');
    resultScreen.classList.remove('screen--active');
    if (loadingScreen) loadingScreen.classList.add('screen--active');
  }

  function setLoadingStatus(text) {
    if (loadingStatus) loadingStatus.textContent = text;
  }

  function setMainContent(htmlOrText, isHtml) {
    if (!aiOutputContentEl) return;
    if (isHtml) {
      aiOutputContentEl.innerHTML = htmlOrText;
    } else {
      aiOutputContentEl.textContent = htmlOrText;
    }
  }

  function showResultScreen() {
    if (loadingScreen) loadingScreen.classList.remove('screen--active');
    startScreen.classList.remove('screen--active');
    resultScreen.classList.add('screen--active');
  }

  // —— Synonym map for paraphrasing (common words and phrases) ——
  var SYNONYMS = {

    /* -------- Quantifiers / Basics -------- */
  
    " a lot of ": " many ",
    " a great deal of ": " a large amount of ",
    " a number of ": " several ",
    " lots of ": " numerous ",
    " plenty of ": " ample ",
    " many ": " numerous ",
    " some ": " certain ",
    " much ": " considerable ",
    " little ": " minimal ",
  
    /* -------- Common Verbs -------- */
  
    " get ": " obtain ",
    " got ": " obtained ",
    " getting ": " obtaining ",
    " buy ": " purchase ",
    " bought ": " purchased ",
    " help ": " assist ",
    " helped ": " assisted ",
    " show ": " demonstrate ",
    " showed ": " demonstrated ",
    " start ": " begin ",
    " started ": " began ",
    " stop ": " cease ",
    " stopped ": " ceased ",
    " use ": " utilize ",
    " used ": " utilized ",
    " make ": " create ",
    " made ": " created ",
    " think ": " consider ",
    " thought ": " considered ",
    " want ": " desire ",
    " wanted ": " desired ",
    " need ": " require ",
    " needed ": " required ",
    " try ": " attempt ",
    " tried ": " attempted ",
  
    /* -------- Modifiers -------- */
  
    " really ": " genuinely ",
    " very ": " highly ",
    " quickly ": " rapidly ",
    " slowly ": " gradually ",
    " often ": " frequently ",
    " sometimes ": " occasionally ",
    " always ": " consistently ",
  
    /* -------- Adjectives -------- */
  
    " big ": " large ",
    " small ": " modest ",
    " good ": " beneficial ",
    " bad ": " unfavorable ",
    " important ": " significant ",
    " different ": " distinct ",
    " same ": " identical ",
    " new ": " novel ",
    " old ": " previous ",
    " great ": " substantial ",
    " easy ": " straightforward ",
    " hard ": " challenging ",
    " difficult ": " demanding ",
    " simple ": " uncomplicated ",
    " complex ": " intricate ",
  
    /* -------- Nouns -------- */
  
    " kids ": " children ",
    " people ": " individuals ",
    " someone ": " an individual ",
    " problem ": " issue ",
    " thing ": " aspect ",
    " stuff ": " matter ",
    " way ": " manner ",
    " nothing ": " no aspect ",
    " everything ": " all ",
  
    /* -------- Softening / Hedging -------- */
  
    " kind of ": " somewhat ",
    " sort of ": " rather ",
    " a bit ": " slightly ",
    " a little ": " somewhat ",
  
    /* -------- Phrase Compression -------- */
  
    " in order to ": " to ",
    " due to the fact that ": " because ",
    " at this point in time ": " now ",
    " in the near future ": " soon ",
    " at the end of the day ": " ultimately ",
    " when it comes to ": " regarding ",
    " in terms of ": " concerning ",
    " as a matter of fact ": " in fact ",
    " the fact that ": " that ",
    " whether or not ": " whether ",
    " each and every ": " each ",
    " for the purpose of ": " for ",
  
    /* -------- Verb Phrases -------- */
  
    " find out ": " discover ",
    " look at ": " examine ",
    " come up with ": " devise ",
    " put up with ": " tolerate ",
    " deal with ": " address ",
    " work on ": " develop ",
    " go on ": " continue ",
    " set up ": " establish ",
    " take place ": " occur ",
    " take part ": " participate ",
    " carry out ": " perform ",
    " point out ": " indicate ",
    " figure out ": " determine ",
    " end up ": " conclude ",
    " turn out ": " result ",
  
    /* -------- Logical / Discourse -------- */
  
    " however ": " nevertheless ",
    " therefore ": " thus ",
    " moreover ": " furthermore ",
    " also ": " additionally ",
    " because ": " since ",
    " although ": " though ",
    " while ": " whereas ",
  
    /* -------- Ordering / Time-neutral -------- */
  
    " first ": " initially ",
    " second ": " subsequently ",
    " last ": " finally ",
    " then ": " thereafter ",
    " now ": " at present ",
    " today ": " in the present day ",
    " here ": " in this context ",
    " there ": " in that context ",
  
    /* -------- Opinion / Framing -------- */
  
    " in my opinion ": " I think ",
    " it seems that ": " apparently ",
    " it is clear that ": " clearly ",
    " it is important to note that ": " notably ",
    " it should be noted that ": " note that ",
    " it is possible that ": " possibly ",
    " it is likely that ": " likely ",
    " it is unlikely that ": " unlikely ",
    " in summary ": " to summarize ",
  
    /* -------- Ability / Action -------- */
  
    " has the ability to ": " can ",
    " have the ability to ": " can ",
    " make a decision ": " decide ",
    " make a choice ": " choose ",
    " make an effort ": " try ",
    " take action ": " act ",
    " give permission ": " allow ",
  
    /* -------- Impact -------- */
  
    " have an impact ": " affect ",
    " have an effect ": " affect ",
    " play a role ": " matter ",
  
    /* -------- Conflict / Security -------- */
  
    " armed forces were deployed to the region ": " forces were deployed ",
    " military action was taken against ": " action was taken against ",
    " the conflict escalated after ": " the conflict escalated ",
    " tensions increased between the groups ": " tensions increased ",
    " fighting broke out in the area ": " fighting began ",
    " civilians were caught in the conflict ": " civilians were affected ",
    " the ceasefire agreement was violated ": " the ceasefire was violated ",
    " negotiations failed to reach an agreement ": " negotiations failed ",
    " control of the area was contested ": " control was contested ",
    " the situation deteriorated rapidly ": " the situation worsened ",
    " armed groups were involved in clashes ": " armed groups clashed ",
    " the operation resulted in casualties ": " the operation caused casualties ",
  
    /* -------- Politics / Governance -------- */
  
    " government officials announced plans to ": " officials announced plans to ",
    " lawmakers debated the issue extensively ": " lawmakers debated the issue ",
    " the decision was met with criticism ": " the decision faced criticism ",
    " public response was divided over ": " public response was divided ",
    " the initiative received bipartisan support ": " the initiative received support ",
    " leadership changes resulted in ": " leadership changes resulted in ",
  
    /* -------- Science / Research -------- */
  
    " researchers conducted a study to ": " researchers studied ",
    " data indicates a correlation between ": " data shows a correlation between ",
    " the experiment demonstrated a link ": " the experiment showed a link ",
    " further research is required to ": " further research is needed to ",
    " conclusions were drawn based on evidence ": " conclusions were evidence-based ",
  
    /* -------- Environment -------- */
  
    " rising temperatures have led to ": " rising temperatures caused ",
    " ecosystems are under increasing pressure ": " ecosystems face pressure ",
    " deforestation has resulted in habitat loss ": " deforestation caused habitat loss ",
    " wildlife populations declined as a result of ": " wildlife populations declined due to ",
  
    /* -------- Analysis / Reporting -------- */
  
    " this suggests a broader trend toward ": " this suggests a trend toward ",
    " the outcome depends largely on ": " the outcome depends on ",
    " the findings underscore the importance of ": " the findings underscore the importance of ",
    " limitations of the study include ": " limitations include "
  };
  

  // Academic-style additions (more formal)
  var ACADEMIC_EXTRA = {
    " get ": " obtain ",
    " help ": " assist ",
    " show ": " demonstrate ",
    " think ": " argue ",
    " say ": " state ",
    " said ": " stated ",
    " tell ": " indicate ",
    " know ": " recognize ",
    " believe ": " contend ",
    " feel ": " suggest ",
    " look ": " appear ",
    " seem ": " appear ",
    " maybe ": " perhaps ",
    " probably ": " likely ",
    " might ": " may ",
    " lots ": " numerous ",
    " thing ": " element ",
    " stuff ": " material ",
    " good ": " effective ",
    " bad ": " ineffective ",
    " big ": " considerable ",
    " small ": " limited ",
    " important ": " crucial ",
    " really ": " indeed ",
    " very ": " highly ",
    " just ": " merely ",
    " actually ": " in fact ",
    " basically ": " fundamentally ",
    " In summary": " In conclusion",
    " In conclusion": " To summarize"
  };

  function applyReplacements(text, map) {
    var result = " " + text + " ";
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var replacement = map[key];
      var regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      result = result.replace(regex, function (match) {
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1).trim() + " ";
        }
        return replacement;
      });
    }
    return result.trim();
  }

  function paraphraseNormal(text) {
    var normalized = text.replace(/\s+/g, " ").trim();
    return applyReplacements(normalized, SYNONYMS);
  }

  function paraphraseAcademic(text) {
    var normalized = text.replace(/\s+/g, " ").trim();
    var combined = Object.assign({}, SYNONYMS, ACADEMIC_EXTRA);
    var result = applyReplacements(normalized, combined);
    if (!/^(In conclusion|To summarize|Thus|Therefore)/i.test(result)) {
      result = "In summary, " + result;
    }
    return result;
  }

  // Words/phrases that suggest a sentence states an important fact
var IMPORTANCE_KEYWORDS = [

  // Core importance
  "important","importance","importantly",
  "key","key point","key factor","main","mainly","primary","primarily",
  "critical","crucial","essential","vital","fundamental","central","core",
  "major","significant","significance","notable","substantial","meaningful",

  // Obligation / necessity
  "must","must be","should","required","requirement",
  "necessary","necessity","need to","needs to","cannot be ignored",

  // Cause & effect
  "because","because of","therefore","thus","hence",
  "as a result","result","results in","resulting",
  "cause","causes","caused by","effect","effects",
  "leads to","led to","produces","produced",
  "contributes to","drives","impacts","impact",

  // Conclusions / summaries
  "conclusion","conclude","in conclusion",
  "summary","summarize","in summary",
  "overall","ultimately","finally","in the end",
  "this means","this shows",

  // Structure / emphasis
  "first","second","third","finally",
  "initially","subsequently",
  "primarily","especially","particularly","specifically","notably",
  "most importantly","above all",

  // Contrast / exception
  "however","although","though","despite","in spite of",
  "while","whereas","nevertheless","nonetheless","yet","on the other hand",

  // Definition / explanation
  "means","defined as","is defined as","refers to",
  "is known as","can be described as",
  "is that","are that","this is","this refers to",

  // Evidence / authority
  "study","studies","research","researchers",
  "evidence","data","statistics","statistical","analysis",
  "findings","results show","shows","indicates","suggests",
  "demonstrates","reveals","confirms","supports",
  "according to","based on",

  // Measurement / change
  "percent","percentage","%","number","numbers",
  "amount","rate","level",
  "increase","increased","decrease","decreased",
  "change","changed","difference","differences",

  // Evaluation / judgment
  "issue","major issue","key issue","central issue","critical issue",
  "important factor","primary factor","driving factor",

  // Symbolic / interpretive
  "symbolic","symbolically","symbolizing","symbolism",
  "represents","representation","reflects","illustrates",

  // Emphatic academic phrases
  "it is important to note","it should be noted","it is worth noting",
  "this highlights","this underscores","this emphasizes",
  "this suggests","this indicates","this demonstrates",

  // Formal / academic signals
  "statistically significant","not insignificant",
  "empirical","the evidence suggests","the data indicates",
  "the findings show","the results indicate"
];


  function countWords(str) {
    return (str.match(/\S+/g) || []).length;
  }

  function isSubstantialSentence(s) {
    var trimmed = s.trim();
    if (trimmed.length < 25) return false;
    if (countWords(trimmed) < 4) return false;
    if (/^[\s\d\W]+$/i.test(trimmed)) return false;
    return true;
  }

  function importanceScore(sentence) {
    var s = sentence.toLowerCase();
    var score = 0;
    for (var i = 0; i < IMPORTANCE_KEYWORDS.length; i++) {
      if (s.indexOf(IMPORTANCE_KEYWORDS[i]) !== -1) score += 1.5;
    }
    if (/\d/.test(sentence)) score += 0.8;
    if (/^(the|a|an)\s+\w+\s+(is|are|was|were|means|refers to)/i.test(sentence.trim())) score += 1;
    if (sentence.length >= 40 && sentence.length <= 180) score += 1;
    if (sentence.length > 180) score -= 0.5;
    if (sentence.length < 40) score -= 0.3;
    return score;
  }

  function trimToKeyPoint(sentence, maxLen) {
    maxLen = maxLen || 120;
    var s = sentence.trim();
    if (s.length <= maxLen) return s;
    var firstClause = s.split(/[,;:]/, 1)[0].trim();
    if (firstClause.length > 0 && firstClause.length <= maxLen) return firstClause;
    return s.slice(0, maxLen).trim().replace(/\s+\S+$/, "") + "…";
  }

  function extractMainPoints(text) {
    if (!text) return [];
    var normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return [];

    var raw = normalized.split(/(?<=[.!?])\s+/);
    var segments = [];
    raw.forEach(function (s) {
      var t = s.trim();
      if (t.length > 200) {
        t.split(/(?<=[,;:])\s+/).forEach(function (part) {
          var p = part.trim();
          if (p.length >= 25 && countWords(p) >= 4) segments.push(p);
        });
      } else if (t.length >= 25 && countWords(t) >= 4) {
        segments.push(t);
      }
    });

    if (segments.length === 0) return [];

    var scored = segments.map(function (sentence, index) {
      var imp = importanceScore(sentence);
      var positionBonus = 0;
      var n = segments.length;
      if (n > 2) {
        if (index === 0) positionBonus = 0.8;
        else if (index === n - 1) positionBonus = 0.6;
        else positionBonus = 0.3;
      } else positionBonus = 0.5;
      return {
        sentence: sentence,
        score: imp + positionBonus,
        originalIndex: index
      };
    });

    scored = scored.filter(function (item) { return isSubstantialSentence(item.sentence); });
    if (scored.length === 0) return [];

    scored.sort(function (a, b) { return b.score - a.score; });
    var maxPoints = 6;
    var targetCount = Math.min(maxPoints, Math.max(1, scored.length));
    var selected = scored.slice(0, targetCount);
    selected.sort(function (a, b) { return a.originalIndex - b.originalIndex; });

    return selected.map(function (item) {
      return trimToKeyPoint(item.sentence, 120);
    });
  }

  function summarizeForMemorization(text) {
    var points = extractMainPoints(text);
    if (points.length === 0) return paraphraseNormal(text);
    var combined = points.join(" ");
    return "Key points: " + paraphraseNormal(combined);
  }

  function renderNotesPanel(points) {
    if (!notesContent) return;
    notesContent.innerHTML = "";
    if (!points || points.length === 0) {
      var p = document.createElement("p");
      p.textContent = "No clear key points detected.";
      p.className = "notes-fallback";
      notesContent.appendChild(p);
      return;
    }
    var list = document.createElement("ul");
    list.className = "notes-list";
    points.forEach(function (point) {
      var li = document.createElement("li");
      li.textContent = point;
      list.appendChild(li);
    });
    notesContent.appendChild(list);
  }

  function runParaphrase(trimmed, modelId) {
    if (modelId === "academic") return paraphraseAcademic(trimmed);
    if (modelId === "memorization") return summarizeForMemorization(trimmed);
    return paraphraseNormal(trimmed);
  }

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  /* FEEDBACK BLOCK START - remove for release (training feedback, same data can be sent to API for cross-device training) */
  (function initFeedback() {
    var goodBtn = document.getElementById("feedback-good");
    var badBtn = document.getElementById("feedback-bad");
    if (!goodBtn || !badBtn) return;

    function sendFeedback(value) {
      var payload = { notes: value, at: new Date().toISOString() };
      try {
        localStorage.setItem("paraphraser_feedback", JSON.stringify(payload));
        if (typeof window.trainableFeedback === "function") window.trainableFeedback(payload);
      } catch (e) {}
      goodBtn.disabled = true;
      badBtn.disabled = true;
      goodBtn.textContent = "Thanks";
      badBtn.textContent = "Noted";
    }

    goodBtn.addEventListener("click", function () { sendFeedback("good"); });
    badBtn.addEventListener("click", function () { sendFeedback("not_informative"); });
  })();
  /* FEEDBACK BLOCK END */

  sendBtn.addEventListener("click", async function () {
    var text = (inputEl && inputEl.value) || "";
    var trimmed = text.trim();

    if (!trimmed) {
      alert("Please paste or type some text first.");
      return;
    }

    if (trimmed.length > 50000) {
      alert("Character limit is 50000. Keep your text shorter for best results.");
      return;
    }

    var modelId = modelSelect ? modelSelect.value : "normal";
    var points = extractMainPoints(trimmed);
    renderNotesPanel(points);
    setMainContent("", false);

    showLoadingScreen();
    setLoadingStatus("Rewriting your text…");

    await delay(600);

    try {
      var paraphrased = runParaphrase(trimmed, modelId);
      showResultScreen();
      setMainContent(paraphrased || trimmed, false);
      /* Reset feedback buttons for new notes (remove with FEEDBACK BLOCK) */
      var goodBtn = document.getElementById("feedback-good");
      var badBtn = document.getElementById("feedback-bad");
      if (goodBtn && badBtn) {
        goodBtn.disabled = false;
        badBtn.disabled = false;
        goodBtn.textContent = "Good";
        badBtn.textContent = "Not informative";
      }
    } catch (err) {
      console.error(err);
      showResultScreen();
      setMainContent(trimmed, false);
    }
  });
})();
