<template>
	<view>
		<view class="chat-list">
			<block v-for="msg in record">
				<view class="chat-item chat-right" v-if="msg.from_id === userInfo.id">
					<u-avatar :src="host+userInfo.avatar"></u-avatar>
					<view class="chat-content content-right">{{ msg.content }}</view>
				</view>
				<view class="chat-item chat-left" v-else>
					<u-avatar :src="host+chatUser.avatar"></u-avatar>
					<view class="chat-content content-left">{{ msg.content }}</view>
				</view>
			</block>
		</view>
		<view :style="{height: paddingBottom+'px'}" id="chat-bottom"></view>
		<view class="input-bar" :style="{ bottom: keyboardHeight + 'px' }">
			<view class="input-box">
				<input ref="inputRef" class="input" :focus="isFocus" v-model="message" confirm-hold
					cursor-color="#00aa00" confirm-type="send" :adjust-position="false" @focus="inputFocus"
					@blur="inputBlur" @confirm="sendMessage"></input>
				<image class="emoji-btn" :src="`/static/${emojiType}.png`" mode="heightFix"
					@touchstart.prevent="changeEmoji">
				</image>
				<button class="send-btn" size="mini" v-if="message" @touchstart.prevent="sendMessage">发送</button>
				<u-icon name="plus-circle" size="30" v-else @click="more"></u-icon>
			</view>
			<scroll-view class="emoji-scroll" scroll-y :style="{height: emojiHeight+'px'}">
				<view class="emoji-panel">
					<view class="emoji-item" v-for="(item, index) in emojisArr" @touchstart.prevent="message+=item">
						{{item}}
					</view>
				</view>
			</scroll-view>
		</view>

	</view>
</template>
<script>
	import {
		mapGetters
	} from 'vuex';
	import WebSocketService from '@/config/websocket.js';
	export default {
		data() {
			return {
				paddingBottom: 50,
				record: [],
				message: '', // 当前输入消息

				userInfo: uni.getStorageSync('userInfo'),
				chatUser: this.$store.state.currentChatUser,

				page: 0, // 当前页数
				size: 10, //加载条数
				isLoading: false, // 是否在加载中
				noMoreData: false,

				typing: '对方正在输入',
				interval: null,
				isFocus: false,
				keyboardHeight: 0, // 键盘高度
				emojiHeight: 0, //表情高度
				emojiType: 'emoji',
				emojisArr: ['😊', '😁', '😀', '😃', '😣', '😞', '😩', '😫', '😲', '😟', '😦', '😜', '😳', '😋', '😥', '😰',
					'🤠', '😎', '😇', '😉', '😭', '😈', '😕', '😏', '😘', '😤', '😡', '😅', '😬', '😺', '😻', '😽',
					'😼', '🙈', '🙉', '🙊', '🔥', '👍', '👎', '👌', '✌️', '🙏', '💪', '👻'
				],

			};
		},
		computed: {
			...mapGetters(['getCurrentMessage', 'getTyping']), // 使用 Vuex getter 获取聊天消息
		},
		watch: {
			getCurrentMessage(newMessage) {
				console.log(newMessage)
				this.record.push(newMessage);
				this.scrollBottom();
			},
			getTyping(newVal) {
				console.log(newVal)
				if (newVal.state == 1 && newVal.from_id == this.chatUser.id) {
					this.startTyping(); 
				} else { 
					clearInterval(this.interval)
					uni.setNavigationBarTitle({
						title: this.chatUser.nickname
					})
				}
			}
		},
		onPullDownRefresh() {
			if (this.noMoreData) {
				uni.showToast({
					title: '没有更多数据了',
					icon: 'none'
				})
				uni.stopPullDownRefresh()
			}
			this.loadMoreData()
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: this.chatUser.nickname
			})
			this.loadMoreData();
			this.showKeyboard();
		},
		onUnload() {
			console.log('离开页面')
			clearInterval(this.interval);
			this.$store.commit('setCurrentChatUser', null);
			this.$store.commit('setCurrentMessage', {});
			this.api.read({
				to: this.chatUser.id
			})
		},
		methods: {
			loadMoreData() {
				if (this.isLoading || this.noMoreData) return;
				this.isLoading = true; // 设置加载中标志
				this.api.record({
					id: this.chatUser.id,
					page: this.page,
					size: this.size
				}).then(res => {
					uni.stopPullDownRefresh()
					this.isLoading = false; // 加载完成
					this.record = [...res.reverse(), ...this.record]
					if (this.page == 0) {
						this.scrollBottom();
					}
					if (res.length < this.size) {
						this.noMoreData = true;
					} else {
						this.page++;
					}
				})
			},
			showKeyboard() {
				uni.onKeyboardHeightChange((res) => {
					if (res.height > 0) {
						this.emojiType = 'emoji';
						this.emojiHeight = 0;
						this.keyboardHeight = res.height;
						this.paddingBottom = res.height + 50
						this.scrollBottom();
					} else {
						this.keyboardHeight = 0;
						// this.paddingBottom = 50;
						this.scrollBottom();
					}
				});
			},

			sendMessage() {
				if (this.message.trim() === '') return;
				const message = {
					type: "chat",
					content: this.message,
					from_id: this.userInfo.id,
					to_id: this.chatUser.id,
				};
				WebSocketService.sendMessage(message);
				// this.$store.commit('setMessages', message);
				this.$store.commit('setCurrentMessage', message);
				// this.record.push(message);
				this.scrollBottom();
				message.createtime = Math.floor(Date.now() / 1000);
				this.$store.dispatch('updateSessions', {
					from_id: this.chatUser.id,
					content: this.message
				})
				this.message = '';
			},

			more() {
				uni.showToast({
					title: '该功能正在开发中',
					icon: 'none'
				})
			},
			inputFocus() {
				WebSocketService.sendMessage({
					type: 'typing',
					from_id: this.userInfo.id,
					to_id: this.chatUser.id,
					state: 1
				});
			},
			inputBlur() {
				this.emojiHeight = 0;
				this.emojiType = 'emoji';
				this.paddingBottom = 50;
				WebSocketService.sendMessage({
					type: 'typing',
					from_id: this.userInfo.id,
					to_id: this.chatUser.id,
					state: 0
				});
			},
			startTyping() {
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
			changeEmoji() {
				if (this.emojiType === 'emoji') {
					uni.hideKeyboard();
					this.$nextTick(() => {
						this.emojiType = 'keyboard';
						this.emojiHeight = 150;
						this.paddingBottom = 200;
						this.scrollBottom();
					})
				}
				if (this.emojiType === 'keyboard') {
					this.isFocus = true;
					this.$nextTick(() => {
						this.emojiType = 'emoji';
						this.emojiHeight = 0;
						this.scrollBottom();
					})
				}
			},

			scrollBottom() {
				this.$nextTick(() => {
					uni.pageScrollTo({
						selector: '#chat-bottom',
						duration: 100
					});
				})
			},

		}

	};
