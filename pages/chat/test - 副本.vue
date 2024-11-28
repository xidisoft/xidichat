<template>
	<z-paging ref="paging" v-model="dataList" use-chat-record-mode safe-area-inset-bottom @query="queryList"
		@keyboardHeightChange="keyboardHeightChange" @hidedKeyboard="hidedKeyboard">
		<view v-for="(item,index) in dataList" :key="index" style="position: relative;">
			<view style="transform: scaleY(-1);">
				<chat-item :item="item"></chat-item>
			</view>
		</view>
		<!-- 底部聊天输入框 -->
		<template #bottom>
			<chat-input-bar ref="inputBar" @send="doSend" @typing="inputFocus" @stopTyping="inputBlur" />
		</template>
	</z-paging>

</template>

<script>
	import {
		mapGetters
	} from 'vuex';
	import WebSocketService from '@/config/websocket.js';
	export default {
		data() {
			return {
				// v-model绑定的这个变量不要在分页请求结束中自己赋值！！！
				dataList: [],
				chatUser: this.$store.state.currentChatUser,
				my: uni.getStorageSync('userInfo'),
				typing: '对方正在输入',
				interval: null,
			}
		},
		computed: {
			...mapGetters(['getCurrentMessage', 'getTyping']), // 使用 Vuex getter 获取聊天消息
		},
		watch: {
			getCurrentMessage(newMessage) {
				this.$refs.paging.addChatRecordData(newMessage);
			},
			getTyping(newVal) {
				if (newVal.state == 1 && newVal.from_id == this.chatUser.id) {
					this.startLoadingEffect();
				} else {
					clearInterval(this.interval)
					uni.setNavigationBarTitle({
						title: this.chatUser.nickname
					})
				}
			}
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: this.chatUser.nickname
			})
		},
		onUnload() {
			this.$store.commit('setCurrentChatUser', null);
			// this.$store.commit('setMessages', {});
			this.api.read({
				to: this.chatUser.id
			})
		},
		methods: {
			// 发送新消息
			doSend(msg) {
				const message = {
					type: "chat",
					content: msg,
					from_id: this.my.id,
					to_id: this.chatUser.id,
				};
				WebSocketService.sendMessage(message);
				message.createtime = Math.floor(Date.now() / 1000);
				this.$store.dispatch('updateSessions', message)

				this.$refs.paging.addChatRecordData(message);
			},
			inputFocus() {
				WebSocketService.sendMessage({
					type: 'typing',
					from_id: this.my.id,
					to_id: this.chatUser.id,
					state: 1
				});
			},
			inputBlur() {
				WebSocketService.sendMessage({
					type: 'typing',
					from_id: this.my.id,
					to_id: this.chatUser.id,
					state: 0
				});
			},
			startLoadingEffect() {
				let count = 0;
				this.interval = setInterval(() => {
					if (count < 3) {
						this.typing = '对方正在输入' + '.'.repeat(count + 1);
						count++;
					} else {
						count = 0;
						this.typing = '对方正在输入';
					}
					uni.setNavigationBarTitle({
						title: this.typing
					})
				}, 500);
			},
			queryList(page, size) {
				const params = {
					page: page,
					size: size,
					id: this.chatUser.id,
				}
				this.api.record(params).then(res => {
					// 将请求的结果数组传递给z-paging
					this.$refs.paging.complete(res);
				}).catch(res => {
					// 如果请求失败写this.$refs.paging.complete(false);
					// 注意，每次都需要在catch中写这句话很麻烦，z-paging提供了方案可以全局统一处理
					// 在底层的网络请求抛出异常时，写uni.$emit('z-paging-error-emit');即可
					this.$refs.paging.complete(false);
				})
			},
			// 监听键盘高度改变，请不要直接通过uni.onKeyboardHeightChange监听，否则可能导致z-paging内置的键盘高度改变监听失效（如果不需要切换表情面板则不用写）
			keyboardHeightChange(res) {
				this.$refs.inputBar.updateKeyboardHeightChange(res);
			},
			// 用户尝试隐藏键盘，此时如果表情面板在展示中，应当通知chatInputBar隐藏表情面板（如果不需要切换表情面板则不用写）
			hidedKeyboard() {
				this.$refs.inputBar.hidedKeyboard();
			},

		}
	}
</script>

<style scoped>
	
	.popup {
		position: absolute;
		top: -20px;
		height: 200rpx;
		width: 400rpx;
		background-color: red;
		z-index: 1000;
	}
</style>