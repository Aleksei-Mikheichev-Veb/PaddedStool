let windowW = document.documentElement.clientWidth;

$(document).ready(function () {
    $(".phone").mask("+7 (999) 999-99-99");
});

// Бургер меню

const button = document.querySelector('.menu__icon');
const menu = document.querySelector('.menu__body');

button.addEventListener("click", function (e) {
    button.classList.toggle('_active');
    menu.classList.toggle('_active');
});

// Прокрутка при клике
const menuLinks = document.querySelectorAll('.menu__link[data-goto]');
if (menuLinks.length > 0) {
    menuLinks.forEach(menuLink => {
        menuLink.addEventListener("click", onMenuLinkClick);
    });

    function onMenuLinkClick(e) {
        const menuLink = e.target;
        if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
            const gotoBlock = document.querySelector(menuLink.dataset.goto);
            const gotoBlockValue = gotoBlock.getBoundingClientRect().top + pageYOffset;

            if (button.classList.contains('_active')) {
                document.body.classList.remove('_lock');
                button.classList.remove('_active');
                menu.classList.remove('_active');
            }

            window.scrollTo({
                top: gotoBlockValue,
                behavior: "smooth"
            });
            e.preventDefault();
        }
    }
}

// Модальное окно
// вот такая должна быть ссылка на попап.<a href="#popup" class="fullscreen__link popup__link">Спросить адвоката</a>
let popupLinks = document.querySelectorAll('.popup__link');
const body = document.querySelector('body');
const lockPadding = document.querySelectorAll(".lock-padding");

let unlock = true;
const timeout = 800;

for (let popupLink of popupLinks) {
    popupLink.addEventListener('click', function (e) {
        let popupName = popupLink.getAttribute('href').replace('#', '');
        let curentPopup = document.getElementById(popupName);
        popupOpen(curentPopup);
        e.preventDefault();
    })
}
let popupCloseIcons = document.querySelectorAll('.close-popup');
for (let popupCloseIcon of popupCloseIcons) {
    popupCloseIcon.addEventListener('click', function (e) {
        popupClose(this.closest('.popup'));
        e.preventDefault();
    })
}
function popupOpen(curentPopup) {
    if (curentPopup && unlock) {
        const popupActive = document.querySelector('.popup.open');
        curentPopup.classList.add('open');
        curentPopup.addEventListener('click', function (e) {
            if (!e.target.closest('.popup__content')) {
                popupClose(e.target.closest('.popup'));
            }
        })
    }
}

let popup = document.querySelector('.popup');
popup.addEventListener('click', function (e) {
    if (!e.target.closest('.popup__content')) {
        popupClose(e.target.closest('.popup'));
    }
})

function popupClose(popupActive, doUnlock = true) {
    popupActive.classList.remove('open');
}
(function () {
    // проверяем поддержку
    if (!Element.prototype.closest) {
        // реализуем
        Element.prototype.closest = function (css) {
            var node = this;
            while (node) {
                if (node.matches(css)) return node;
                else node = node.parentElement;
            }
            return null;
        };
    }
})();
(function () {
    // проверяем поддержку
    if (!Element.prototype.matches) {
        // определяем свойство
        Element.prototype.matches = Element.prototype.matchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector;
    }
})();

// Отправка форм

