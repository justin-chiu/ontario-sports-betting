// STATIC DOM ELEMENTS

let quiz = document.querySelector(".quiz-container");
let progress = document.querySelector(".progress");





// DATA

let sectionData = [ // section types and rules for navigation forward/backward from each type
    // sectype == type of section [start, end, instruction, question]
    // approval == function that determines whether conditions are met to navigate back/forward
    {   sectype: "text-input",
        approval: function () { // check if nickname field is filled
            if (nickname.value.length == 0) {
                alert("Choose a nickname and we'll get started!");
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

            let choicePicked = checkPicked(activeSection);

            if (!choicePicked) { // if no radio button on checkbox is checked
                
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
        type: "radio",
        question: "",
        slug: "",
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
        linkURL: ""
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

let totalQs = questionData.length; // number of questions in quiz






// UTILITY FUNCTIONS

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
    let sectionObj = sectionData.find(obj => { 
        // getting approval function to determine whether navigation back/forward is allowed
        return obj.sectype === activeSection.getAttribute("sectype");
    })

    if (e.currentTarget.classList.contains("btn-next")) { // button next

        approved = sectionObj.approval(); // running approval function to see whether navigation is allowed
        
        if (approved) {
            console.log(goNext()); // navigate forward
        }

    } else if (e.currentTarget.classList.contains("btn-back")) { // button back
        console.log(goPrevious()); // navigate backward
    }
}

function goNext() { // navigate forward

    // hide current section
    activeSection.classList.remove("active");

    // show next section
    let sectionNext = activeSection.nextElementSibling;
    sectionNext.classList.add("active");

    // update activeSection and activeQObj
    activeSection = sectionNext;
    activeQObj = getQObj();

    // update progress elements
    setProgress();

    return "next triggered";
}

function goPrevious() { // navigate backward

    // hide current section
    activeSection.classList.remove("active");

    // show previous section
    let sectionPrev = activeSection.previousElementSibling;
    sectionPrev.classList.add("active");

    // update activeSection and activeQObj
    activeSection = sectionPrev;
    activeQObj = getQObj();

    // update progress elements
    setProgress();

    return "back triggered";
}

function enableButton(e) { // removes "disabled" class, add "check-answer" class

    // enable button and change to check-answer
    let nextBtn = activeSection.querySelector(".btn-next");
    nextBtn.classList.remove("disabled");
    nextBtn.classList.add("check-answer");

    // show powerups
    let powerups = activeSection.querySelector(".controls-powerups");
    powerups.classList.add("show");
}

function checkAnswer() { // evaluates answer, presents answer explanation, and updates score

    clearInterval(timerInterval);

    let timeLeft = activeSection.getAttribute("timeleft");

    if (evalAnswer()) {
        updateScore(activeQObj.duration, timeLeft, yourStreak);
    }

    presentAnswer(activeSection);
}

function timeoutAnswer() { // evaluates answer, presents answer explanation, and updates score when timer times out

    clearInterval(timerInterval);

    let timeLeft = activeSection.getAttribute("timeleft");

    if (evalAnswer()) {
        updateScore(activeQObj.duration, timeLeft, yourStreak);
    }

    presentAnswer();
}





// STATUS

let minutes; // minutes integer
let seconds; // seconds integer

let timerInterval; // interval function goes here
let timerMinutes = progress.querySelector(".timer-minutes"); // minutes string
let timerSeconds = progress.querySelector(".timer-seconds"); // seconds string

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
            timeoutAnswer();
        }

        timerMinutes.innerText = minutes;
        timerSeconds.innerText = addZeroes(seconds);

    }, 1000);
}

