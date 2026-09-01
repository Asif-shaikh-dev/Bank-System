export const accessRisk = async (pan_number) => {
    const lastTwoDigits = parseInt(pan_number.slice(-2), 10);
    console.log(lastTwoDigits)
    
   
    if (!isNaN(lastTwoDigits)) {
        if (lastTwoDigits === 22) {
            return 1; // 1 tier risk
        } else if (lastTwoDigits === 33) {
            return 3; // 3 tier risk
        }
    }

    return 0; // Default case
}


