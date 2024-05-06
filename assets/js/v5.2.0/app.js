function setPageEditable(el) {
    if(el.hasAttribute('checked') && el.getAttribute('checked')!="false") {
        // user requested edit mode
        $('[data-content-id]').attr("contenteditable",true);
        el.setAttribute('checked','false')
    } else {
        $('[data-content-id]').attr("contenteditable",false);
        el.setAttribute('checked','true')
    }
}

const Chat = {
    id: 'chat',
    target_element:"",
    render: function(){

    }
};


document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 's') {
        // Prevent the Save dialog to open
        e.preventDefault();
        // Place your code here
        console.log('CTRL + S');
    }
});


$( document ).ready(function() {
    $.getJSON('http://www.geoplugin.net/json.gp', function(data) {
        console.log(JSON.stringify(data, null, 2));
    });
});

function sendVideoTrackingEvent(msg,v){
    $.ajax({
        method: "POST",
        url: "<?=$_SERVER['WEB_ADDR'];?>/tracking/website-001/video/video-001",
        data: { event: msg, video_id: v, user_id:"user-001",website_id:"website-001" }
    })
        .done(function( msg ) {
            console.log( msg.data.status );
        });
}

// array of the events we want to track
var events=new Array("abort","canplay","canplaythrough","durationchange","emptied","ended","error","loadeddata","loadedmetadata","loadstart","pause","play","playing","progress","ratechange","seeked","seeking","stalled","suspend","timeupdate","volumechange","waiting");

var vid=document.getElementById('video');
var msg = document.getElementById('msg');

if(vid) {
    // add event listeners to the video
    for (var i in events) {
        vid.addEventListener(events[i], showEvent, false);
    }
}

function showEvent(e) {
    var addMsg = "";
    if (e.type == "durationchange") {
        addMsg = e.type + "[" + vid.duration + "]";
    } else if (e.type == "seeked") {
        addMsg = e.type + "[" + vid.currentTime + "]";
    } else if (e.type == "timeupdate") {
        // do nothing as there are a lot of these
    } else if (e.type == "volumechange") {
        addMsg = "volume " + (vid.muted ? "muted" : vid.volume);
    } else {
        addMsg = e.type;
    }
    if (addMsg != "") {
        sendVideoTrackingEvent(addMsg,"video-001");
        msg.innerHTML = addMsg + ((msg.innerHTML == "") ? "":", ") + msg.innerHTML;
    }
}

$(document).on('click', '#contentUpdateSubmit', function(){
    $els=$('body').find('[data-changed]');
    $.each( $els, function( key, value ) {

        let contentId = $($els[key]).attr('data-content-id');
        let initialValue = $($els[key]).attr('data-initial-value');
        let newValue = $(value).text();

        if(initialValue.localeCompare(newValue)) {
            // content have been changed
            console.log(contentId + "to be updated from " + initialValue + " to " + newValue);

            $('<input>').attr({
                type: 'text',
                id: 'content-'+contentId+'-value',
                name: 'content['+contentId+'][value]',
                class: 'form-control',
                value: newValue
            }).appendTo('#contentFormModal .modal-body');
            $('<input>').attr({
                type: 'hidden',
                id: 'content-'+contentId+'-id',
                name: 'content['+contentId+'][content_id]',
                value: contentId
            }).appendTo('#contentFormModal .modal-body');
        }
    });
});
$(document).on('focusin', '[data-content-id]', function(){
    console.log("Saving value " + $(this).text());
    $(this).attr('data-initial-value',$(this).text());
    $(this).attr('data-changed',true);
})

