(function(window){
	function Player($audio){
		return new Player.prototype.init($audio);
	}
	Player.prototype = {
		constructor: Player,
		$musicList: [],
		init: function ($audio){
			this.$audio = $audio;
			this.audio = $audio.get(0);
		},
		//1.播放音乐
		currentMusic: -1,
		playMusic: function(index,music){
			//如果点击同一首音乐
			if(this.currentMusic == index){
				if(this.audio.paused){
					//如果是暂停的，让它播放
					this.audio.play();
				}else{
					//如果是播放的，让它暂停
					this.audio.pause();
				}
			}else{
			//点击另一首音乐
				this.$audio.attr("src",music.link_url);
				this.audio.play();
				this.currentMusic = index;
			}
		},
		//2.歌曲索引处理
		preIndex: function(){
			var index = this.currentMusic - 1;
			if(index < 0){
				index = this.$musicList.length - 1;
			}
			return index;
		},
		nextIndex: function(){
			var index = this.currentMusic + 1;
			if(index > this.$musicList.length - 1){
				index = 0;
			}
			return index;
		},
		nextIndex1: function(){
			var index = this.currentMusic + 1;
			if(index > this.$musicList.length - 1){
				return;
			}
			return index;
		},
		//3.删除音乐处理
		changeMusic: function(index){
			this.$musicList.splice(index,1);
			//如果删除了正在播放的音乐的前面的音乐
			this.currentMusic -= 1;
		},
		//4.格式化时间
		formatTime: function(currentTime){
			var playMin = parseInt(currentTime/60);
			var playSec = parseInt(currentTime%60);
			if(playMin < 10){
				playMin = "0" + playMin;
			}
			if(playSec < 10){
				playSec = "0" + playSec;
			}

			return playMin + ":" + playSec;
		},
		//5.歌曲播放时间处理
		musicTimeUpdate: function(callBack){
			var $this = this;
			this.$audio.on("timeupdate",function(){
				var currentTime = $this.audio.currentTime;
				var duration = $this.audio.duration;
				var timeStr = $this.formatTime(currentTime);
				callBack(currentTime,duration,timeStr);
			});
		},
		//6.进度条改变音乐播放
		musicSeekTo:function(value){
			if(isNaN(value)) return;
			this.audio.currentTime = this.audio.duration * value;
		},
		//6.1音乐快进后退
		musicMoveOn: function(){
			this.audio.currentTime += 5;
		},
		musicMoveBack: function(){
			this.audio.currentTime -= 5;
		},
		//7.音量进度条调整
		volumeSeekTo: function(value){
			if(isNaN(value)) return;
			if(value < 0 || value > 1) return;
			this.audio.volume = value;
		},
		//7.1音量增加降低
		volumeDown: function(){
			this.audio.volume-=0.1;
		},
		volumeUp: function(){
			this.audio.volume+=0.1;
		},
		//8.单曲循环
		music_single_cycle: function(){
			this.audio.currentTime = 0;
			this.audio.play();
		},
		//9.顺序播放
		music_order_play: function(){
			if(index = this.$musicList.length - 1){
				this.audio.pause();
			}
		}
	}
	Player.prototype.init.prototype = Player.prototype;
	window.Player = Player;
})(window);