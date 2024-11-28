<template>
	<view>
		<view v-for="user in getSessions" :key="user.id" @click="openChat(user)" class="p20 flex white-bg border-b">
			<view class="relative">
				<u-avatar :src="host+user.avatar" size="50" mode="aspectFill"></u-avatar>
				<u-badge :type="user.online?'success':'info'" isDot absolute :offset="[0,0]">
				</u-badge>
			</view>
			<view class="flex-1 ml20">
				<view class="mb10">{{user.nickname}}</view>
				<view class="tips-color">{{user.content}}</view>
			</view>
			<view class="text-right">
				<view class="tips-color xs-font">{{$u.timeFrom(user.createtime)}}</view>
				<text class="unread" v-if="user.unread>0">{{user.unread}}</text>
			</view>
		</view>
		<!-- 加载提示 -->
		<view class="load-tips" v-if="isLoading">
			加载中...
		</view>
		<view class="load-tips" v-else-if="noMoreData">
			没有更多数据了
		</view>
	</view>
</template>
<script>
	import {
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				isLoading: false, // 是否正在加载
				noMoreData: false, // 是否没有更多数据
				page: 0, // 当前页码
				size: 10, // 每页加载的条数
			};
		},
		computed: {
			...mapGetters(['getSessions']), // 使用 Vuex getter 获取用户列表
		},

		onLoad() {
			this.loadMore();
		},
		onReachBottom() {
			this.loadMore();
		},
		methods: {
			loadMore() {
				if (this.isLoading || this.noMoreData) return;
				this.isLoading = true;
				// 模拟异步请求
				this.api.chatList({
					page: this.page,
					size: this.size
				}).then(res => {
					if (res.length < this.size) {
						this.noMoreData = true;
					} else {
						this.page++;
					}
					this.$store.commit('setSessions', res);
					this.isLoading = false;
				})
			},
			openChat(user) {
				this.$store.commit('setCurrentChatUser', user);
				this.$store.commit('updateUnreads', user.id);
				// 点击用户后，跳转到聊天页面
				uni.navigateTo({
					url: '/pages/chat/detail'
				});
			}
		},
	};
</script>
<style>
	page {
		background: #f3f3f3;
	}

	.load-tips {
		color: #999;
		text-align: center;
		padding: 20upx;
		font-size: 30upx;
	}

	.unread {
		width: 20upx;
		height: 20upx;
		line-height: 20upx;
		font-size: 22upx;
		background: red;
		color: #fff;
		border-radius: 50%;
		padding: 10upx;
		display: inline-block;
		text-align: center;
	}
</style>