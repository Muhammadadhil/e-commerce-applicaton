
function focusNext(event) {
    const currentInput = event.target;
    // console.log(`currentINput: ${currentInput}`);
    const nextInput = currentInput.nextElementSibling;
    // console.log(`next input: ${nextInput}`);

    if (currentInput.value.length === 1 && nextInput) {
        nextInput.focus();
    }
}

function focusPrevious(event) {
    const currentInput = event.target;
    const previousInput = currentInput.previousElementSibling;

    if (event.key === "Backspace" && !currentInput.value && previousInput) {
        previousInput.focus();
    }
}

//event listener for submit button clicked
const verfiyButton = document.querySelector(".verify-button");
verfiyButton.addEventListener("click", (event) => {
    if (vaidateOtpField()) {
        verifyOTP(event);
    }
});

//validating otp field
function vaidateOtpField() {
    const num1 = document.getElementById("num1").value;
    const num2 = document.getElementById("num2").value;
    const num3 = document.getElementById("num3").value;
    const num4 = document.getElementById("num4").value;

    const otpValidateError = document.getElementById("validateError");

    if (!num1.trim() || !num2.trim() || !num3.trim() || !num4.trim()) {
        
        otpValidateError.textContent = "otp field should not be empty";
        return false;
    } else {
        otpValidateError.textContent = "";
    }
    return true;
}

const otpUserId = document.querySelector(".userId").value;
console.log("opt userid:" + otpUserId);


function verifyOTP(event) {
    event.preventDefault();

    console.log("verify OTP func reached : fetch request !!");

    const num1 = document.getElementById("num1").value;
    const num2 = document.getElementById("num2").value;
    const num3 = document.getElementById("num3").value;
    const num4 = document.getElementById("num4").value;


    const otpErrorElement = document.getElementById("otp-error");

    fetch("/forgetPasswordOtpVerify", {
        method: "POST",
        body: JSON.stringify({
            num1,
            num2,
            num3,
            num4,
            otpUserId,
        }),
        headers: {
            "content-type": "application/json;charset=utf-8",
        },
        credentials: "include",
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("data : ", data);
            
            if (data.otp == false) {
                
                otpErrorElement.textContent = data.message;
            } else if (data.otp == "expired") {
                
                otpErrorElement.textContent = data.message;
            } else if (data.otp == "invalid") {
                
                otpErrorElement.textContent = data.message;
            } else if (data.otp == "noRecord") {
                
                otpErrorElement.textContent = data.message;
            } else if (data.otp == true) {

                window.location.href = "/";
            }else if(data.success){

                window.location.href=`/newPassword?id=${otpUserId}`
            }
        })
        .catch((error) => {
            console.error("Error:", error.message);
        });

    setTimeout(() => {
        otpErrorElement.textContent = "";
    }, 6000);
}


//timer for the otp
function timer() {
    let secondsRemaining = 60;
    let display = document.getElementById("timerDisplay");
    

    let timerInterval = setInterval(() => {
        display.innerHTML = `OTP expire within ${secondsRemaining} seconds`;

        if (secondsRemaining <= 0) {
            clearInterval(timerInterval);
            display.innerHTML = "";
        } else {    
            secondsRemaining--;
        }
    }, 1000);
}
//load the timer when otp page loaded
window.onload = function () {
    timer();
};


