var Detail = angular.noop;

// community

function Community(Http,$timeout, $rootScope, $scope, Config, $mdPanel, Toast){
  this._config = Config;
  this._userid = $rootScope.UserID;
  this._commuid = $rootScope.CommuID;
  this._http = Http;
  this._panel = $mdPanel;
  this._toast = Toast;
}

Community.prototype.addtocommunity = function(user){
  var _self = this;
  this._http.data('getcommunities', false, function(v){
    var temp = v;
    _self._http.data('sendcommunityrequest', true, function(v){
      if(v.Status.Alert){
        this._toast(v.Status.Alert);
      }else{
        _self.suarez = true;
      }
    },{
      'To': [user],
      'DID': this._userid,
      'CommuID': temp.Status.myCommunities[0].CommuID
    });
  });
}

Community.prototype.openprofile = function(id){
  var _self = this;
  this._http.data('getuserprofile', true, function(v){
    var conf = _self._config(500, 500, 'templates/panels/patientprofilepanel.html', UserProfile, {
      profile : v
    });
    conf.zIndex = 150;
    _self._panel.open(conf);
  }, {ID : id, CommuID : this._commuid});
}

// companel

function ComPanel($rootScope, Http, $mdDialog){
  this._dialog = $mdDialog;
  this._http = Http;
  this.IDE = $rootScope.UserID;
  this.comment = true;
  this.detail = Http.data('userdetail', false, angular.noop, {}).$data;
}

ComPanel.prototype.openreplies = function(index){
  var _self = this;
  var temp = this.comments[index].ComID;
  this._http.data('getreplies', true, function(data){
    _self.replies = data.Status.Replies;
    _self.comment = false;
    _self.ComID = temp
  },{ComID : temp});
}

ComPanel.prototype.delete = function(index){
  var _self = this;
  if(this.comment){
    this._http.data('deletecomment', true, function(){
      _self.comments.splice(index,1);
    },{ComID :this.comments[index].ComID});
  }else{
    this._http.data('deletecomment', true, function(){
      _self.replies.splice(index,1);
    },{RepID :this.replies[index].RepID});
  }
}

ComPanel.prototype.edit = function(ev, item){
  var _self = this;
  var confirm = this._dialog.prompt()
      .title('Edit')
      .textContent('Write Here')
      .placeholder('Comment')
      .ariaLabel('CommentEdit')
      .initialValue((item.Comment)?item.Comment:item.Reply)
      .targetEvent(ev)
      .ok('Edit It!')
      .cancel('Cancel');
  this._dialog.show(confirm).then(function(result) {
    var options = { 'Comment' : result };
    if(item.ComID){
      options.ComID = item.ComID;
    }else{
      options.RepID = item.RepID;
    }
    _self._http.data('editcomment', true, function(v){
      if(item.ComID){
        item.Comment = result;
      }else{
        item.Reply = result;
      }
    }, options);
  }, angular.noop);
}

ComPanel.prototype.newcomment = function(event){
  if(event.keyCode == 13){
    var _self = this;
    var temp = { data : this.new, anon : 0};
    this.new = "";
    var tempname = "Dr." + this.detail.Status.FName + " " + this.detail.Status.LName;
    if(this.comment){
      this._http.data('commentarticle', true, function(data) {
        var newcomment = {'Comment' : temp.data, 'IsAnon' : temp.anon, 'Replies' : {}, 'ComID' : data.Status.ComID, FullName : tempname, UserID : _self.IDE, Pic : _self.detail.Status.Pic };
        _self.comments.push(newcomment);
        _self.feed.data.Comments++;
  	 },{
  			'ShrID' : this.feed.data.ShrID,
  			'Comment' : temp.data,
  			'Anon' : temp.anon
  		});
    }else{
      this._http.data('commentarticle', true, function(data) {
  		 var newreply = {'RepID' : data.Status.RepID, 'Reply' : temp.data, 'IsAnon' : temp.anon, FullName : tempname, "RepID" : data.Status.RepID, UserID : _self.IDE, Pic : _self.detail.Status.Pic };
  		 _self.replies.push(newreply);
  	 }, {
  			'reply' : 'dc',
  			'ComID' : this.ComID,
  			'UserID' : this.IDE,
  			'Comment' : temp.data,
  			'Anon' : temp.anon
  		});
    }
  }
}

ComPanel.prototype.goback = function(){
  this.replies = [];
  this.ComID = undefined;
  this.comment = true;
}

