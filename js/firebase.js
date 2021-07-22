  // TODO https://firebase.google.com/docs/auth/web/firebaseui
  // TODO https://medium.com/firebase-developers/patterns-for-security-with-firebase-per-user-permissions-for-cloud-firestore-be67ee8edc4a
  // TODO https://medium.com/firebase-developers/patterns-for-security-with-firebase-group-based-permissions-for-cloud-firestore-72859cdec8f6
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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