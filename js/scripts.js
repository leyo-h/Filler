//canvas stuff
var c = document.getElementById("gameCanvas");
var moveButton = document.getElementById("makeMove");
var colourSelect = document.getElementById("colourSelect");


var ctx = c.getContext("2d");


templateBoard = [[5, 5, 2, 3, 0, 6, 4, 5], [3, 0, 1, 2, 6, 0, 5, 6],[4, 5, 4, 5, 0, 4, 2, 0],[5, 6, 1, 0, 6, 5, 0, 2], [2, 3, 5, 1, 3, 4, 5, 1],[1, 2, 3, 2, 4, 5, 1, 4],[2, 3, 2, 6, 3, 0, 5, 0]]

allBoards = [];

//game settings/ variables
var searchDepth = 8;
var ALPHA = -1000000
var BETA = -ALPHA

var width = 8;
var height = 7;

var colours =7;
var coloursHex = ["#6184D8","#7F055F","#C44900","#9CEC5B","#F0F465","#FF0035","#000000"]
 //                 blue    pink        orange  green       yellow  red         black
var canvasHeight = 525;
var canvasWidth=600;


var mainBoard = [];
var directions = [[0,1],[0,-1],[1,0],[-1,0]]
var sqW=0;
var sqH=0;

//game logic variable
p1StartSquare = [0,0]
p2StartSquare = [height-1,width-1]
p1Sqs = [p1StartSquare]
p2Sqs = [p2StartSquare]

p1Turn = true;

twoPlayer = false;

//Opponents
opponent = 4; 
/*
0   random move
1 random move of available moves that benefit the player
2 depth of 1 ig
3 arbitrary depth
4 different depth one to see if that works
*/

function updateDropDown(){
    for(var i =0; i< colours;i++){
        let o = document.createElement("option");
        o.value = i;
        o.text = " ";
        o.style.backgroundColor = coloursHex[i];
        o.style.color = coloursHex[i];
        colourSelect.options.add(o);

    }

}

function setColourOfSelector(){
    colourSelect.style.backgroundColor = coloursHex[colourSelect.value]
}


function cloneBoard(board){
    let newB = []
    for(let i =0;i<board.length;i++){
        newB.push(Array(board[i].length))
        for(let j=0;j<board[i].length;j++){
            newB[i][j] = board[i][j]+0
        }
    }
    return newB


}
function drawBoard(board){
    //calculate the size of our squares
    sqW = canvasWidth/width;
    sqH = canvasHeight/height;

    for(var i = 0; i<height;i++){
        for(var j = 0;j<width;j++){
            sqColour = board[i][j]
            ctx.fillStyle = coloursHex[sqColour]; // set fill style
            ctx.fillRect(j*sqW,i*sqH,sqW,sqH);
            ctx.fill();

        }
    }
    //other drawing stuff we have to do
    setColourOfSelector()

}

function getRandomColourID(){
    tempC = Math.floor(Math.random()*colours)
    if (tempC == colours) c=colours-1;
    return tempC
}

function generateVisitedArray(){
    let newBoard = [];
    for (var i=0;i<height; i++){
        newBoard.push(Array(width).fill(false)) // fill the array with -1 as this is not gonna be a number we can randomly generate
        
    }
    return newBoard
}


function generateBoard(){
    let newBoard = []

    for (var i=0;i<height; i++){
        newBoard.push(Array(width).fill(-1)) // fill the array with -1 as this is not gonna be a number we can randomly generate
        for (var j=0;j<width; j++){
            // checking the sqaure above is different
            possibleColour = getRandomColourID()
            foundValidColour = false;

            while(!foundValidColour){

                if(i+1 < newBoard.length){ // not at top of board

                    if(possibleColour == newBoard[i+1][j]){
                        //change c to a colour  which we know is safe ig compare to this one
                        possibleColour =  (newBoard[i+1][j] +1) % colours
                        continue;

                    }

                }
                if(i > 0){ // not at the bottom of the board

                    if(possibleColour == newBoard[i-1][j]){
                        //change c to a colour  which we know is safe ig compare to this one
                        possibleColour =  (newBoard[i-1][j] +1) % colours;
                        continue;

                    }

                }
                if(j+1 != width){//not on the right edge

                    if(possibleColour == newBoard[i][j+1]){
                        //change c to a colour  which we know is safe ig compare to this one
                        possibleColour =  (newBoard[i][j+1] +1) % colours;
                        continue;

                    }

                }
                if(j >0){//not on the left edge

                    if(possibleColour == newBoard[i][j-1]){
                        //change c to a colour  which we know is safe ig compare to this one
                        possibleColour =  (newBoard[i][j-1] +1) % colours;
                        continue;

                    }

                }

                foundValidColour = true;

            }
            newBoard[i][j] = possibleColour
        }
    }
    return newBoard
}