// community

Community.prototype.remove1 = function(user,index){
  var _self = this;
  this._http.data('getcommunities', false, function(v){
    var temp = v;
    _self._http.data('removefromcommunity', true, function(v){
      $scope.ctrl.people.Status.ConnectionData.Followers.splice(index, 1);
    },{
      'ID': user,
      'CommuID': temp.Status.myCommunities[0].CommuID
    });
  });
}

Community.prototype.remove2 = function(user ,index){
  var _self = this;
  this._http.data('getcommunities', false, function(v){
    var temp = v;
    _self._http.data('removefromcommunity', true, function(v){
      _self.people.Status.ConnectionData.Connection.splice(index, 1);
    },{
      'ID': user,
      'CommuID': temp.Status.myCommunities[0].CommuID
    });
  });
}

// article

function Article(Http){
  this._http = Http;
  if(this.tags == null){
    this.tags = [];
  }
}

Article.prototype.publish = function(){
  var _self = this;
  var temp = "";
  for(let item of this.tags){
    temp+=(item.selected)?(item.name + " "):"";
  }
  this.data.Details+=(temp.length > 0)?"<p>" + temp + "</p>":"";
  var options = {
    "Summary": this.data.Summary,
    "Details": this.data.Details,
    "Header": this.data.Header,
    "Link": this.data.Link,
    "ImageLink": (this.data.ImageLink)?this.data.ImageLink:''
  }
  if(this.communities){
    options.Type = 0;
    options.IsPublic = (this.public)?1:0;
    options.CommuID = this.data.CommuID;
    this._http.data('sharearticle', true, function(){
      _self.mdPanelRef.close();
      if(_self.refresh){
        _self.refresh.refresh();
      }
    },options);
  }else{
    this._http.data('editarticle', true, function(){
      _self.mdPanelRef.close();
      if(_self.refresh){
        _self.refresh.refresh();
      }
    }, {"ShrID": this.data.ShrID,
        "Data": options});
  }
}

// share

function Share(Http){
  this._http = Http;
}

Share.prototype.share = function(){
  var _self = this;
  this._http.data('sharearticle', true, function(){
    _self.mdPanelRef.close();
    if(_self.refresh){
      _self.refresh.refresh();
    }
  },{ShrID : this.data.ShrID, CommuID : this.selected, Type : 2, Summary : this.summary});
}

// feed

function Feed(feed, Http, panel, config, refresh, read){
  this._http = Http;
  this.data = feed;
  this._panel = panel;
  this.likedisabled = false;
  this.followdisabled = false;
  this.bookmarkdisabled = false;
  this.sharedisabled = false;
  this.config = config;
  this.parent = refresh;
  if(!read){
    this.communities = Http.data('getcommunities', false, angular.noop, {});
  }else{
    this.readonly = read;
  }
}

Feed.prototype.$like = function(){
  var _self = this;
  this.likedisabled = true;
  if(this.data.Liked == 0){
    this._http.data('likearticle', true, function(){
      _self.likedisabled = false;
      _self.data.Liked = 1;
      _self.data.Likes++;
    },{ShrID : this.data.ShrID, Like : 'foo'});
  }else{
    this._http.data('likearticle', true, function(){
      _self.likedisabled = false;
      _self.data.Liked = 0;
      _self.data.Likes--;
    },{ShrID : this.data.ShrID});
  }
}

Feed.prototype.$comment = function(){
  var _self = this;
  this._http.data('getcomments', true, function(v){
    var conf = _self.config(500, 700, 'templates/panels/commentpanel.html', ComPanel, {
      comments : v.Status.Comments,
      feed : _self
    });
    _self._panel.open(conf);
  }, {ShrID : this.data.ShrID});
}

Feed.prototype.$share = function(ev, communities){
  var _self = this;
  var a = this.communities.$data.Status.myCommunities;
  var b = this.communities.$data.Status.adminCommunities;
  var commu = a.concat(b);
  var conf = this.config(500, 500, 'templates/panels/sharedialog.html', Share, {
    communities : commu,
    data : this.data,
    refresh : this.parent
  })
  this.sharedisabled = true;
  this._panel.open(conf).then(function(){
    _self.sharedisabled = false;
  });
}

Feed.prototype.$detail = function(){
  var conf = this.config(600, 600, 'templates/panels/detailpanel.html', Detail, {
    feed : this,
    refresh : this.parent,
    readonly : this.readonly
  });
  this._panel.open(conf);
}

