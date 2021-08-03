function adminControlsClickHandler() {
    closeMenu();
    selectTab(adminButton);
}

function buildUserView(imgUrl, screenName, email) {
    const userCard = document.createElement('div'),
        profileImgDiv = document.createElement('div'),
        screenNameDiv = document.createElement('div'),
        emailDiv = document.createElement('div'),
        profileImg = document.createElement('img');

    userCard.classList.add('user-card');
    profileImg.setAttribute('src', imgUrl);
    profileImg.setAttribute('alt', 'Profile Pic');
    screenNameDiv.innerText = screenName;
    emailDiv.innerText = email;

    profileImgDiv.appendChild(profileImg);
    userCard.append(profileImgDiv, screenNameDiv, emailDiv);

    return userCard;
}