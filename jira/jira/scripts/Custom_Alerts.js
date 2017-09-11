function dialogOKOnly(isModal, myTitle, myMessage) {

    var $dialog = $('<div></div>')
		        .html(myMessage)
		        .dialog({
		            autoOpen: false,
		            resizable: false,
		            title: myTitle,
		            modal: isModal,
		            buttons: {
		                Ok: function () {
		                    $(this).dialog("close");
		                }
		            }
		        });

    $dialog.dialog('open');
}

//function dialogYesCancel(isModal, myTitle, myMessage) {
//    var returnMsg 
//    var $dialog = $('<div></div>')
//		        .html(myMessage)
//		        .dialog({
//		            autoOpen: false,
//		            resizable: false,
//		            title: myTitle,
//		            modal: isModal,
//		            buttons: {
//		                Yes: function () {
//		                    $(this).dialog("close");
//		                    return true;
//		                },
//		                Cancel: function () {
//		                    $(this).dialog("close");
//		                    return false;		                   
//		                }
//		            }
//		        });

//		        return $dialog.dialog('open');
//		        
//		        
//		    }
