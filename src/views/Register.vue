<script setup>
  import { ref, onMounted } from 'vue';
  import router from '../router';
  import axios from 'axios';
  
  const username = ref('');
  const password = ref('');
  const email = ref('');
  const error = ref(null);

  onMounted(() => {
    checkAuth();
  });

  function checkAuth() {
    if (isUserAuth('chat_userdata') || isUserAuth('chat_token')) {
      router.push('/');
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

  function setCookie(name, value, days) {
    const date = new Date();

    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    const expires = "expires=" + date.toUTCString();

    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  
  function register() {
    // check if data has been entered

    const userData = {
      username: username.value,
      email: email.value,
      password: password.value
    };

    axios.post('http://localhost:8080/register', userData)
      .then(resp => {
        if (resp.data.uuid) {
          setCookie('chat_userdata', username.value+'-'+resp.data.uuid, 30);
          setCookie('chat_token', resp.data.token, 30);
          router.push('/');
        }
      })
      .catch(err => {
        username.value = '';
        password.value = '';
        email.value = '';
        error.value = err.response.data.message;
        console.log(err.response.data.message);
      });
  }

</script>

<template>
  <div class="container">

    <router-link class="reg-link" to="/login">Login</router-link>
    <router-link class="reg-link guest-link" to="/guest">Guest Mode</router-link>

    <h1>Register</h1>

    <div class="error">{{ error }}</div>

    <form @submit.prevent="register()">
      <label for="name">Name</label>
      <input type="text" id="name" v-model="username" required>
      <label for="email">Email</label>
      <input type="email" id="email" v-model="email" required>
      <label for="password">Password</label>
      <input type="password" id="password" v-model="password" required>
      <input type="submit" value="Submit">
    </form>

  </div>
</template>


<style scoped>
  .container {
    background: rgb(74, 74, 139);
    padding: 20px;
    border-radius: 10px;
    margin: 100px auto;
    text-align: center;
    width: 50%;
  }

  .container form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .container form input, form label {
    height: 30px;
    width: 60%;
    border-radius: 4px;
    border: none;
    outline: none;
    font-size: 1.2em;
  }
  
  .container form input {
    margin-bottom: 20px;
  }

  .container label {
    text-align: left;
  }

  input:last-of-type {
    background: gold;
    transition: background .2s;
  }

  input:last-of-type:hover {
    cursor: pointer;
    background: rgb(255, 229, 83);
  }

  .error {
    width: 60%;
    background: red;
    border-radius: 4px;
    margin: 20px auto;
  }

  .reg-link {
    position: absolute;
    top: 20px;
    right: 20px;
    text-decoration: none;
    font-size: 1.2em;
    background: gold;
    color: black;
    padding: 5px;
    border-radius: 4px;
    transition: background .2s;
    z-index: 100;
    width: 120px;
  }
  .reg-link:hover {
    cursor: pointer;
    background: rgb(255, 229, 83);
  }

  .guest-link {
    left: 30px;
  }

</style>
