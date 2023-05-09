<script setup>
    import { ref, computed } from 'vue';
    import { socket } from "@/socket";
    
    const props = defineProps(['messages', 'privateMessages', 'commonId', 'currentUserData', 'selectedUser']);

    const message = ref('');

    const messages = computed(() => props.messages);
    const privateMessages = computed(() => props.privateMessages);
    const currentUser = computed(() => props.currentUserData);
    const selectedUser = computed(() => props.selectedUser);
    const commonId = computed(() => props.commonId);
    
    function sendMessage() {
        
        if (!selectedUser.value) {
            socket.emit('message', { 
                message: message.value,
                from: currentUser.value,
            });
        } else {
            socket.emit('private-message', {
                message: message.value,
                from: currentUser.value,
                to: selectedUser.value.id
            });
        }
        message.value = '';
    }
</script>

<template>
    <div class="chat-container">
        <h1 v-if="!selectedUser">Chat</h1>
        <h1 v-else="selectedUser">Chat with {{ selectedUser.username }}</h1>
        
        <div class="messages-display">
            
            <div v-if="!selectedUser" v-for="message in messages">
                <p><strong>{{ message.from.username }} </strong>: {{ message.message }}</p>
            </div>

            <div v-else v-for="message in privateMessages[commonId]">
                <p><strong>{{ message[0].from }} </strong>: {{ message[0].message }}</p>
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
        overflow-y: scroll;
        max-height: 79vh;
    }

    .messages-display::-webkit-scrollbar {
        width: 0.5em;
    }
    
    .messages-display::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    }
    
    .messages-display::-webkit-scrollbar-thumb {
        border-radius: 100px;
        background-color: #112;
        outline: 1px solid #114;
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