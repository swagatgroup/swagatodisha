# Fix Payment Slip Upload System

The issue is that when Staff or Super Admin sets a Course Fee for a student, the backend only updates the `totalFees` and `dueAmount` but **fails to initialize any payment installments**. Because there are no installments, students see the "No installments found for this application" message and have no way to upload their payment slips. 

## Proposed Changes

### Backend

#### [MODIFY] [adminController.js](file:///c:/Users/Dell/Desktop/swagatodisha/backend/controllers/adminController.js)
Update the `updateCourseFee` function:
- When updating the `totalFees`, if the `financialStatus.installments` array is empty, automatically generate a default "Installment 1" for the full `dueAmount`.
- This ensures the student immediately has a placeholder slot to upload their payment slip.

### Verification Plan
- Login as Admin, go to Student Management, and "Set Course Fee" for a student.
- Login as that Student, click "Upload Slip" in the Dashboard, and verify that "Installment 1" is now present.
- Upload a dummy payment slip and verify the receipt URL gets saved to the backend.

## User Review Required

> [!IMPORTANT]
> If a student's course fee has **already** been set in the past, they will still have 0 installments. We can either:
> 1. Run a quick migration script in the backend to fix old data.
> 2. Have the Admin click "Set Course Fee" again and just hit save (which will trigger the new code and generate the installment). 
> 
> Let me know if you approve this plan, and I'll execute the code changes!
