// API 
const urlCat = "https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1";
const urlDog = "https://dog.ceo/api/breeds/image/random";

const $containerImage = document.getElementById('image');
const $btnDog = document.getElementById('show-dog');
const $btnCat = document.getElementById('show-cat');
const $wrapperContent = document.getElementById('wrapper-content');
const $cartDog = document.getElementById('cartDog');
const $cartCat = document.getElementById('cartCat');

// Счетчик для вращения заголовка
let count = 0;

//цвет 
let hslColor = 196;


// Переменные для Drag & Drop
let dragAnimal = null;
let deleteAnimal = false;
let activeCart = null;

// Флаг и звуки для аудио
let soundFlag = false;
const soundDogDrop = new Audio('audio/лай-drag.mp3');
const soundDogCart = new Audio('audio/собака-довольная.mp3');
const soundCatDrop = new Audio('audio/мяуканье-drag.mp3');
const soundCatCart = new Audio('audio/кот-довольный.mp3');
const soundLogo = new Audio('audio/скрипучая-дверь.mp3');
const initAnimalSound = new Audio('audio/бульканье-воды.mp3');


const getImage = (url, animal, containerImage) => {
  fetch(url)
    .then(response => response.json())
    .then(result => showImage(result, animal, containerImage))
    .catch(error => console.log('error', error));
};

const showImage = (data, animal, containerImage) => {
  if (animal === 'cat') {
    containerImage.src = data[0].url;
  } else if (animal === 'dog') {
    containerImage.src = data.message;
  }
};

const rotateTitle = () => {
  if (count === -3 || count === 3) {
    (count === -3) ? createDecor('cat') : createDecor('dog');
    count = 0;

    document.documentElement.style.setProperty('--rotate', `${count}deg`);
    document.documentElement.style.setProperty('--pos-x', `${count}px`);
    return;
  }
  document.documentElement.style.setProperty('--rotate', `${count * 3}deg`);
  document.documentElement.style.setProperty('--pos-x', `${count * 3}px`);
};

const createDecor = (animal) => {
  const randomValueX = Math.floor(Math.random() * 90);
  const randomValueY = Math.floor(Math.random() * 90);
  const elemDecor = document.createElement('div');

  (animal === 'cat') ? elemDecor.classList.add('draggable', 'cat') :
    elemDecor.classList.add('draggable', 'dog');

  if (elemDecor.classList.contains('draggable')) {
    elemDecor.draggable = true;
  }

  elemDecor.style.top = randomValueX + 'vh';
  elemDecor.style.left = randomValueY + 'vw';
  $wrapperContent.append(elemDecor);
  soundPlay(initAnimalSound);
};

const soundPlay = (sound, time = 0) => {
  if (!soundFlag) {
    sound.play().then(() => {
      soundFlag = true;
    })
      .then(() => setTimeout(() => {
        soundFlag = false;
      }, time))
      .catch((error) => {
        console.error(error);
        soundFlag = false;
      })
  }
};

const vibrationImage = (elem, className) => {
  elem.classList.add(className);
  setTimeout(() => {
    elem.classList.remove(className);
    soundPlay(initAnimalSound);
  }, 300);
};

const changeColor = (increment, variable) => {
  const root = document.documentElement;

  if ((hslColor + increment) >= 0 && (hslColor + increment) <= 360) {
    hslColor += increment;
  } else if ((hslColor + increment) < 0) {
    hslColor = 0;
  } else {
    hslColor = 360;
  }

  root.style.setProperty(variable, `hsl(${hslColor}, 82%, 40%)`);
}

//Выезд правил игры
window.addEventListener('load', () => {
  setTimeout(() => {
    const rules = document.getElementById('gameRules');
    rules.remove();
    vibrationImage($cartCat, 'vibration-cart');
    vibrationImage($cartDog, 'vibration-cart');
  }, 3000);
});

//Кнопки для переключения картинок
$btnDog.addEventListener('click', () => {
  count++
  getImage(urlDog, 'dog', $containerImage);
  rotateTitle();
  soundPlay(soundLogo);
});

$btnCat.addEventListener('click', () => {
  count--
  getImage(urlCat, 'cat', $containerImage);
  rotateTitle();
  soundPlay(soundLogo);
});

//Drag & Drop для desktop 
$wrapperContent.addEventListener(`dragstart`, (e) => {

  if (e.target.classList.contains('cat') || e.target.classList.contains('dog')) {
    e.target.classList.add(`selected`);
    dragAnimal = e.target;
  }
});

