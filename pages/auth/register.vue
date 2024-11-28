<template>
	<view class="p40">
		<image src="/static/logo.png" mode="widthFix" class="logo"></image>
		<u-input v-model="mobile" placeholder="手机号" border="bottom"></u-input>
		<u-input v-model="captcha" placeholder="验证码" border="bottom">
			<template slot="suffix">
				<u-code ref="uCode" @change="codeChange" seconds="60" changeText="X秒重新获取"></u-code>
				<u-button @tap="getCode" :text="tips" type="success" size="mini"></u-button>
			</template>
		</u-input>
		<u-gap></u-gap>
		<u-button type="primary" shape="circle" @click="register">立即注册</u-button>
		<navigator url="/pages/auth/login" hover-class="none" class="text-center p20 m20 xs-font">
			<text>已有账号，去</text>
			<text style="color: #00aa00;">登录</text>
		</navigator>
	</view>
</template>
<script>
	import WebSocketService from '@/config/websocket.js';
	export default {
		data() {
			return {
				mobile: '',
				tips: '',
				captcha: ''
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
					this.api.sendSms({
						mobile:this.mobile
					}).then(res => {
						uni.hideLoading();
						// 这里此提示会被this.start()方法中的提示覆盖
						uni.$u.toast('验证码已发送');
						// 通知验证码组件内部开始倒计时
						this.$refs.uCode.start();
					})
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
					mobile:this.mobile,
					captcha:this.captcha
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
</style>