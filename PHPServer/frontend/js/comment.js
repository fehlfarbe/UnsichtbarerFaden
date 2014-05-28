$(document).ready(function () {
        
        $("#comment-overlay").click(function(){
            $("#comment-overlay, #comment-box").hide();
        })

        $(window).resize(function () {
            if (!$("#comment-box").is("hidden")) popupComment();
        });

        
        $("#btn-submit").click(function() {  
            $("#comment-form").trigger('submit'); 
        });

        $("#comment-form").validate({ onkeyup:false, submitHandler:contact_submit });
        $('#captcha-code').attr('value', '');
        function contact_done() { window.location = '/'; }
        function contact_submit()
        {
                $.ajax({
                        type: "POST",
                        url: "comment.php",
                        data: $("#comment-form").serialize(),
                        success: function(data){
                                if (data == "SUCCESS")
                                        $("#comment-overlay, #comment-box").hide();
                                else if (data == "WRONG_CODE")
                                        alert("The security code you typed was wrong. Please try again.");
                                else
                                        alert("Message not sent, please try again. Error data: "+data);
                        }
                });
        


    };



});

function popupComment() {
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();

    var dialogTop = (maskHeight/3) - ($("#comment-box").height());
    var dialogLeft = (maskWidth/2) - ($("#comment-box").width()/2);

        $("#comment-overlay").css({height:maskHeight, width:maskWidth}).show();
        $("#comment-box").css({ left:dialogLeft}).show();
}