Feed.prototype.$edit = function(){
  var conf = this.config(500, 500, 'templates/panels/articlepanel.html', Article, {
    title : "Edit Article",
    data : this.data,
    refresh : this.parent,
    options : {
      language: 'en',
      allowedContent: true,
      entities: false
    }
  });
  this._panel.open(conf);
}

Feed.prototype.$bookmark = function(){
  this.bookmarkdisabled = true;
  var _self = this;
  var options = {
    ShrID : this.data.ShrID,
    action : (this.data.Bookmarked)?0:1
  };
  this._http.data('bookmark', true, function(){
    _self.bookmarkdisabled = false;
    _self.data.Bookmarked = !_self.data.Bookmarked;
  }, options);
}

Feed.prototype.$follow = function(){
  this.followdisabled = true;
  var _self = this;
  this._http.data('followcommunity', true, function(){
    _self._http.data('getcommunities', true, angular.noop, {});
    _self.data.action+=2;
    _self.followdisabled = false;
  }, {CommuID : this.data.CommuID});
}

Feed.prototype.$delete = function(Shr){
  var _self = this;
  this._http.data('deletearticle', true, function(){
    if(_self.refresh){
      _self.refresh();
    }
  },{ShrID : Shr});
}

// infinite

function Infinite(http, Config, mdpanel, myid, tag){
  this._options = {};

  this.myid = myid;
  this.end = false;
  this.feeds = [];
  this._http = http;
  this.panelconfig = Config;
  this._mdpanel = mdpanel;
  if(tag){
    this.refresh('tag', tag, tag);
  }else{
    this.refresh('all');
  }
}

Infinite.prototype.refresh = function(type, name, id){
  this.loading = true;
  this.end = false;
  switch(type){
    case 'bookmark':
      this._options = {};
      this.community = undefined;
      this.title = name;
      let temp = {Bookmark : 'yup'}
      this._options.Pref = temp;
      break;
    case 'community':
      this._options = {};
      if(this._options.CommuID != id){
        this.community = this._http.data('getcommunitydetails', true, angular.noop, {CommuID : id}).$data;
      }
      this.title = name;
      this._options.CommuID = id;
      break;
    case 'share':
      this._options = {};
      this.community = undefined;
      this.title = name;
      this._options.ShrID = id;
      break;
    case 'all':
      this._options = {};
      this.community = undefined;
      this.title = undefined;
      break;
    case 'tag':
      this._options.Tag = id;
      this.title = name;
  }
  this._options.count = undefined;
  this.feeds = [];
  this.fetchMoreItems_();
}

Infinite.prototype.info = function(){
  this.infoloading = true;
  var _self = this;
  this._http.data('getconnections', true, function(v){
    _self.infoloading = false;
    var conf = _self.panelconfig(600, 600, 'templates/panels/communitypanel.html', Community, {
      detail : _self.community,
      people : v
    });
    if(_self.community.Status.DID == _self.myid){
      conf.locals.neymar = true;
      conf.locals.suarez = false;
    }
    _self._mdpanel.open(conf);
  }, {CommuID : this.community.Status.CommuID, require : ['connection', 'follower']}, {}, function(){
    _self.infoloading = false;
  });
}

Infinite.prototype.fetchMoreItems_ = function(){
    var _self = this;
    if(this._options.count !== undefined){
      this._options.count++;
    }else{
      this._options.count = 0;
    }
    this._http.data('getfeeds',true, function(v){
      if(v.Status.Articles.length < 5){
        _self.end =  true;
      }
      angular.element(document).ready(function () {
        var elements = document.getElementsByClassName("wrap-children");
        var temp = _self._options.count*5;
        for(let i = temp; i < temp+5; i++){
          if(elements[i] && elements[i].children.length > 2){
            _self.feeds[i].overflow = true;
          }
        }
      });
      for(let i = 0;i < v.Status.Articles.length; i++){
        let j = new Feed(v.Status.Articles[i], _self._http, _self._mdpanel, _self.panelconfig, _self);
        _self.feeds.push(j);
      }
      _self.loading = false;
    },this._options);
}

