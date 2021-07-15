const menuToggle = document.querySelector('#hamburger-menu');

function openMenu() {
    menuToggle.parentElement.classList.add('expand');
}

function closeMenu() {
    menuToggle.parentElement.classList.remove('expand');
}

function toggleMenu() {
    menuToggle.parentElement.classList.toggle('expand');
}

document.addEventListener('wheel', () => {
    closeMenu();
});

document.addEventListener('mousedown', (e) => {
    if(!e.path.includes(menuToggle.parentElement)) {
        closeMenu();
    }
});