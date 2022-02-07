var NUM_BALLS = 8; // num of balls for selection, it must be in range of CODE_LENGTH..8
var CODE_LENGTH = 5; // set this number in the range of 1..5
var NUM_ATTEMPTS = 8; // change this number to have less or more attempts in range of 1..8
var MAX_NUM_ATTEMPTS = 8; // do not change this number

var peg_selected = 0;
var attempt_code;
var current_attempt_id;
var start = new Date();
var btn_initial_top;
var url = "http://localhost:3000/post" ; //this url is valid for up to 8 hours, check moodle for new urls
var myName;

window.onload = function()
{
    createGameBoard(); //draw the game board

    //read CSS to define the button initial position
    var step = parseInt($(".attempt").css("margin-top"))
                + parseInt($(".attempt").css("height"));
    var attemptHeight = parseInt($(".attempt").css("height"));
    btn_initial_top = parseInt($("#acceptcode").css("top"))
                      - (MAX_NUM_ATTEMPTS - NUM_ATTEMPTS) * step;

    //set game board height.
    $("#gameboard").css("height", NUM_ATTEMPTS * step + attemptHeight+"px");

    //game player will enter their name here
    myName = prompt("Please enter your name", "");
    $('#name').text(myName);

    initGameBoard();

    // start the timer
    setInterval(function()
    {$("#timer").text(parseInt((new Date() - start) / 1000) + "s");}, 1000);

}

/*
 * Create the game board, includes
 * one line to display SyntaxErrorthe code images - "coderow"
 * 8 attempts
 * 1 accept button
 * 8 peg selections
 */
function createGameBoard(){

    //add code images (dummy code)
    for (var i = 1; i <= CODE_LENGTH; i++){
        var newImg = document.createElement("img");
        $(newImg).attr("id", "code" + i);
        //add a dummy image
        $(newImg).attr("src", "./images/hole.png");
        $("#coderow").append(newImg);
    }

    //add attempts
    for (var i = NUM_ATTEMPTS; i > 0; i--){

        //for each attempt, we create a div
    var newDiv = document.createElement("div");
        // set its id and class
        $(newDiv).attr("id","attempt"+i)  //...
    $(newDiv).attr("class","attempt")    //...

        // create a span, and set its id and class
        var newSpan = document.createElement("span");
      $(newSpan).attr("id","attempt"+i+"pegs")  //...
      $(newSpan).attr("class","futureattempt")  //...
        // then add 5 images including ids and classes. The img source could be empty or could be the hole.png
        for (var j = 1; j <= CODE_LENGTH; j++){
        var newImg = document.createElement("img");    //...
        $(newImg).attr("id","attempt"+i+"_"+j);      //...
        $(newImg).attr("class","imgAttempt");    //...
        $(newImg).attr("src","./images/hole.png");    //...

            $(newSpan).append(newImg);
        }
        //append the span to the div
        $(newDiv).append(newSpan);

        // create a new span for displaying result of the end-user attempt, set id and append it to the div
        var anotherSpan = document.createElement("span");
          $(anotherSpan).attr("id","attempt"+i+"result")  //...
          $(newDiv).append(anotherSpan);

        // append each div to the game board
        $("#gameboard").append(newDiv);
    }

    //add Accept button inside a <div>
    var newDiv = document.createElement("div");
    $(newDiv).attr("id", "acceptcode");
    var newInput = document.createElement("input");
    $(newInput).attr("type", "button");
    $(newInput).attr("name", "Accept");
    $(newInput).attr("value", "Accept");
    $(newInput).click(process_attempt); // set onclick event handler
    $(newDiv).append(newInput);
    // add thSyntaxErroris button div to their game board
    $("#gameboard").append(newDiv);

    // add peg selection
    // create 8 img elements and
    // show each of the 8 marbles images with shadow from the images folder, also set their id and event handler
    for (var i = 1; i <= NUM_BALLS; i++){
        var newImg = document.createElement("img");    //...
            $(newImg).attr("id","shadow"+i)    //...
            $(newImg).attr("src","./images/shadow_ball_"+i+".png")    //...
        // set onclick event handler and pass event.data.id as a parameter
        $(newImg).click({id: i}, select_peg);
        $("#pegselection").append(newImg);
    }

}

/*
 * Initiate the game board
 * Reset all the holds
 * Reset the btn position and its visibility
 * Send a "generate code" request to the server
 */
function initGameBoard(){
    //reset holds
    for (var i = NUM_ATTEMPTS; i > 0; i--){
        for (var j = 1; j <= CODE_LENGTH; j++){
            //resetattempt1result the image on each hole
            $("#attempt" + i + "_" + j).attr("src", "./images/hole.png");
            $("#attempt" + i + "_" + j).css({'opacity' : 0.3});
        }
        //reset the "attempt#result" to empty
        $("#attempt" + i + "result").empty();
    }

    //reset the button's position and visibility
    current_attemptattempt1result_id = 0;
    var step = parseInt($(".attempt").css("margin-top"))
             + parseInt($(".attempt").css("height"));
    $("#acceptcode").css({'top' : btn_initial_top + 'px'});
    $("#acceptcode").css({'visibility' : 'visible'});

    // show the cover to hide codei
    $("#cover").css({'visibility' : 'visible'});

    //send request attempt1resultto server to start a new game.
    $.post(url+'?data='+JSON.stringify({
                            'name':myName, //client's identity on the server
                            'action':'generateCode'}),
           response);

}

