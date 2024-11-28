/*
---------------------------------------
PLAYER Object
---------------------------------------
*/
class Player {
  constructor() {
    this.remainingAttempts = 6;
    this.guessedLetters = [];
  }

  reset() {
    this.remainingAttempts = 6;
    this.guessedLetters = [];
  }

  guessLetter(letter, word) {
    if (this.guessedLetters.indexOf(letter) === -1) {
      this.guessedLetters.push(letter);

      if (word.indexOf(letter) === -1) {
        this.remainingAttempts--;
      }
    }
  }

  hasWon(word) {
    for (let i = 0; i < word.length; i++) {
      if (this.guessedLetters.indexOf(word[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  hasLost() {
    return this.remainingAttempts <= 0;
  }
}

/*
---------------------------------------
Word Object
---------------------------------------
*/
class Word {
  constructor(word, hint) {
    this.word = word.toUpperCase();
    this.hint = hint;
  }

  getDisplayWord(guessedLetters) {
    let display = '';
    for (let i = 0; i < this.word.length; i++) {
      if (guessedLetters.indexOf(this.word[i]) !== -1) {
        display += this.word[i] + ' ';
      } else {
        display += '_ ';
      }
    }
    return display.trim();
  }
}

/*
---------------------------------------
Game Object
---------------------------------------
*/
class Game {
  constructor() {
    this.player = new Player();
    this.currentWord = null;
    this.words = [];
    this.hangmanImages = [
      'images/hangman-0.svg',
      'images/hangman-1.svg',
      'images/hangman-2.svg',
      'images/hangman-3.svg',
      'images/hangman-4.svg',
      'images/hangman-5.svg',
      'images/hangman-6.svg',
    ];
  }

  init() {
    let self = this;
    this.loadWords(function () {
      self.setupEventListeners();
      self.startNewGame();
    });
  }

  loadWords(callback) {
    let self = this;
    fetch('data/json/words.json')
      .then(function (response) {
        if(response.ok){
          return response.json();
        }else{
          console.log("Network error: fetch failed");
        }  
      })
      .then(function (data) {
        for (let i = 0; i < data.length; i++) {
          self.words.push(new Word(data[i].word, data[i].hint));
        }
        callback();
      })
      .catch(function (error) {
        console.error('Error fetching words:', error);
      });
  }

  setupEventListeners() {
    let self = this;
    document.getElementById('new-game-btn').addEventListener('click', function () {
        self.startNewGame();
      });

    document
      .getElementById('keyboard').addEventListener('click', function (e) {
        self.handleKeyPress(e);
      });
  }

  startNewGame() {
    let randomIndex = Math.floor(Math.random() * this.words.length);
    this.currentWord = this.words[randomIndex];
    this.player.reset();
    this.updateUI();
  }

  updateUI() {
    this.updateWordDisplay();
    this.updateHint();
    this.updateImage();
    this.updateAttemptsDisplay();
    this.resetKeyboard();
    this.clearMessage();
  }

  updateWordDisplay() {
    let wordContainer = document.getElementById('word');
    wordContainer.textContent = this.currentWord.getDisplayWord(
      this.player.guessedLetters
    );
  }

  // Hint
  updateHint() {
    document.getElementById('hint').textContent =
      'Hint: ' + this.currentWord.hint;
  }
  
  // Image Update
  updateImage() {
    let imageElement = document.querySelector('#hangman-image img');
    if (this.player.remainingAttempts === 0) {
      imageElement.src = this.hangmanImages[6];
    } else {
      imageElement.src = this.hangmanImages[6 - this.player.remainingAttempts] || this.hangmanImages[6];
    }
  }

  // Attempts
  updateAttemptsDisplay() {
    let attemptsElement = document.getElementById('attempts');
    attemptsElement.textContent =
      'Attempts: ' + this.player.remainingAttempts + '/6';
  }

  // Keyboard
  resetKeyboard() {
    let keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';

    let rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

    for (let i = 0; i < rows.length; i++) {
      let rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';

      for (let j = 0; j < rows[i].length; j++) {
        let button = document.createElement('button');
        button.className = 'key';
        button.textContent = rows[i][j];
        button.dataset.letter = rows[i][j];
        button.disabled = false;
        rowDiv.appendChild(button);
      }
      keyboard.appendChild(rowDiv);
    }
  }

  handleKeyPress(event) {
    if (!event.target.classList.contains('key')) {
      return; 
    }

    let letter = event.target.dataset.letter;
    event.target.disabled = true;
    event.target.classList.add('clicked');

    this.player.guessLetter(letter, this.currentWord.word);

    if (this.player.hasWon(this.currentWord.word)) {
      this.showMessage('You win!', 'green');
    } else if (this.player.hasLost()) {
      this.showMessage(
        'You lost! The word was ' + this.currentWord.word + '.', 'red'
      );
    } else {
      this.updateUI();
    }
  }

  showMessage(message, color) {
    let messageElement = document.getElementById('game-status-message');
    messageElement.textContent = message;
    messageElement.style.color = color;
    messageElement.classList.add('fade-in');
    setTimeout(function () {
      messageElement.classList.remove('fade-in');
    }, 2000);
  }

  clearMessage() {
    let messageElement = document.getElementById('game-status-message');
    messageElement.textContent = '';
  }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function () {
  let hangmanGame = new Game();
  hangmanGame.init();
});
