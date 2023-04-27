<script setup>
    import { computed } from 'vue';

    const props = defineProps(['usersOnline', 'selectedUser', 'currentUser', 'notifications']);

    const notifications = computed(() => props.notifications);
    const selectedUser = computed(() => props.selectedUser);
    const currentUser = computed(() => props.currentUser);

    function notification(userId) {
        if (selectedUser.value !== null && selectedUser.value.id === userId) {
            return;
        }
        if (notifications.value.includes(userId)) {
            return 'notification';
        }
    }

    function showSelectedUser(userId) {
        if (selectedUser.value !== null && selectedUser.value.id === userId) {
            return 'selected-user'
        }
    }

    function showCurrentUser(userId) {
        if (currentUser.value.userId === userId) {
            return 'current-user'
        }
    }
</script>

<template>
    <div class="users-online">
        <h2>Users Online</h2>
        
        <ul v-for="userOnline in usersOnline">
            <li @click="$emit('selectUser', $event)" 
                :data-id="userOnline.userId"
                :class="showSelectedUser(userOnline.userId) + ' ' + showCurrentUser(userOnline.userId) + ' ' + notification(userOnline.userId)"
                >
                {{ userOnline.username }}
                <div class="status"></div>
            </li>
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
        background: rgb(152, 74, 96);
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

    .current-user {
        background: rgb(46, 46, 154);
    }

    .selected-user {
        background: rgb(126, 54, 75);
    }

    .notification {
        box-shadow: inset 4px 0px 0px 0px gold;
        /* animation: notification .8s infinite alternate; */
    }

    /* @keyframes notification {
        100% {
            box-shadow: inset 4px 0px 0px 0px gold;
        }
    } */
</style>