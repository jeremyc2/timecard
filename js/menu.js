const menuToggle = document.querySelector('#hamburger-menu'),
    header = document.querySelector('body > header');

function openMenu() {
    header.classList.add('expand');
}

function closeMenu() {
    header.classList.remove('expand');
}

function toggleMenu() {
    header.classList.toggle('expand');
}

document.addEventListener('wheel', () => {
    closeMenu();
});

document.addEventListener('mousedown', (e) => {
    if(!e.path.includes(header)) {
        closeMenu();
    }
});

document.addEventListener('touchstart', (e) => {
    if(!e.path.includes(header)) {
        closeMenu();
    }
});