  // TODO https://medium.com/firebase-developers/patterns-for-security-with-firebase-per-user-permissions-for-cloud-firestore-be67ee8edc4a
  // TODO https://medium.com/firebase-developers/patterns-for-security-with-firebase-group-based-permissions-for-cloud-firestore-72859cdec8f6
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  function showSigninWidget() {
    ui.start('#firebaseui-auth-container', uiConfig);
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
    if(user && user.uid != currentUser?.uid) {
      currentUser = user;
      console.log(`${currentUser.displayName} is signed in.`);
      document.dispatchEvent(new Event('authenticated'));
    } else {
      currentUser = null;
      document.dispatchEvent(new Event('unauthenticated'));
      console.log('No user signed in.');

      showSigninWidget()
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
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        console.log(`${authResult.user.displayName} successfully signed in.`);
        document.dispatchEvent(new Event('authenticated'));
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        return false;
      },
      uiShown: function() {
        // The widget is rendered.
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      // firebase.auth.GithubAuthProvider.PROVIDER_ID,
      // firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    // tosUrl: '<your-tos-url>',
    // Privacy policy url.
    // privacyPolicyUrl: '<your-privacy-policy-url>'
  };