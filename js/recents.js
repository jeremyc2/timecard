async function getRecentsList() {
    var recents = await localforage.getItem('recents');
    return recents || [];
}

async function appendUserToRecentsList(id, displayName, profileImg) {
    var recents = await getRecentsList();
    recents = recents.filter(user => user.id != id);
    recents.push({id, displayName, profileImg});
    return localforage.setItem('recents', recents);
}