function squareInArray(sq,arr){
    
    for(let i = 0;i<arr.length;i++){
        let f = true;
        for(let j =0; j<sq.length;j++){
            if( (arr[i][j] != sq[j]) ){
                f= false
            }
        
        }
        if(sq.length != arr[i].length){
        
        }else if(f){
            return true
        }
        
    }
    return false;


}

function makeMoveP1(colourID,b){
    // we change the colour of all the squares then we use a depth first search thing to get all of the squares we control
    
    let pB = cloneBoard(b)
    let p1ControlledSquares =getConnectedSquares(p1StartSquare,pB,b[p1StartSquare[0]][p1StartSquare[1]])

    for(var i =0;i<p1ControlledSquares.length;i++){
        pB[p1ControlledSquares[i][0]][p1ControlledSquares[i][1]] = colourID;
    }
    //p1Sqs = getConnectedSquares(p1StartSquare,[p1StartSquare],board)

    return pB
}

function makeMoveP2(colourID,b){
    // we change the colour of all the squares then we use a depth first search thing to get all of the squares we control
    let qB = cloneBoard(b)
    let testing = false;

    let p2ControlledSquares =getConnectedSquares(p2StartSquare,qB,qB[p2StartSquare[0]][p2StartSquare[1]]+0)

        //console.log("The connected squares are",p2ControlledSquares,p2ControlledSquares.length)
    
   

    for(var i =0;i<p2ControlledSquares.length;i++){
        qB[p2ControlledSquares[i][0]] [ p2ControlledSquares[i][1] ] = colourID;
    }

    //p2Sqs = getConnectedSquares(p2StartSquare,[p2StartSquare],board)
    return qB
}


function getConnectedSquares(startSquare,board,currentColour,v=[],d=0){
    let entry=false;
    if(v.length==0){
        entry = true;
    }
    let y = startSquare[0]
    let x = startSquare[1]
    let curr = currentColour; // pointless variable but LOL
    //console.log(y,x)
    if(startSquare[0]>=height || startSquare[0]<0 || startSquare[1]<0 || startSquare[1]>=width||squareInArray(startSquare,v)  ){
        return []
    }else if(board[y][x] != curr){
        return []
    }
    v.push(startSquare)

    for(let i =0;i<directions.length;i++){
        let dir = directions[i]
        getConnectedSquares([y+dir[0],x+dir[1]],board,curr,v,d+1)
    }
    if(entry){
        return v;
    }
    
    


}

function isMoveValid(m,board){
    //tells you if a move on the MAIN BOARD is valid
    if(m == board[p1StartSquare[0]][p1StartSquare[1]] || m == board[p2StartSquare[0]][p2StartSquare[1]]){
        return false
    }
    return true;
    
}

