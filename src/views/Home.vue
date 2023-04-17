<script setup>
  import { ref, onMounted } from 'vue';
  import router from '../router';
  import UsersOnline from '../components/UsersOnline.vue';

  import { io } from "socket.io-client";

  const connectionStatus = ref(false);
  const username = ref('');
  const userId = ref('');
  const usersOnlineObject = ref({});

  let socket = null;


  onMounted(() => {
    checkAuth();
  })

  function checkAuth() {
    if (!isUserAuth('Auth')) {
      router.push('login');
    } else {
      const userObject = getLoggedUser();
  
      username.value = userObject.username;
      userId.value = userObject.userId;
      connectToChat();
    }
  }


  function isUserAuth(name) {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();

      if (cookie.indexOf(name + '=') === 0) {
        return true;
      }
    }
    return false;
  }


  function getLoggedUser() {
    const cookies = document.cookie.split(';');

    for(let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();

      if (cookie.startsWith('Auth')) {
        const userDataArray = cookie.substring(5).split('-');
        return {username: userDataArray[0], userId: userDataArray[1]};
      }
    }
  }


  function logoutUser() {
    document.cookie = "Auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
    
    socket.disconnect();
    checkAuth();
  }


  function connectToChat() {
    socket = io("http://localhost:3000");

    socket.on('connect', () => {
      socket.emit('user-data', {
        username: username.value,
        userId: userId.value
      });
    })

    socket.on('users-online', (usersOnline) => {
      usersOnlineObject.value = usersOnline;

      for (const key in usersOnlineObject.value) {
        console.log(usersOnlineObject.value[key].username+" : "+usersOnlineObject.value[key].userId);
      }
    })
  }

</script>

<template>
  <h1>Home</h1>
  <h3>Hello {{ username }}</h3>

  <UsersOnline :usersOnline="usersOnlineObject" />
  
  <button @click="logoutUser">Logout</button>
</template>

<style scoped>
  .status {
    color: rgb(8, 128, 58);
  }
</style>