Infinite.prototype.newArticle = function(communities){
  var _self = this;
  var a = communities.$data.Status.myCommunities;
  var b = communities.$data.Status.adminCommunities;
  var commu = a.concat(b);
  this._http.data('gettags', true, function(v){
    var config = _self.panelconfig(600, 600, 'templates/panels/articlepanel.html', Article, {
      title : "Post Article",
      data : {},
      refresh : _self.refresh,
      communities : commu,
      tags : v.Status.Tags,
      options : {
        language: 'en',
        allowedContent: true,
        entities: false
      }
    });
    _self._mdpanel.open(config);
  });
}

// userprofile

function UserProfile($state, Http, $rootScope, $mdDialog){
  if($rootScope.info.type == 1){
    this.info = $rootScope.info;
    this.clinicdoctors = Http.data("getclinicdoctors", false, angular.noop,  {}).$data.Status.Doctors;
    this.con = {
      doc : this.alldata.DID,
      date : new Date(this.alldata.Time),
      fees : (this.alldata.Payment >0)?"Rs: "+this.alldata.Payment:"Hasn't paid yet"
    }
  }
  if(this.prescriptiondetails && this.submitpres){
    this.payment = (this.prescriptiondetails.Status.Payment)?this.prescriptiondetails.Status.Payment:this.prescriptiondetails.Status.Fees;
  }
  this.info = $rootScope.info;
  this._dialog = $mdDialog;
  this.editnotes = false;
  this._commuid = $rootScope.CommuID;
  this._http = Http;
  this._state = $state
  this.contactdetails = [{head : 'Contact Info', contents :['First Name', 'Last Name', 'Phone', 'Email']},
    {head : 'Basic Info', contents : ['Date of Birth', 'Sex']}
  ];
}

UserProfile.prototype.confirmApp = function () {
  var _self = this;
  this.conformsubmitted = true;
  this._http.data('confirmappointment', true, function(){
    _self.conformsubmitted = false;
    _self.mdPanelRef.close();
  }, {AID : this.alldata.AID, DID : this.con.doc, Time : Math.floor(this.con.date.getTime()/1000), UserID : this.profile.Status.UserData.UserID}, function(){
    _self.conformsubmitted = false;
  })
}

UserProfile.prototype.updatesymptoms = function(){
  var user = {
    age : Number(this.alldata.Age),
    gender : (this.alldata.Gender == "male")?"Male":"Female",
    name : this.alldata.Name,
    phone : Number(this.alldata.Phone)
  }
  this._state.go('dxmate',{user : JSON.stringify(user), AID : this.alldata.AID, PFID : this.alldata.PFID, evidence : angular.toJson(this.alldata.DetailSymptom)});
  this.mdPanelRef.close();
}

UserProfile.prototype.generateprescription = function(){
  var sym = [];
  for(let item of this.alldata.DetailSymptom) sym.push({'id':item.SymptomID, 'name':item.Symptom, 'choice_id':item.SymptomChoice})
  var user = {
    name : this.alldata.Name,
    age : Number(this.alldata.Age),
    gender : (this.alldata.Gender == "male")?"Male":"Female",
    phone : Number(this.alldata.Phone)
  }
  this._state.go('prescription', {'AID': this.alldata.AID, 'user' : JSON.stringify(user), 'symptoms' : JSON.stringify(sym)});
  this.mdPanelRef.close();
}

UserProfile.prototype.submit = function(){
  var options = {'AID': this.prescriptiondetails.Status.AID, 'Condition' : this.selectedCondition};
  if(!this.prescriptiondetails.Status.Payment){
    options.Payment = this.payment;
  }
  this.pressubmitclicked = true;
  var _self = this;
  this._http.data('saveprescription', true, function(){
    _self.pressubmitclicked = false;
    _self._state.go('app.home');
    _self.mdPanelRef.close();
  }, options, {}, function(){
    _self.pressubmitclicked = false;
  })
}

UserProfile.prototype.completeWithoutPrescription = function(ev){
  var _self = this;
  this._dialog.show({
      controller: DialogController,
      controllerAs : 'ctrl',
      templateUrl: 'templates/panels/paymentdialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: false,
      bindToController : true,
      hasBackdrop : true,
      locals : {
        conditions : this.submitpres.Status.Conditions,
        payment : (this.alldata.Payment)?this.alldata.Payment:this.alldata.Fees,
        paymentdone : (this.alldata.Payment)?true:false
      }
    }).then(function(answer) {
      var options = {'AID': _self.alldata.AID, 'Condition' : answer.selectedCondition, 'SWP' : 1};
      if(!_self.alldata.Payment){
        options.Payment = answer.payment;
      }
      _self.pressubmitclicked = true;
      _self._http.data('saveprescription', true, function(){
        _self.pressubmitclicked = false;
        _self._state.go('app.home');
        _self.mdPanelRef.close();
      }, options, {}, function(){
        _self.pressubmitclicked = false;
      })
    });
}

