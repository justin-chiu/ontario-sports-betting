let quiz = document.querySelector(".quiz-container");
let navButtons = quiz.querySelectorAll(".btn-nav");
let nickname = quiz.querySelector("#nickname");
let fieldsets = quiz.querySelectorAll("fieldset");
let radioChoices = quiz.querySelectorAll(".q-choice");

let sectionData = [
    // sectype == type of section [start, end, instruction, question]
    // approval == function that determines whether conditions are met to navigate back/forward
    {
        sectype: "start",
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
        sectype: "instruction",
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
    let sectionTgt = e.target.closest("section"); // button's parent section element
    let sectionObj = sectionData.find(obj => { 
        // getting approval function to determine whether navigation back/forward is allowed
        return obj.sectype === sectionTgt.getAttribute("sectype");
    })

    if (e.target.classList.contains("btn-next")) {

        approved = sectionObj.approval(sectionTgt); // running approval function to see whether navigation is allowed

        if (approved) {
            console.log(goNext(sectionTgt)); // navigate forward
        }

    } else if (e.target.classList.contains("btn-back")) {
        console.log(goPrevious(sectionTgt)); // navigate backward
    }
}

function enableButton(e) { // removes "disabled" class, add "check-answer" class
    let sectionTgt = e.target.closest("section");
    let sectionBtn = sectionTgt.querySelector(".btn-next");
    sectionBtn.classList.remove("disabled");
    sectionBtn.classList.add("check-answer");
}

// nav button events
navButtons.forEach(function (btn) {
    btn.onclick = tapNavButton;
});

// change to nickname field triggers button state
nickname.onkeyup = function (e) {
    let buttonStart = quiz.querySelector("#btn-start");
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