function moveButton_onPress(){
    let attemptedMove = parseInt(colourSelect.value);
    p1Colour = mainBoard[p1StartSquare[0]][p1StartSquare[1]]
    p2Colour = mainBoard[p2StartSquare[0]][p2StartSquare[1]]

    if(attemptedMove != p1Colour && attemptedMove != p2Colour){
        if(p1Turn){
            mainBoard = makeMoveP1(attemptedMove,mainBoard);
            p1Colour = attemptedMove;
            p1Sqs = getConnectedSquares(p1StartSquare,mainBoard,mainBoard[p1StartSquare[0]][p1StartSquare[1]]);
            if(twoPlayer){
                p1Turn = !p1Turn;
            }else{
                //Gonna Put my different levels of Difficulty of AI
                //Truly Random
                if(opponent == 0){
                    let potentialMove = getRandomColourID();
                    if(potentialMove == p1Colour || potentialMove == p2Colour){
                        potentialMove = (potentialMove+1) % colours
                        if(potentialMove == p1Colour || potentialMove == p2Colour){
                            potentialMove = (potentialMove+1) % colours
                            
                        }
                    }
                    mainBoard=  makeMoveP2(potentialMove,mainBoard);
                    p2Colour = potentialMove;
                    p2Sqs = getConnectedSquares(p2StartSquare,mainBoard,mainBoard[p2StartSquare[0]][p2StartSquare[1]]);





                }else if (opponent==1){
                    //Random but only out of moves that will give atleast one extra square
                    let potentialMove = getRandomColourID()-1;
                    let suitableMoveFound = false;
                    let count = 0;
                    while(!suitableMoveFound){
                        potentialMove = (potentialMove+1)%colours;
                        if(potentialMove == p1Colour || potentialMove == p2Colour){
    
                            continue;
                        }
                        if(count>colours+1){
                        // we have to make a move as there are no good moves for us and all we can do it stall
                            mainBoard = makeMoveP2(potentialMove,mainBoard);
                            p2Sqs = getConnectedSquares(p2StartSquare,mainBoard,mainBoard[p2StartSquare[0]][p2StartSquare[1]]);
                            suitableMoveFound = true;
                        }
                        if(getConnectedSquares(p2StartSquare, makeMoveP2(potentialMove,mainBoard)).length > p2Sqs.length){
                            mainBoard = makeMoveP2(potentialMove,mainBoard);
                            p2Sqs = getConnectedSquares(p2StartSquare,mainBoard),mainBoard[p2StartSquare[0]][p2StartSquare[1]];
                            suitableMoveFound = true;
                        }
                        count = count+1;
                    }
                }
                else if (opponent == 2){
                    let t = bestMoveAtDepth(mainBoard,false,eval_difference,1,true)
                    //console.log(t);

                    mainBoard = makeMoveP2(t,mainBoard);
                    p2Sqs = getConnectedSquares(p2StartSquare,mainBoard,mainBoard[p2StartSquare[0]][p2StartSquare[1]]);

                }
                else if (opponent ==3){
                    //search at arbitrary depth
                    let t = bestMoveAtDepth(mainBoard,false,eval_difference,searchDepth,true)
                        //console.log(t);

                    mainBoard = makeMoveP2(t,mainBoard);
                    p2Sqs = getConnectedSquares(p2StartSquare,mainBoard,mainBoard[p2StartSquare[0]][p2StartSquare[1]]);

                }else if(opponent ==4){
                    //alpha beta at depth
                        //search at arbitrary depth
                        let t = bestMoveAtDepth_alphabeta(mainBoard,false,eval_difference,searchDepth,ALPHA,BETA,true)
    
                        //console.log(t)
                        //console.log(t);
    
                        mainBoard = makeMoveP2(t,mainBoard);
                        p2Sqs = getConnectedSquares(p2StartSquare,mainBoard,mainBoard[p2StartSquare[0]][p2StartSquare[1]]);
    

                }




            }

        }else{ // if we are in 2 player mode and someone amde a move and its not player ones we do p2s
            mainBoard = makeMoveP2(attemptedMove,mainBoard)
            p2Colour = attemptedMove;
            p2Sqs = getConnectedSquares(p2StartSquare,mainBoard,mainBoard[p2StartSquare[0]][p2StartSquare[1]]);

        }
        

    }
    drawBoard(mainBoard);
    
    if(p1Sqs.length + p2Sqs.length == width*height){
        console.log("SOMEONE HAS ONE OR LOST OR ITS A DRAW")
        console.log("Score: "+p1Sqs.length+" : "+p2Sqs.length)
    }



}


//onclick events
c.addEventListener('click', function(event) {
    r = c.getBoundingClientRect()
    var x = event.pageX - r.left,
        y = event.pageY - r.top;

    var sqX = (Math.floor(x/sqW));
    var sqY = (Math.floor(y/sqH));
    // stuff to do on click
    // check its player ones turn
        // make p1 move
    //console.log(sqX,sqY)
    
  //  old code for chosing what move to do 
  
    let attemptedMove = mainBoard[sqY][sqX]
    colourSelect.value = attemptedMove;
    moveButton_onPress();
    

}, false);



function eval_difference(board,maximise){ // adding maximise here for convention in case i need later
    let p1Score = getConnectedSquares(p1StartSquare,board, board[p1StartSquare[0]][p1StartSquare[1]] ).length;
    let p2Score = getConnectedSquares(p2StartSquare,board,board[p2StartSquare[0]][p2StartSquare[1]]).length;

    //console.log("This is the score and the board after a move",-p2Score,board)

    return -p2Score;

}





