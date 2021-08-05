function getActiveUid() {
  if(isAdmin) {
    return localStorage.getItem('activeUid');
  }
}

function setActiveUid(uid, displayName) {
  if(isAdmin) {
    if(!uid) {
      localStorage.removeItem('activeUid');
    } else {
      if(uid == currentUser.uid) {
        resetDisplayName();
      } else {
        setDisplayName(displayName.split(' ')[0]);
      }
      localStorage.setItem('activeUid', uid);
    }
  }
}

function showSigninWidget() {
  ui.start('#firebaseui-auth-container', uiConfig);
}

var firebaseConfig = {
  apiKey: "AIzaSyC2e0G6bgedPnYibqN5lntzqvWHEMevja4",
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

var db = firebase.firestore();
db.settings({experimentalForceLongPolling: true, merge: true});

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
      document.body.classList.add('admin');
      users.forEach(({id, isAdmin, photoURL, displayName, email}) => 
          appendUserView(id, isAdmin, photoURL, displayName, email));

    }).catch(() => {
      console.log("No Admin Access for this user");
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

var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function() {
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return false;
    },
    signInFailure: function(error) {
      console.log("Auth Error:", error);
      alert("Sign-In Error");
    },
    uiShown: function() {
      // The widget is rendered.
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      clientId: "560667499267-rkmhj9j7nd0bni7rqrdtvoootq6vad0b.apps.googleusercontent.com"
    }
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    // firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
  // Terms of service url.
  // tosUrl: '<your-tos-url>',
  // Privacy policy url.
  // privacyPolicyUrl: '<your-privacy-policy-url>'
};