const today = new Date().toISOString().split("T")[0];
document.getElementById("activationdate").setAttribute("min", today);
document.getElementById("expirydate").setAttribute("min", today);

function generateRandomString(length) {
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var randomString = "";
    for (var i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}

document.getElementById("generateButton").addEventListener("click", () => {
    const code = generateRandomString(5);

    document.getElementById("code").value = "homiqo" + code;
});

function ValidateForm(event) {
    const nameInput = document.getElementById("name").value;

    const codeInput = document.getElementById("code").value;

    let discountInput = document.getElementById("discount").value;
    discountInput = Number(discountInput);

    let criteriaAmountInput = document.getElementById("criteriAmount").value;
    criteriaAmountInput = Number(criteriaAmountInput);
    const activationdate = document.getElementById("activationdate").value;
    const expirydate = document.getElementById("expirydate").value;

    const nameError = document.getElementById("nameError");
    const codeError = document.getElementById("codeError");
    const discountError = document.getElementById("discountError");
    const expirydateError = document.getElementById("expirydateError");
    const criteriaAmountError = document.getElementById("criteriamountError");
    const useLimitError = document.getElementById("useLimitError");

    if (!nameInput.trim()) {
        nameError.innerHTML = "Coupon name should not be empty";
        return false;
    } else if (!/^[a-zA-Z\s][a-zA-Z0-9\s]*$/.test(nameInput)) {
        nameError.innerHTML = "Coupon name should not only numbers";
        return false;
    } else {
        nameError.innerHTML = "";
    }

    if (discountInput == "") {
        discountError.innerHTML = "discount should not be empty";
        return false;
    } else if (discountInput > criteriaAmountInput) {
        discountError.innerHTML = " discount amount should not be greater than criteria amount";
        return false;
    } else {
        discountError.innerHTML = "";
    }

    if (criteriaAmountInput == "") {
        criteriaAmountError.innerHTML = "criterai amount field should not empty";
        return false;
    }
    if (expirydate < activationdate) {
        expirydateError.innerHTML = "expiry date should not less than activation date";
        return false;
    }

    return true;
}
