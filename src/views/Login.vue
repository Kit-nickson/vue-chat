<script setup>
    import { ref } from 'vue';
    import axios from 'axios';
    import router from '../router';

    const username = ref('');
    const password = ref('');
    const error = ref(null);

    function setCookie(name, value, days) {
        const date = new Date();

        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        const expires = "expires=" + date.toUTCString();

        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }


    function login() {
        // check if data has been entered

        const userData = {
            username: username.value,
            password: password.value
        }

        axios.post('http://localhost:8080/login', userData)
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
    }


</script>

<template>
    <div class="container">

    <router-link class="reg-link" to="/register">Register</router-link>

    <h1>Login</h1>

    <div class="error">{{ error }}</div>

    <form @submit.prevent="login()">
      <label for="name">Name</label>
      <input type="text" name="name" v-model="username" required>
      <label for="password">Password</label>
      <input type="password" name="password" v-model="password" required>
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
  }
  .reg-link:hover {
    cursor: pointer;
    background: rgb(255, 229, 83);
  }

</style>