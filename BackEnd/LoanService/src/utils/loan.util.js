// utils/loan.util.js

/**
 * Standard reducing-balance EMI formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * @param {number} principal - loan amount
 * @param {number} annualRate - annual interest rate in %, e.g. 10.5
 * @param {number} tenureMonths
 */
export const calculateEMI = (principal, annualRate, tenureMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / tenureMonths;

    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    return Math.round(emi * 100) / 100;
};

/**
 * Generates the full amortization schedule as an array of rows,
 * ready to bulk-insert into loan_emis.
 */
export const buildAmortizationSchedule = (principal, annualRate, tenureMonths, startDate) => {
    const monthlyRate = annualRate / 12 / 100;
    const emiAmount = calculateEMI(principal, annualRate, tenureMonths);

    let outstandingPrincipal = principal;
    const schedule = [];

    for (let i = 1; i <= tenureMonths; i++) {
        const interestComponent = Math.round(outstandingPrincipal * monthlyRate * 100) / 100;
        let principalComponent = Math.round((emiAmount - interestComponent) * 100) / 100;

        // Last installment absorbs any rounding drift so principal fully closes to 0
        if (i === tenureMonths) {
            principalComponent = outstandingPrincipal;
        }

        outstandingPrincipal = Math.round((outstandingPrincipal - principalComponent) * 100) / 100;

        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        schedule.push({
            emi_number: i,
            due_date: dueDate.toISOString().slice(0, 10),
            emi_amount: i === tenureMonths ? principalComponent + interestComponent : emiAmount,
            principal_component: principalComponent,
            interest_component: interestComponent
        });
    }

    return { emiAmount, schedule };
};