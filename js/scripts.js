// STATIC DOM ELEMENTS

let quiz = document.querySelector(".quiz-container");
let nickname = quiz.querySelector("#nickname");
let chalContainer = quiz.querySelector(".chal-container");
let chalIcon = quiz.querySelector(".chal-icon");
let chalName = quiz.querySelectorAll(".chal-name");
let chalScore = quiz.querySelectorAll(".chal-score");
let resultsSection = quiz.querySelector("#s-results");
let resultsChal = quiz.querySelector(".results-chal");






// URL QUERY

let query = window.location.search; // ?chal=nickname&score=0&qset=1&ans=000000000000
console.log("query: " + query);

let queryObj = queryToObj(query);

if (queryObj) {

    chalIcon.innerText = queryObj.chal[0];

    chalName.forEach(function (element) {
        element.innerText = queryObj.chal;
    });
        
    chalScore.forEach(function (element) {
        element.innerText = queryObj.score;
    });

} else {
    chalContainer.remove();
    resultsChal.remove();
}




// HEIGHT

let windowInitHeight = window.innerHeight;

function setQuizHeight () { // a fix for mobile browser viewport height issue
    quiz.style.height = Math.min(windowInitHeight, 1000) + "px";

    if (windowInitHeight == document.documentElement.clientHeight) {
        quiz.parentElement.style.alignItems = "center";
    } else {
        quiz.parentElement.style.alignItems = "start";
    }
}

setQuizHeight();





// ASYNC START QUIZ

function startQuiz(qData) {

    questionData = qData;

    // ADD DYNAMIC CONTENT

    // add all question sections
    questionData.forEach(function (qObj, qIndex) {
        addQSection(qObj, qIndex);
    });

    // DYNAMIC DOM ELEMENTS

    let navButtons = quiz.querySelectorAll(".btn-nav");
    let radioFieldsets = quiz.querySelectorAll("fieldset.radio");
    let checkboxFieldsets = quiz.querySelectorAll("fieldset.checkbox");
    let inputChoices = quiz.querySelectorAll(".q-choice");
    let boostButtons = quiz.querySelectorAll(".powerup-boost");

    // ACTIVE OBJECTS

    activeSection = document.querySelector(".active");
    activeQObj = getQObj(activeSection);
    activeQIndex = activeSection.getAttribute("qindex");
    
    // CONTENT

    let statsTotalQs = quiz.querySelector(".stats-total-qs");
    statsTotalQs.innerText = questionData.length;

    // DYNAMIC ELEMENT EVENTS

    // nav button events
    navButtons.forEach(function (btn) {
        btn.onclick = tapNavButton;
    });

    // change to answer choice enables button, shades fieldset
    inputChoices.forEach(function (radio) {
        radio.onchange = enableButton;
        radio.onclick = function (e) {
            fieldsetShade(e.currentTarget, e.currentTarget.parentElement); // change shading
        };
    });

    // clicking fieldset changes radio button
    radioFieldsets.forEach(function (set) {
        set.onclick = function (e) {
            e.currentTarget.querySelector("input").checked = true; // set input
            fieldsetShade(e.currentTarget.querySelector("input"), e.currentTarget); // change shading
            enableButton(e);
        }
    });

    // clicking fieldset changes checkbox
    checkboxFieldsets.forEach(function (set) {
        set.onclick = function (e) {
            if (e.target.tagName !== "INPUT") {
                let thisInput = e.currentTarget.querySelector("input");
                thisInput.checked = !thisInput.checked;
                fieldsetShade(thisInput, e.currentTarget);
            }
        }
    });

    // boost button events
    boostButtons.forEach(function (btn) {
        btn.onclick = toggleBoost;
    });
}






// UTILITY

function queryToObj(query) { // convert URL query portion into object
    
    if (query.length > 0) {
        query = query.replace("?", "");
        let queryArray = query.split("&");
        let tempObj = new Object();
    
        queryArray.forEach(function (value) {
            let valArray = value.split("=");
            tempObj[valArray[0]] = decodeURIComponent(valArray[1]);
        });
    
        console.log(tempObj);
        return tempObj;

    } else {
        return false;
    }
}

