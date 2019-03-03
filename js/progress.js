(function(window){
	function Progress($progress_bar,$progress_line,$progress_dot){
		return new Progress.prototype.init($progress_bar,$progress_line,$progress_dot);
	}
	Progress.prototype = {
		constructor: Progress,
		init: function ($progress_bar,$progress_line,$progress_dot){
			this.$progress_bar = $progress_bar;
			this.$progress_line = $progress_line;
			this.$progress_dot = $progress_dot;
		},
		isMove: false,
		//1.进度条点击事件
		progressClick: function(callBack){
			var $this = this;//此时的this是Progress
			//点击进度条事件
			this.$progress_bar.click(function(event){
				//进度条最左边的位置
				var basicLeft = $(this).offset().left;
				//鼠标点击进度条的位置
				var clickLeft = event.pageX;
				//设置进度条前景宽度
				$this.$progress_line.css("width",clickLeft-basicLeft);
				//设置进度条上的点的位置
				$this.$progress_dot.css("left",clickLeft-basicLeft);
				//获取进度条前进和总长的比例
				var value = (clickLeft-basicLeft)/$(this).width();
				callBack(value);
			});
		},
		//2.进度条移动事件
		progressMove: function(callBack){
			var $this = this;
			var basicLeft = this.$progress_bar.offset().left;
			var bar_width = this.$progress_bar.width();
			var clickLeft;
			//鼠标在进度条上按下事件
			this.$progress_bar.mousedown(function(){
				$this.isMove = true;
				
				$(document).mousemove(function(){
					clickLeft = event.pageX;
					var line_width = clickLeft-basicLeft;
					if(line_width < 0){
						line_width = 0;
					}else if(line_width > bar_width){
						line_width = bar_width;
					}
					$this.$progress_line.css("width",line_width);
					$this.$progress_dot.css("left",line_width);
				});
			});
			//鼠标抬起事件
			$(document).mouseup(function(){
				$this.isMove = false;
				$(document).off("mousemove");
				//获取进度条前进和总长的比例
				var value = (clickLeft-basicLeft)/$this.$progress_bar.width();
				callBack(value);
			});
		},
		//3.音乐进度条同步
		setProgress: function(value){
			if(this.isMove) return;
			if(value < 0 || value > 100) return;
			this.$progress_line.css("width",value+"%");
			this.$progress_dot.css("left",value+"%");
		},
		
	}
	Progress.prototype.init.prototype = Progress.prototype;
	window.Progress = Progress;
})(window);