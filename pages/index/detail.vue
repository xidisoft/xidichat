<template>
	<view>
		<view class="avatar">
			<u-avatar :src="host+user.avatar" size="80" mode="aspectFill"></u-avatar>
			<view class="mt20">{{user.nickname}}</view>
		</view>
		<view class="flex m20 p20 border-b">
			<view class="title">技术栈</view>
			<view class="content">
				<text class="p10 m10 grey-bg" v-for="item in user.lang">{{item}}</text>
			</view>
		</view>
		<view class="flex-center m20 p20 border-b">
			<view class="title">地区</view>
			<view class="content">
				<text class="p10 m10">江苏徐州</text>
			</view>
		</view>
		<view class="flex-center m20 p20 border-b">
			<view class="title">接私活</view>
			<view class="content">
				<text class="p10 m10">{{['否','是'][user.is_free]}}</text>
			</view>
		</view>

		<view class="contact">
			<u-button type="success" @click="toChat(user)">立即沟通</u-button>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				user: {}
			}
		},
		onLoad(e) {
			this.api.detail({
				id: e.id
			}).then(res => {
				this.user = res;
			})
		},
		methods: {
			toChat(e) {
				if (e.id == uni.getStorageSync('userInfo').id) {
					return uni.showToast({
						title: '不能跟自己聊天',
						icon: 'none'
					})
				}
				this.$store.commit('setCurrentChatUser', e);
				// 点击用户后，跳转到聊天页面
				uni.navigateTo({
					url: '/pages/chat/detail'
				});
			}

		}
	}
</script>

<style>
	.avatar {
		background: #00aa00;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20upx;
		color: #eee;
	}

	.title {
		color: #999;
		flex: 1;
	}

	.content {
		flex: 3;
		display: flex;
		flex-wrap: wrap;
	}

	.contact {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 20upx;
		box-sizing: border-box;

	}
</style>