function shuffleArray(array) { // shuffle items in array

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function getQObj(sectionTgt = activeSection) { // gets questionData object based on section DOM node
    let qObj = questionData.find(obj => { // find questionData obj for the section
        return obj.slug === sectionTgt.id; // id is questionData[#].slug
    });

    return qObj;
}

function addZeroes(input, digits = 2) { // add leading zeroes to number

    let zeroes = digits - input.toString().length;
    let output = input.toString();

    for (let i = 0; i < zeroes; i++) {
        output = "0" + output;
    }

    return output;

}

function checkPicked() { // check if answer has been selected

    let sectionRadioChoices = activeSection.querySelectorAll(".q-choice");
    let choicePicked = false;
    sectionRadioChoices.forEach(function (choice) {
        if (choice.checked) {
            choicePicked = true; // if answer selected, approve navigation to next section
        }
    });

    return choicePicked;

}

function splitTime(time) { // time in total seconds, returns object
    return {
        "min": Math.floor(time / 60), 
        "sec": time % 60, 
        "secAddZeroes": addZeroes(time % 60)
    };
}




// NAVIGATION

function tapNavButton(e) { // whenever the navigation buttons are tapped

    console.log("button tapped");

    let approved; // value == true if navigation back/forward is allowed
    let sectionObj = sectionApprovals.find(obj => { 
        // getting approval function to determine whether navigation back/forward is allowed
        return obj.sectype === activeSection.getAttribute("sectype");
    })

    if (e.currentTarget.classList.contains("btn-next")) { // button next

        approved = sectionObj.approval(); // running approval function to see whether navigation is allowed
        
        if (approved) {
            console.log(goNext()); // navigate forward
        } else {
            console.log("navigation not allowed");
        }

    } else if (e.currentTarget.classList.contains("btn-back")) { // button back
        console.log(goPrevious()); // navigate backward
    }
}

function goNext() { // navigate forward

    // hide current section
    activeSection.classList.remove("active");
    clearTimeout(timerInterval);

    // show next section
    let sectionNext = activeSection.nextElementSibling;
    sectionNext.classList.add("active");

    // update activeSection and activeQObj
    activeSection = sectionNext;
    activeQObj = getQObj();
    activeQIndex = activeSection.getAttribute("qindex");

    // update progress elements
    setProgress();

    return "navigated to next section";
}

function goPrevious() { // navigate backward

    // hide current section
    activeSection.classList.remove("active");
    clearTimeout(timerInterval);

    // show previous section
    let sectionPrev = activeSection.previousElementSibling;
    sectionPrev.classList.add("active");

    // update activeSection and activeQObj
    activeSection = sectionPrev;
    activeQObj = getQObj();
    activeQIndex = activeSection.getAttribute("qindex");

    // update progress elements
    setProgress();

    return "navigated to previous section";
}

function enableButton(e) { // removes "disabled" class, add "check-answer" class

    // enable button and change to check-answer
    let nextBtn = activeSection.querySelector(".btn-next");
    nextBtn.classList.remove("disabled");
    nextBtn.classList.add("check-answer");

    // show powerups
    if (boosts > 0) {
        let powerups = activeSection.querySelector(".controls-powerups");
        powerups.classList.add("show");
    }
}

function toggleBoost() { // turns boost on and off

    if (activeSection.getAttribute("boost") == "true") {
        activeSection.setAttribute("boost", false);
    } else {
        activeSection.setAttribute("boost", true);
    }
}

function fieldsetShade(input, fieldset) {

    if (input.getAttribute("type") == "radio") {
        if (input.checked) {
            let shaded = fieldset.parentElement.querySelectorAll(".checked");
            shaded.forEach(function (set) {
                set.classList.remove("checked");
            });
            fieldset.classList.add("checked");
        } else {
            fieldset.classList.remove("checked");
        }
    } else if (input.getAttribute("type") == "checkbox") {
        if (input.checked) {
            fieldset.classList.add("checked");
        } else {
            fieldset.classList.remove("checked");
        }
    }
}



// STATUS

function startTimer(timeLeft) {

    clearInterval(timerInterval);

    // counters
    minutes = Math.floor(timeLeft / 60);
    seconds = timeLeft % 60;

    let timerMinutes = activeSection.querySelector(".timer-minutes");
    let timerSeconds = activeSection.querySelector(".timer-seconds");

    // inner text
    timerMinutes.innerText = minutes;
    timerSeconds.innerText = addZeroes(seconds); // adding leading zeroes

    timerInterval = setInterval(function () {

        let timerMinutes = activeSection.querySelector(".timer-minutes");
        let timerSeconds = activeSection.querySelector(".timer-seconds");

        // m:ss display

        if (seconds > 0 && seconds <= 59) {
            seconds --;
        } else if (seconds == 0) {
            if (minutes > 0) {
                minutes --;
                seconds = 59;
            }
        }

        // counter

        let timeLeft = activeSection.getAttribute("timeleft");

        if (timeLeft > 0) {
            activeSection.setAttribute("timeleft", (timeLeft - 1));
        } else {
            checkAnswer();
        }

        timerMinutes.innerText = minutes;
        timerSeconds.innerText = addZeroes(seconds);

    }, 1000);
}

function setProgress() { // sets progress bar and indicators

    let progress = document.querySelector(".progress");

    if (activeSection.getAttribute("sectype") == "question") {

        // set light/darkmode
        if (activeSection.getAttribute("darkmode") || activeQObj.category == "sports-trivia") {
            progress.classList.remove("light-mode");
            progress.classList.add("dark-mode");
        } else {
            progress.classList.remove("dark-mode");
            progress.classList.add("light-mode");
        }

        // show progress elements
        progress.classList.remove("disabled");

        // set progress indicator
        let indicator = progress.querySelector(".progress-indicator");
        indicator.style.width = (100 * (activeSection.getAttribute("qindex")) / questionData.length) + "%";

        // start timer
        
        let timeLeft = activeSection.getAttribute("timeleft");

        if (!activeSection.classList.contains("answer")) {
            startTimer(timeLeft);
        }

    } else {
        // hide progress elements
        progress.classList.add("disabled");
        progress.classList.remove("light-mode");
        progress.classList.add("dark-mode");
    }
}




// CONTENT

function createFieldset(type, slug, ansChoice, ansIndex) {
    
    let input = document.createElement("input");
    input.classList.add("q-choice");
    input.setAttribute("type", type);
    input.setAttribute("name", slug);
    input.setAttribute("ansindex", ansIndex);

    let label = document.createElement("label");
    label.classList.add("text-regular");
    label.classList.add("text-size-medium");
    label.innerText = ansChoice;

    // let resultIcon = document.createElement("figure");
    // resultIcon.classList.add("q-result-icon");

    let resultIcon = '<figure class="q-result-icon"><svg class="vector-incorrect" width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9142 1.99991L10.5 0.585693L6.00003 5.08569L1.50003 0.585693L0.0858154 1.99991L4.58582 6.49991L0.0858154 10.9999L1.50003 12.4141L6.00003 7.91412L10.5 12.4141L11.9142 10.9999L7.41424 6.49991L11.9142 1.99991Z"/></svg><svg class="vector-correct" width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.4142 1.49991L5.75003 11.1641L0.585815 5.99991L2.00003 4.58569L5.75003 8.33569L14 0.0856934L15.4142 1.49991Z"/></svg></figure>';

    let fieldset = document.createElement("fieldset");
    fieldset.classList.add("q-fieldset");
    fieldset.classList.add(type);
    fieldset.appendChild(input);
    fieldset.appendChild(label);
    fieldset.innerHTML += resultIcon;

    return fieldset;
}

function addQSection(qObj, qIndex) { // add question section

    // Answer choices
    let qFieldsets = new Array();
    qObj.answers.forEach(function (ansChoice, ansIndex) {
        let fieldset = createFieldset(qObj.type, qObj.slug, ansChoice, ansIndex);
        qFieldsets.push(fieldset);
    });

    // Randomize answers
    if (qObj.answerRandomize) {
        qFieldsets = shuffleArray(qFieldsets);
    }

    // Answer choice container
    let qChoiceSet = document.createElement("div");
    qChoiceSet.classList.add("q-choice-set");
    qChoiceSet.classList.add("dflt-margin-self");
    qFieldsets.forEach(function (fieldset) {
        qChoiceSet.appendChild(fieldset);
    });

    // Question heading
    let qHeading = document.createElement("h2");
    qHeading.innerText = qObj.question;

    if (qObj.type == "checkbox") {
        qHeading.classList.add("dflt-margin-self-small");
    }

    // Select all that apply
    let qAllApply = '<p class="text-regular text-size-medium">Select all that apply.</p>';
    
    // Question number
    let qNumber = document.createElement("div");
    qNumber.classList.add("q-number");
    qNumber.classList.add("q-flag-box");
    qNumber.classList.add("dflt-margin-self");
    qNumber.classList.add("text-bold");
    qNumber.classList.add("text-size-small");
    qNumber.innerText = "Q" + (qIndex + 1);

    // Timer
    let qTimer = document.createElement("div");
    qTimer.classList.add("q-timer");
    qTimer.classList.add("q-flag-box");
    qTimer.classList.add("text-size-small");
    qTimer.classList.add("text-italic");

    let timerObj = splitTime(qObj.duration);

    qTimer.innerHTML = '<span class="timer-minutes">' + timerObj.min + '</span>';
    qTimer.innerHTML += ':' + '<span class="timer-seconds">' + timerObj.secAddZeroes + '</span>';

    // Question flag
    let qFlag = document.createElement("div");
    qFlag.classList.add("q-flag");
    qFlag.appendChild(qNumber);
    qFlag.appendChild(qTimer);

    let qQuestion = document.createElement("div");
    qQuestion.classList.add("q-question");
    qQuestion.appendChild(qFlag);
    qQuestion.appendChild(qHeading);
    
    if (qObj.type == "checkbox") { // Note to select all that apply
        qQuestion.innerHTML += qAllApply;
    }
    
    // Question content container
    let qContent = document.createElement("div");
    qContent.classList.add("section-content");
    qContent.appendChild(qQuestion);
    qContent.appendChild(qChoiceSet);  

    // Navigation controls
    let qControls = '<div class="section-controls"><div class=controls-powerups><button class=powerup-boost>Boost</button></div><div class=controls-nav><button class="btn-nav btn-back">Back</button> <button class="btn-nav btn-next"><span class=btn-skip-text>Skip</span><span class=btn-check-text>Check Answer</span><span class=btn-next-text>Next</span></button></div></div>';
    

    // Section container
    let qSection = document.createElement("section");
    qSection.classList.add(qObj.type);
    qSection.classList.add(qObj.category);
    qSection.id = qObj.slug;
    qSection.setAttribute("sectype", "question");
    qSection.setAttribute("qnum", (qIndex + 1));
    qSection.setAttribute("qindex", qIndex);
    qSection.setAttribute("timeleft", qObj.duration);
    qSection.setAttribute("boost", false);
    qSection.appendChild(qContent); // add question content
    qSection.innerHTML += qControls; // add standard controls

    // For checkbox questions
    if (qSection.classList.contains("checkbox")) {
        qSection.querySelector(".btn-next").classList.add("check-answer");
    }

    // Append everything
    let container = quiz.querySelector(".sections-container");
    // container.appendChild(qSection);
    container.insertBefore(qSection, resultsSection);

}

function presentAnswer(result) { // show answer explanation

    // create nodes and add answer explanation from questionData obj

    let ansHeading;
    let ansScore;

    // heading logic

    ansHeading = document.createElement("h3");
    ansHeading.classList.add("q-answer-heading");

    if (result && result !== null) {

        let randomPhrase = Math.round(Math.random() * (ansPhrases.correct.length - 1));
        ansHeading.innerText = ansPhrases.correct[randomPhrase];

        ansScore = document.createElement("span");
        ansScore.classList.add("text-regular");
        ansScore.classList.add("text-size-small");
        ansScore.innerText = "+" + result.pointsValue;
    } else if (result == null) {
        let randomPhrase = Math.round(Math.random() * (ansPhrases.blank.length - 1));
        ansHeading.innerText = ansPhrases.blank[randomPhrase];

    } else {
        let randomPhrase = Math.round(Math.random() * (ansPhrases.incorrect.length - 1));
        ansHeading.innerText = ansPhrases.incorrect[randomPhrase];
    }

    let ansExplain = document.createElement("p");
    ansExplain.classList.add("text-regular");
    ansExplain.classList.add("text-size-medium");
    ansExplain.innerText = activeQObj.answerExplain;

    let ansLink;
    if (activeQObj.linkName && activeQObj.linkURL) {
        ansLink = document.createElement("a");
        ansLink.setAttribute("href", activeQObj.linkURL);
        ansLink.setAttribute("target", "_blank");
        ansLink.classList.add("text-size-medium");
        ansLink.innerText = activeQObj.linkName;
    }

    let ansContainer = document.createElement("div");
    ansContainer.classList.add("q-answer");
    ansContainer.classList.add("dflt-margin-child");
    if (ansHeading !== undefined) {ansContainer.appendChild(ansHeading)}
    if (ansScore !== undefined) {ansContainer.appendChild(ansScore)}
    ansContainer.appendChild(ansExplain);
    if (ansLink !== undefined) {ansContainer.appendChild(ansLink);}

    let sectionContent = activeSection.querySelector(".section-content");
    sectionContent.appendChild(ansContainer);

    // change button from "check-answer" to "continue" class

    let nextBtn = activeSection.querySelector(".btn-next");
    nextBtn.classList.remove("check-answer");
    nextBtn.classList.add("continue");

    // add class "answer" to indicate that answer has been revealed

    activeSection.classList.add("answer");
}

function updateNomLink(allParams = [ // [paramName, paramValue]
    ["chal", nickname.value],
    ["score", yourScore],
    ["qset", 1]
]) {
    
    allParams.forEach(function (param , index) { // encoding and formatting
        param[1] = encodeURIComponent(param[1]); // encoding param value
        allParams[index] = param.join("=");
    });

    allParams = allParams.join("&");

    let link = window.location.href.replace(window.location.search, "");
    link += "?" + allParams;

    nomLink.value = link;

    return link;
}



// SCORING

function checkAnswer() { // evaluates answer, presents answer explanation, and updates score

    clearInterval(timerInterval);

    let powerups = activeSection.querySelector(".controls-powerups");
    powerups.classList.remove("show");

    let timeLeft = activeSection.getAttribute("timeleft");

    if (checkPicked()) { // if any answer choice was selected
        if (evalAnswer()) { // if answer is correct 
            presentAnswer(updateScore(activeQObj.duration, timeLeft, yourStreak, activeSection.getAttribute("boost")));
        } else { // if answer is incorrect
            presentAnswer(false);
        }
    } else { // if answer is blank
        evalAnswer();
        presentAnswer(null);        
    }

    updateScrStats();
    updateNomLink();
}

function evalAnswer () { // returns true if answer is correct

    let correct;

    let ansChoices = activeSection.querySelectorAll("input"); // get answerChoice inputs

    if (activeSection.classList.contains("radio")) { // if question is single-answer

        correct = false;

        ansChoices.forEach(function (choice) {

            // set to true if the choice selected has ansindex that matches correct answer
            if (choice.checked) {

                let icon = choice.parentElement.querySelector(".q-result-icon");

                if (choice.getAttribute("ansindex") == activeQObj.answerCorrect) {
                    correct = true;
                    icon.classList.add("correct-selected");
                } else {
                    icon.classList.add("incorrect");
                }

            } else if (choice.getAttribute("ansindex") == activeQObj.answerCorrect) {

                let icon = choice.parentElement.querySelector(".q-result-icon");
                icon.classList.add("correct-blank");
            }
        });
    } else if (activeSection.classList.contains("checkbox")) {

        correct = true;

        ansChoices.forEach(function (choice) {

            let ansIndex = parseInt(choice.getAttribute("ansindex"));
            let icon = choice.parentElement.querySelector(".q-result-icon");

            if (choice.checked !== activeQObj.answerCorrect[ansIndex]) {
                correct = false;

                if (choice.checked) {
                    icon.classList.add("incorrect");
                } else {
                    icon.classList.add("correct-blank");
                }

            } else if (choice.checked) {
                icon.classList.add("correct-selected");
            }
        });
    }

    if (correct) {

        yourStreak++; // add to streak
        correctCount++; // add to count of correct answers

        // set longestStreak if current streak exceeds longestStreak
        if (yourStreak > longestStreak) {
            longestStreak = yourStreak;
        }

        // set streak indicator
        numStreak.innerText = yourStreak;

        // add result to questionData
        questionData[activeQIndex].userCorrect = true;

        console.log("answer correct");
    } else {

        // set longestStreak if current streak exceeds longestStreak
        if (yourStreak > longestStreak) {
            longestStreak = yourStreak;
        }

        yourStreak = 0; // reset streak

        numStreak.innerText = yourStreak;

        // add results to questionData
        questionData[activeQIndex].userCorrect = false;
        questionData[activeQIndex].userScore = 0;

        console.log("answer incorrect");
    }

    return correct;
}

function updateScore(timeGiven, timeLeft, streak = 0, boost = false) { // answer scoring scheme

    let oldScore = yourScore; // score before update

    let basePoints = 200; // minimum points if player answers correct
    let timePoints = 200; // points amount that changes based on how fast player answers
    let streakMultiply = 1.2;
    let boostMultiply = 1.2;

    let pointsValue = basePoints; // give minimum amount
    let timeBonus = timeLeft / timeGiven * timePoints; // points earned for answering quickly
    pointsValue += timeBonus; // add points based on time taken to answer question

    let streakBonus = pointsValue * Math.pow(streakMultiply, streak - 1) - pointsValue; // multiplies for every consecutive correct answer
    pointsValue += streakBonus; 

    let boostBonus = 0; // boost
    if (eval(boost)) {
        
        boostBonus = pointsValue * boostMultiply - pointsValue; // calculate boost
        pointsValue += boostBonus; // add to pointsValue

        boosts--; // subtract used boost
        numBoosts.innerText = boosts; // update boost indicator
    }
    pointsValue = Math.round(pointsValue); // round

    // add to questionData
    questionData[activeQIndex].userScore = pointsValue;

    // add to overall score
    yourScore += pointsValue;

    // if score exceeds highest scoring question, update highestScoring object
    if (pointsValue > highestScoring.value) {
        highestScoring.qNum = activeSection.getAttribute("qnum");
        highestScoring.value = pointsValue;
    }

    // update score indicator
    let totalScore = quiz.querySelectorAll(".total-score");
    totalScore.forEach(function (score) {
        score.innerText = yourScore;
    });

    let pointsCalc = {
        "oldScore": oldScore,
        "yourScore": yourScore,
        "pointsValue": pointsValue,
        "basePoints": basePoints,
        "timeBonus": timeBonus,
        "streakBonus": streakBonus,
        "boostBonus": boostBonus
    };

    console.log(pointsCalc);

    return pointsCalc;
}

function updateScrStats() {

    let statsCorrect = quiz.querySelector(".stats-correct");
    statsCorrect.innerText = correctCount;

    let statsStreak = quiz.querySelector(".stats-streak");
    statsStreak.innerText = longestStreak;

    if (highestScoring.qNum !== null) {
        let statsHSQNum = quiz.querySelector(".stats-hs-qnum");
        statsHSQNum.innerText = "Q" + highestScoring.qNum;
        let statsHSValue = quiz.querySelector(".stats-hs-value");
        statsHSValue.innerText = "(+" + highestScoring.value + ")";
    }

}






// GLOBAL VARIABLES

let minutes; // minutes integer
let seconds; // seconds integer
let timerInterval; // interval function goes here

let yourScore = 0; // total score
let yourStreak = 0; // answer streak

let boosts = 3;
let correctCount = 0;
let longestStreak = 0;
let highestScoring = {
    qNum: null,
    value: 0
};

let questionData, activeSection, activeQObj, activeQIndex;

let sectionApprovals = [ // section types and rules for navigation forward/backward from each type
    // sectype == type of section [start, end, instruction, question]
    // approval == function that determines whether conditions are met to navigate back/forward
    {   sectype: "text-input",
        approval: function () { // check if nickname field is filled
            if (nickname.value.length == 0) {
                alert("Choose a nickname and we'll get started!");
                return false;
            } else if (nickname.value == queryObj.chal) {
                alert("Please choose a different nickname.")
                return false;
            } else {
                return true;
            }
        },
    },
    {   sectype: "walkthrough",
        approval: function () {
            return true;
        }
    },
    {   sectype: "question",
        approval: function () { // check if answer choice has been selected

            let choicePicked = checkPicked();
            let ansRevealed = activeSection.classList.contains("answer");
            let radio = activeSection.classList.contains("radio");
            let checkbox = activeSection.classList.contains("checkbox");

            if (!choicePicked && !ansRevealed) { // if no radio button on checkbox is checked

                if (radio) {return true;} // if question is radio
                else if (checkbox) {checkAnswer(); return false;} // if question is checkbox

            } else { // if radio button or checkbox is checked

                if (!ansRevealed) { // if answer has not been revealed
                    checkAnswer(activeSection);
                    return false; // do not approve navigation
                } else { // if answer has been revealed
                    return true; // approve navigation forward
                }
            }
        }
    }
]

let ansPhrases = {
    correct: ["You got it!", "Bullseye!", "Score!"],
    incorrect: ["Not quite…"],
    blank: ["The answer"]
}






// FETCH QUESTION DATA

let dataPath = "data/questions.json";
let dataURL;

if (window.location.hostname.indexOf("github.io") !== -1) {
    dataURL = window.location.protocol + "//" + window.location.hostname + window.location.pathname + dataPath;

} else {
    dataURL = "../" + dataPath;
}

fetch(dataURL)
    .then((response) => response.json())
    .then((data) => startQuiz(data));






// MORE STATIC ELEMENTS

let numBoosts = quiz.querySelector(".num-boosts"); // # of times player can boost pointsValue
// let timerMinutes = quiz.querySelector(".timer-minutes"); // minutes string
// let timerSeconds = quiz.querySelector(".timer-seconds"); // seconds string
let numStreak = quiz.querySelector(".num-streak");
let buttonSetNickname = quiz.querySelector("#btn-nickname-inline");
let yourName = quiz.querySelector(".your-name");
let nomLink = quiz.querySelector(".nominate-link");
let nomButton = quiz.querySelector(".nominate-button");

numBoosts.innerText = boosts;

// STATIC ELEMENT EVENTS

nickname.onchange = function () { // set nickname on results page
    // yourName.innerText = nickname.value;
    updateNomLink();
    console.log("nickname set to " + nickname.value);
}

// change to nickname field triggers button state
nickname.onkeyup = function (e) {
    let buttonStart = quiz.querySelector("#btn-nickname");
    if (nickname.value.length == 0) {
        buttonStart.classList.add("disabled");
        buttonSetNickname.classList.add("hide");

    } else {
        buttonStart.classList.remove("disabled");
        buttonSetNickname.classList.remove("hide");
    }

    if (e.keyCode == 13 || e.which == 13) {
        let btnNext = activeSection.querySelector(".btn-next");
        btnNext.click();
    }
}

nomLink.onclick = function () { // when nomLink field is clicked, select entire value
    nomLink.select();
}

nomButton.onclick = function () { // when "Copy Link" button clicked, copy nomLink.value
    nomLink.select();
    nomLink.setSelectionRange(0,99999);
    navigator.clipboard.writeText(nomLink.value);
}

buttonSetNickname.onclick = function () {

}

window.onresize = function() {
    setQuizHeight();
}