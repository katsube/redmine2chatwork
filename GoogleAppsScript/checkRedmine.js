/**
 * Redmine2chatwork
 *
 * Usage:
 *   This made by GAS(Google Apps Script).
 *   Please read README.md(https://github.com/katsube/redmine2chatwork)
 *
 * Author: M.Katsube < katsubemakito@gmail.com >
 * License: MIT Lisence
 * CopyRight: (C) 2018 M.katsube
 */

var CONFIG = {
  'Me':{
      'CW_TOKEN':  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'             //チャットワークAPIトークン
    , 'CW_ROOMID': '12345678'                                     //ルームID
    , 'Redmine':{
           'token': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'    //Redmine APIトークン
      , 'endpoint': 'https://redmine.example.com/issues.json'     //Redmine APIエンドポイント
      ,  'project': 'foo'                                         //Redmine ProjectID
      ,    'limit': 50                                            //Redmine 取得件数
      ,     'sort': 'priority:desc'                               //Redmine ソート順
      , 'issueurl': 'https://redmine.example.com/issues/'         //Redmine チケットのURL
    }
    , 'Member':[
            {'name':'foo', 'rd':1,    'cw':100001}   //ユーザー名、Redmineでのid、ChatworkでのIDをセット
          , {'name':'bar', 'rd':2,    'cw':100002}
          , {'name':null,  'rd':'!*', 'cw':null}     //担当者がセットされていないチケットも出したい場合(nameは必ずnullにする)
      ]
  }
/*
  , 'Foo':{
      'CW_TOKEN':  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'             //チャットワークAPIトークン
    , 'CW_ROOMID': '12345678'                                     //ルームID
    , 'Redmine':{
           'token': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'    //Redmine
      , 'endpoint': 'https://redmine.example.com/issues.json'     //Redmine API
      ,  'project': 'foo'                                         //Redmine ProjectID
      ,    'limit': 50                                            //Redmine 取得件数
      ,     'sort': 'priority:desc'                               //Redmine ソート順
      , 'issueurl': 'https://redmine.example.com/issues/'         //Redmine チケットのURL
    }
    , 'Member':[
            {'name':'foo', 'rd':1,    'cw':100001}   //ユーザー名、Redmineでのid、ChatworkでのIDをセット
          , {'name':'bar', 'rd':2,    'cw':100002}
          , {'name':null,  'rd':'!*', 'cw':null}     //担当者がセットされていないチケットも出したい場合
      ]
  }
*/
};  // CONFIG

var DEFINE = {
	//チケット名が長い場合に省略する
	'trim': {
		  'enable': true	// falseにすると省略しない
		,    'len': 25		// 最大文字数
		,   'char': '…'		// 置き換える文字(空文字列でもOK)
	}
}; // DEFINE



/**
 * トリガーにセットする用関数
 *
 * @return void
 * @access public
 */
function executeMe(){
  checkRedmineTicket('Me');
}
/*
 * function executeFoo(){
 *   checkRedmineTicket('Foo');
 * }
 */




/**
 * Redmineからチケット情報を取得しChatworkに投げる
 *
 * @param  {String} target 使用するCONFIG
 * @return void
 * @access public
 */
function checkRedmineTicket(target){
  //validation
  if( target in CONFIG === false){
	Logger.log("[checkRedmineTicket] Error: undefined CONFIG(" + target + ")");
	return(false);
  }

  var conf = CONFIG[target];
  var len  = conf.Member.length;

  //--------------------------------------------------
  // 起動メッセージ
  //--------------------------------------------------
  sendMessage(conf.CW_TOKEN, conf.CW_ROOMID, "Redmineのチケットをチェックするよ。\n対象のプロジェクトは『"+conf.Redmine.project+"』だよ。");
  Utilities.sleep(3000);  //3秒待機

  //--------------------------------------------------
  // メンバー数分チェック
  //--------------------------------------------------
  for(var i=0; i<len; i++){
    var message = '';
    var member  = conf.Member[i];

    // Redmineからメンバーのチケット情報を取得
    var tickets = getRedmineTicket(conf.Redmine, member.rd);
    var len_t   = tickets.length;

    // 担当者の設定なしチケット
    if(member.name === null){
		if(len_t === 0){
			continue;
		}
		else{
			message = "担当者が未設定のチケットがあるよ。\n\n";
		}
	}
    // 担当者の設定ありチケット
    else{
	  // 担当者へTo
	  message = "[To:"+ member.cw +"] "+ member.name + " さん\n";
      message += member.name + " さんの担当しているチケットは"+ len_t +"件だよ\n\n";
    }

    // チケットを一覧にする
    for(var j=0; j<len_t; j++){
      var id       = tickets[j].id;              //1
      var tracher  = tickets[j].tracker.name;    //タスク、要件定義...
      var priority = tickets[j].priority.name;   //通常、重要、急いで...
      var subject  = tickets[j].subject;         //チケット名

	  // チケット名が長い場合は省略する
	  if( DEFINE.trim.enable ){
		subject = strimwidth(subject, DEFINE.trim.len, DEFINE.trim.char);
	  }

      message += j+1 + ". ["+tracher+"] " + subject + "("+priority+") " +  conf.Redmine.issueurl+id + "\n";
    }

    // チャットワークへ送信
    sendMessage(conf.CW_TOKEN, conf.CW_ROOMID, message);
    Utilities.sleep(3000);  //3秒待機
  }

  //--------------------------------------------------
  // 終了メッセージ
  //--------------------------------------------------
  sendMessage(
        conf.CW_TOKEN
      , conf.CW_ROOMID
      ,   "チェックが終わったよ。\n"
        + "1人最大で"+ conf.Redmine.limit +"件までしか取ってこないからたくさんチケットがある人はRedmineを直接見てね。\n"
  );
}


/**
 * Redmineからチケット情報を取得
 *
 * @param  {Object}  redmine CONFIG.[TARGET].Redmine
 * @param  {Integer} id      Redmine上のユーザーID
 * @return {Object}
 * @access public
 */
function getRedmineTicket(redmine, id){
  var url = redmine.endpoint + '?'
              + 'key='             + encodeURIComponent(redmine.token)
              + '&project_id='     + encodeURIComponent(redmine.project)
              + '&limit='          + encodeURIComponent(redmine.limit)
              + '&sort='           + encodeURIComponent(redmine.sort)
              + '&assigned_to_id=' + encodeURIComponent(id);
  var response = UrlFetchApp.fetch(url);
  var results  = JSON.parse(response.getContentText());

  return(results.issues);
}

/**
 * Chatworkにメッセージ送信
 *
 * @param  {String}  token   APIトークン
 * @param  {Integer} room_id 部屋ID
 * @param  {String}  msg     投稿する文字列
 * @return void
 * @access public
 */
function sendMessage(token, room_id, msg) {
  var client = ChatWorkClient.factory({token: token});
  client.sendMessage({
      room_id: room_id
    , body: msg
  });
}

/**
 * 文字列を指定文字数でカットする
 *
 * @param {String}  str        対象とする文字列
 * @param {Integer} width      最大文字数
 * @param {String}  trimmarker 置き換える文字列
 */
function strimwidth(str, width, trimmarker){
	if( str.length > width ){
	  return( str.substr(0, width) + trimmarker );
	}
	else{
	  return(str);
	}
  }
