<script setup>
    defineProps(['usersOnline']);
</script>

<template>
    <div class="users-online">
        <h2>Users Online</h2>
        
        <ul v-for="userOnline in usersOnline">
          <li>{{ userOnline.username }}<div class="status"></div></li>
        </ul>
  </div>
</template>

<style scoped>
    .users-online {
        width: 250px;
        background: #224;
        height: 100vh;
        z-index: 10;
    }
    .users-online  h2 {
        text-align: center;
        padding: 10px;
     }

    .users-online ul {
        display: flex;
        flex-direction: column;
        list-style: none;
        padding: 0;
    }
    
    .users-online ul li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
        padding: 10px;
        transition: background .2s;
    }
    .users-online ul li:hover {
        background: #446;
     }

    .status {
        border-radius: 100%;
        background: lime;
        height: 10px;
        width: 10px;
        border: none;
        outline: none;
    }

</style>