(function () {
  var sendBtn = document.getElementById('send-btn');
  var startScreen = document.getElementById('start-screen');
  var resultScreen = document.getElementById('result-screen');

  sendBtn.addEventListener('click', function () {
    startScreen.classList.remove('screen--active');
    resultScreen.classList.add('screen--active');
  });
})();
