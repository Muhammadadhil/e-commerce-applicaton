
function validateNewPassword(event){

    event.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    
    const passwordError = document.getElementById("passwordError");
    if (!password.trim()) {
        passwordError.textContent = "Password is required";
        return;
    } else if (password.length < 6) {
        passwordError.textContent = "Password must be at least 6 characters long";
        return;
    }else if(!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)){
        passwordError.textContent = "Password must contain at least one uppercase letter, one lowercase letter, one number";
        return;
    }else {
        passwordError.textContent = "";
    }
    
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    if (!confirmPassword.trim()) {
        confirmPasswordError.textContent = "Confirm Password is required";
        return;
    } else if (confirmPassword !== password) {
        confirmPasswordError.textContent = "Passwords does not match";
        return;
    } else {
        confirmPasswordError.textContent = "";
    }
    
    return true;
    
}
