// api.js

export default {
	install(Vue) {
		const http = uni.$u.http

		Vue.prototype.host = http.config.baseURL;
		Vue.prototype.api = {
			index: (params, config = {}) => http.post('api/chat/index', params, config), // 首页
			detail: (params, config = {}) => http.post('api/index/detail', params, config), // 首页
			bind: (params, config = {}) => http.post('api/chat/bind', params, config), // 首页
			send: (params, config = {}) => http.post('api/chat/send', params, config), // 首页
			message: (params, config = {}) => http.post('api/chat/message', params, config), // 首页
			record: (params, config = {}) => http.post('api/chat/record', params, config), // 首页

			chatList: (params, config = {}) => http.post('api/chat/chatList', params, config), // 首页
			login: (params, config = {}) => http.post('api/user/login', params, config), // 首页
			logout: (params, config = {}) => http.post('api/user/logout', params, config), // 首页
			register: (params, config = {}) => http.post('api/user/register', params, config), // 首页

			getUser: (params, config = {}) => http.post('api/chat/getUser', params, config), //获取用户、头像
			read: (params, config = {}) => http.post('api/chat/read', params, config), //获取用户、头像
			updateVersion: (params, config = {}) => http.post('api/index/update', params, config), //更新版本
			sendSms: (params, config = {}) => http.post('api/sms/send', params, config), //更新版本
			updateProfile: (params, config = {}) => http.post('api/index/profile', params, config), //更新版本
			updateNickname: (params, config = {}) => http.post('api/index/nickname', params, config),
		}
	}
}