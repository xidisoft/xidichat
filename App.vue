<script>
	import WebSocketService from '@/config/websocket.js';
	import {
		mapGetters
	} from 'vuex';

	export default {
		computed: {
			...mapGetters(['getUnreadTotal']), // 监听 Vuex 中的未读消息总数
		},
		watch: {
			// 监听未读消息总数的变化
			getUnreadTotal(newCount) {
				console.log(newCount)
				if (newCount > 0) {
					uni.setTabBarBadge({
						index: 1, // 消息对应的 tab 索引
						text: String(newCount), // 更新角标内容
					});
				} else {
					uni.removeTabBarBadge({
						index: 1, // 消息对应的 tab 索引
					});
				}
			},
		},
		onLaunch: function() {
			// #ifdef APP-PLUS
			this.api.updateVersion().then(res => {
				plus.runtime.getProperty(plus.runtime.appid, (info) => {
					if (res.version>info.version) {
						this.appUpdate(this.host + res.file);
					}
				})
			})
			// #endif
			const userInfo = uni.getStorageSync('userInfo');
			if(userInfo?.avatar.includes('assets')){
				return uni.reLaunch({
					url:'/pages/user/profile'
				})
			}
			if (userInfo.token) {
				WebSocketService.init();
			}
		},
		onShow() {
			const unreadCount = this.getUnreadTotal;
			if (unreadCount > 0) {
				uni.setTabBarBadge({
					index: 1, // 消息对应的 tab 索引
					text: String(unreadCount),
				});
			}
		},
		onUnload() {
			WebSocketService.close();
		},
		methods: {
			appUpdate(url) {
				uni.downloadFile({
					url,
					success: res => {
						if (res.statusCode === 200) {
							plus.runtime.install(
								res.tempFilePath, {
									force: true //true表示强制安装，不进行版本号的校验；false则需要版本号校验，
								},
								function() {
									plus.runtime.restart()
								},
								function(e) {
									console.error('install fail...');
								}
							);
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "uview-ui/index.scss";
	@import "static/style.css";
</style>