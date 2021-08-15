async function getRecentsList() {
    var recents = await localforage.getItem('recents');
    return recents || [];
}

async function appendUserToRecentsList(id, displayName) {
    var recents = await getRecentsList();
    recents = recents.filter(user => user.id != id);
    recents.push({id, displayName});
    return localforage.setItem('recents', recents);
}