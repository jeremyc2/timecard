const usersDiv = document.querySelector('#admin-section > div.users');

function adminControlsClickHandler() {
    closeMenu();
    selectTab(adminButton);
}

function clearUsersDiv() {
    usersDiv.innerHTML = '';
}

function appendUserView(id, isAdmin, photoURL, displayName, email) {

    const userCard = document.createElement('div'),
        profileImgDiv = document.createElement('div'),
        displayNameDiv = document.createElement('div'),
        emailDiv = document.createElement('div'),
        profileImg = document.createElement('img');

    userCard.setAttribute('data-id', id);

    userCard.classList.add('user-card');
    profileImg.src = photoURL;
    profileImg.alt = 'Profile Pic';
    displayNameDiv.innerText = displayName;
    emailDiv.innerText = email;

    if(isAdmin) {
        userCard.classList.add('admin-user');
    }

    profileImgDiv.appendChild(profileImg);
    userCard.append(profileImgDiv, displayNameDiv, emailDiv);

    usersDiv.appendChild(userCard);
}