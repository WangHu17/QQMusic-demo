$(function(){
	var $audio = $("audio");
	var player = new Player($audio);
	var progress;
	var volume;
	var lyric;
	
	//0.自定义滚动条
	$(".music_list").mCustomScrollbar();

	//1.加载歌曲列表
	getMusicList();
	function getMusicList(){

		$.getJSON("source/musicList.json",function(data){

			initMusicInfo(data[0]);
			initMusicLyric(data[0]);
			player.$musicList = data;
			var MusicList = $(".music_list ul");
			$.each(data,function(index,ele){
				var item = createMusicList(index,ele);
				MusicList.append(item);
			});	
		})
	}
	//2.初始化歌曲图片，背景等
	function initMusicInfo(music){
		$(".song_img img").attr("src",music.picture);
		$(".background_blur").css("background","url('"+music.picture+"')");
		$(".song_name").text(music.name);
		$(".song_singer").text(music.singer);
		$(".song_album").text(music.album);
		$(".bottom_song_name").text(music.name);
		$(".bottom_song_singer").text(music.singer);
		$(".total_time").text(" / " + music.time);
	}

	//3.初始化歌词
	function initMusicLyric(music){
		lyric = new Lyric(music.link_lrc);
		$(".lyric").html("");
		$(".pure_lyric").html("");
		lyric.loadLyric(function(){
			$.each(lyric.lyrics,function(index,ele){	
				var $item = $("<li>"+ele+"</li>");
				$(".lyric").append($item);
				var $item_pure = $("<li>"+ele+"</li>");
				$(".pure_lyric").append($item_pure);
			});
		});
	}

	//4.初始化进度条
	initProgress();
	function initProgress(){
		//音乐播放进度条
		var $progress_bar = $(".progress_bar");
		var $progress_line = $(".progress_line");
		var $progress_dot = $(".progress_dot");
		progress = new Progress($progress_bar,$progress_line,$progress_dot);
		progress.progressClick(function(value){
			player.musicSeekTo(value);
		});
		progress.progressMove(function(value){
			player.musicSeekTo(value);
		});

		//音量进度条
		var $volume_bar = $(".volume_bar");
		var $volume_line = $(".volume_line");
		var $volume_dot = $(".volume_dot");
		volume = new Progress($volume_bar,$volume_line,$volume_dot);
		volume.progressClick(function(value){
			player.volumeSeekTo(value);
		});
		volume.progressMove(function(value){
			player.volumeSeekTo(value);
		});
	}

	//5.各事件监听
	bindEvent();
	function bindEvent(){

		//(1)歌曲的移入移出事件
		$(".music_list").delegate('.list_li', 'mouseenter', function(event) {
			$(this).find(".li_menu").css("display","block");
			$(this).find(".time a").css("display","block");
			$(this).find(".time span").css("display","none");
		});
		$(".music_list").delegate('.list_li', 'mouseleave', function(event) {
			$(this).find(".li_menu").css("display","none");
			$(this).find(".time a").css("display","none");
			$(this).find(".time span").css("display","block");
		});

		//(2)复选框点击事件
		$(".music_list").delegate('.check i', 'click', function(event) {
			$(this).toggleClass("checked");
		});

		//(3)播放按钮点击连带事件
		$(".music_list").delegate('.play_btn', 'click', function(event) {
			var $li = $(this).parents(".list_li");

			// 1)点击变换图标
			$(this).toggleClass("play_btn2");

			// 2)复原其他图标
			$li.siblings().find('.play_btn').removeClass('play_btn2');

			// 3)同步下面的播放暂停图标
			if($(this).attr("class").indexOf("play_btn2")!=-1){//如果播放歌曲
				//底部播放按钮变为播放
				$(".stop").addClass('stop2');
				//将歌曲序号变为播放gif
				$li.find('.number').addClass("gif");
				//字体高亮
				$li.find('.music_name').css("color","white");
				$li.find('.singer a').css("color","white");
				
			}else{//如果暂停歌曲
				//底部播放按钮变为暂停
				$(".stop").removeClass('stop2');
				//将播放gif变为歌曲序号
				$li.find('.number').removeClass("gif");
				//字体变暗
				$li.find('.music_name').css("color","#BCBCBC");
				$li.find('.singer a').css("color","#BCBCBC");
			}

			// 4)复原列的其他字体
			$li.siblings().find('.music_name').css("color","#BCBCBC");
			$li.siblings().find('.singer a').css("color","#BCBCBC");

			// 5)复原其他列的序号
			$li.siblings().find('.number').removeClass("gif");

			// 6)播放音乐
			player.playMusic($li.get(0).index,$li.get(0).music);

			// 7)变换歌曲图片和背景和歌词
			initMusicInfo($li.get(0).music);
			initMusicLyric($li.get(0).music);

			// 8)监听播放进度
			player.musicTimeUpdate(function(currentTime,duration,timeStr){
				//同步播放时间
				$(".progress_time").text(timeStr);
				//同步进度条
				var value = (currentTime / duration) * 100;
				progress.setProgress(value);
				//同步歌词
				var index = lyric.currentLyric(currentTime);
				var $item = $(".lyric li").eq(index);
				$item.addClass('current');
				$item.siblings().removeClass('current');
				//纯净版歌词
				var $item_pure = $(".pure_lyric li").eq(index);
				$item_pure.addClass('current');
				$item_pure.siblings().removeClass('current');
				//滚动歌词
				if(index <= 2) return;
				$(".lyric").css("marginTop",(-index + 2)*33);
				if(index <= 3) return;
				$(".pure_lyric").css("marginTop",(-index + 3)*58);
			});

			
		});

		//(4)底部播放按钮事件
		// 1)播放暂停按钮
		$(".stop").click(function(){
			if(player.currentMusic == -1){//如果没有播放过音乐，播放第0首
				$(".list_li").eq(0).find(".play_btn").trigger('click');
			}else{//如果播放过音乐，就播放那首
				$(".list_li").eq(player.currentMusic).find(".play_btn").trigger('click');

			}
		});
		// 2)上一首按钮
		$(".pre").click(function(){
			$(".list_li").eq(player.preIndex()).find(".play_btn").trigger('click');
		});
		// 3)下一首按钮
		$(".next").click(function(){
			$(".list_li").eq(player.nextIndex()).find(".play_btn").trigger('click');
		});

		//(5)歌曲删除按钮事件
		$(".music_list").delegate('.delete_btn', 'click', function(event) {
			var $li = $(this).parents(".list_li");
			//删除页面上的
			$li.remove();
			//删除保存在数组里的
			player.changeMusic($li.get(0).index);
			//重新排序
			$(".list_li").each(function(index,ele){
				ele.index = index;
				$(ele).find(".number").text(index+1);
			});
			//如果删除的是正在播放的音乐，就播放下一首音乐
			if($li.get(0).index == player.currentMusic){
				$(".next").trigger('click');
			}	
		});

		//(6)音量图标点击事件
		$(".volume_left").click(function(){
			$(this).toggleClass("volume_left2");
			if($(this).attr("class").indexOf("volume_left2") != -1){
				player.volumeSeekTo(0);
			}else{
				player.volumeSeekTo(1);
			}
		});

		//(7)收藏按钮点击事件
		$(".like").click(function(){
			$(this).toggleClass('like2');
		});

		//(8)纯净模式点击事件
		$(".pure").click(function(){
			$(this).toggleClass('pure2');
			$(".content").toggleClass('content_hide');
			$(".content_pure").toggleClass('content_pure_hide');
		});

		//(9)空格点击播放暂停
		$(document).keydown(function(e){
			var e = e || window.event;
			if(e.keyCode == 32){
				if(player.currentMusic == -1){//如果没有播放过音乐，播放第0首
					$(".list_li").eq(0).find(".play_btn").trigger('click');
				}else{//如果播放过音乐，就播放那首
					$(".list_li").eq(player.currentMusic).find(".play_btn").trigger('click');
				}
			}
		});

		//(10)上下键控制音量
		$(document).keydown(function(e){
			var e = e || window.event;
			if(e.keyCode == 38){
				var width = $(".volume_line").width();
				if(width >= 70) return;
				width += 7;
				player.volumeUp();
				$(".volume_line").css("width",width);
				$(".volume_dot").css("left",width);
			}
			if(e.keyCode == 40){
				var width = $(".volume_line").width();
				if(width <= 0) return;
				width -= 7;
				player.volumeDown();
				$(".volume_line").css("width",width);
				$(".volume_dot").css("left",width);
			}
		});

		//(11)左右键控制音乐快进后退
		$(document).keydown(function(e){
			var e = e || window.event;
			if(e.keyCode == 37){
				player.musicMoveBack();
			}
			if(e.keyCode == 39){
				player.musicMoveOn();
			}
		});

		//(12)清除列表点击事件
		var clear_btn = $(".menu").find('.clear_musicList');
		clear_btn.click(function(){
			$(".list_li").remove();
		});

		//(13)全选按钮点击事件
		var select_all = $(".top_li .check i");
		select_all.click(function(){
			$(".list_li .check i").addClass('checked');
			if(select_all.attr("class").indexOf("checked")!=-1){
				$(".list_li .check i").removeClass('checked');
			}
		})

		//(14)顶部菜单栏的删除按钮点击事件
		$(".delete_music").click(function(){
			var selected = $(".checked").parents(".list_li");
			selected.remove();
			//重新排序
			$(".list_li").each(function(index,ele){
				ele.index = index;
				$(ele).find(".number").text(index+1);
			});
			//清除全选框的勾
			$(".top_li .check i").removeClass('checked');
		});

		//(15)音乐播放模式切换
		$("#Mode").click(function(){
			if($(this).attr("class") == "mode"){
				$(this).removeClass('mode').addClass('mode2');
			}else if($(this).attr("class") == "mode2"){
				$(this).removeClass('mode2').addClass('mode3');
			}else if($(this).attr("class") == "mode3"){
				$(this).removeClass('mode3').addClass('mode4');
			}else if($(this).attr("class") == "mode4"){
				$(this).removeClass('mode4').addClass('mode');
			}
		});
		player.musicTimeUpdate(function(currentTime,duration,timeStr){
				//循环播放
				if($("#Mode").attr("class") == "mode"){
					if(currentTime == duration){
						$(".list_li").eq(player.nextIndex()).find(".play_btn").trigger('click');
					}
				}
				//顺序播放
				if($("#Mode").attr("class") == "mode2"){
					if(currentTime == duration){
						$(".list_li").eq(player.nextIndex1()).find(".play_btn").trigger('click');
						$(".list_li").eq(player.currentMusic).find(".play_btn").trigger('click');
						player.music_order_play();
					}
				}
				//随机播放
				if($("#Mode").attr("class") == "mode3"){
					if(currentTime == duration){
						var random = Math.round(Math.random()*(player.$musicList.length-1));
						$(".list_li").eq(random).find(".play_btn").trigger('click');
						// console.log(random);
					}
				}
				//单曲循环
				if($("#Mode").attr("class") == "mode4"){
					if(currentTime == duration){
						player.music_single_cycle();
					}
				}
		});

	}

	//创建歌曲列表
	function createMusicList(index,music){
		var $li = $("<li class=\"list_li\">\n"+
							"<div class=\"check\"><i></i></div>\n"+
							"<div class=\"number\">"+(index+1)+"</div>\n"+
							"<div class=\"music_name\">"+music.name+"\n"+
								"<div class=\"li_menu\">\n"+
									"<a href=\"javascript:;\" title=\"播放\" class=\"play_btn\"></a>\n"+
									"<a href=\"javascript:;\" title=\"添加到歌单\"></a>\n"+
									"<a href=\"javascript:;\" title=\"下载\"></a>\n"+
									"<a href=\"javascript:;\" title=\"分享\"></a>\n"+
								"</div>\n"+
							"</div>\n"+
							"<div class=\"singer\"><a href=\"javascript:;\">"+music.singer+"</a></div>\n"+
							"<div class=\"time\">\n"+
								"<span>"+music.time+"</span>\n"+
								"<a href=\"javascript:;\" title=\"删除\" class=\"delete_btn\"></a>\n"+
							"</div>\n"+
						"</li>");
		
		$li.get(0).index = index;
		$li.get(0).music = music;
		return $li;
	}

});