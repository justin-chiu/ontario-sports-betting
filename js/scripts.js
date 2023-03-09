// STATIC DOM ELEMENTS

let quiz = document.querySelector(".quiz-container");
let nickname = quiz.querySelector("#nickname");
let chalContainer = quiz.querySelector(".chal-container");
let chalName = quiz.querySelectorAll(".chal-name");
let chalScore = quiz.querySelectorAll(".chal-score");
let resultsSection = quiz.querySelector("#s-results");
let resultsChal = quiz.querySelector(".results-chal");






// QUERY

let query = window.location.search; // ?chal=nickname&score=0&qset=1&ans=000000000000
console.log("query: " + query);

let queryObj = queryToObj(query);

if (queryObj) {

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





// STATUS

function startTimer(timeLeft) {

    clearInterval(timerInterval);

    // counters
    minutes = Math.floor(timeLeft / 60);
    seconds = timeLeft % 60;

    // inner text
    timerMinutes.innerText = minutes;
    timerSeconds.innerText = addZeroes(seconds); // adding leading zeroes

    timerInterval = setInterval(function () {

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
    label.innerText = ansChoice;

    let resultIcon = document.createElement("figure");
    resultIcon.classList.add("q-result-icon");

    let fieldset = document.createElement("fieldset");
    fieldset.classList.add("q-fieldset");
    fieldset.appendChild(input);
    fieldset.appendChild(label);
    fieldset.appendChild(resultIcon);

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
    qChoiceSet.classList.add("dflt-margin-child");
    qFieldsets.forEach(function (fieldset) {
        qChoiceSet.appendChild(fieldset);
    });

    // Question heading
    let qHeading = document.createElement("h2");
    qHeading.innerText = qObj.question;
    let qNumber = document.createElement("div");
    qNumber.classList.add("q-number");
    qNumber.classList.add("dflt-margin-self");
    qNumber.innerText = "Q" + (qIndex + 1);
    let qQuestion = document.createElement("div");
    qQuestion.classList.add("q-question");
    qQuestion.appendChild(qNumber);
    qQuestion.appendChild(qHeading);
    
    // Question content container
    let qContent = document.createElement("div");
    qContent.classList.add("section-content"); 
    qContent.appendChild(qQuestion);
    qContent.appendChild(qChoiceSet);  

    // Navigation controls
    let qControls = '<div class=section-controls><div class=controls-powerups><button class=powerup-boost>Boost</button></div><div class=controls-nav><button class="btn-nav btn-back">Back</button> <button class="btn-nav btn-next"><span class=btn-skip-text>Skip</span><span class=btn-check-text>Check Answer</span><span class=btn-next-text>Next</span></button></div></div>';
    
    // Section container
    let qSection = document.createElement("section");
    qSection.classList.add(qObj.type);
    qSection.id = qObj.slug;
    qSection.setAttribute("sectype", "question");
    qSection.setAttribute("qnum", (qIndex + 1));
    qSection.setAttribute("qindex", qIndex);
    qSection.setAttribute("timeleft", qObj.duration);
    qSection.setAttribute("boost", false);
    qSection.appendChild(qContent); // add question content
    qSection.innerHTML += qControls; // add standard controls

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

    if (result && result !== null) {

        let randomPhrase = Math.round(Math.random() * (ansPhrases.correct.length - 1));
        ansHeading = document.createElement("h3");
        ansHeading.innerText = ansPhrases.correct[randomPhrase];

        ansScore = document.createElement("div");
        ansScore.innerText = "+" + result.pointsValue;
    } else if (result == null) {
        let randomPhrase = Math.round(Math.random() * (ansPhrases.blank.length - 1));
        ansHeading = document.createElement("h3");
        ansHeading.innerText = ansPhrases.blank[randomPhrase];

    } else {
        let randomPhrase = Math.round(Math.random() * (ansPhrases.incorrect.length - 1));
        ansHeading = document.createElement("h3");
        ansHeading.innerText = ansPhrases.incorrect[randomPhrase];
    }

    let ansExplain = document.createElement("p");
    ansExplain.innerText = activeQObj.answerExplain;

    let ansLink;
    if (activeQObj.linkName && activeQObj.linkURL) {
        ansLink = document.createElement("a");
        ansLink.setAttribute("href", activeQObj.linkURL);
        ansLink.setAttribute("target", "_blank");
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
    let correct = false;

    let ansChoices = activeSection.querySelectorAll("input"); // get answerChoice inputs

    if (activeSection.classList.contains("radio")) { // if question is single-answer
        ansChoices.forEach(function (choice) {

            // set to true if the choice selected has ansindex that matches correct answer
            if (choice.checked) {
                if (choice.getAttribute("ansindex") == activeQObj.answerCorrect) {
                    correct = true;
                    let icon = choice.parentElement.querySelector(".q-result-icon");
                    icon.classList.add("correct-selected");
                } else {
                    let icon = choice.parentElement.querySelector(".q-result-icon");
                    icon.classList.add("incorrect");
                }
            } else if (choice.getAttribute("ansindex") == activeQObj.answerCorrect) {
                let icon = choice.parentElement.querySelector(".q-result-icon");
                icon.classList.add("correct-blank");
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

        // add result to questionData
        questionData[activeQIndex].userCorrect = true;

        console.log("answer correct");
    } else {

        // set longestStreak if current streak exceeds longestStreak
        if (yourStreak > longestStreak) {
            longestStreak = yourStreak;
        }

        yourStreak = 0; // reset streak

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
    let streakMultiply = 1.5;
    let boostMultiply = 1.5;

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




// -------------------
// START EVERYTHING...
// -------------------





// DATA

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
    {   sectype: "question-required",
        approval: function () {
            let sectionRadioChoices = activeSection.querySelectorAll(".q-choice");
            let choicePicked = false;
            sectionRadioChoices.forEach(function (choice) {
                if (choice.checked) {
                    choicePicked = true;
                }
            });

            if (!choicePicked) {
                alert("Choose an answer and we'll continue!");
            }

            return choicePicked;
        }
    },
    {   sectype: "question",
        approval: function () { // check if answer choice has been selected

            let choicePicked = checkPicked();
            let ansRevealed = activeSection.classList.contains("answer");

            if (!choicePicked && !ansRevealed) { // if no radio button on checkbox is checked
                
                // confirm that player wants to leave question blank
                if (confirm("Are you sure you want to leave this question blank?")) {
                    return true;
                } else {
                    return false; // do not approve navigation
                }

            } else { // if radio button or checkbox is checked
                if (!activeSection.classList.contains("answer")) { // if answer has not been revealed
                    checkAnswer(activeSection);
                    return false; // do not approve navigation
                } else { // if answer has been revealed
                    return true; // approve navigation forward
                }

            }
        }
    }
]

let questionData = [ // questions and answers
    /*
        slug: "",
        type: "radio",
        question: "",
        duration: 60,
        img: "",
        answers: [
            "",
            "",
            "",
            ""
        ],
        answerCorrect: 3,
        answerRandomize: true,
        answerExplain: "",
        linkName: "",
        linkURL: "",
        userCorrect: null,
        userScore: 0
    */
    {   slug: "problem-gambling",
        type: "radio",
        duration: 5,
        question: "What is problem gambling?",
        answers: [
            "Gambling activity that has a negative impact on the gambler’s life",
            "An addictive form of gambling involving solving complex puzzles",
            "The technical term for gambling addiction in the DSM-5",
            "Excessive gambling due to the gambler’s inability to control their urges"
        ],
        answerCorrect: 0,
        answerRandomize: true,
        answerExplain: "Test answer explanation",
        linkName: "Test link",
        linkURL: "https://google.ca"
    },
    {   slug: "gambling-beliefs",
        type: "radio",
        duration: 5,
        question: "Which of the following statements is true?",
        answers: [
            "Betting is a good way to earn extra cash if you are skilled and knowledgeable enough",
            "Near misses mean that you were close to winning",
            "If you lose money, you’ll eventually win it back if you keep betting",
            "None of the above are true"
        ],
        answerCorrect: 3,
        answerRandomize: false,
        answerExplain: "Test answer explanation"
    }
]

let ansPhrases = {
    correct: ["You got it!"],
    incorrect: ["Not quite…"],
    blank: ["The answer"]
}





// ADD DYNAMIC CONTENT

// add all question sections
questionData.forEach(function (qObj, qIndex) {
    addQSection(qObj, qIndex);
});





// DYNAMIC DOM ELEMENTS

let navButtons = quiz.querySelectorAll(".btn-nav");
let fieldsets = quiz.querySelectorAll("fieldset");
let radioChoices = quiz.querySelectorAll(".q-choice");
let boostButtons = quiz.querySelectorAll(".powerup-boost");






// ACTIVE OBJECTS

let activeSection = document.querySelector(".active");
let activeQObj = getQObj(activeSection);
let activeQIndex = activeSection.getAttribute("qindex");





// DYNAMIC ELEMENT EVENTS

// nav button events
navButtons.forEach(function (btn) {
    btn.onclick = tapNavButton;
});

// change to answer choice enables button
radioChoices.forEach(function (radio) {
    radio.onchange = enableButton;
});

// clicking fieldset changes radio button
fieldsets.forEach(function (set) {
    set.onclick = function (e) {
        set.querySelector("input").checked = true;
        enableButton(e);
    }
});

// boost button events
boostButtons.forEach(function (btn) {
    btn.onclick = toggleBoost;
});





// GLOBAL VARIABLES

let minutes; // minutes integer
let seconds; // seconds integer
let timerInterval; // interval function goes here

let yourScore = 0; // total score
let yourStreak = 0; // answer streak

let boosts = 1;
let correctCount = 0;
let longestStreak = 0;
let highestScoring = {
    qNum: null,
    value: 0
};





// MORE STATIC ELEMENTS

let numBoosts = quiz.querySelector(".num-boosts");
let timerMinutes = quiz.querySelector(".timer-minutes"); // minutes string
let timerSeconds = quiz.querySelector(".timer-seconds"); // seconds string
let yourName = quiz.querySelector(".your-name");
let statsTotalQs = quiz.querySelector(".stats-total-qs");
let nomLink = quiz.querySelector(".nominate-link");
let nomButton = quiz.querySelector(".nominate-button");

statsTotalQs.innerText = questionData.length;
numBoosts.innerText = boosts;





// STATIC ELEMENT EVENTS

nickname.onchange = function () { // set nickname on results page
    yourName.innerText = nickname.value;
    updateNomLink();
    console.log("nickname set to " + nickname.value);
}

// change to nickname field triggers button state
nickname.onkeyup = function (e) {
    let buttonStart = quiz.querySelector("#btn-nickname");
    if (nickname.value.length == 0) {
        buttonStart.classList.add("disabled");
    } else {
        buttonStart.classList.remove("disabled");
    }
}

nomLink.onclick = function () { // when nomLink field is clicked, select entire value
    nomLink.select();
};

nomButton.onclick = function () { // when "Copy Link" button clicked, copy nomLink.value
    nomLink.select();
    nomLink.setSelectionRange(0,99999);
    navigator.clipboard.writeText(nomLink.value);
}