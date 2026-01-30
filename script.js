(function () {
  var sendBtn = document.getElementById('send-btn');
  var startScreen = document.getElementById('start-screen');
  var resultScreen = document.getElementById('result-screen');
  var inputEl = document.querySelector('.text-input');
  var notesContent = document.querySelector('.notes-content');
  var modelSelect = document.getElementById('model-select');
  var aiOutputContentEl = document.querySelector('.ai-output-content');

  // "PineConeV1.0" - simple, local utilities
  function extractMainPoints(text) {
    if (!text) return [];

    var normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    var sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .filter(function (s) {
        return s && s.trim().length > 0;
      });

    if (sentences.length === 0) return [];

    var scored = sentences.map(function (sentence, index) {
      var s = sentence.trim();
      var lengthScore = Math.min(s.length / 80, 1.5);
      var positionScore = 1 - index / sentences.length;
      return {
        sentence: s,
        score: lengthScore + 0.5 * positionScore,
        originalIndex: index
      };
    });

    // Sort by score (descending) to pick the strongest candidates
    scored.sort(function (a, b) {
      return b.score - a.score;
    });

    var targetCount = Math.min(5, Math.max(1, Math.round(sentences.length / 3)));

    // Take the top N, then re-sort by original index to preserve document order,
    // even when multiple selected sentences are identical.
    var selectedObjects = scored.slice(0, targetCount);
    selectedObjects.sort(function (a, b) {
      return a.originalIndex - b.originalIndex;
    });

    return selectedObjects.map(function (item) {
      return item.sentence;
    });
  }

  function normalizeText(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  // Normal mode: lightly cleaned version of the original text
  function paraphraseNormal(text) {
    return normalizeText(text);
  }

  // Academic mode: slightly more formal wording using a tiny synonym map
  function paraphraseAcademic(text) {
    var normalized = normalizeText(text);
    var replacements = {
      "kids": "children",
      "a lot of": "many",
      "lots of": "many",
      "really": "highly",
      "very": "highly",
      "get": "obtain",
      "buy": "purchase",
      "help": "assist",
      "show": "demonstrate",
      "start": "commence",
      "stop": "cease"
    };

    Object.keys(replacements).forEach(function (key) {
      var pattern = new RegExp("\\b" + key + "\\b", "gi");
      normalized = normalized.replace(pattern, function (match) {
        var replacement = replacements[key];
        // Preserve capitalization of the first letter
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    });

    return "In summary, " + normalized;
  }

  function renderMemorizationOutput(container, points) {
    container.innerHTML = "";

    var title = document.createElement("h2");
    title.textContent = "Key points to remember";
    container.appendChild(title);

    if (!points || points.length === 0) {
      var p = document.createElement("p");
      p.textContent = "No clear key points detected.";
      container.appendChild(p);
      return;
    }

    var list = document.createElement("ol");
    points.forEach(function (point) {
      var li = document.createElement("li");
      li.textContent = point;
      list.appendChild(li);
    });
    container.appendChild(list);
  }

  sendBtn.addEventListener('click', function () {
    var text = (inputEl && inputEl.value) || '';
    var trimmed = text.trim();

    if (!trimmed) {
      alert('Please paste some text first.');
      return;
    }

    if (trimmed.length > 500) {
      alert("Character limit is 500 characters. To keep going, you'll need to pay or something like that.");
      return;
    }

    var modelId = modelSelect ? modelSelect.value : 'normal';

    // Always compute main points for the notes section
    var points = extractMainPoints(trimmed);

    if (notesContent) {
      notesContent.innerHTML = '';

      if (points.length > 0) {
        var list = document.createElement('ul');
        list.className = 'notes-list';

        points.forEach(function (point) {
          var li = document.createElement('li');
          li.textContent = point;
          list.appendChild(li);
        });

        notesContent.appendChild(list);
      } else {
        var fallback = document.createElement('p');
        fallback.textContent = 'No clear main points detected.';
        notesContent.appendChild(fallback);
      }
    }

    // Render main AI output based on selected mode
    if (aiOutputContentEl) {
      if (modelId === 'memorization') {
        renderMemorizationOutput(aiOutputContentEl, points);
      } else if (modelId === 'academic') {
        aiOutputContentEl.textContent = paraphraseAcademic(trimmed);
      } else {
        aiOutputContentEl.textContent = paraphraseNormal(trimmed);
      }
    }

    startScreen.classList.remove('screen--active');
    resultScreen.classList.add('screen--active');
  });
})();
