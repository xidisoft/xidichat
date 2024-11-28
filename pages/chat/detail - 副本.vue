<template>
	<view class="chat-container">
		<scroll-view class="chat-scroll" scroll-y @scrolltoupper="loadMoreData" :scroll-top="scrollTop">
			<view id="record">
				<view v-for="msg in record">
					<view class="chat-right" v-if="msg.from_id === myId">
						<view>{{ msg.content }}</view>
						<image :src="myAvatar" mode="aspectFill"></image>
					</view>
					<view class="chat-left" v-else>
						<image :src="chatAvatar" mode="aspectFill"></image>
						<view>{{ msg.content }}</view>
					</view>
				</view>
				<view v-for="(item, index) in getMessages" :key="index">
					<view class="chat-right" v-if="item.from === myId">
						<view>{{ item.content }}</view>
						<image :src="myAvatar" mode="aspectFill"></image>
					</view>
					<view class="chat-left" v-else>
						<image :src="chatAvatar" mode="aspectFill"></image>
						<view>{{ item.content }}</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<view class="typing" v-if="showTyping">
			<u-icon name="edit-pen-fill" :label="label" label-color="#fff" color="#fff"></u-icon>
		</view>
		<view class="input-container">
			<view class="input">
				<input v-model="message" id="chatInput" :focus="isFocus" confirm-type="send" placeholder="输入消息..."
					class="input-box" @focus="focus" @blur="blur" @confirm="sendMessage" />
				<image class="emoji-img" src="/static/emoji.png"></image>
				<button class="send-button" size="mini" @click="sendMessage">发送</button>
			</view>
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
				
				showTyping: false,
				scrollTop: 0,
				record: [],
				myId: uni.getStorageSync('userInfo')['id'],
				message: '', // 当前输入消息
				myAvatar: uni.getStorageSync('userInfo')['avatar'],
				chatAvatar: this.host + this.$store.state.currentChatUser.avatar,
				page: 0, // 当前页数
				size: 10, //加载条数
				isLoading: false, // 是否在加载中
				noMoreData: false,
				height: 0, //聊天容器高度
				label: '对方正在输入',
				interval: null,
				chatId: this.$store.state.currentChatUser.id,
				isFocus: false,

			};
		},
		computed: {
			...mapGetters(['getMessages', 'getTyping']), // 使用 Vuex getter 获取聊天消息
		},
		watch: {
			getMessages(newMessages) {
				this.scrollBottom();
			},
			getTyping(newVal) {
				if (newVal.state == 1 && newVal.from == this.chatId) {
					this.startLoadingEffect();
					this.showTyping = true
				} else {
					this.showTyping = false
					clearInterval(this.interval)
				}
			}
		},

		onShow() {
			this.scrollBottom()
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: '聊天'
			})
			this.loadMoreData()
		},
		onUnload() {
			this.$store.commit('setCurrentChatUser', null);
			this.$store.commit('setMessages', {});
			this.api.read({
				to: this.chatId
			})
		},
		
		methods: {
			focus() {
				WebSocketService.sendMessage({
					type: 'typing',
					from: this.myId,
					to: this.chatId,
					state: 1
				});
			},
			blur() {
				WebSocketService.sendMessage({
					type: 'typing',
					from: this.myId,
					to: this.chatId,
					state: 0
				});
			},
			startLoadingEffect() {
				let count = 0;
				this.interval = setInterval(() => {
					if (count < 3) {
						this.label = '对方正在输入' + '.'.repeat(count + 1);
						count++;
					} else {
						count = 0;
						this.label = '对方正在输入';
					}
				}, 500);
			},
			scrollBottom(e = true) {
				this.scrollTop = '';
				if (e) {
					this.height = 0;
				}
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select("#record").boundingClientRect((
						rect) => {
						this.scrollTop = rect.height - this.height;
						this.height = rect.height
					}).exec();
				});
			},
			sendMessage() {
				this.message = ''
				this.isFocus = false
				setTimeout(function() {
					this.focus = true
				}, 50)
				return false;
				if (this.message.trim() === '') return;
				const message = {
					type: "chat",
					content: this.message,
					from: uni.getStorageSync('userInfo')['id'],
					to: this.chatId,
				};
				WebSocketService.sendMessage(message);
				this.$store.commit('setMessages', message);
				this.message = '';
			},
			loadMoreData() {
				if (this.isLoading || this.noMoreData) return;
				this.isLoading = true; // 设置加载中标志
				this.api.record({
					id: this.chatId,
					page: this.page,
					size: this.size
				}).then(res => {
					if (res.length < this.size) {
						this.noMoreData = true;
					} else {
						this.page++;
					}
					this.record = [...res.reverse(), ...this.record]
					this.isLoading = false; // 加载完成
					this.scrollBottom(false)
				})
			},

		}
	};
</script>

<style>
	.typing {
		position: fixed;
		top: 0;
		width: 100%;
		padding: 10upx;
		box-sizing: border-box;
		background: #00aa00;
		display: flex;
		justify-content: center;
	}

	.chat-container {
		/* display: flex;
		flex-direction: column; */
		/* height: 100vh; */
		/* padding-top: 44px; */
	}

	.chat-scroll {
		/* height: calc(100vh - 100upx); */
		/* flex: 1; */
		/* padding: 20upx;
		box-sizing: border-box; */
	}

	.chat-left {
		display: flex;
		align-items: flex-start;
		margin: 10px 0;
		padding: 10px;
		border-radius: 5px;
		position: relative;
		justify-content: flex-start;
	}

	.chat-right {
		display: flex;
		align-items: flex-start;
		margin: 10px 0;
		padding: 10px;
		border-radius: 5px;
		position: relative;
		justify-content: flex-end;
	}

	.chat-left>image,
	.chat-right>image {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin-left: 0;
		margin-right: 10px;
	}

	.chat-right>image {
		margin-left: 10px;
		margin-right: 0;
	}

	.chat-left>view,
	.chat-right>view {
		max-width: 70%;
		word-wrap: break-word;
		word-break: break-all;
		background-color: #f3f3f3;
		border-radius: 15px;
		padding: 10px;
		position: relative;
	}

	.chat-right>view {
		background-color: #95ec69;
	}

	.chat-left>view::after {
		content: '';
		position: absolute;
		top: 40upx;
		border-top: 10upx solid transparent;
		border-bottom: 10upx solid transparent;
		transform: translateY(-50%);
		left: -10upx;
		border-right: 10upx solid #f3f3f3;
	}


	.chat-right>view::after {
		content: '';
		position: absolute;
		top: 40upx;
		border-top: 10upx solid transparent;
		border-bottom: 10upx solid transparent;
		transform: translateY(-50%);
		right: -10upx;
		border-left: 10upx solid #95ec69;
	}

	.input-container {
		position: fixed;
		bottom: 0;
		width: 100%;
		box-sizing: border-box;
		padding: 20upx;
		height: 50px;
		background-color: #f3f3f3;
	}

	.input {
		/* height: 50px; */

		display: flex;
		align-items: center;
	}

	.input-box {
		flex: 1;
		padding: 10upx 20upx;
		border: 1px solid #ccc;
		border-radius: 20px;
		background: #fff;
	}

	.emoji-img {
		width: 54rpx;
		height: 54rpx;
	}

	.send-button {
		margin-left: 20upx;
		background: #00aa00;
		color: #fff;
		border-radius: 20px;
	}

	.emoji {
		background: #00aa00;
	}
</style>