function getActiveUid() {
  if(isAdmin) {
    return getSearchParam('activeUid');
  }
}

function getActiveDisplayName() {
  if(isAdmin) {
    var activeDisplayName = getSearchParam('activeDisplayName');
    if(activeDisplayName) {
      return decodeURIComponent(activeDisplayName);
    }
  }
}

function setActiveUser(uid, displayName) {
  if(isAdmin && uid && uid != currentUser?.uid) {
    const userQueryString = `activeUid=${uid}&activeDisplayName=${encodeURIComponent(displayName)}`;
    links.forEach(link => {
      var page = link.getAttribute('data-section');
      link.href = `?page=${page}&${userQueryString}`;
    });

    var page = getSearchParam('page');
    if(page) {
      history.pushState(null, document.title, 
        `?page=${page}&${userQueryString}`);
    } else {
      history.pushState(null, document.title, 
        `?${userQueryString}`);
    }

  } else {
    links.forEach(link => {
      var page = link.getAttribute('data-section');
      link.href = `?page=${page}`;
    });
        
    var page = getSearchParam('page');
    if(page) {
      history.pushState(null, document.title, 
        `?page=${page}`);
    } else {
      history.pushState(null, document.title,
        document.location.pathname);
    }

  }
}

function showSigninWidget() {
  ui.start('#firebaseui-auth-container', uiConfig);
}

var firebaseConfig = {
  apiKey: "AIzaSyCqFEKqAFjnBX8PYWhfu4yftE5yT6qJieI",
  authDomain: "timecard-1304f.firebaseapp.com",
  projectId: "timecard-1304f",
  storageBucket: "timecard-1304f.appspot.com",
  messagingSenderId: "11197150944",
  appId: "1:11197150944:web:9d344bcd4400f6380b8285",
  measurementId: "G-FHKR76JRPX"
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
      users.forEach(({id, isAdmin, photoURL, displayName, email}) => {
        appendUserView(id, isAdmin, photoURL, displayName, email);
      });

    }).catch(() => {
      isAdmin = false;
      console.log("No Admin Access for this user");
    }).then(() => {
      document.dispatchEvent(new Event('authenticated'));
    })
  } else {
    signInButton.classList.remove('sign-out');
    document.dispatchEvent(new Event('unauthenticated'));
  }
});

function signout() {
  firebase.auth().signOut().then(() => {
    setActiveUser(null);
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
      clientId: "11197150944-cscamua8ea2g53q6dbbpopfmiqe332ok.apps.googleusercontent.com",
      customParameters: {
        // Forces account selection even when one account
        // is available.
        prompt: 'select_account'
      }
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