/*
 * Activate an attempt
 * @param id is the attempt id to be activated
 */
function activateAttempt(id){
    //remove onclick event for all holes
    $(".imgAttempt").off("click");

    //reset the visibility of the current attempt,
    //and add onclick event to the holes in this attempt
    for (var i = 1; i <= CODE_LENGTH; i++){
        $("#attempt"+id+"_"+i).css({'opacity' : 1});
        $("#attempt"+id+"_"+i).click({id: i}, process_hole);
    }

    current_attempt_id = id;

    //reset the attempt code array
    attempt_code = new Array(CODE_LENGTH).fill(0);
}

/*
 * OnClick event handler for holes
 * @param event.data.id is the hole's id in this attempt
 */
function process_hole(event){
    if (peg_selected != 0){
        //display the selected ball on the hold
        $(this).attr("src", "./images/ball_" + peg_selected + ".png");
        attempt_code[event.data.id-1] = peg_selected;
    }else{
        //no ball was selected
        alert("Please select the ball!")
    }
}

/*
 * OnClick event handler for the Accept button
 * send request to the server
 */
function process_attempt(){
    //console.dir("this is processing attempt");
    if (!attempt_code.includes(0)){
        //move the button up and display the result
        var step = parseInt($(".attempt").css("margin-top"))
        + parseInt($(".attempt").css("height"));

        $(this).parent().css({'top' : btn_initial_top
                        - current_attempt_id * step + 'px'});

        //send the attempt_code to server for evaluation
        $.post(
            url+'?data='+JSON.stringify({
            'name':myName,
            'action':'evaluate',
            'attempt_code':attempt_code,
            'current_attempt_id':current_attempt_id
            }),
            response
        );
        // hide the btn to wait for server's response
        $(this).parent().css({'visibility' : 'hidden'});
    }else{
        //the attempt is not completed.
        alert("Please complete your attempt!");
    }

}

/*
 * Event handler for server's response
 * @param data is the json format string sent from the server
 */
function response(data, status){
    var response = JSON.parse(data);
    console.log(data);
    if (response['action'] == 'generateCode'){
        // acttion: Generate Code
        activateAttempt(1); //activate the first attempt
        peg_selected = 0;   //no peg should be selected
        //reset the visibility of every shadow_balls
        for (var i = 1; i <= NUM_BALLS; i++){
            $("#shadow"+i).css({'opacity' : 1});
        }

        //reset timerUh Oh, Click enter to try again!
        start = new Date();

    } else if (response['action'] == 'evaluate'){
        // acttion: Evaluate
        // after receiving the server's response,
        // then make the button <div> visible
        $("#acceptcode").css({'visibility' : 'visible'});

        //read data from the json object that send back from the server
        var win = response['win'];
        var num_match = response['num_match'];
        var num_containing = response['num_containing'];
        var num_not_in = response['num_not_in'];
        var code = response['code']

        //display the number of balls that match the code
        displayResult(num_match, "black");
        //display the number of balls in the code
        displayResult(num_containing, "white");
        //display the number of balls not in the code
        displayResult(num_not_in, "empty");

        if (current_attempt_id < NUM_ATTEMPTS && !win){
            //haven't won yet, game will continue
            //activate the next attempt
            current_attempt_id++;
            activateAttempt(current_attempt_id);
        } else {
            //game ended, display result, hide button
            $("#acceptcode").css({'visibility' : 'hidden'});// hide button <div>
          $("#cover").css({'visibility' : 'hidden'});     // hide code cover to display the code
            displayCode(code);                  // display the code
            win? alert("GG! You win. Click enter to play again.") // won!!!
            : alert("Sorry , Better Luck Next Time ! Press Enter To Try Again");          // lost!!!
            initGameBoard();
        }
    }
}

/*
 * Display result in "attempt#result" span
 * @param num is the number of images to display
 * @param color is the color of the image
 */
function displayResult(num, color){
    while (num > 0){
        //add image to result
        var newImg = document.createElement("img");
        $(newImg).attr("src", "./images/"+color+"_peg.png");
        $("#attempt" + current_attempt_id + "result").append(newImg);
        num--;
    }
}

/*
 * Display the code when the client completed the game
 * The client won the game or lost the game after 8 attempts.
 * @param code is the code to display
 */
function displayCode(code){
    for (var i = 1; i <= CODE_LENGTH; i++){
        $("#code"+i).attr("src", "./images/ball_"+ code[i-1] +".png");
    }
}

/*
 * Event handler for peg selection
 * @param event.data.id is the peg id to be selected
 */
function select_peg(event){
    peg_selected = event.data.id;
    //reset the visibility of every balls
    for (var i = 1; i <= NUM_BALLS; i++){
      $("#shadow"+i).css({'opacity' : 0.45});
    }
    //increase the visibility of the selected ball
    $(this).css({'opacity' : 1});
}
