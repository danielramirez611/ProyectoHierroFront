importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAsbLtV4B2Dlm0LpKnm_FRwbKRigAdF2uk",
    authDomain: "hierroproject-68af2.firebaseapp.com",
    projectId: "hierroproject-68af2",
    storageBucket: "hierroproject-68af2.firebasestorage.app",
    messagingSenderId: "661736862379",
    appId: "1:661736862379:web:7441225f3ef2a337973dee",
    measurementId: "G-0NCXFLZRX4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