UserProfile.prototype.addtocommunity = function(){
  this.addtocommunitybuttonclicked = true;
  var _self = this;
  this._http.data('sendcommunityrequest', true, function(v){
    _self.addtocommunitybuttonclicked = false;
    _self.mdPanelRef.close();
  },{'To': [this.profile.Status.UserData.UserID], CommuID : this._commuid}, {}, function(){
    _self.addtocommunitybuttonclicked = false;
  });
}

UserProfile.prototype.removefromcommunity = function(){
  this.removefromcommunitybuttonclicked = true;
  var _self = this;
  this._http.data('removefromcommunity', true, function(){
    _self.removefromcommunitybuttonclicked = true;
    _self.mdPanelRef.close();
  },{'ID': this.profile.Status.UserData.UserID, CommuID : this._commuid}, {}, function(){
    _self.removefromcommunitybuttonclicked = true;
  });
}

UserProfile.prototype.diagnose = function(){
  var user = {
    name : this.profile.Status.UserData['First Name'] + this.profile.Status.UserData['Last Name'],
    age : Number(this.profile.Status.UserData['Age']),
    gender : (this.profile.Status.UserData['Sex'] == 'male')?"Male":"Female",
    phone : Number(this.profile.Status.UserData['Phone'])
  }
  this._state.go('dxmate',{ user : JSON.stringify(user) });
  this.mdPanelRef.close();
}

UserProfile.prototype.editnote = function(){
  if(!this.editnotes){
    this.editnotes = true;
    this.noteinstance = new Notes({notes : this.prescriptiondetails.Status.Notes});
  }else{
    let _self = this;
    this._http.data('updatenotes', true, function(){
      _self.editnotes = false;
    }, {AID : this.prescriptiondetails.Status.AID, Notes : JSON.stringify(this.prescriptiondetails.Status.Notes)})
  }
}

UserProfile.prototype.openanswerdialog = function(ev){
  var _self = this;
  var confirm = this._dialog.prompt()
      .title('Answer Here')
      .textContent('Ex. I would recommend to visit me.')
      .placeholder('Answer...')
      .ariaLabel('Answer Section')
      .targetEvent(ev)
      .ok('Answer')
      .cancel('Cancel');
  this._dialog.show(confirm).then(function(result) {
    if(result.length>0){
      var pqid;
      if(_self.alldata.query){
        let len = _self.alldata.query.length-1;
        if(_self.alldata.query[len].PQuery && !_self.alldata.query[len].DQuery){
          pqid = _self.alldata[len].PQID;
          _self._http.data("savedoctorquery", true, function(data) {
          _self._dialog.show(
            _self._dialog.alert()
              .parent(angular.element(document.querySelector('#patientprofilepanel')))
              .clickOutsideToClose(true)
              .title('Success!')
              .textContent('Your reply was successfully sent to your patient!')
              .ariaLabel('Alert Answer Sent')
              .ok('Got it!')
            );
                //return data
              }, {
            'PQID': pqid,
            'PFID': _self.alldata.PFID,
            'DQuery': result
          });
        }else{
          _self._dialog.show(
            _self._dialog.alert()
              .parent(angular.element(document.querySelector('#patientprofilepanel')))
              .clickOutsideToClose(true)
              .title('Oops!')
              .textContent('You have already replied to this query!')
              .ariaLabel('Alert Answer already sent')
              .ok('Got it!')
          );
          pqid = null;
        }
      }else{
        pqid = null;
      }
    }
  }, angular.noop);
}

// notes

function Notes(user){
  if(!this.user){
    this.user = user;
  }
  if(!this.user.notes){
    this.user.notes = {files : []};
  }
}

Notes.prototype.documentaddcallback = function($files){
  var temp = this.user.notes.files.length;
  var _self = this;
  this.user.notes.files.push({status : false});
  $files.then(function(v){
    _self.user.notes.files[temp] = {
      name : v.file_name,
      url : v.url,
      status : true
    }
  }).catch(err => {
    _self.user.notes.files.pop();
    alert(err);
  })
}

// get age

