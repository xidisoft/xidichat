<template>
	<z-paging ref="paging" v-model="dataList" @query="queryList" :paging-style="{'background-color':'#f3f3f3'}"
		:default-page-no="0">
		<view class="user-item" v-for="item in dataList" @click="toDetail(item.id)">
			<view class="user-top">
				<u-badge :type="item.online?'success':'info'" isDot absolute :offset="[0,0]">
				</u-badge>
				<u-avatar :src="host+item.avatar" size="50" mode="aspectFill"></u-avatar>
				<view class="location">徐州市</view>
			</view>
			<view class="flex-1 ml20">
				<view class="nickname">
					<text class="ellipsis">{{item.nickname}}</text>
					<view @click.stop="toChat(item)">
						<u-button type="success" size="mini" shape="circle">私信</u-button>
					</view>
				</view>
				<view class="tags">
					<view class="tag-item" v-for="val in item.lang">{{val}}</view>
				</view>
			</view>
		</view>

	</z-paging>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				dataList: []
			}
		},
		onNavigationBarSearchInputConfirmed() {
			this.search();
		},
		onNavigationBarSearchInputChanged(e) {
			this.keyword = e.text
		},

		methods: {
			queryList(page, size) {
				var params = {
					page,
					size
				};
				if (this.keyword) {
					params.keyword = this.keyword
				}

				this.api.index(params).then(res => {
					this.$refs.paging.complete(res);
				})
			},
			search() {
				this.$refs.paging.reload();
			},
			toDetail(e) {
				uni.navigateTo({
					url: '/pages/index/detail?id=' + e
				})
			},
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

	};
</script>

<style scoped>
	.user-item {
		display: flex;
		/* align-items: center; */
		background: #fff;
		padding: 20upx;
		margin: 20upx;
		border-radius: 10upx;
	}

	.user-top {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
	}

	.location {
		text-align: center;
		font-size: 30upx;
		width: 4em;
	}

	.nickname {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20upx;
		margin-bottom: 20upx;
		border-bottom: solid 2upx #eee;
	}

	.free {
		background: #00aa00;
		color: #fff;
		font-size: 22upx;
		padding: 10upx;
		border-radius: 10upx;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		height: 60upx;
		line-height: 60upx;
		overflow: hidden;

	}

	.tag-item {
		margin: 0 10upx;
		/* flex-shrink: 0; */
		background: #f3f3f3;
		padding: 0 16upx;
		color: #777;
		font-size: 26upx;
		border-radius: 10upx;
	}
</style>