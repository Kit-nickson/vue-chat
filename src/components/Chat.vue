<script setup>
    import { ref, computed } from 'vue';
    import { socket } from "@/socket";
    
    const props = defineProps(['messages', 'currentUserData']);

    const message = ref('');

    const currentUser = computed(() => props.currentUserData);
    
    function sendMessage() {
        socket.emit('message', { 
            message: message.value,
            from: currentUser.value,
        });

        message.value = '';
    }
</script>

<template>
    <div class="chat-container">
        <h1>Chat</h1>
        <div class="messages-display">
            <div v-for="message in messages">
                <p><strong>{{ message.from.username }} </strong>: {{ message.message }}</p>
            </div>
        </div>
        <form @submit.prevent="sendMessage" class="write-msg">
            <input type="text" v-model="message">
            <button>Send</button>            
        </form>
    </div>
</template>

<style scoped>
    .chat-container {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    } 
    .chat-container h1 {
        text-align: center;
        padding: 10px;
        background: rgb(40, 37, 59);
    }
    
    .messages-display {
        flex: 1;
        padding: 10px;
    }
    
    .write-msg {
        display: flex;
        height: 40px;
        width: 100%;
    }
    .write-msg input {
        flex: 4;
        border: none;
        outline: none;
        font-size: 1.2em;
    }
    .write-msg button {
        flex: 1;
        font-size: 1.2em;
        background: orange;
        border: none;
        outline: none;
        transition: background .2s;
    }
    .write-msg button:hover { 
        background: rgb(255, 183, 50);
    }

    strong {
        color: red;
        font-weight: bold;
    }
        

</style>