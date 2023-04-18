<script setup>
    import { ref, watch, inject } from 'vue';
    
    const message = ref('');
    const messages = ref([]);

    let socket = inject('socket');

    watch(socket, () => {
        socket = socket.value;
    })
    
    function sendMessage() {
        socket.emit('message', { message: message.value });
        
        socket.on('message', (data) => {
            console.log('1234');
            messages.value.push(data);

            console.log(messages);
        })
    }

</script>


<template>
    <div class="chat-container">
        <h1>Chat</h1>
        <div class="messages-display" v-for="message in messages">
            <p>{{ message.message }}</p>
        </div>
        <div class="write-msg">
            <input type="text" v-model="message">
            <button @click="sendMessage">Send</button>
        </div>
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
        

</style>