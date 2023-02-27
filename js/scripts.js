let quiz = document.querySelector(".quiz-container");

let sectionData = [ // section types and rules for navigation forward/backward from each type
    // sectype == type of section [start, end, instruction, question]
    // approval == function that determines whether conditions are met to navigate back/forward
    {
        sectype: "text-input",
        approval: function () { // check if nickname field is filled
            if (nickname.value.length == 0) {
                alert("Choose a nickname and we'll get started!");
                return false;
            } else {
                return true;
            }
        },
    },
    {
        sectype: "walkthrough",
        approval: function () {
            return true;
        }
    },
    {
        sectype: "question-required",
        approval: function (sectionTgt) {
            let sectionRadioChoices = sectionTgt.querySelectorAll(".q-choice");
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
    {
        sectype: "question",
        approval: function (sectionTgt) { // check if answer choice has been selected
            let sectionRadioChoices = sectionTgt.querySelectorAll(".q-choice");
            let choicePicked = false;
            sectionRadioChoices.forEach(function (choice) {
                if (choice.checked) {
                    choicePicked = true;
                }
            });

            if (!choicePicked) {
                if (confirm("Are you sure you want to leave this question blank?")) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return choicePicked;
            }
        }
    }
]

let questionData = [
    /*
        type: "radio",
        question: "",
        slug: "",
        answers: [
            "",
            "",
            "",
            ""
        ],
        answerCorrect: 3,
        answerRandomize: true,
        answerExplain: "",
        buttonName: "",
        buttonLink: ""
    */
    {
        type: "radio",
        question: "What is problem gambling?",
        slug: "problem-gambling",
        answers: [
            "Gambling activity that has a negative impact on the gambler’s life",
            "An addictive form of gambling involving solving complex puzzles",
            "The technical term for gambling addiction in the DSM-5",
            "Excessive gambling due to the gambler’s inability to control their urges"
        ],
        answerCorrect: 0,
        answerRandomize: true,
        answerExplain: "Test answer explanation"
    },
    {
        type: "radio",
        question: "Which of the following statements is true?",
        slug: "gambling-beliefs",
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


function goNext(sectionTgt) { // navigate forward

    // hide current section
    sectionTgt.classList.remove("active");

    // show next section
    let sectionNext = sectionTgt.nextElementSibling;
    sectionNext.classList.add("active");

    console.log("next triggered");
}

function goPrevious(sectionTgt) { // navigate backward

    // hide current section
    sectionTgt.classList.remove("active");

    // show previous section
    let sectionPrev = sectionTgt.previousElementSibling;
    sectionPrev.classList.add("active");

    console.log("back triggered");
}

function tapNavButton(e) { // whenever the navigation buttons are tapped

    console.log("button tapped");

    let approved; // value == true if navigation back/forward is allowed
    let sectionTgt = e.currentTarget.closest("section"); // button's parent section element
    let sectionObj = sectionData.find(obj => { 
        // getting approval function to determine whether navigation back/forward is allowed
        return obj.sectype === sectionTgt.getAttribute("sectype");
    })

    if (e.currentTarget.classList.contains("btn-next")) {

        approved = sectionObj.approval(sectionTgt); // running approval function to see whether navigation is allowed

        if (approved) {
            console.log(goNext(sectionTgt)); // navigate forward
        }

    } else if (e.currentTarget.classList.contains("btn-back")) {
        console.log(goPrevious(sectionTgt)); // navigate backward
    }
}

function enableButton(e) { // removes "disabled" class, add "check-answer" class
    let sectionTgt = e.currentTarget.closest("section");
    let sectionBtn = sectionTgt.querySelector(".btn-next");
    sectionBtn.classList.remove("disabled");
    sectionBtn.classList.add("check-answer");
}

function createFieldset(type, slug, ansChoice, ansIndex) {
    
    let input = document.createElement("input");
    input.classList.add("q-choice");
    input.setAttribute("type", type);
    input.setAttribute("name", slug);
    input.setAttribute("ansindex", ansIndex);

    let label = document.createElement("label");
    label.innerText = ansChoice;

    let fieldset = document.createElement("fieldset");
    fieldset.appendChild(input);
    fieldset.appendChild(label);

    return fieldset;
}

function shuffleArray(array) { // shuffle items in array

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function addQSection(qObj) { // add question section

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
    let qQuestion = document.createElement("div");
    qQuestion.classList.add("q-question");
    qQuestion.appendChild(qHeading);
    
    // Question content container
    let qContent = document.createElement("div");
    qContent.classList.add("section-content"); 
    qContent.appendChild(qQuestion);
    qContent.appendChild(qChoiceSet);  

    // Navigation controls
    let qControls = '<div class=section-controls><div class=controls-wager><h3>Your Bet</h3><div class=wager-fields><fieldset><label>Wager</label><input class=input-wager value=100 max=500 min=100></fieldset><fieldset><label>To Win</label><input class=input-payout value=200><fieldset></div><fieldset><input class=slider-wager value=100 max=500 min=100 type=range></fieldset></div><div class=controls-nav><button class="btn-nav btn-back">Back</button> <button class="btn-nav btn-next"><span class=btn-skip-text>Skip</span> <span class=btn-check-text>Check Answer</span></button></div></div>';
    
    // Section container
    let qSection = document.createElement("section");
    qSection.setAttribute("sectype", "question");
    qSection.appendChild(qContent); // add question content
    qSection.innerHTML += qControls; // add standard controls

    // Append everything
    let container = quiz.querySelector(".sections-container");
    container.appendChild(qSection);

}

// add all question sections
questionData.forEach(function (qObj) {
    addQSection(qObj);
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