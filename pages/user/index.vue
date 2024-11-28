<template>
	<view>
		<view class="center">
			<u-avatar :src="host+userInfo.avatar" size="50" mode="aspectFill"></u-avatar>
			<view class="ml20 flex-1">
				<view class="flex" @click="show=true;nickname=userInfo.nickname">
					<text class="white-color">{{userInfo.nickname}}</text>
					<u-icon name="edit-pen" color="#eee"></u-icon>
				</view>
				<view class="level">会员等级：V{{userInfo.level}}</view>
			</view>
			<navigator url="/pages/user/profile" hover-class="none">
				<u-icon name="setting" color="#eeeeee"></u-icon>
			</navigator>
		</view>

		<view class="logout">
			<view class="tips-color text-center p20">当前版本 V{{version}}</view>
			<u-button type="error" shape="circle" @click="logout">退出登录</u-button>
		</view>
		<u-popup :show="show" mode="center" round="10" @close="show=false">
			<view style="width: 550upx;padding: 40upx;">
				<u-input v-model="nickname" border="bottom" clearable>
					<template slot="suffix">
						<u-button type="success" size="mini" @click="edit">提交</u-button>
					</template>
				</u-input>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show: false,
				userInfo: uni.getStorageSync('userInfo'),
				nickname: '',
				version: ''
			}
		},
		onLoad() {
			plus.runtime.getProperty(plus.runtime.appid, (info) => {
				this.version = info.version
			})
		},
		methods: {
			edit() {
				console.log(this.nickname)
				this.api.updateNickname({
					nickname: this.nickname
				}).then(res => {
					this.show = false
					this.userInfo.nickname = this.nickname
					uni.setStorageSync('userInfo', this.userInfo)
					uni.showToast({
						title: '修改成功'
					})
				})
			},

			logout() {
				var that = this
				uni.showModal({
					content: '确定要退出登录吗？',
					success(res) {
						if (res.confirm) {
							that.api.logout().then(res => {
								uni.removeStorageSync('userInfo');
								uni.showToast({
									title: '退出成功',
									icon: 'success'
								})
								setTimeout(() => {
									uni.reLaunch({
										url: '/pages/auth/login'
									})
								}, 1500)
							})
						}
					}
				})
			}

		}
	}
</script>

<style>
	.center {
		background: #00aa00;
		padding: 50upx;
		display: flex;
		align-items: center;
	}

	.nickname {
		color: #ffffff;
	}

	.level {
		color: #ffff00;
		font-size: 24upx;
	}

	.logout {
		position: fixed;
		/* #ifdef APP-PLUS */
		bottom: 0;
		/* #endif */
		/* #ifdef H5 */
		bottom: 50px;
		/* #endif */
		width: 100%;
		padding: 20px;
		box-sizing: border-box;
	}
</style>