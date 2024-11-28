<template>
	<view class="p20">
		<view class="input-item">
			<view class="title">在此上传用户头像</view>
			<view class="content">
				<u-upload :fileList="fileList" @afterRead="afterRead" @delete="deletePic" :maxCount="1">
				</u-upload>
			</view>
		</view>
		<view class="input-item">
			<view class="title">擅长哪种开发语言（可多选）</view>
			<view class="content">
				<view class="flex">
					<view class="mr20 mb20" v-for="(item, index) in checkboxs" :key="index">
						<u-tag :text="item.name" :plain="!item.checked" type="success" :name="index"
							@click="checkboxClick">
						</u-tag>
					</view>
				</view>
			</view>
		</view>
		<view class="input-item">
			<view class="title">是否愿意接私活</view>
			<view class="content">
				<view class="flex">
					<view class="mr20" v-for="(item, index) in radios" :key="index">
						<u-tag :text="item.name" :plain="!item.checked" type="success" :name="index"
							@click="radioClick">
						</u-tag>
					</view>
				</view>
			</view>
		</view>
		<view class="p20 m20">
			<u-button shape="circle" type="primary" @click="submit">提交</u-button>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				fileList: [],
				checkboxs: [{
					name: 'PHP',
					checked: false
				}, {
					name: 'Java',
					checked: false
				}, {
					name: 'Python',
					checked: false
				}, {
					name: 'HTML',
					checked: false
				}, {
					name: 'CSS',
					checked: false
				}, {
					name: 'JavaScript',
					checked: false
				}, {
					name: 'TypeScript',
					checked: false
				}, {
					name: 'Vue',
					checked: false
				}, {
					name: 'Ruby',
					checked: false
				}, {
					name: 'Node.js',
					checked: false
				}, {
					name: 'Go',
					checked: false
				}, {
					name: 'C',
					checked: false
				}, {
					name: 'C++',
					checked: false
				}, {
					name: 'C#',
					checked: false
				}, {
					name: 'Swift',
					checked: false
				}, {
					name: 'Lua',
					checked: false
				}, {
					name: 'Kotlin',
					checked: false
				}, {
					name: '其他',
					checked: false
				}],
				radios: [{
					name: '是',
					value: 1,
					checked: false
				}, {
					name: '否',
					value: 0,
					checked: false
				}],
			}
		},
		methods: {
			async submit() {
				if (this.fileList.length == 0) {
					return uni.showToast({
						title: '请上传头像',
						icon: 'none'
					})
				}
				// var lang = this.checkboxs.filter(item => item.checked);
				var lang = []
				this.checkboxs.map(item => {
					if (item.checked) {
						lang.push(item.name)
					}
				})
				if (lang.length == 0) {
					return uni.showToast({
						title: '请选择开发语言',
						icon: 'none'
					})
				}
				var free = this.radios.filter(item => item.checked)
				if (free.length == 0) {
					return uni.showToast({
						title: '请选择是否接受私活',
						icon: 'none'
					})
				}
				const result = await this.uploadFilePromise(this.fileList[0].url);
				var params = {
					is_free: free[0].value,
					langjson: lang,
					avatar: JSON.parse(result).data.url
				}
				this.api.updateProfile(params).then(res => {
					uni.removeStorageSync('userInfo');
					uni.showToast({
						title: '提交成功'
					})
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/index'
						})
					}, 1500)
				})

				// console.log(this.radios.filter(item=>item.checked))
				// console.log(this.checkboxs.filter(item => item.checked))
			},
			checkboxClick(name) {
				this.checkboxs[name].checked = !this.checkboxs[name].checked;
			},
			radioClick(name) {
				this.radios.map((item, index) => {
					item.checked = index === name ? true : false
				})
			},
			async afterRead(event) {
				this.fileList.push(event.file);
				// const result = await this.uploadFilePromise(event.file.url)
				// console.log(JSON.parse(result))
			},
			deletePic(event) {
				this.fileList.splice(event.index, 1);
			},
			uploadFilePromise(url) {
				return new Promise((resolve, reject) => {
					let a = uni.uploadFile({
						url: `${this.host}/api/common/upload`, // 仅为示例，非真实的接口地址
						filePath: url,
						name: 'file',
						formData: {
							token: uni.getStorageSync('userInfo').token
						},
						success: (res) => {
							resolve(res.data)
						},
						fail(err) {
							console.log('fail')
						}
					});
				})
			},

		}
	}
</script>

<style scoped>
	.profile {
		display: flex;
		justify-content: center;
		padding: 20upx;
	}

	.upload {
		display: flex;
		justify-content: center;
		position: relative;
		padding: 20upx;
		margin: 20upx;

	}

	.upload::after {
		content: '修改头像';
		font-size: 14px;
		position: absolute;
		top: calc(50% - 7px);
		color: #777;
	}

	.tips {
		position: absolute;
		top: calc(50% - 7px);
		font-size: 14px;
		color: #777;
	}

	.input-item {
		display: flex;
		align-items: center;
		padding: 20upx;
		border-bottom: solid 2upx #eee;
	}

	.title {
		flex: 1;
		width: 100%;
		text-align: right;
		margin-right: 40upx;
		color: #777;
	}

	.content {
		flex: 3;
	}
</style>