<script setup>
  import { ref, onMounted } from 'vue';
  import router from '../router';
  import UsersOnline from '../components/UsersOnline.vue';
  import Chat from '../components/Chat.vue'
  import { socket } from "@/socket";
  import axios from 'axios';

  const currentUserData = ref('');
  const usersOnlineObject = ref({});
  const token = ref({});
  const messages = ref({});
  const privateMessagesLocal = ref([]);
  const selectedUser = ref(null);
  const commonId = ref(null);
  const notifications = ref([]);

  
  onMounted(() => {
    checkAuth();
  })
  
  function checkAuth() {
    if (!isUserAuth('chat_userdata') || !isUserAuth('chat_token')) {
      router.push('guest');
    } else {
      currentUserData.value = getLoggedUser();
      token.value = getToken();
      
      axios.post('http://localhost:8080/check_data', {userdata: currentUserData.value, token: token.value})
      .then((resp) => {
        if (resp.data === 'okay') {
          connectToChat();
        } else {
          logoutUser();
          
          router.push('guest');
        }
      })
      .catch((error) => {
        console.log(error.data);
        logoutUser();
        
        router.push('guest');
      });
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

      if (cookie.startsWith('chat_userdata')) {
        const userDataArray = cookie.substring(14).split('-');
        return {username: userDataArray[0], userId: userDataArray[1]};
      }
    }
  }

  function getToken() {
    const cookies = document.cookie.split(';');

    for(let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();

      if (cookie.startsWith('chat_token')) {
        return cookie.substring(11);
      }
    }
  }


  function logoutUser() {
    document.cookie = "chat_userdata=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "chat_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
    
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
      
      socket.on('private-message', (privateMessagesData) => {

        if (!privateMessagesLocal.value[privateMessagesData[0]]) {
            privateMessagesLocal.value[privateMessagesData[0]] = [];
        }

        let messageObject = null;

        if (privateMessagesData[1][0]) {
          messageObject = privateMessagesData[1][0];
        } else {
          messageObject = privateMessagesData[1];
        }

        privateMessagesLocal.value[privateMessagesData[0]].push(messageObject);
      });

      socket.on('get-private-messages', (privateMessagesData) => {
        if (privateMessagesData[1].length > 0) {
          if (!privateMessagesLocal.value[privateMessagesData[0]]) {
            privateMessagesLocal.value[privateMessagesData[0]] = [];
          }

          // maybe cache later...
          
          privateMessagesLocal.value[privateMessagesData[0]] = privateMessagesData[1];    
        }
      });

      socket.on('notification', (from) => {
        notifications.value.push(from);
      })

      socket.on('join-error', () => {
        router.go(0);
      })
    })
  }


  function selectUser(e) {
    if (e.target.dataset.id !== 'guest') {
      console.log('test');
      selectedUser.value = {
        username: e.target.innerText,
        id: e.target.dataset.id
      }

      commonId.value = [selectedUser.value.id, currentUserData.value.userId].sort().join('_');

      socket.emit('join-room', {commonId: commonId.value, userData: selectedUser.value});

      notifications.value = notifications.value.filter(item => item !== selectedUser.value.id)
    }
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
        <Chat v-if="!selectedUser" 
          :messages="messages" 
          :current-user-data="currentUserData" 
          :selected-user="selectedUser" 
        />

        <Chat v-else 
          :private-messages="privateMessagesLocal" 
          :commonId="commonId" 
          :current-user-data="currentUserData" 
          :selected-user="selectedUser" 
        />

      </div>
    </div>

    <UsersOnline :usersOnline="usersOnlineObject" 
      :current-user="currentUserData" 
      :selectedUser="selectedUser" 
      :notifications="notifications" 
      @select-user="selectUser" 
      />
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