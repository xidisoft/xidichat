import store from '@/store';
import Vue from 'vue';
let socket = null;
let reconnectCount = 0; // 重连次数计数器
let maxReconnectAttempts = 5; // 最大重连次数
let heartbeatInterval = null; // 心跳定时器
const serverUrl = "ws://106.14.156.8:8282"; // WebSocket 服务地址

const WebSocketService = {
	init() {
		if (socket) return;
		this.initAudio(); // 初始化音频
		socket = uni.connectSocket({
			url: serverUrl,
			success: () => console.log("WebSocket 连接成功"),
			fail: (err) => console.error("WebSocket 连接失败:", err),
		});
		socket.onOpen(() => {
			reconnectCount = 0; // 重置重连次数
			this.startHeartbeat(); // 开启心跳检测
		});
		socket.onMessage((res) => {
			const data = JSON.parse(res.data);
			switch (data.type) {
				case 'init':
					Vue.prototype.api.bind({
						client: data.client
					}).then(res => {
						store.commit('setUnreadTotal', res);
						//#ifndef H5
						if (res > 0) {
							this.play();
						}
						//#endif
					})
					break;
				case 'chat': //这里需要判断是否处理会话列表和总消息数
					if (store.state.currentChatUser && data.from_id == store.state.currentChatUser.id) {
						store.commit('setCurrentMessage', {
							from_id: data.from_id,
							content: data.content,
							to_id: data.to_id
						});
					} else {
						store.commit('setUnreadTotal', 1);
					}
					store.dispatch('updateSessions', data)
					this.play();
					break;
				case 'typing':
					store.commit('setTyping', {
						state: data.state,
						from_id: data.from_id
					});
					break;
				case 'logout':
					store.commit('updateLogout', data.client)
					break;
			}
		});
		socket.onClose(() => {
			socket = null;
			this.reconnectWebSocket();
		});
		socket.onError((error) => {
			socket = null;
			this.reconnectWebSocket();
		});
	},
	close() {
		if (socket) {
			socket.close();
			socket = null;
		}
	},
	//心跳检测
	startHeartbeat() {
		if (heartbeatInterval) clearInterval(heartbeatInterval);
		heartbeatInterval = setInterval(() => {
			console.log('发送心跳检测');
			uni.sendSocketMessage({
				data: JSON.stringify({
					type: 'ping'
				}),
				fail(err) {
					console.error('心跳发送失败：', err);
				},
			});
		}, 30000); // 每 30 秒发送一次心跳
	},

	// 重连逻辑
	reconnectWebSocket() {
		if (reconnectCount >= maxReconnectAttempts) {
			console.error('已达到最大重连次数，放弃重连');
			return;
		}
		reconnectCount++;
		setTimeout(() => {
			this.init()
		}, 3000); // 3 秒后尝试重连
	},

	sendMessage(message) {
		if (socket) {
			socket.send({
				data: JSON.stringify(message),
				success: () => {
					return true;
				},
				fail: (err) => {
					return false;
				},
			});
		} else {
			console.error("WebSocket 尚未连接");
		}
	},
	play() {
		if (this.audioContext) {
			this.audioContext.play();
		}
	},
	initAudio() {
		this.audioContext = uni.createInnerAudioContext(); // 创建音频实例
		this.audioContext.src = '/static/receive.mp3'; // 设置音频资源地址
		this.audioContext.autoplay = false; // 自动播放关闭
		this.audioContext.loop = false; // 不循环
		// 监听错误事件
		this.audioContext.onError((res) => {
			console.error('音频播放出错', res);
		});
	},


};

export default WebSocketService;