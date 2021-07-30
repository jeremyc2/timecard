  function getActiveUid() {
    if(isAdmin) {
      return localStorage.getItem('activeUid');
    }
  }

  function setActiveUid(uid) {
    if(isAdmin) {
      if(!uid) {
        localStorage.removeItem('activeUid');
      } else {
        localStorage.setItem('activeUid', uid);
      }
    }
  }
  
  var firebaseConfig = {
    apiKey: "AIzaSyBJg2I8xb16QiLu4S-twXm5o1L3cWf2oVQ",
    authDomain: "timecard-95463.firebaseapp.com",
    projectId: "timecard-95463",
    storageBucket: "timecard-95463.appspot.com",
    messagingSenderId: "560667499267",
    appId: "1:560667499267:web:af89e3449c4a51ecca2736",
    measurementId: "G-1FZ61815QR"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  firebase.firestore().settings({ experimentalForceLongPolling: true });
  var db = firebase.firestore();

  var currentUser;
  firebase.auth().onAuthStateChanged(user => {
    currentUser = user;
    isAdmin = undefined;
    if(user) {

      signInButton.classList.add('sign-out');

      const displayName = user.displayName,
            email = user.email,
            photoURL = user.photoURL;
            
      getUsersCollectionRef().doc(user.uid).set({
          displayName,
          email,
          photoURL
      }, {merge: true})
      .then(() => {
          console.log("Profile successfully updated!");
      })
      .catch((error) => {
          console.error("Error updating profile: ", error);
      });

      getUsersCollectionRef().get().then(querySnapshot => {
        isAdmin = true;
        let users = querySnapshot.docs.map(entry => {
            return {id: entry.id, ...entry.data()};
        });
        console.log("Admin Access Granted", users);
        // TODO Build Admin UI for selecting user as active uid
      }).catch(() => {
        isAdmin = false;
        console.log("No Admin Access for this user");
        // TODO Remove Admin UI
      });

      document.dispatchEvent(new Event('authenticated'));
    } else {
      signInButton.classList.remove('sign-out');
      document.dispatchEvent(new Event('unauthenticated'));
    }
  });

  function signout() {
    firebase.auth().signOut().then(() => {
      console.log('Sign-out successful.')
    }).catch((error) => {
      console.error(error);
    });
  }

  var provider = new firebase.auth.GoogleAuthProvider();

  function signInWithPopup() {
    firebase.auth()
    .signInWithPopup(provider)
    .then((/*result*/) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // var token = result.credential.accessToken;
      // The signed-in user info.
      // var user = result.user;
    }).catch((error) => {
      // Handle Errors here.
      console.error(error);
    });
  }