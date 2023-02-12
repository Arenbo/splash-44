import { writable } from 'svelte/store';

const messageStore = writable({ status: "storeinit" });
// const messageStore = writable([]);

const socket = new WebSocket('ws://localhost:9010');

socket.addEventListener('open', function (event) {
    console.log("store ws open");
});

socket.addEventListener('message', function (event) {
    console.log('store ws message received', event.data);

    const dataObj = JSON.parse(event.data);

    messageStore.set(dataObj);
    // messageStore.update(messageStore => [...messageStore, dataObj]);
});

const sendMessage = (message) => {
	if (socket.readyState <= 1) {
		socket.send(message);
	}
}

export default {
	subscribe: messageStore.subscribe,
	sendMessage
}