function setProgress() { // sets progress bar and indicators

    if (activeSection.getAttribute("sectype") == "question") {

        // show progress elements
        progress.classList.remove("disabled");

        // set progress indicator
        let indicator = progress.querySelector(".progress-indicator");
        indicator.style.width = (100 * (activeSection.getAttribute("qnum") - 1) / totalQs) + "%";

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
    qFieldsets.forEach(function (fieldset) {
        qChoiceSet.appendChild(fieldset);
    });

    // Question heading
    let qHeading = document.createElement("h2");
    qHeading.innerText = qObj.question;
    let qNumber = document.createElement("div");
    qNumber.classList.add("q-number");
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
    qSection.setAttribute("sectype", "question");
    qSection.setAttribute("qnum", (qIndex + 1));
    qSection.setAttribute("timeleft", qObj.duration);
    qSection.classList.add(qObj.type);
    qSection.id = qObj.slug;
    qSection.appendChild(qContent); // add question content
    qSection.innerHTML += qControls; // add standard controls

    // Append everything
    let container = quiz.querySelector(".sections-container");
    container.appendChild(qSection);

}

function presentAnswer() {

    // create nodes and add answer explanation from questionData obj

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
    ansContainer.appendChild(ansExplain);
    if (ansLink !== undefined && ansLink !== null) {ansContainer.appendChild(ansLink);}

    let sectionContent = activeSection.querySelector(".section-content");
    sectionContent.appendChild(ansContainer);

    // change button from "check-answer" to "continue" class

    let nextBtn = activeSection.querySelector(".btn-next");
    nextBtn.classList.remove("check-answer");
    nextBtn.classList.add("continue");

    // add class "answer" to indicate that answer has been revealed

    activeSection.classList.add("answer");
}





// SCORING

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
        console.log("answer correct");
    } else {
        console.log("answer incorrect");
    }

    return correct;
}

let yourScore = 0; // total score
let yourStreak = 0; // answer streak

function updateScore(timeGiven, timeLeft, streak = 0, attempts = 1, boost = false) { // answer scoring scheme

    let pointsValue = 200; // minimum points if player answers correct
    let timePoints = 200; // points amount that changes based on how fast player answers
    let streakMultiply = 1.5;
    let boostMultiply = 1.5;

    if (attempts <= 1) {
        pointsValue += timeLeft/timeGiven * timePoints; // subtract points based on time taken to answer question
        pointsValue *= Math.pow(streakMultiply, streak); // multiplies for every consecutive correct answer
        if (boost) {pointsValue *= boostMultiply;} // boost

    } else {
        pointsValue /= attempts; // divided by number of attempts taken to get question correct
    }

    pointsValue = Math.round(pointsValue); // round

    console.log("old score: " + yourScore);
    console.log("points added: " + pointsValue);

    yourScore += pointsValue; // add to overall score

    console.log("current score: " + yourScore);

    let totalScore = progress.querySelector(".total-score");
    totalScore.innerText = yourScore; 
}





// RUNNING...

// add all question sections
questionData.forEach(function (qObj, qIndex) {
    addQSection(qObj, qIndex);
});

let navButtons = quiz.querySelectorAll(".btn-nav");
let nickname = quiz.querySelector("#nickname");
let fieldsets = quiz.querySelectorAll("fieldset");
let radioChoices = quiz.querySelectorAll(".q-choice");

// nav button events
navButtons.forEach(function (btn) {
    btn.onclick = tapNavButton;
});

// change to nickname field triggers button state
nickname.onkeyup = function (e) {
    let buttonStart = quiz.querySelector("#btn-nickname");
    if (nickname.value.length == 0) {
        buttonStart.classList.add("disabled");
    } else {
        buttonStart.classList.remove("disabled");
    }
}

// change to answer choice enables button
radioChoices.forEach(function (radio) {
    radio.onchange = enableButton;
})

// clicking fieldset changes radio button
fieldsets.forEach(function (set) {
    set.onclick = function (e) {
        set.querySelector("input").checked = true;
        enableButton(e);
    }
})

let activeSection = document.querySelector(".active");
let activeQObj = getQObj(activeSection);