function getAge(birthDate) {
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function Suggestion(){}

Suggestion.prototype.usesuggestion = function(it){
	if(it.Prescription.length > 0){
		for(let item of it.Prescription){
			let temp = {
				name : item.Medicine,
				days : Number(item.Days),
				dose : item.Dosage,
				type : item.Type,
				selectedTimings : [],
				isafter : (item.IsAfter == "1")?true:false
			}
			if(item.Morning == "1"){
				temp.selectedTimings.push("morning");
				temp.morning = 1;
			}else{
				temp.morning = 0;
			}
			if(item.Afternoon == "1"){
				temp.selectedTimings.push("afternoon");
				temp.afternoon = 1;
			}else{
				temp.afternoon = 0;
			}
			if(item.Night == "1"){
				temp.selectedTimings.push("night");
				temp.night = 1;
			}else{
				temp.night = 0;
			}
			if(item.OnNeed == "1"){
				temp.selectedTimings.push("sos");
				temp.sos = true;
			}else{
				temp.sos = false;
			}
			this.selectedMedicine.push(temp);
		}
	}
	if(it.Test.length > 0){
		for(let item of it.Test){
			this.selectedTest.push({
				name : item.TestName
			})
		}
	}
	this.recommendation = it.Comment;
	this.mdPanelRef.close();
}

// Signup

function Signup(Http, Config, $timeout, $mdPanel){
  this._config = Config;
  this._http = Http;
  this._timeout = $timeout;
  this.today = new Date();
  this._panel = $mdPanel;
}


Signup.prototype.sendOTP = function(user){
  var _self = this;
  this._http.data('otp', true, function(v){

     if (v.Status.ResponseCode == 200){
      _self.messi = false;
      _self.otp = v.Status.val;
     }
     else if(v.Status.ResponseCode == 202){
       _self.showtoast(v.Status.ResponseMessage);
     }else{
     }
  }, {'Phone': user.phone.toString(),
      'Email' : user.email});
}

Signup.prototype.tncs = function(){
  var conf = this._config(500, 600, 'templates/panels/tncs.html', angular.noop, {});
  conf.zIndex = 150;
  this._panel.open(conf);
}


Signup.prototype.verifyOTP = function(user){
 if(user.otp == this.otp){
  this._http.data('register', true, function(v){},{
    'Phone': user.phone.toString(),
      'Email':user.email,
      'FName': user.fname,
      'LName': user.lname,
      'IsDoctor': '1',
      'DeviceID': null ,
      'RegNo': user.regno,
      'RegAssoc' : user.regassoc,
      'RegYear': user.regyear
  });
  this.mdPanelRef.close();
  this.showtoast('Your profile is successfully created, you will be verified shortly and wil receive your Login Credentials  within 24 hours', 4500);
 }else{
    this.showtoast('Incorrect OTP',3000);
  }
}



// Forgot Password

function forgotpass(Http, $timeout){
  this._http = Http;
  this._timeout = $timeout;
  this.today = new Date();
}


forgotpass.prototype.sendOTP = function(user){
  var _self = this;
  this._http.data('otp', true, function(v){

     if (v.Status.ResponseCode == 200){
      _self.messi = false;
      _self.otp = v.Status.val;
     }else{
      _self.showtoast(v.Status.ResponseMessage);
     }
  }, {'Phone': user.phone.toString(),
      'forgot':"yes"});
}



forgotpass.prototype.verifyOTP = function(user){
 if(user.otp == this.otp){
     this.ronaldo = true;
 }else{
  this.showtoast('Incorrect OTP',3000);
}
}

forgotpass.prototype.changepass = function(user){
  var _self = this;
this._http.data('changepass', true, function(v){
  _self.showtoast('Password Changed');
},{
  'OldPassword': user.currpass,
  'Phone': user.phone,
  'NewPassword': user.newpass});
  this.mdPanelRef.close();
  this.showtoast('Please login with new password',3000);
 }

 // profile

 function Prof(Http, $mdPanel, Config, $mdDialog){
   var _self = this;
   this._dialog = $mdDialog;
   this._mdpanel = $mdPanel;
   this._config = Config;
   this._Http = Http;
   this.contactdetails = [{head : 'Contact Info', contents :['First Name', 'Last Name', 'Phone', 'Secondary Phone', 'Email'], edit : false},
     {head : 'Basic Info', contents : ['Date of Birth', 'Sex', 'Summary'], edit : false},
     {head : 'Medical Info', contents : ['Registration Number', 'Registration Year', 'Association', 'Experience'], contents1 : ['Degree', 'Speciality', 'Affiliation'], edit : false}
   ];
   this.done = function(v){
     _self.volatile = false;
     delete _self.info;
     _self._Http.data('getdoctorprofile', true, angular.noop, {});
     _self._Http.data('userdetail', true, angular.noop, {});
     if(index > -1){
       _self.contactdetails[index].edit = false;
     }
     var panelRef = _self.mdPanelRef;

     panelRef && panelRef.close().then(function() {
       // angular.element(document.querySelector('.demo-dialog-open-button')).focus();
       panelRef.destroy();
     });
   }
 }
 Prof.prototype.edit = function(index){
   this.info = Object.create(this.profile.Status.DoctorData);
   this.info['Date of Birth'] = new Date(this.info['Date of Birth']);
   this.info['Secondary Phone'] = Number(this.info['Secondary Phone']);
   this.contactdetails[index].edit = true;
 }

 Prof.prototype.cancel = function(index){
   delete this.info;
   this.contactdetails[index].edit = false;
 }

 Prof.prototype.picchangecallback = function(url){
   var _self = this;
   url.then(function(response){
     _self.volatile = true;
     _self.profile.Status.DoctorData.Pic = response.url;
   })
 }

 Prof.prototype.submit = function(index){
   switch(index){
     case 0:
       this.result = this._Http.data('updatedoctor', true, this.done,{FName : this.info['First Name'], LName : this.info['Last Name'], SecPhone : this.info['Secondary Phone']}).$data;
       break;
     case 1:
       this.result = this._Http.data('updatedoctor', true, this.done,{DOB : this.info['Date of Birth'], Sex : this.info['Sex']}).$data;
       break;
     case 2:
       this.done();
       break;
     default:
       this.result = this._Http.data('updatedoctor', true, this.done,{Pic : this.profile.Status.DoctorData.Pic}).$data;
       break;
   }
   this.contactdetails[index].edit = false;
 }

 Prof.prototype.setcurrent = function(index){
   var _self = this;
   this._Http.data('setcurrentclinic', true, function(v){
     for(let item of _self.profile.Status.DoctorData.Clinics){
       item.Curr = 0;
     }
     _self.profile.Status.DoctorData.Clinics[index].Curr = 1;
   }, { ClinicID : this.profile.Status.DoctorData.Clinics[index].ClinicID});
 }

 // clinic

 function Clinic(Http){
   this._http = Http;
   this.edit = (this.clinic)?true:false;
   if(this.clinic){
     this.clinic.ClinicPhone = Number(this.clinic.ClinicPhone);
   }else{
     this.clinic = {CommuID : this.parentscope.commuid};
   }
 }

 Clinic.prototype.logocallback = function(uri){
   var _self = this;
   this.loading = true;
   uri.then(function(response){
     _self.loading = false;
     _self.clinic.ClinicLogo = response.url;
   })
 }

 Clinic.prototype.submit = function(){
    var _self = this;
    this._http.data('updateclinics', true, function(v){
      if(!_self.edit){
        _self.clinic.ClinicID = v.Status.ClinicID
        _self.parentscope.clinics.push(_self.clinic);
      }
      _self.mdPanelRef.close().then(function(){
        if(!_self.edit){
          if(_self.parentscope.currentNavItem){
            _self.parentscope.currentNavItem = _self.parentscope.clinics.length - 1;
          }else{
            _self.parentscope.currentNavItem = 0;
          }
        }
      });
    }, this.clinic);
 }

 //forgot Password

 function ForgotPassword(Http){
   this._Http = Http;
 }
 ForgotPassword.prototype.checkpass = function(){
   var _self = this;
   var check = function(v){
     if(v.Status.Result == "true"){
       _self.valid = true;
     }else{
       _self.valid = false;
     }
   }
   this.check = this._Http.data('checkpassword', true, check, {pass : this.currpass}).$data;
 }

ForgotPassword.prototype.changepass = function(){
 var _self =this;
 var exit = function(v){
   location.reload();
 }
 this.change = this._Http.data('changepass', true, exit, {OldPassword: this.currpass, Phone: this.phone, NewPassword: this.newpass}).$data
}

function ConfirmAppointment(Http, Toast, $mdDialog, $http){
  this.paid = true;
  this.clinicdoctors = Http.data("getclinicdoctors", false, angular.noop,  {}).$data.Status.Doctors;
  var date = new Date();
  this.con = {
    date : new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes())
  };
  this._http = Http;
  this._toast = Toast;
  this._dialog = $mdDialog;
  this.http = $http;
}

