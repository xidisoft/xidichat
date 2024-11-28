// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		typing: {},
		unreadTotal: 0, //未读消息总数
		message: {}, //当前聊天消息最新一条
		sessions: [], //会话列表
		users: [], // 在线用户列表，可选
		currentChatUser: uni.getStorageSync('currentChatUser') || null, // 当前聊天的用户I
	},
	mutations: {
		setTyping(state, type) {
			state.typing = type
		},

		setCurrentMessage(state, message) {
			if (state.currentChatUser) {
				state.message = message
			} else {
				state.message = {}
			}
		},

		setUnreadTotal(state, unread) {
			state.unreadTotal += unread
		},

		// 设置当前聊天的用户
		setCurrentChatUser(state, user) {
			if (user) {
				uni.setStorageSync('currentChatUser', user)
			} else {
				uni.removeStorageSync('currentChatUser')
			}
			state.currentChatUser = user;
		},
		setSessions(state, data) {
			state.sessions = [...state.sessions, ...data]
		},
		updateLogout(state, uid) {
			let index = state.sessions.findIndex(item => item.id === uid);
			if (index !== -1) {
				Vue.set(state.sessions[index], 'online', 0);
			}
		},

		updateUnreads(state, uid) {
			let index = state.sessions.findIndex(item => item.id === uid);
			Vue.set(state, 'unreadTotal', state.unreadTotal - state.sessions[index].unread);
			Vue.set(state.sessions[index], 'unread', 0);
		},
	},
	actions: { //异步改变state
		updateSessions({
			commit,
			state
		}, msg) {
			let index = state.sessions.findIndex(item => item.id === msg.from_id);
			if (index !== -1) { // 如果找到了，就更新元素
				Vue.set(state.sessions[index], 'content', msg.content);
				Vue.set(state.sessions[index], 'createtime', Math.floor(Date.now() / 1000));
				if (state.currentChatUser && msg.from_id == state.currentChatUser.id) {

				} else {
					Vue.set(state.sessions[index], 'unread', ++state.sessions[index].unread);
				}
				const [element] = state.sessions.splice(index, 1); // 删除该元素并返回
				state.sessions.unshift(element); // 将该元素移动到数组前面
			} else { // 如果没有找到，插入新元素
				Vue.prototype.api.getUser({
					id: msg.from_id
				}).then(res => {
					state.sessions.unshift({
						id: msg.from_id,
						content: msg.content,
						from_id: msg.from_id,
						to_id: uni.getStorageSync('userInfo')['id'],
						nickname: res.nickname,
						avatar: res.avatar,
						unread: 1,
						online: 1,
						createtime: Math.floor(Date.now() / 1000)
					});
				})
			}
		},

	},
	getters: {
		//未读消息总数
		getUnreadTotal(state) {
			return state.unreadTotal;
		},
		// 获取当前正在聊天的消息
		getCurrentMessage(state) {
			return state.message
		},

		getSessions(state) {
			return state.sessions;
		},
		// 获取输入状态
		getTyping(state) {
			return state.typing;
		},
	}
});

export default store;