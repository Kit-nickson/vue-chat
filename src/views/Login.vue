<script setup>
  import { ref } from 'vue';
  import router from '../router';
  import axios from 'axios';
  
  const username = ref('');
  const password = ref('');
  const email = ref('');
  const error = ref(null);


  function setCookie(name, value, days) {
    const date = new Date();

    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    const expires = "expires=" + date.toUTCString();

    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  
  function login() {
    // save user data on the server and reply TRUE if everything is okay
    
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
        error.value = err.response.data.message;
        console.log(err.response.data.message);
      });

    // const date = Math.floor(Date.now() / 1000);

    // setCookie('Auth', username.value+'-'+date, 30);

    // router.push('/');
  }

</script>

<template>
  <div class="container">
    <h1>Login</h1>

    <div class="error">{{ error }}</div>

    <form @submit.prevent="login()">
      <label for="name">Name</label>
      <input type="text" name="name" v-model="username" required>
      <label for="email">Email</label>
      <input type="email" name="email" v-model="email" required>
      <label for="password">Password</label>
      <input type="password" name="password" v-model="password" required>
      <input type="submit" value="Submit">
    </form>

  </div>
</template>


<style scoped>
  .container {
    background: burlywood;
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

  .error {
    width: 60%;
    background: red;
    border-radius: 4px;
    margin: 20px auto;
  }

</style>
