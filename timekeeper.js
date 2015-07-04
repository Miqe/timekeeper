angular.module('timekeeper',[])
.factory('tk',['$timeout','$rootScope',function($timeout,$rootScope){
	var arr = [];
	var timerStarted = false;
	var getMoment = function(o){
		var h = o.getHours;
		var m = o.getMinutes;
		var s = o.getSeconds;
		var no = angular.copy(o);
		no.getHours = h;
		no.getMinutes = m;
		no.getSeconds = s;
		return no;
	};
	var cx = function(){
			if(!timerStarted)
				timerStarted=true;
			for(var q = 0;q < arr.length;q++){
				if(!arr[q].paused){
					if(arr[q].isCountDown){
						if(arr[q].secs>0)
							arr[q].secs--;
						
					}
					
					else if(arr[q].isDateObject){
						var s =arr[q].getSeconds();
						s++;
						arr[q].setSeconds(s);
						if(arr[q].alm.isSet){
							var t = (arr[q].getHours()*60*60)+(arr[q].getMinutes())+arr[q].getSeconds();
							if(arr[q].alarm.time == t){
								 $rootScope.$broadcast('alarmOn', getMoment(arr[q]));
							}
						}
					}
					else  {
						arr[q].secs++;
					}

					if(arr[q].alarm.time == arr[q].secs){
						 if(!arr[q].alm.on){
							   $rootScope.$broadcast('alarmOn', getMoment(arr[q]));
							   arr[q].alm.on = true;
						}
					}
						
					
				}
				
			}

			$timeout(cx,1000);
	}

	var pauseTimer= function(index){
			for(var q = 0;q < arr.length;q++){
				if(arr[q].index == index)
					arr[q].paused=true;
			}
	}
	var startTicking = function(){
		if(!timerStarted)
				cx();
	}
	var createTimer = function(secs,countDown,currentTime){
			var n = null;
			if(currentTime){
				var n = new Date();
				n.paused=false;
				n.isDateObject = true;
				n.alm= {
					time:0,
					isSet:false,
					on:false
				}
				n.index = arr.length-1 == -1?0:arr.length-1;
			}else{
				n = {
					paused:true,
					secs:secs,
					isDateObject:false,
					isCountDown:countDown,
					alm: {
						time:0,
						isSet:false,
						on:false
					},
					index:arr.length-1 == -1?0:arr.length-1
				};
			}
			Object.defineProperty(n,'alarm',{
				set: function(s){
					this.alm.time=s;
					this.alm.isSet = true;
					this.alm.on = false;
				},
				get: function(){
					return this.alm;
				}
			});

			Object.defineProperty(n,'setAlarmOff',{
				get: function(){
					return this.alm.isSet=false;
				}
			});
			Object.defineProperty(n,'pause',{
				get: function(){
					return this.paused=true;
				}
			});
			Object.defineProperty(n,'start',{
				get: function(){
					return this.paused=false;
				}
			});
			Object.defineProperty(n,'reset',{
				get: function(){
					return this.secs=0;
				}
			});
			if(!n.isDateObject){
				Object.defineProperty(n,'getHours',{
				get: function(){
					return this.secs/3600 <0?0:Math.floor(this.secs/3600);
				}
				});
				Object.defineProperty(n,'getMinutes',{
					get: function(){
						return this.secs/60 <0?0:(Math.floor(this.secs/60))%60;
					}
				});
				Object.defineProperty(n,'getSeconds',{
					get: function(){
						return this.secs % 60;
					}
				});
			}
			

			return n;
	};
	return {
		getCountUpTimer:function(s,alarm){
			startTicking()
			var n = createTimer(s,false);
			if(alarm)
				n.alarm = alarm;
			arr.push(n);
			return n;
		},
		getCountDownTimer:function(s,alarm){
			startTicking();
			var n = createTimer(s,true);
			if(alarm)
				n.alarm = alarm;
			else
				n.alarm = 0;
			arr.push(n);
			return n;
		},
		setTimer:function(o){
			for(var i=0;i<arr.length;i++){
				if(arr[i].index == o.index){
					arr[i]=0;
				}
			}
		},
		getCurrentTime:function(){
				startTicking();
				var n = createTimer(0,false,true);
				arr.push(n);
				return n;
		},
		remove:function(o){
			for(var i=0;i<arr.length;i++){
				if(arr[i].index == o.index){
					arr.splice(i,1);
					return true;
				}
			}
			return false;
		},
		toSecs:function(h,m,s){
			return (s||0) + (m||0)*60+ h*60*60;	
		}
		
	}
}]).filter('timepad',[function(){
	return function(input){
		if(input < 10)
			return "0"+input;
		return input+"";
	}
}]);