document.addEventListener('DOMContentLoaded', function () {
    // Сама тэг form
    // const form = document.getElementById('form');
    const forms = document.querySelectorAll('.forms');
    for (let form of forms) {
        // Событие отправки формы
        // console.log(this);
        form.addEventListener('submit', formSend);
        // Переменная чтобы отловить попап и закрыть при отправке формы
        let popupActiveCloses = document.querySelectorAll('.popup');

        async function formSend(e) {
            e.preventDefault();
            // Проверим инпуты на норм заполнение т.е. вместо атрибута required
            console.log(form);
            form = e.target;
            let error = formValidate(form);
            let formData = new FormData(form);

            if (error === 0) {
                // Чтобы присваивал открытый попап
                let body = document.querySelector('.sale__box');
                console.log(body);
                body.classList.add('_sending');
                let response = await fetch('sendmail.php', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    let popup = document.querySelector(".popup");
                    let result = await response.json();
                    // alert(result.message);
                    // formPreview.innerHTML = '';
                    form.reset();
                    body.classList.remove('_sending');
                    popupActiveCloses.forEach(popupActiveClose => {
                        console.log(popupActiveClose);
                        popupActiveClose.classList.remove('open');
                    });
                    console.log(popup);
                    popup.classList.add('open');
                } else {
                    alert("Ошибка");
                    body.classList.remove('_sending');
                }
            } else {
                alert('Заполните обязательные поля');
            }

        }

        // Функция для проверки валидации
        function formValidate(form) {
            let error = 0;
            console.log(form);
            // Если в одной форме 2 обязательных поля, то ищем все классы _req в конкретной форме.
            let formReq = form.querySelectorAll('._req');

            //Переберем все инпуты с классом ._req т.е. которые должны быть обязательно заполнены
            for (let index = 0; index < formReq.length; index++) {
                const input = formReq[index];
                formRemoveError(input);
                //Если имеет класс _email то, используем функцию для проверки имейла
                if (input.classList.contains('_email')) {
                    // Если имейл не прошел проверку то функция вернет true и тогда ей добавится класс _error
                    if (emailTest(input)) {
                        formAddError(input);
                        error++;
                    }
                    // Если инпут является чекбоксом и он не нажат то снова добавится класс _error
                } else if (input.getAttribute("type") === "checkbox" && input.checked === false) {
                    formAddError(input);
                    error++;
                } else {
                    //Проверяем заполнено ли поле
                    if (input.value === '') {
                        formAddError(input);
                        error++;
                    }
                }
            }
            return error;
        }
        // Добавим класс '_error' тем кто не прошел проверку
        function formAddError(input) {
            input.parentElement.classList.add('_error');
            input.classList.add('_error');
        }
        // Уберем класс '_error' тем кто прошел проверку 
        function formRemoveError(input) {
            input.parentElement.classList.remove('_error');
            input.classList.remove('_error');
        }
        //Функция теста email
        function emailTest(input) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
        }
    }
});


// Плавное появление элементов
/* Добавляем _anim-items _anim-no-hide и класс нужной анимации*/
// const animItems = document.querySelectorAll('._anim-items');

// if (animItems.length > 0) {
// window.addEventListener('scroll', animOnScroll);
// function animOnScroll() {
// Для анимированного появления блоков
// for (let index = 0; index < animItems.length; index++) {
//     const animItem = animItems[index];
//     const animItemHeight = animItem.offsetHeight;
//     const animItemOffset = offset(animItem).top;
//     const animStart = 4;

//     let animItemPoint = window.innerHeight - animItemHeight / animStart;
//     if (animItemHeight > window.innerHeight) {
//         animItemPoint = window.innerHeight - window.innerHeight / animStart;
//     }

//     if ((pageYOffset > animItemOffset - animItemPoint) && pageYOffset < (animItemOffset + animItemHeight)) {
//         animItem.classList.add('_active');
//     } else {
//         if (!animItem.classList.contains('_anim-no-hide')) {
//             animItem.classList.remove('_active');
//         }
//     }
// }
// Прилипающее меню
//-----------------------------------------------//
// if (windowW > 990) {
//     //Чтобы работало поставим строчку снизу вверх
//     // let windowW = document.documentElement.clientWidth;
//     let menuHeader = document.querySelector('.header');
//     let menuHeight = menuHeader.offsetHeight;
//     // Записываем блок на котором должно всплывать
//     let fullscreen = document.querySelector('.about');

//     let fullscreenHeight = offset(fullscreen).top;
//     const scrollY = window.scrollY || window.pageYOffset;
//     function menuFixed() {
//         if (scrollY > fullscreenHeight) {
//             menuHeader.classList.add('act');
//         } else {
//             menuHeader.classList.remove('act');
//         }
//     }
//     menuFixed();
// }

// Для анимированного появления блоков
// let windowWidth = document.documentElement.clientWidth;
// if (windowWidth < 991) {
//     const itemShowsDis = document.querySelectorAll('.itemShow');
//     for (let itemShow of itemShowsDis) {
//         itemShow.classList.remove('itemShow');
//     }

// }
//-----------------------------------------------//
// }
// function offset(el) {
//     const rect = el.getBoundingClientRect(),
//         scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
//         scrollTop = window.pageYOffset || document.documentElement.scrollTop;
//     return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
// }
// Для анимированного появления блоков
// setTimeout(() => {
//     animOnScroll();
// }, 300);
// }

const video = document.querySelector('.video')
const playButton = document.querySelector('.play-button')


//Play and Pause button
playButton.addEventListener('click', (e) => {
    if (video.paused) {
        video.play()
        playButton.style.opacity = 0;
        e.target.textContent = '❚ ❚'
    } else {
        video.pause()
        playButton.style.opacity = 1;
        e.target.textContent = '►'
    }
})