ConfirmAppointment.prototype.confirm = function(ev){
  var _self = this;
  if(this.evidence){
    var options = {
      'DID' : this.con.doc,
      'Phone': this.con.phone,
      'Name': this.con.name,
      'DOB' : Math.floor(this.con.dob.getTime()/1000),
      'Sex': this.con.gender.toLowerCase(),
      'Symptoms' : [this.evidence],
      'Conditions': [],
      'AppointmentDate' : Math.floor(this.con.date.getTime()/1000),
      'Height' : this.con.height,
      'Weight' : this.con.weight,
      'BloodGroup' : this.con.bgroup,
      'Allergies' : this.con.allergies,
      'Hereditory' : this.con.hereditory
    };
    if(this.paid){
      options.Payment = this.con.payment;
    }
    this._http.data('savenewdata', true, function(){
      _self.refresh();
      _self.mdPanelRef.close();
      _self._toast('Appointment Confirmed');
    },options);
  }else{
    this._dialog.show(
      this._dialog.alert()
        .parent(angular.element(document.querySelector('#adddoccontent')))
        .clickOutsideToClose(true)
        .title('Required')
        .textContent('Please add a symptom')
        .ariaLabel('Alert Dialog Symptom')
        .ok('Got it!')
        .targetEvent(ev)
    );
  }
}

