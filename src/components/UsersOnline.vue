<script setup>
    import { computed } from 'vue';

    const props = defineProps(['usersOnline', 'notifications']);

    const notifications = computed(() => props.notifications);

    function notification(userId) {
        if (notifications.value.includes(userId)) {
            return 'notification';
        }
    }
</script>

<template>
    <div class="users-online">
        <h2>Users Online</h2>
        
        <ul v-for="userOnline in usersOnline">
          <li @click="$emit('selectUser', $event)" :data-id="userOnline.userId">{{ userOnline.username }}<div class="status" :class="notification(userOnline.userId)"></div></li>
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
        cursor: pointer;
     }

    .status {
        border-radius: 100%;
        background: lime;
        height: 10px;
        width: 10px;
        border: none;
        outline: none;
    }

    .notification {
        animation: notification 2s infinite linear alternate;
    }

    @keyframes notification {
        100% {
            background: red;
        }
    }

</style>