function bestMoveAtDepth(board,maximise,evalFunction,depth,root=false){
    //console.log(maximise,prev)
    
    
    if(depth == 0){
        
        //console.log(board)
       // allBoards.push(prev);
        return evalFunction(board,maximise)
    }
    //other wise ig
    //player 2 is trying to minimise in this model
    if(maximise){ // player 1: (trying to maximise the score)
        //console.log("----------searching as p1 at depth:", searchDepth - depth,"------------------\n\n")
        var maxScore = -10000000; //set best score to very negtive number so any score will be better than it  
        var bestMovep1 = 0;
        for(let i =0;i<colours;i++){
            //let tboard= cloneBoard(board);
            if(isMoveValid(i,board)){
                outcome = bestMoveAtDepth(makeMoveP1(i,board),!maximise,eval_difference,depth-1)// get score of the best outcome if we do this move
                if(outcome>maxScore){//updating best score and best move
                   // console.log("bestMove currentyl",bestMove)
                    maxScore = outcome;
                    bestMovep1 = i;
                    //Alpha beta part
    

                }
            }


        }
        if(bestMove>colours){
            console.log("oh uh shit got wack")
        }

        if(root){//if root is true we return which move to do not its score

            return bestMove
        }
        //console.log("As p1 we found the max score at depth:",searchDepth- depth," to be ",maxScore)

        return maxScore;



    }else{
        //go through possible moves
        let minScore = 10000000;
        var bestMove = 0;
        // console.log("---------------------searching as p2 at depth:",searchDepth-  depth,"------------\n\n")

        for(let i =0;i<colours;i++){
            //let tboard= cloneBoard(board);
            if(isMoveValid(i,board)){

                //console.log(prev,board)

                outcome = bestMoveAtDepth(makeMoveP2(i,board),!maximise,evalFunction,depth-1)
                
                
                if(outcome<minScore){
                    minScore = outcome;
                    bestMove = i;
                    //alpha beta

    

                }
            }else{
                continue;
            }


        }
        if(bestMove>colours){
            console.log("oh uh shit got wack")
        }

        if(root){
            //console.log("As p2 we found the min score at depth:",searchDepth- depth," to be ",minScore," the move is",bestMove)

            return bestMove
        }
        //console.log("As p2 we found the min score at depth:",searchDepth- depth," to be ",minScore)
        return minScore;



    }

}


/*
Alphabeta pruning on our previous min-max to compare speeds :o




*/


function bestMoveAtDepth_alphabeta(board,maximise,evalFunction,depth,alpha,beta,root=false){
    

    if(depth == 0){

        return evalFunction(board,maximise)
    }
    //other wise ig
    //player 2 is trying to minimise in this model
    if(maximise){ // player 1: (trying to maximise the score)
        //console.log("----------searching as p1 at depth:", searchDepth - depth,"------------------\n\n")
        var maxScore = -10000000; //set best score to very negtive number so any score will be better than it  
        var bestMovep1 = 0;
        for(let i =0;i<colours;i++){
            //console.log("===================making this move as p1::",i,"================")
            //let tboard= cloneBoard(board);
            if(isMoveValid(i,board)){
                outcome = bestMoveAtDepth_alphabeta(makeMoveP1(i,board),!maximise,eval_difference,depth-1,alpha,beta)// get score of the best outcome if we do this move
                //console.log("Alpha is currently",alpha," beta is",beta,"  and the outcome we just got for ",i," is ",outcome)
                if(outcome>maxScore){//updating best score and best move
                   // console.log("bestMove currentyl",bestMove)
                    maxScore = outcome;
                    bestMovep1 = i;
                    //Alpha beta part
                    if(maxScore>beta){
                        break;
                    }
                    alpha = Math.max(alpha,maxScore);

                }
            }


        }

        if(root){//if root is true we return which move to do not its score

            return bestMove
        }
        //console.log("As p1 we found the max score at depth:",searchDepth- depth," to be ",maxScore)

        return maxScore;



    }else{
        //go through possible moves
        let minScore = 10000000;
        var bestMove = 0;

        for(let i =0;i<colours;i++){
            //let tboard= cloneBoard(board);
            if(isMoveValid(i,board)){

                //console.log(prev,board)
                outcome = bestMoveAtDepth_alphabeta(makeMoveP2(i,board),!maximise,evalFunction,depth-1,alpha,beta)
                //console.log("Alpha is currently",alpha," beta is",beta,"  and the outcome we just got for ",i," is ",outcome)

                if(outcome<minScore){
                    minScore = outcome;
                    bestMove = i;
                    //alpha beta
                    if(minScore<alpha){
                        break;
                    }
                    beta = Math.min(beta,minScore);
    

                }
            }else{
                continue;
            }


        }
        if(bestMove>colours){
            console.log("oh uh shit got wack")
        }

        if(root){
            //console.log("As p2 we found the min score at depth:",searchDepth- depth," to be ",minScore," the move is",bestMove)

            return bestMove
        }
       // console.log("As p2 we found the min score at depth:",searchDepth- depth," to be ",minScore)
        return minScore;



    }

}





mainBoard = generateBoard();
//mainBoard = templateBoard;
updateDropDown();
drawBoard(mainBoard);

