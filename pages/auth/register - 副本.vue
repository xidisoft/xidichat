<template>
	<view class="p40">
		<image src="/static/logo.png" mode="widthFix" class="logo"></image>
		<u--input v-model="username" placeholder="用户名" border="bottom"></u--input>
		<u--input type="password" v-model="password" placeholder="密码" border="bottom"></u--input>
		<u--input type="password" v-model="repeat" placeholder="确认密码" border="bottom"></u--input>


		<u-input v-model="captcha" placeholder="验证码" border="bottom">
			<template slot="suffix">
				<u-code ref="uCode" @change="codeChange" seconds="20" changeText="X秒重新获取哈哈哈"></u-code>
				<u-button @tap="getCode" :text="tips" type="success" size="mini"></u-button>
			</template>
		</u-input>

		<u-gap></u-gap>
		<u-button type="primary" shape="circle" @click="register">立即注册</u-button>
		<view class="forget">
			<text>已有账号，去</text>
			<navigator url="/pages/auth/login" style="color: #00aa00;">登录</navigator>
		</view>
	</view>
</template>
<script>
	import WebSocketService from '@/config/websocket.js';
	export default {
		data() {
			return {
				checked: false,
				username: '',
				password: '',
				repeat: '',
				tips:'',
				captcha:''
			}
		},
		methods: {
			codeChange(text) {
				this.tips = text;
			},
			getCode() {
				if (this.$refs.uCode.canGetCode) {
					// 模拟向后端请求验证码
					uni.showLoading({
						title: '正在获取验证码'
					})
					setTimeout(() => {
						uni.hideLoading();
						// 这里此提示会被this.start()方法中的提示覆盖
						uni.$u.toast('验证码已发送');
						// 通知验证码组件内部开始倒计时
						this.$refs.uCode.start();
					}, 2000);
				} else {
					uni.$u.toast('倒计时结束后再发送');
				}
			},
			change(e) {
				console.log('change', e);
			},
			send() {
				this.api.sendSms({
					country: this.country,
					mobile: this.mobile
				}).then(res => {
					console.log(res)
				})
			},
			register() {
				this.api.register({
					username: this.username,
					password: this.password,
					repeat: this.repeat
				}).then(data => {
					uni.setStorageSync('userInfo', data.userinfo)
					WebSocketService.init();
					uni.showToast({
						title: '注册成功'
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

	.forget {
		display: flex;
		justify-content: center;
		padding: 40upx 20upx;
		font-size: 24upx;
	}
</style>