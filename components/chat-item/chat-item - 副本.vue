<!-- z-paging聊天item -->

<template>
	<view class="p20">
		<view class="chat-time" v-if="item.createtime">
			{{item.createtime}}
		</view>
		<view class="chat-right" v-if="item.from_id==my.id">
			<u-avatar :src="my.avatar"></u-avatar>
			<view class="chat-content content-right">
				{{item.content}}
			</view>
		</view>
		<view class="chat-left" v-else>
			<u-avatar :src="chatUser.avatar"></u-avatar>
			<view class="chat-content content-left">
				{{item.content}}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "chat-item",
		props: {
			item: {
				type: Object,
				default: function() {
					return {}
				}
			}
		},
		data() {
			return {
				my: uni.getStorageSync('userInfo'),
				chatUser: this.$store.state.currentChatUser,
			};
		}
	}
</script>

<style scoped>
	.chat-time {
		padding: 4upx 0;
		text-align: center;
		font-size: 22upx;
		color: #aaaaaa;
	}

	.chat-right {
		display: flex;
		flex-direction: row-reverse;
	}

	.chat-left {
		display: flex;
	}

	.chat-content {
		border-radius: 10upx;
		padding: 16upx;
		margin: 10upx 20upx;
		max-width: 500upx;
		position: relative;
	}

	.content-left {
		background-color: #f1f1f1;
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
		border-right: 10upx solid #f1f1f1;
	}

	.content-right::after {
		right: -10upx;
		border-left: 10upx solid #95ec69;
	}
</style>