</script>
<style>
	.chat-list {
		transition: all 0.3 ease;
	}

	.chat-item {
		display: flex;
		margin: 20upx 0;
		padding: 20upx;
		border-radius: 10upx;
		position: relative;
	}

	.chat-right {
		flex-direction: row-reverse;
	}

	.chat-content {
		border-radius: 10upx;
		padding: 16upx;
		margin: 10upx 20upx;
		max-width: 500upx;
		position: relative;
	}

	.content-left {
		background-color: #f3f3f3;
	}

	.content-right {
		background-color: #95ec69;
	}

	.chat-content::after {
		content: '';
		position: absolute;
		top: 30upx;
		border-top: 10upx solid transparent;
		border-bottom: 10upx solid transparent;
		transform: translateY(-50%);
	}

	.content-left::after {
		left: -10upx;
		border-right: 10upx solid #f3f3f3;
	}

	.content-right::after {
		right: -10upx;
		border-left: 10upx solid #95ec69;
	}

	.input-bar {
		position: fixed;
		bottom: 0;
		width: 100%;
		z-index: 999;
		/* border-top: solid 1px #333; */
		background: #f8f8f8;
	}

	.input-box {
		display: flex;
		align-items: center;
		padding: 20upx;
		box-sizing: border-box;
		height: 50px;
	}

	.input {
		flex: 1;
		padding: 10upx 20upx;
		border-radius: 20px;
		background: #eeeeee;

	}

	.emoji-btn {
		height: 30px;
		margin: 0 20upx;
	}

	.send-btn {
		color: #ffffff;
		background: #00aa00;
		border-radius: 20px;
	}

	.emoji-scroll {
		transition: all 0.3s ease;
	}

	.emoji-panel {
		padding: 20upx;
		display: flex;
		flex-wrap: wrap;
	}

	.emoji-item {
		padding: 10upx;
		font-size: 50upx;
	}
</style>