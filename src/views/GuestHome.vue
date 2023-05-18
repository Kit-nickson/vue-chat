<script setup>

import { onMounted, ref } from 'vue';
import router from '../router';

const username = ref('');
const color = ref('');

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

function setColor(e) {
    color.value = e.target.style.background;
}

</script>

<template>

    <div class="guest-data">
        <h2>Your name: <span class="username" :style="'color:'+ color">{{ username }}</span></h2>
        <div>
            <div class="guest-input">
                <input type="text" v-model="username">
                <button>Connect</button>
            </div>

            <div class="name-colors">
                <div>Name color: </div>
                <div class="name-color" @click="setColor($event)" style="background: #ffffff"></div>
                <div class="name-color" @click="setColor($event)" style="background: #f90000"></div>
                <div class="name-color" @click="setColor($event)" style="background: #ffff00"></div>
                <div class="name-color" @click="setColor($event)" style="background: #15ff00"></div>
                <div class="name-color" @click="setColor($event)" style="background: #00bfff"></div>
                <div class="name-color" @click="setColor($event)" style="background: #0800ff"></div>
                <div class="name-color" @click="setColor($event)" style="background: #9900ff"></div>
                <div class="name-color" @click="setColor($event)" style="background: #fb00ff"></div>
                <div class="name-color" @click="setColor($event)" style="background: #3a3a3a"></div>
            </div>
            
        </div>

        <div class="links">
            <router-link class="reg-link" to="/register">Register</router-link>
            <router-link class="reg-link" to="/login">Login</router-link>
        </div>
    </div>

</template>

<style scoped>

    .guest-data {
        width: 340px;
        height: 340px;
        background: #112;
        float: right;
        border-bottom-left-radius: 4px;
    }
    .guest-data h2 {
        margin: 40px auto;
        text-align: center;
    }

    .guest-input {
        display: flex;
        flex-direction: column;
        padding: 10px;
        gap: 10px;
    }
    .guest-input, input, .guest-input button {
        border: none;
        outline: none;
        height: 80px;
        font-size: 1em;
        border-radius: 4px;
    }

    .guest-input button {
        background: rgb(51, 161, 58);
        color: white;
    }
    
    .name-colors {
        margin: 10px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
    }
    
    .name-color {
        height: 20px;
        width: 20px;
        float: left;
        border-radius: 100px;
        transition: box-shadow .4s;
    }
    .name-color:hover {
        cursor: pointer;
        box-shadow: 0 0 3px 3px rgb(255, 119, 0);
    }

    .links {
        display: flex;
        gap: 10px;
        padding: 10px;
    }

    .reg-link {
        flex: 1;
        text-decoration: none;
        font-size: 1.2em;
        background: gold;
        color: black;
        border-radius: 4px;
        transition: background .2s;
        z-index: 100;
        text-align: center;
        width: 120px;
    }

    .reg-link:hover {
        cursor: pointer;
        background: rgb(255, 229, 83);
    }


</style>