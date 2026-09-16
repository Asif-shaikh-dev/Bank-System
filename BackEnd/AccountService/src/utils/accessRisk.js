export const accessRisk = async (pan_number) => {
    const lastChar = pan_number.slice(-1).toUpperCase(); // Get the last character and convert to uppercase

    if (lastChar === 'F') {
        return 1; // 1 tier risk
    } else if (lastChar === 'B') {
        return 3; // 3 tier risk
    }

    return 0; // Default case
}
