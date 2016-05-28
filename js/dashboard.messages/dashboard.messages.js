export default
['$scope', '$rootScope', '$firebaseArray', '$stateParams', 
 '$timeout', '$interval', '$location', 'userInfo', 'fire', 
 '$firebaseObject',
function($scope, $rootScope, $firebaseArray, $stateParams, 
  $timeout, $interval, $location, userInfo, fire, $firebaseObject) {
  
  $rootScope.subLoading = true;
  let current_dialog_ref = new Firebase(`${fire}/users/${userInfo.uid}/dialogs/${$stateParams.name}`);
  let current_dialog = $firebaseObject(current_dialog_ref);
  let current_user   = $firebaseObject(new Firebase(`${fire}/users/${userInfo.uid}`));
  let messages_ref = new Firebase(`${fire}/users/${userInfo.uid}/dialogs/${$stateParams.name}/messages`);
  let messages = $firebaseArray(messages_ref);
  $scope.userUid = userInfo.uid;
      
  current_dialog.$loaded(function() {
    
    $scope.current_dialog = current_dialog;
    current_dialog_ref.child('newMessages').set(false);
    $rootScope.subLoading = false;    
  })
  
  current_user.$loaded(function() {
   
    $scope.message = {
    
      author: current_user.info.name + ' ' + current_user.info.surname,
      time: '',
      text: '',
      authorId: current_user.id,
      authorPhoto: current_user.info.image
    };
  })
  
  $scope.currentDate = 1463754897700;
  
  $scope.dialogTitle = $stateParams.name.split('_').join(' ');
  $scope.dialogName  = $stateParams.name;
  $scope.messages    = messages;
  $scope.sendMessage = sendMessage;
  $scope.watchEnter  = watchEnter;
  $scope.goBack      = goBack;
  
  function watchEnter(e) {
    
    if (e.keyCode === 13) {
      
      $timeout(function() {
        angular.element('#message_text').triggerHandler('click');
      }, 0);
    }
  }
  
  function sendMessage() {
    
    $scope.message.time = (new Date()).getTime();
    
    if($scope.current_dialog.toOneUser) {
      
      
      $scope.current_dialog.participants.forEach(function(participant) {
        
        if (userInfo.uid !== participant) {
                    
          let dialog_name = current_user.info.name + '_' + current_user.info.surname,
              dialog      = new Firebase(`${fire}/users/${participant}/dialogs/${dialog_name}`),
              participant_messages = $firebaseArray(new Firebase(`${fire}/users/${participant}/dialogs/${dialog_name}/messages`));
          
          participant_messages.$add($scope.message);           
          dialog.child('newMessages').set(true);
        } else {
          
          let participant_messages = $firebaseArray(new Firebase(`${fire}/users/${participant}/dialogs/${$stateParams.name}/messages`)),
              dialog     = new Firebase(`${fire}/users/${participant}/dialogs/${$stateParams.name}`);
          participant_messages.$add($scope.message);
          dialog.child('newMessages').set(false);
        }
      })
      $scope.message.text = ''; 
    } else {
      
      $scope.current_dialog.participants.forEach(function(participant) {

        let participant_messages = $firebaseArray(new Firebase(`${fire}/users/${participant}/dialogs/${$stateParams.name}/messages`));
        let dialog               = new Firebase(`${fire}/users/${participant}/dialogs/${$stateParams.name}`);
        participant_messages.$add($scope.message);
        if (userInfo.uid !== participant) {
            
          dialog.child('newMessages').set(true); 
        }
      })
      $scope.message.text = '';  
    }
  }
  
  function goBack() {
    
    current_dialog_ref.child('newMessages').set(false);
    $location.path('/dialogs');
  }
}]