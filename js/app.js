(function(){
	Parse.initialize("RlgHG4oEKi68PerkzCaiEcFMklZbqZDcLkWd0d3I", "Jp3ycvF2oBUIbEcn3chBXiWsDTNuwJpvKTNjRhel");
	var templates={};
	["loginView","evaluationView","updateSuccessView"].forEach(function(t){
		templateCode=document.getElementById(t).text;
		templates[t]=doT.template(templateCode);
	});
	var t={
		loginRequiredView:function(e){
			return function(){
				var currentUser=Parse.User.current();
				if(t){
					e();
				}
				else{
					window.location.hash="login/"+window.location.hash
				}
			}
		}
	};
	var handlers={
		navbar:function(){
			var currentUser=Parse.User.current();
			if(currentUser){
				document.getElementById("loginButton").style.display="none";
				document.getElementById("logoutButton").style.display="block";
				document.getElementById("evaluationButton").style.display="block"}
			else{
				document.getElementById("loginButton").style.display="block";
				document.getElementById("logoutButton").style.display="none";
				document.getElementById("evaluationButton").style.display="none";
			}
			document.getElementById("logoutButton").addEventListener("click",function(){
				Parse.User.logOut();
				handlers.navbar();
				window.location.hash="login/";
			});
		},
		evaluationView:t.loginRequiredView(function(){
			var t=Parse.Object.extend("Evaluation");
			var currentUser=Parse.User.current();
			var right=new Parse.ACL;
			right.setPublicReadAccess(false);
			right.setPublicWriteAccess(false);
			right.setReadAccess(currentUser,true);
			right.setWriteAccess(currentUser,true);
			var i=new Parse.Query(t);
			i.equalTo("user",currentUser);
			i.first({success:function(i){
				window.EVAL=i;
				if(i===undefined){
					var s=TAHelp.getMemberlistOf(currentUser.get("username")).filter(function(e){
						return e.StudentId!==currentUser.get("username")?true:false}).map(function(e){
							e.scores=["0","0","0","0"];
							return e});
					}
				else{
					var s=i.toJSON().evaluations
				}
				document.getElementById("content").innerHTML=templates.evaluationView(s);
				document.getElementById("evaluationForm-submit").value=i===undefined?"送出表單":"修改表單";
			    document.getElementById("evaluationForm").addEventListener("submit",function(){
			    	for(var o=0;o<s.length;o++){
			    		for(var u=0;u<s[o].scores.length;u++){
			    			var a=document.getElementById("stu"+s[o].StudentId+"-q"+u);
			    			var f=a.options[a.selectedIndex].value;
			    			s[o].scores[u]=f
			    		}
			    	}
			    	if(i===undefined){
			    		i=new t;
			    		i.set("user",currentUser);
			    		i.setACL(right)}console.log(s);
			    		i.set("evaluations",s);
			    		i.save(null,{
			    			success:function(){
			    				document.getElementById("content").innerHTML=templates.updateSuccessView()
			    			},
			    			error:function(){}}
			    			)
			    	},false)},
			    error:function(e,t){}}
			)
		}),
		loginView:function(t){
			var studentid=function(e){
				var id=document.getElementById(e).value;
				return TAHelp.getMemberlistOf(id)===false?false:true;
			};
			var warning=function(loc,idcheck,warn){
				if(!idcheck()){
					document.getElementById(loc).innerHTML=warn;
					document.getElementById(loc).style.display="block";
				}
				else{
					document.getElementById(loc).style.display="none";
				}
			};
			var succeed=function(){
				handlers.navbar();
				window.location.hash=t?t:"";//不懂
			};
			var passcheck=function(){
				var p=document.getElementById("form-signup-password");
				var p1=document.getElementById("form-signup-password1");
				var n=p.value===p1.value?true:false;
				warning("form-signup-message",function(){return n},"密碼不一致，請再確認一次。");
				return n;	
			};
				/*if(e!==t){
					document.getElementById("form-signup-message").innerHTML="Passwords don't match.";
					return false;
				}
				else{
					return true;
				}*/
			document.getElementById("content").innerHTML=templates.loginView();//*不懂
			document.getElementById("form-signin-student-id").addEventListener("keyup",function(){
				warning("form-signin-message",function(){return studentid("form-signin-student-id")},"此學生非本班學生。")
			});
			document.getElementById("form-signin").addEventListener("submit",function(){
				if(!studentid("form-signin-student-id")){
					alert("此學生非本班學生。");
					return false
				}
				Parse.User.logIn(document.getElementById("form-signin-student-id").value,document.getElementById("form-signin-password").value,{
					success:function(e){
						succeed();
					},
					error:function(e,t){
						warning("form-signin-message",function(){
							return false
						},
						"帳號或密碼錯誤，請再確認一次。")
					}
				})
			},false);//signin部分
			document.getElementById("form-signup-student-id").addEventListener("keyup",function(){
				warning("form-signup-message",function(){
					return studentid("form-signup-student-id")
				},
				"此學生非本班學生。")
			});
			document.getElementById("form-signup-password1").addEventListener("keyup",passcheck);
			document.getElementById("form-signup").addEventListener("submit",function(){
				if(!studentid("form-signup-student-id")){
					alert("此學生非本班學生。");
					return false
				}
				var e=passcheck();
				if(!e){
					return false
				}
				var sign=new Parse.User;
				sign.set("username",document.getElementById("form-signup-student-id").value);
				sign.set("password",document.getElementById("form-signup-password").value);
				sign.set("email",document.getElementById("form-signup-email").value);
				sign.signUp(null,{
					success:function(e){
						succeed();
					},
					error:function(e,sign){
						warning("form-signup-message",function(){
							return false
						},sign.message)
					}
				})
			},false);//signup部分
		}
	};
	var r=Parse.Router.extend({
		routes:{
			"":"indexView",
			"peer-evaluation/":"evaluationView",
			"login/*redirect":"loginView"
		},
		indexView:handlers.evaluationView,
		evaluationView:handlers.evaluationView,
		loginView:handlers.loginView
	});
	this.Router=new r;
	Parse.history.start();
	handlers.navbar()
})();
