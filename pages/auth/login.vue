<template>
	<view class="p40">
		<image src="/static/logo.png" mode="widthFix" class="logo"></image>
		<u-input v-model="account" prefixIcon="account" placeholder="手机号码" border="bottom"></u-input>
		<u-gap></u-gap>
		<u-input v-model="password" type="password" prefixIcon="lock" placeholder="初始密码手机后6位" border="bottom"></u-input>
		<u-gap></u-gap>
		<view class="mt20 pt20">
			<u-button type="primary" shape="circle" @click="login">立即登录</u-button>
		</view>
		<navigator url="/pages/auth/register" hover-class="none" class="text-center p20 m20 xs-font">
			<text>没有账户？去</text>
			<text style="color: #00aa00;">注册</text>
		</navigator>
	</view>
</template>

<script>
	import WebSocketService from '@/config/websocket.js';
	export default {
		data() {
			return {
				account: '',
				password: '',
			}
		},

		methods: {
			login() {
				if (uni.$u.test.isEmpty(this.account)) {
					return uni.$u.toast('账号不能为空')
				}
				if (uni.$u.test.isEmpty(this.password)) {
					return uni.$u.toast('密码不能为空')
				}
				this.api.login({
					account: this.account,
					password: this.password
				}).then(data => {
					uni.setStorageSync('userInfo', data.userinfo)
					WebSocketService.init();
					uni.showToast({
						title: '登录成功'
					})
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/index'
						})
					}, 1500)
				})
			}

		}
	}
</script>

<style>
	.p40 {
		padding: 40upx;
	}

	.logo {
		width: 100%;
		margin: 50upx auto;
	}
</style>