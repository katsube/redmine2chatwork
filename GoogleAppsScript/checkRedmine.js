/**
 * Redmine2chatwork
 *
 * Usage:
 *   This made by GAS(Google Apps Script).
 *   Please read README.md(https://github.com/katsube/redmine2chatwork)
 *
 * Author: M.Katsube < katsubemakito@gmail.com >
 * License: MIT Lisence
 * CopyRight: 
 */

var CONFIG = {
  'Me':{
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

/**
 * トリガーにセットする用関数
 *
 * @param  void
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
 * @param  target String
 * @return void
 * @access public
 */
function checkRedmineTicket(target){
  var conf = CONFIG[target];
  var now  = new Date().getTime();
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

    // 担当者へTo
    if( (member.name === null) && (len_t > 0) ){
      message = "担当者が未設定のチケットがあるよ。\n\n";
    }
    else{
      message = "[To:"+ member.cw +"] "+ member.name + " さん\n";
      message += member.name + " さんの担当しているチケットは"+ len_t +"件だよ\n\n";
    }

    // チケットを一覧にする
    for(var j=0; j<len_t; j++){
      var id       = tickets[j].id;              //1
      var tracher  = tickets[j].tracker.name;    //タスク、要件定義...
      var priority = tickets[j].priority.name;   //通常、重要、急いで...
      var subject  = tickets[j].subject;         //チケット名
      
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
 * @param  redmine Object
 * @oaram  id      Integer
 * @return Object
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
 * @param  token   String
 * @param  room_id Integer
 * @param  msg     String
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

