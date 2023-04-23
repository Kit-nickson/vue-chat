<script setup>
  import { ref, onMounted } from 'vue';
  import router from '../router';
  import UsersOnline from '../components/UsersOnline.vue';
  import Chat from '../components/Chat.vue'
  import { socket } from "@/socket";

  const currentUserData = ref('');
  const usersOnlineObject = ref({});
  const messages = ref({});
  const selectedUser = ref(null);

  
  onMounted(() => {
    checkAuth();
  })
  
  function checkAuth() {
    if (!isUserAuth('Auth')) {
      router.push('login');
    } else {
      currentUserData.value = getLoggedUser();
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
    socket.connect();
    
    socket.on('connect', () => {
      socket.emit('user-data', currentUserData.value);
      
      socket.on('users-online', (usersOnline) => {
        usersOnlineObject.value = usersOnline;
      })
      
      socket.on('message', (messagesFromSocket) => {
        messages.value = messagesFromSocket;
      });
    
      socket.on('private-message', (message) => {
        console.log(message);
      })
    })
  }


  function selectUser(e) {
    const selectedUserObject = {
      username: e.target.innerText,
      id: e.target.dataset.id
    }

    selectedUser.value = selectedUserObject;
  }

</script>

<template>
  <div class="container">
    <div class="content">
      <header>
        <h1>Hello {{ currentUserData.username }}</h1>
        <button class="logout-btn" @click="logoutUser">Logout</button>
      </header>

      <div class="chat">
        <Chat :messages="messages.main" :current-user-data="currentUserData" :selected-user="selectedUser"/>
      </div>
    </div>
    <UsersOnline :usersOnline="usersOnlineObject" @select-user="selectUser" />
  </div>
  
</template>

<style scoped>
  .container {
    display: flex;
  }

  header {
    background: #113;
    text-align: center;
    max-height: 100px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .chat {
    display: flex;
    flex: 1;
  }

  header .logout-btn {
    position: absolute;
    top: 50%;
    right: 10px;
    height: 40px;
    width: 100px;
    transform: translate(0, -50%);
    font-size: 1.2em;
    border-radius: 10px;
    background: #335;
    color: white;
    border: none;
    outline: none;
    transition: background .2s;
  }
  
  header .logout-btn:hover { 
    background: rgb(69, 69, 114);
    cursor: pointer;
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100vh;
  }
  
</style>