ConfirmAppointment.prototype.searchTextChange = function(str) {
  var header = {
      'Content-Type': 'application/json ',
      'Accept': 'application/json'
  };

  return this.http({
      method: 'POST',
      url: 'http://52.24.83.227/getsymptombydata.php',
      data: {
          'query': str,
          'api_key' : "5+`C%@>9RvJ'y?8:"
      },
      headers: header
  })
  .then(function(response) {
      var querylist = [];
      for (var i = 0; i < response.data.Status.Result.length; i++) {
          querylist.push({
              'id': response.data.Status.Result[i].SymptomID,
              'name': response.data.Status.Result[i].SymptomName
          })
      }
      return querylist;
  });
}

ConfirmAppointment.prototype.addsymptom = function(){
  if (this.auto.selectedItem) {
      this.auto.searchText = "";
      this.evidence = {
          'id': this.auto.selectedItem.id,
          'name': this.auto.selectedItem.name,
          'choice_id': "present",
          'match': 0
      };
      var k = document.getElementById("youbethere");
      k.style.color = 'green';
  }
}

function AddDoctor($http, $rootScope, Http){
  this._http = $http;
  this.http = Http;
  this.selecteddoctors = [];
  this._userid = $rootScope.UserID;
}

 AddDoctor.prototype.add = function(item){
  if(item){
    this.selecteddoctors.push(item);
    this.searchText = "";
  }
 }

 AddDoctor.prototype.remove = function(item){
  if(item){
    this.selecteddoctors.splice(item,1);
  }
 }

AddDoctor.prototype.search = function(str) {
  var _self = this;
  var header = {
            'Content-Type': 'application/json ',
            'Accept': 'application/json'
        };

        return this._http({
                method: 'POST',
                url: 'http://52.24.83.227/search.php',
                data: {
                    'Data': str,
                    'api_key' : "5+`C%@>9RvJ'y?8:",
                    'IsDoctor' : 0
                },
                headers: header
            })
            .then(function(response) {
                _self.querylist = [];
                for(var i = 0; i < response.data.Status.Result.People.length; i++) {
                  _self.querylist.push(response.data.Status.Result.People[i]);
                }
                return _self.querylist;
           });
}

AddDoctor.prototype.senddoctorrequest = function(){
  var _self = this;
  var temp = [];
  for(var i of this.selecteddoctors){
    temp.push(i.UserID);
  }
    _self.http.data('sendcommunityrequest', true, function(v){
        _self.mdPanelRef.close();
    },{
      'To': temp,
      'DID': this._userid,
      'ClinicID': this.ClinicID
    });
}

function DialogController($mdDialog){
  this._dialog = $mdDialog;
}

DialogController.prototype.confirm = function(){
  this._dialog.hide({ selectedCondition : this.selectedCondition, payment : this.payment});
}
