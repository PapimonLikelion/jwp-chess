import {blackTeamCurrentTurn, chessBoard, drawPieceImage, whiteTeamCurrentTurn} from "./initialize.js";
import {finishGame} from "./finishGame.js";
import {askUserToLogin} from "./userLogin.js";

const whiteTeamScoreUI = document.getElementById("whiteTeamScore");
const blackTeamScoreUI = document.getElementById("blackTeamScore");
export const player1 = document.getElementById("player1");
export const player2 = document.getElementById("player2");

let start = undefined;
let destination = undefined;

export function addChessBoardEvent() {
    chessBoard.addEventListener('click', function (e) {
        if (e.target && e.target.nodeName === "IMG") {
            if (start === undefined) {
                start = e.target;
                start.style = "background-color: yellow";
            } else {
                destination = e.target;
                console.log(start.parentNode.id + "-->" + destination.parentNode.id);
                //서버요청!
                serverMoveRequest(start.parentNode.id, destination.parentNode.id);
                start.style = "background-color: none";
                start = undefined;
                destination = undefined;
            }
        }

        if (e.target && e.target.nodeName === "DIV") {
            destination = e.target;
            if (start !== undefined) {
                console.log(start.parentNode.id + "-->" + destination.id);
                //서버요청!
                serverMoveRequest(start.parentNode.id, destination.id);
                start.style = "background-color: none";
                start = undefined;
                destination = undefined;
            }
        }
    })
}

function serverMoveRequest(startPoint, destPoint) {
    const moveRequest = {
        start: startPoint,
        destination: destPoint
    }

    const postOption = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(moveRequest)
    }

    document.getElementById("roomNumber");
    let roomNumber = document.getElementById("roomNumber").getAttribute("class");

    let moveUrl = "/games/" + String(roomNumber) + "/move";
    fetch(moveUrl, postOption)
        .then(response => {
            return checkFetchMove(response);
        })
        .then(data => {
            drawPieceImage(data);
            updateScoreUI(data.teamScore.white, data.teamScore.black);
            updateTurn(data.currentTurnTeam);
            checkIsPlaying(data);
        })
        .catch(error => {
        })
}

export function checkFetchMove(response) {
    if (!response.ok) {
        console.log(response.status)
        if (response.status === 401) {
            alert("로그인을 먼저 해주세요");
            askUserToLogin();
        } else {
            alert("움직일 수 없는 경로입니다.");
        }
        throw new Error(response.status);
    }
    return response.json();
}

export function updateScoreUI(whiteTeamScore, blackTeamScore) {
    whiteTeamScoreUI.innerText = "Score: " + whiteTeamScore;
    blackTeamScoreUI.innerText = "Score: " + blackTeamScore;
}

function updateTurn(currentTurnTeam) {
    if (currentTurnTeam === "black") {
        whiteTeamCurrentTurn.innerText = "";
        blackTeamCurrentTurn.innerText = "Current Turn";
    } else {
        whiteTeamCurrentTurn.innerText = "Current Turn";
        blackTeamCurrentTurn.innerText = "";
    }
}

export function checkIsPlaying(data) {
    if (!data.isPlaying) {
        alert(data.currentTurnTeam + "팀의 왕이 잡혔습니다! 게임이 종료됩니다!");
        player1.style.display = "none";
        player2.style.display = "none";
        chessBoard.style.display = "none";
        finishGame(data);
    }
    return data.isPlaying;
}
