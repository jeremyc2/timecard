const usersDiv = document.querySelector('#admin-section > div.users');

function adminControlsClickHandler() {
    closeMenu();
    selectTab(adminButton);
}

function clearUsersDiv() {
    usersDiv.innerHTML = '';
}

function selectUser(id, displayName) {
    setActiveUser(id, displayName);
    appendUserToRecentsList(id, displayName);
    loadPage();
}

function getRecentsList() {
    return JSON.parse(localStorage.getItem('recents')) || [];
}

function appendUserToRecentsList(id, displayName) {
    var currRecentsList = getRecentsList();
    currRecentsList = currRecentsList.filter(user => user.id != id);
    currRecentsList.push({id, displayName});
    localStorage.setItem('recents', JSON.stringify(currRecentsList));
}

function appendUserView(id, isAdmin, photoURL, displayName, email) {

    const userCard = document.createElement('div'),
        profileImgDiv = document.createElement('div'),
        displayNameDiv = document.createElement('div'),
        emailDiv = document.createElement('div'),
        profileImg = document.createElement('img');

    userCard.setAttribute('data-id', id);
    userCard.addEventListener('click', () => selectUser(id, displayName));

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

const broadcastChannel = new BroadcastChannel('channel1');
broadcastChannel.addEventListener('message', event => {
    if(event.data.type == 'getRecents') {
        broadcastChannel.postMessage({type: 'recents', body: getRecentsList()});
    }
});