$wrapperContent.addEventListener(`dragend`, (e) => {
  e.target.classList.remove(`selected`);
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();

  let activeElem = document.querySelector('.selected');

  if (activeElem) {

    if (dragAnimal.classList.contains('dog')) {
      deleteAnimal ? soundPlay(soundDogDrop) : soundPlay(soundDogDrop, 800);
    } else if (dragAnimal.classList.contains('cat')) {
      deleteAnimal ? soundPlay(soundCatCart) : soundPlay(soundCatDrop);

    }

    if (dragAnimal.classList.contains('dog') && e.target === $cartDog) {

      deleteAnimal = true;
    } else {
      deleteAnimal = false;
    }
    if (dragAnimal.classList.contains('cat') && e.target === $cartCat) {
      deleteAnimal = true;
    }
    activeCart = e.target;
  }
});

document.addEventListener('drop', (e) => {
  e.preventDefault();

  const activeElem = document.querySelector('.selected');

  if (activeCart && activeCart.id === 'cartCat' && activeElem.classList.contains('dog')) {
    activeElem.style.left = e.pageX + 100 + 'px';
    return;
  }
  if (activeCart && activeCart.id === 'cartDog' && activeElem.classList.contains('cat')) {
    activeElem.style.left = e.pageX + 100 + 'px';
    return;
  }
  if (deleteAnimal && activeElem) {
    vibrationImage(activeCart, 'vibration-cart');
    activeCart.id === 'cartDog' ? changeColor(-10, '--primary-accent') : changeColor(10, '--primary-accent');


    activeElem.remove();
    return;
  }
  if (activeElem) {
    activeElem.style.left = e.pageX + 'px';
    activeElem.style.top = e.pageY + 'px';
  }
});

//Drag & Drop для телефонов и планшетов
$wrapperContent.addEventListener('touchstart', (e) => {

  const touch = e.touches[0];

  if (touch.target.classList.contains('cat') || touch.target.classList.contains('dog')) {
    touch.target.classList.add(`selected`);
  }
});

$wrapperContent.addEventListener('touchmove', (e) => {
  e.preventDefault();

  const viewportHeight = window.innerHeight;
  const touch = e.touches[0];
  const activeElem = document.querySelector('.selected');

  if (!activeElem) return;
  if (viewportHeight < touch.clientY + 50) {
    activeElem.classList.remove(`selected`);
    activeElem.style.top = touch.pageY - 50 + 'px';
    return;
  }

  if (activeElem.classList.contains('dog')) {
    activeCart === 'dog' ? soundPlay(soundDogDrop) : soundPlay(soundDogDrop, 800);
  }
  if (activeElem.classList.contains('cat')) {
    activeCart === 'cat' ? soundPlay(soundCatCart) : soundPlay(soundCatDrop);
  }

  activeElem.style.left = touch.pageX + 'px';
  activeElem.style.top = touch.pageY + 'px';

  const cartDogStyle = $cartDog.getBoundingClientRect();
  const cartCatStyle = $cartCat.getBoundingClientRect();

  if (touch.pageX >= cartCatStyle.left && touch.pageX <= cartCatStyle.right &&
    touch.pageY >= cartCatStyle.top && touch.pageY <= cartCatStyle.bottom) {
    activeCart = 'cat';
  } else if (touch.pageX >= cartDogStyle.left && touch.pageX <= cartDogStyle.right &&
    touch.pageY >= cartDogStyle.top && touch.pageY <= cartDogStyle.bottom) {
    activeCart = 'dog';
  } else {
    activeCart = null;
  }
});

$wrapperContent.addEventListener('touchend', (e) => {

  let activeElem = document.querySelector('.selected');

  if (!activeElem) return;

  activeElem.classList.remove(`selected`);

  if (activeCart === 'dog' && activeElem.classList.contains('cat')) {
    activeElem.style.left = '50vw';
    return;
  }
  if (activeCart === 'cat' && activeElem.classList.contains('dog')) {
    activeElem.style.left = '20vw';
    return;
  }
  if (activeCart === 'dog' && activeElem.classList.contains('dog')) {
    vibrationImage($cartDog, 'vibration-cart')
    activeElem.remove();
    changeColor(-10, '--primary-accent');
    return;
  }
  if (activeCart === 'cat' && activeElem.classList.contains('cat')) {
    vibrationImage($cartCat, 'vibration-cart');
    activeElem.remove();
    changeColor(10, '--primary-accent');

    return;
  }
});
